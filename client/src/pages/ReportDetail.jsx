// client/src/pages/ReportDetail.jsx

import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useReport, useReportHistory } from "../store/useReports";
import { getAllowedTransitions, canReopen } from "../utils/stateMachine";
import { api } from "../services/api";
import { putHistory, putReport } from "../services/db";
import { generateUuid } from "../utils/uuid";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import SyncBadge from "../components/SyncBadge";
import HistoryTimeline from "../components/HistoryTimeline";
import { useRole } from "../store/useRole";
import { HISTORY_EVENTS } from "../utils/constants";

export default function ReportDetail() {
  const { clientId } = useParams();
  const report = useReport(clientId);
  const history = useReportHistory(clientId);
  const { role } = useRole();

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [assignee, setAssignee] = useState("");

  if (!report) {
    return (
      <div className="card">
        <p>Report not found.</p>
        <Link className="btn" to="/field">
          Back
        </Link>
      </div>
    );
  }

  const allowed = getAllowedTransitions(report.status);
  const canReopenNow = canReopen(report.status);

  async function applyTransition(toStatus) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await putReport({
        ...report,
        status: toStatus,
        assignedTo:
          toStatus === "ASSIGNED"
            ? assignee || "unassigned"
            : report.assignedTo,
        updatedAt: new Date().toISOString(),
        syncState: "PENDING",
      });

      await putHistory({
        id: generateUuid(),
        reportClientId: clientId,
        eventType:
          toStatus === "ASSIGNED"
            ? HISTORY_EVENTS.ASSIGNED
            : HISTORY_EVENTS.STATUS_CHANGED,
        fromStatus: report.status,
        toStatus,
        actor: role,
        details: { reason: "changed from UI" },
        createdAt: new Date().toISOString(),
        synced: false,
      });

      if (report.serverId) {
        try {
          await api.updateStatus(report.serverId, {
            toStatus,
            actor: role,
            assignedTo: toStatus === "ASSIGNED" ? assignee : undefined,
          });

          await putReport({
            ...report,
            status: toStatus,
            assignedTo:
              toStatus === "ASSIGNED"
                ? assignee || "unassigned"
                : report.assignedTo,
            updatedAt: new Date().toISOString(),
            syncState: "SYNCHRONIZED",
          });

          setMessage(`Status updated to ${toStatus}`);
        } catch {
          setMessage("Updated locally. Will sync when online.");
        }
      } else {
        setMessage("Updated locally. Will sync when online.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReopen() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const target = report.status === "RESOLVED" ? "IN_PROGRESS" : "SUBMITTED";

      await putReport({
        ...report,
        status: target,
        updatedAt: new Date().toISOString(),
        syncState: "PENDING",
      });

      await putHistory({
        id: generateUuid(),
        reportClientId: clientId,
        eventType: HISTORY_EVENTS.REOPENED,
        fromStatus: report.status,
        toStatus: target,
        actor: role,
        details: { reason: "reopened from UI" },
        createdAt: new Date().toISOString(),
        synced: false,
      });

      if (report.serverId) {
        try {
          await api.reopen(report.serverId, {
            actor: role,
            reason: "reopened",
          });
        } catch {
          /* offline — will retry */
        }
      }

      setMessage(`Reopened to ${target}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link to={role === "coordinator" ? "/coordinator" : "/field"}>
          ← Back
        </Link>
      </div>

      <div className="card">
        <h2>{report.category}</h2>

        <div className="meta mb-2">
          <PriorityBadge priority={report.priority} />
          <StatusBadge status={report.status} />
          <SyncBadge syncState={report.syncState} />
        </div>

        <p>{report.description}</p>

        <div className="meta">
          <span>
            <strong>Location:</strong> {report.location}
          </span>
          <span>
            <strong>Created by:</strong> {report.createdBy}
          </span>
          {report.assignedTo && (
            <span>
              <strong>Assigned to:</strong> {report.assignedTo}
            </span>
          )}
          <span>
            <strong>Reported at:</strong>{" "}
            {new Date(report.reportedAt).toLocaleString()}
          </span>
          {report.serverId && (
            <span>
              <strong>Server ID:</strong> {report.serverId.slice(0, 8)}…
            </span>
          )}
        </div>
      </div>

      {role === "coordinator" && (
        <div className="card">
          <h3>Coordinator actions</h3>

          {message && <div className="alert alert-info">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {allowed.length === 0 && !canReopenNow && (
            <p className="text-muted">
              No transitions available for this status.
            </p>
          )}

          {allowed.includes("ASSIGNED") && (
            <div className="form-row">
              <label>Assign to (optional)</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g. team-A"
              />
            </div>
          )}

          <div className="flex-row">
            {allowed.map((to) => (
              <button
                key={to}
                className="btn"
                onClick={() => applyTransition(to)}
                disabled={busy}
              >
                → {to}
              </button>
            ))}

            {canReopenNow && (
              <button
                className="btn btn-secondary"
                onClick={handleReopen}
                disabled={busy}
              >
                ↻ Reopen
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h3>History</h3>
        <HistoryTimeline events={history} />
      </div>
    </div>
  );
}
