// client/src/components/SyncButton.jsx
// Manual "Sync Now" button

import { useState } from "react";
import { runSyncCycle } from "../services/syncEngine";

export default function SyncButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSync() {
    setBusy(true);
    setMessage("");
    try {
      const result = await runSyncCycle();
      if (result.status === "offline") {
        setMessage("You are offline");
      } else if (result.status === "nothing_to_sync") {
        setMessage("Nothing to sync");
      } else if (result.status === "completed") {
        setMessage(`Synced ${result.results.length} report(s)`);
      } else if (result.status === "already_running") {
        setMessage("Sync already running");
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button onClick={handleSync} disabled={busy}>
        {busy ? "Syncing..." : "↻ Sync Now"}
      </button>
      {message && (
        <span style={{ fontSize: 12, color: "#555" }}>{message}</span>
      )}
    </div>
  );
}
