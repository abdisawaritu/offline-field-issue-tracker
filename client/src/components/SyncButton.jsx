// client/src/components/SyncButton.jsx
// Manual sync trigger with icon and status feedback

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
        setMessage("Offline");
      } else if (result.status === "nothing_to_sync") {
        setMessage("Up to date");
      } else if (result.status === "completed") {
        setMessage(`Synced ${result.results.length}`);
      } else if (result.status === "already_running") {
        setMessage("Running...");
      }
    } catch (e) {
      setMessage("Error");
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="sync-button-wrap">
      <button
        className="sync-button"
        onClick={handleSync}
        disabled={busy}
        title="Synchronize pending reports"
        type="button"
      >
        <span className={`sync-icon ${busy ? "spinning" : ""}`}>⟳</span>
        <span>{busy ? "Syncing" : "Sync"}</span>
      </button>
      {message && <span className="sync-message">{message}</span>}
    </div>
  );
}
