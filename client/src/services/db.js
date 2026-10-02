// client/src/services/db.js
// IndexedDB schema via Dexie

import Dexie from "dexie";

export const db = new Dexie("OfflineFieldIssueTracker");

db.version(1).stores({
  // Primary key: clientId (local). Server id is a separate field.
  reports:
    "clientId, serverId, status, priority, category, syncState, createdAt, updatedAt, createdBy",

  // Primary key: id (local UUID). Indexed by reportClientId.
  history: "id, reportClientId, eventType, createdAt, synced",

  // Primary key: clientId. Indexed by syncState and nextRetryAt.
  syncQueue: "clientId, syncState, enqueuedAt, nextRetryAt",
});

// ---------- Reports ----------

export async function putReport(report) {
  return db.reports.put(report);
}

export async function getReport(clientId) {
  return db.reports.get(clientId);
}

export async function getAllReports() {
  return db.reports.orderBy("createdAt").reverse().toArray();
}

export async function getReportsBySyncState(syncState) {
  return db.reports.where("syncState").equals(syncState).toArray();
}

export async function getPendingReports() {
  const pending = await db.reports
    .where("syncState")
    .equals("PENDING")
    .toArray();
  const failed = await db.reports.where("syncState").equals("FAILED").toArray();
  const syncing = await db.reports
    .where("syncState")
    .equals("SYNCING")
    .toArray();

  // Recover interrupted syncs: treat SYNCING as PENDING
  const recovered = syncing.map((r) => ({
    ...r,
    syncState: "PENDING",
    lastError: "Sync interrupted",
  }));

  for (const r of recovered) {
    await db.reports.put(r);
  }

  return [...pending, ...failed, ...recovered].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
}

export async function deleteReport(clientId) {
  return db.reports.delete(clientId);
}

export async function countReports() {
  return db.reports.count();
}

// ---------- History ----------

export async function putHistory(entry) {
  return db.history.put(entry);
}

export async function getHistoryForReport(reportClientId) {
  return db.history
    .where("reportClientId")
    .equals(reportClientId)
    .sortBy("createdAt");
}

export async function markHistorySynced(reportClientId) {
  const entries = await getHistoryForReport(reportClientId);
  await db.history.bulkPut(entries.map((e) => ({ ...e, synced: true })));
}

// ---------- Sync Queue ----------

export async function enqueueSync(clientId, priority = 0) {
  return db.syncQueue.put({
    clientId,
    priority,
    enqueuedAt: new Date().toISOString(),
    nextRetryAt: new Date().toISOString(),
    retryCount: 0,
    lastError: null,
  });
}

export async function dequeueSync(clientId) {
  return db.syncQueue.delete(clientId);
}

export async function getQueue() {
  const items = await db.syncQueue.toArray();
  return items.sort((a, b) => new Date(a.enqueuedAt) - new Date(b.enqueuedAt));
}

export async function updateQueueItem(clientId, patch) {
  const existing = await db.syncQueue.get(clientId);
  if (!existing) return null;
  return db.syncQueue.put({ ...existing, ...patch });
}

export async function clearAll() {
  await db.reports.clear();
  await db.history.clear();
  await db.syncQueue.clear();
}
