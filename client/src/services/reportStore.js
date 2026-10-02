// client/src/services/reportStore.js
// High-level report operations that also write history

import {
  putReport,
  getReport,
  getAllReports,
  putHistory,
  getHistoryForReport,
  enqueueSync,
} from "./db";
import { generateUuid } from "../utils/uuid";
import { SYNC_STATUS, HISTORY_EVENTS } from "../utils/constants";

/**
 * Create a new report locally (offline-first).
 */
export async function createLocalReport(input) {
  const now = new Date().toISOString();

  const report = {
    clientId: generateUuid(),
    serverId: null,
    category: input.category,
    description: input.description,
    location: input.location,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    priority: input.priority,
    status: input.status,
    createdBy: input.createdBy,
    assignedTo: input.assignedTo ?? null,
    reportedAt: now,
    createdAt: now,
    updatedAt: now,
    syncState: SYNC_STATUS.PENDING,
    retryCount: 0,
    lastAttemptAt: null,
    lastError: null,
    syncedAt: null,
    hasConflict: false,
    syncVersion: 0,
    deleted: false,
  };

  await putReport(report);

  // Log CREATED event locally
  await putHistory({
    id: generateUuid(),
    reportClientId: report.clientId,
    eventType: HISTORY_EVENTS.CREATED,
    fromStatus: null,
    toStatus: report.status,
    actor: report.createdBy,
    details: { source: "client" },
    createdAt: now,
    synced: false,
  });

  // Enqueue for sync
  await enqueueSync(report.clientId);

  return report;
}

/**
 * Update fields on a local report (only if not yet synced or editable).
 */
export async function updateLocalReport(clientId, patch) {
  const existing = await getReport(clientId);
  if (!existing) throw new Error(`Report ${clientId} not found`);

  const now = new Date().toISOString();
  const updated = {
    ...existing,
    ...patch,
    updatedAt: now,
    syncState:
      existing.syncState === SYNC_STATUS.SYNCHRONIZED
        ? SYNC_STATUS.PENDING
        : existing.syncState,
  };

  await putReport(updated);

  await putHistory({
    id: generateUuid(),
    reportClientId: clientId,
    eventType: HISTORY_EVENTS.UPDATED,
    fromStatus: existing.status,
    toStatus: updated.status,
    actor: patch.actor || existing.createdBy,
    details: { fields: Object.keys(patch) },
    createdAt: now,
    synced: false,
  });

  if (existing.syncState === SYNC_STATUS.SYNCHRONIZED) {
    await enqueueSync(clientId);
  }

  return updated;
}

/**
 * Mark a report as SYNCING (transient state during sync).
 */
export async function markSyncing(clientId) {
  const report = await getReport(clientId);
  if (!report) return null;
  return putReport({
    ...report,
    syncState: SYNC_STATUS.SYNCING,
    lastAttemptAt: new Date().toISOString(),
  });
}

/**
 * Mark a report as SYNCHRONIZED.
 */
export async function markSynced(clientId, serverData) {
  const report = await getReport(clientId);
  if (!report) return null;
  return putReport({
    ...report,
    serverId: serverData.id ?? report.serverId,
    syncVersion: serverData.syncVersion ?? report.syncVersion,
    syncState: SYNC_STATUS.SYNCHRONIZED,
    syncedAt: new Date().toISOString(),
    lastError: null,
    retryCount: 0,
  });
}

/**
 * Mark a report as FAILED with a reason.
 */
export async function markFailed(clientId, errorMessage) {
  const report = await getReport(clientId);
  if (!report) return null;
  return putReport({
    ...report,
    syncState: SYNC_STATUS.FAILED,
    lastError: errorMessage,
    lastAttemptAt: new Date().toISOString(),
  });
}

/**
 * Reset a FAILED report to PENDING (manual retry).
 */
export async function markPending(clientId) {
  const report = await getReport(clientId);
  if (!report) return null;
  const updated = {
    ...report,
    syncState: SYNC_STATUS.PENDING,
    retryCount: 0,
    nextRetryAt: null,
  };
  await putReport(updated);
  await enqueueSync(clientId);
  return updated;
}

export { getAllReports, getReport, getHistoryForReport };
