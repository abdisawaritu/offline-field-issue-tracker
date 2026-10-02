// client/src/pages/OfflineTest.jsx
// Debug page — offline + sync verification

import { useEffect, useState } from "react";
import {
  createLocalReport,
  getAllReports,
  markPending,
} from "../services/reportStore";
import {
  countReports,
  clearAll,
  getQueue,
  getHistoryForReport,
} from "../services/db";
import { isEffectivelyOnline } from "../services/connectivity";
import {
  runSyncCycle,
  startAutoSync,
  stopAutoSync,
} from "../services/syncEngine";
import SyncBadge from "../components/SyncBadge";
import SyncButton from "../components/SyncButton";

export default function OfflineTest() {
  const [reports, setReports] = useState([]);
  const [queue, setQueue] = useState([]);
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  async function refresh() {
    const [all, q, c] = await Promise.all([
      getAllReports(),
      getQueue(),
      countReports(),
    ]);
    setReports(all);
    setQueue(q);
    setCount(c);
    setOnline(await isEffectivelyOnline());
  }

  useEffect(() => {
    refresh();
    startAutoSync({ intervalMs: 30000 });

    const onOnline = () => refresh();
    const onOffline = () => refresh();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const interval = setInterval(refresh, 3000);

    return () => {
      stopAutoSync();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, []);

  async function handleCreate() {
    await createLocalReport({
      category: "Broken Water Point",
      description: "Test report created from the debug page",
      location: "Test Location",
      priority: "HIGH",
      status: "SUBMITTED",
      createdBy: "test-worker",
    });
    await refresh();
  }

  async function handleViewHistory(clientId) {
    setSelectedId(clientId);
    const h = await getHistoryForReport(clientId);
    setSelectedHistory(h);
  }

  async function handleRetry(clientId) {
    await markPending(clientId);
    await refresh();
  }

  async function handleClear() {
    if (!window.confirm("Clear ALL local data?")) return;
    await clearAll();
    setSelectedHistory([]);
    setSelectedId(null);
    await refresh();
  }

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>Offline + Sync — Debug Page</h1>

      <p>
        <strong>Online:</strong>{" "}
        {online === null ? "checking..." : online ? "✅ yes" : "❌ no"}
      </p>

      <p>
        <strong>Reports in IndexedDB:</strong> {count}
      </p>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <button onClick={handleCreate}>+ Create offline report</button>
        <SyncButton />
        <button onClick={refresh}>↻ Refresh</button>
        <button onClick={handleClear} style={{ color: "red" }}>
          Clear all
        </button>
      </div>

      <h2>Reports</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {reports.map((r) => (
          <li
            key={r.clientId}
            style={{
              marginBottom: 12,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 6,
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <strong>{r.category}</strong> — {r.status} —{" "}
              <SyncBadge syncState={r.syncState} />
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              clientId: {r.clientId}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>{r.description}</div>
            {r.lastError && (
              <div style={{ fontSize: 12, color: "#991b1b" }}>
                Error: {r.lastError}
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => handleViewHistory(r.clientId)}>
                View history
              </button>{" "}
              {r.syncState === "FAILED" && (
                <button onClick={() => handleRetry(r.clientId)}>Retry</button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {selectedId && (
        <>
          <h2>History for {selectedId}</h2>
          <ul>
            {selectedHistory.map((h) => (
              <li key={h.id}>
                {h.eventType} — {h.createdAt}
                {h.synced ? " ✓" : " (not synced)"}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Sync Queue ({queue.length})</h2>
      <ul>
        {queue.map((q) => (
          <li key={q.clientId}>
            {q.clientId} — retryCount: {q.retryCount} — next: {q.nextRetryAt}
            {q.lastError ? ` — last error: ${q.lastError}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
