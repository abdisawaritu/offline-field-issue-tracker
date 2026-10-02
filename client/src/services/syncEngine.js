// client/src/services/syncEngine.js
// Orchestrates offline-to-server synchronization

import {
  getPendingReports,
  getHistoryForReport,
  markHistorySynced,
  updateQueueItem,
  dequeueSync,
  putHistory,
} from "./db";

import {
  getReport,
  markSyncing,
  markSynced,
  markFailed,
  markPending,
} from "./reportStore";

import { api } from "./api";
import {
  hasRetriesLeft,
  nextRetryDate,
  isRetryDue,
  MAX_RETRIES,
} from "./retryPolicy";
import { isEffectivelyOnline } from "./connectivity";
import { SYNC_STATUS, HISTORY_EVENTS } from "../utils/constants";
import { generateUuid } from "../utils/uuid";

// ---------- Engine State ----------

let running = false;
const listeners = new Set();

function emit(event) {
  for (const fn of listeners) {
    try {
      fn(event);
    } catch (e) {
      console.error("[syncEngine] listener error:", e);
    }
  }
}

export function subscribeSyncEngine(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function isSyncRunning() {
  return running;
}

// ---------- Payload Builder ----------

async function buildPayload(report) {
  const history = await getHistoryForReport(report.clientId);
  const unsynced = history.filter((h) => !h.synced);

  return {
    clientId: report.clientId,
    category: report.category,
    description: report.description,
    location: report.location,
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    priority: report.priority,
    status: report.status,
    createdBy: report.createdBy,
    assignedTo: report.assignedTo ?? null,
    reportedAt: report.reportedAt,
    clientUpdatedAt: report.updatedAt,
    history: unsynced.map((h) => ({
      id: h.id,
      eventType: h.eventType,
      fromStatus: h.fromStatus ?? null,
      toStatus: h.toStatus ?? null,
      actor: h.actor,
      details: h.details ?? {},
      createdAt: h.createdAt,
    })),
  };
}

// ---------- History Helper ----------

async function logSyncEvent(
  reportClientId,
  eventType,
  details = {},
  actor = "system",
) {
  await putHistory({
    id: generateUuid(),
    reportClientId,
    eventType,
    fromStatus: null,
    toStatus: null,
    actor,
    details,
    createdAt: new Date().toISOString(),
    synced: false,
  });
}

// ---------- Single Report Sync ----------

async function syncOneReport(report) {
  const clientId = report.clientId;

  if (!isRetryDue(report.nextRetryAt)) {
    return { status: "skipped", clientId };
  }

  if (!hasRetriesLeft(report.retryCount)) {
    await markFailed(clientId, "Max retries exceeded");
    await logSyncEvent(clientId, HISTORY_EVENTS.SYNC_FAILED, {
      reason: "Max retries exceeded",
      permanent: true,
    });
    return { status: "failed", clientId };
  }

  await markSyncing(clientId);
  await logSyncEvent(clientId, HISTORY_EVENTS.SYNC_STARTED, {});

  try {
    const payload = await buildPayload(report);
    const response = await api.syncReport(payload);

    await markSynced(clientId, {
      id: response.data.id,
      syncVersion: response.data.syncVersion,
    });
    await markHistorySynced(clientId);
    await dequeueSync(clientId);

    await logSyncEvent(clientId, HISTORY_EVENTS.SYNC_SUCCEEDED, {
      serverId: response.data.id,
      duplicate: response.data.duplicate,
      updated: response.data.updated,
    });

    emit({ type: "success", clientId, response: response.data });
    return { status: "synced", clientId, response: response.data };
  } catch (err) {
    const status = err.status || 0;

    if (status === 400 || status === 422) {
      await markFailed(clientId, err.message);
      await logSyncEvent(clientId, HISTORY_EVENTS.SYNC_FAILED, {
        reason: err.message,
        code: err.code,
        permanent: true,
      });
      emit({ type: "permanent_failure", clientId, error: err.message });
      return { status: "failed", clientId, error: err.message };
    }

    const newRetryCount = report.retryCount + 1;
    const nextRetryAt = nextRetryDate(newRetryCount);

    if (newRetryCount >= MAX_RETRIES) {
      await markFailed(clientId, err.message);
    } else {
      await markPending(clientId, err.message);
    }

    await updateQueueItem(clientId, {
      retryCount: newRetryCount,
      lastError: err.message,
      nextRetryAt,
    });

    await logSyncEvent(clientId, HISTORY_EVENTS.SYNC_FAILED, {
      reason: err.message,
      code: err.code,
      retryCount: newRetryCount,
      nextRetryAt,
      permanent: false,
    });

    emit({
      type: "transient_failure",
      clientId,
      error: err.message,
      nextRetryAt,
    });
    return { status: "pending", clientId, error: err.message };
  }
}

// ---------- Full Sync Run ----------

export async function runSyncCycle() {
  if (running) {
    return { status: "already_running" };
  }

  running = true;
  emit({ type: "cycle_started" });

  try {
    const online = await isEffectivelyOnline();
    if (!online) {
      emit({ type: "offline" });
      return { status: "offline" };
    }

    const pending = await getPendingReports();
    if (pending.length === 0) {
      emit({ type: "nothing_to_sync" });
      return { status: "nothing_to_sync" };
    }

    const results = [];
    for (const report of pending) {
      const result = await syncOneReport(report);
      results.push(result);
      await new Promise((r) => setTimeout(r, 200));
    }

    emit({ type: "cycle_completed", results });
    return { status: "completed", results };
  } finally {
    running = false;
  }
}

// ---------- Auto-sync ----------

let autoSyncUnsubscribe = null;

export function startAutoSync({ intervalMs = 30000 } = {}) {
  stopAutoSync();

  const onOnline = () => {
    runSyncCycle().catch((e) => console.error("[autoSync] online:", e));
  };

  window.addEventListener("online", onOnline);

  const timer = setInterval(() => {
    runSyncCycle().catch((e) => console.error("[autoSync] interval:", e));
  }, intervalMs);

  autoSyncUnsubscribe = () => {
    window.removeEventListener("online", onOnline);
    clearInterval(timer);
  };
}

export function stopAutoSync() {
  if (autoSyncUnsubscribe) {
    autoSyncUnsubscribe();
    autoSyncUnsubscribe = null;
  }
}
