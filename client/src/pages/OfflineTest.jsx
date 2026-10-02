// client/src/pages/OfflineTest.jsx
// Debug page — offline storage + sync verification

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
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

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
    if (selectedId === clientId) {
      setSelectedId(null);
      setSelectedHistory([]);
      return;
    }
    setSelectedId(clientId);
    const h = await getHistoryForReport(clientId);
    setSelectedHistory(h);
  }

  async function handleRetry(clientId) {
    await markPending(clientId);
    await refresh();
  }

  async function handleSyncNow() {
    await runSyncCycle();
    await refresh();
  }

  async function handleClear() {
    if (!window.confirm("Clear ALL local data? This cannot be undone.")) return;
    await clearAll();
    setSelectedHistory([]);
    setSelectedId(null);
    await refresh();
  }

  return (
    <div className="debug-page">
      <header className="page-header">
        <h2>Debug Console</h2>
        <p>
          Inspect IndexedDB state, sync queue, and history. This page is for
          verification only.
        </p>
      </header>

      {/* ---------- Status cards ---------- */}
      <div className="debug-stats">
        <div className="debug-stat">
          <div className="debug-stat-label">Connection</div>
          <div className="debug-stat-value">
            {online === null ? (
              <span className="text-muted">checking…</span>
            ) : online ? (
              <span className="debug-dot debug-dot-online" />
            ) : (
              <span className="debug-dot debug-dot-offline" />
            )}
            <span>{online === null ? "" : online ? "Online" : "Offline"}</span>
          </div>
        </div>

        <div className="debug-stat">
          <div className="debug-stat-label">Local Reports</div>
          <div className="debug-stat-value">{count}</div>
        </div>

        <div className="debug-stat">
          <div className="debug-stat-label">Sync Queue</div>
          <div className="debug-stat-value">{queue.length}</div>
        </div>

        <div className="debug-stat">
          <div className="debug-stat-label">Pending</div>
          <div className="debug-stat-value">
            {reports.filter((r) => r.syncState === "PENDING").length}
          </div>
        </div>

        <div className="debug-stat">
          <div className="debug-stat-label">Failed</div>
          <div className="debug-stat-value">
            {reports.filter((r) => r.syncState === "FAILED").length}
          </div>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="debug-actions">
        <button className="btn" onClick={handleCreate} type="button">
          + Create test report
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleSyncNow}
          type="button"
        >
          ⟳ Sync now
        </button>
        <button className="btn btn-secondary" onClick={refresh} type="button">
          ↻ Refresh
        </button>
        <button className="btn btn-danger" onClick={handleClear} type="button">
          Clear all
        </button>
      </div>

      {/* ---------- Reports list ---------- */}
      <section className="debug-section">
        <header className="debug-section-header">
          <h3>Local Reports</h3>
          <span className="debug-section-count">{reports.length}</span>
        </header>

        {reports.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No reports in IndexedDB</div>
            <div className="empty-text">
              Click "Create test report" to add one.
            </div>
          </div>
        ) : (
          <div className="debug-list">
            {reports.map((r) => (
              <div key={r.clientId} className="debug-list-item">
                <div className="debug-list-main">
                  <div className="debug-list-title">
                    <strong>{r.category}</strong>
                  </div>
                  <div className="debug-list-badges">
                    <PriorityBadge priority={r.priority} />
                    <StatusBadge status={r.status} />
                    <SyncBadge syncState={r.syncState} />
                  </div>
                  <div className="debug-list-meta">
                    <span className="debug-mono">{r.clientId}</span>
                  </div>
                  <div className="debug-list-desc">{r.description}</div>
                  {r.lastError && (
                    <div className="debug-list-error">Error: {r.lastError}</div>
                  )}
                  {r.serverId && (
                    <div className="debug-list-meta">
                      <span className="debug-label">Server:</span>
                      <span className="debug-mono">{r.serverId}</span>
                    </div>
                  )}
                </div>

                <div className="debug-list-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleViewHistory(r.clientId)}
                    type="button"
                  >
                    {selectedId === r.clientId ? "Hide history" : "History"}
                  </button>
                  {r.syncState === "FAILED" && (
                    <button
                      className="btn btn-sm"
                      onClick={() => handleRetry(r.clientId)}
                      type="button"
                    >
                      Retry
                    </button>
                  )}
                </div>

                {selectedId === r.clientId && (
                  <div className="debug-history">
                    <div className="debug-history-title">History</div>
                    {selectedHistory.length === 0 ? (
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        No events.
                      </div>
                    ) : (
                      <ul className="debug-history-list">
                        {selectedHistory.map((h) => (
                          <li key={h.id}>
                            <span className="debug-history-type">
                              {h.eventType}
                            </span>
                            <span className="debug-history-time">
                              {new Date(h.createdAt).toLocaleTimeString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Sync queue ---------- */}
      <section className="debug-section">
        <header className="debug-section-header">
          <h3>Sync Queue</h3>
          <span className="debug-section-count">{queue.length}</span>
        </header>

        {queue.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✓</div>
            <div className="empty-title">Queue is empty</div>
            <div className="empty-text">
              All reports have been synchronized.
            </div>
          </div>
        ) : (
          <ul className="debug-queue">
            {queue.map((q) => (
              <li key={q.clientId} className="debug-queue-item">
                <span className="debug-mono">{q.clientId}</span>
                <span className="debug-queue-meta">
                  retries: <strong>{q.retryCount}</strong>
                  {q.nextRetryAt && (
                    <>
                      {" · next: "}
                      <strong>
                        {new Date(q.nextRetryAt).toLocaleTimeString()}
                      </strong>
                    </>
                  )}
                  {q.lastError && (
                    <>
                      {" · "}
                      <span className="debug-queue-error">{q.lastError}</span>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
