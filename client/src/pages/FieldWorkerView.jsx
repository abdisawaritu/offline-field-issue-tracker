// client/src/pages/FieldWorkerView.jsx

import { useState } from "react";
import ReportForm from "../components/ReportForm";
import ReportList from "../components/ReportList";
import { useReports } from "../store/useReports";
import { getRole } from "../store/useRole";
import { runSyncCycle } from "../services/syncEngine";

export default function FieldWorkerView() {
  const allReports = useReports();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  // Field worker sees only their own reports
  const role = getRole();
  const myReports = allReports.filter((r) => r.createdBy === role);

  async function handleSync() {
    setSyncing(true);
    setMessage("");
    try {
      const result = await runSyncCycle();
      if (result.status === "offline") {
        setMessage("You are offline");
      } else if (result.status === "nothing_to_sync") {
        setMessage("Nothing to sync");
      } else if (result.status === "completed") {
        setMessage(`Synced ${result.results.length} report(s)`);
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div>
      <h2>Field Worker</h2>
      <p className="text-muted">
        Create reports offline. They will sync automatically when online.
      </p>

      <div className="mb-4">
        <button className="btn" onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing..." : "↻ Sync now"}
        </button>
        {message && (
          <span className="text-muted" style={{ marginLeft: 12 }}>
            {message}
          </span>
        )}
      </div>

      <ReportForm />

      <h3 className="mt-4">My reports ({myReports.length})</h3>
      <ReportList reports={myReports} />
    </div>
  );
}
