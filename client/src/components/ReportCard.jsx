// client/src/components/ReportCard.jsx

import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import SyncBadge from "./SyncBadge";

export default function ReportCard({ report, showActions = true }) {
  return (
    <div className="report-card">
      <h3>{report.category}</h3>

      <div className="meta">
        <PriorityBadge priority={report.priority} />
        <StatusBadge status={report.status} />
        <SyncBadge syncState={report.syncState} />
        <span>{new Date(report.createdAt).toLocaleString()}</span>
      </div>

      <div className="description">{report.description}</div>

      <div className="meta">
        <span>
          <strong>Location:</strong> {report.location}
        </span>
        <span>
          <strong>By:</strong> {report.createdBy}
        </span>
        {report.assignedTo && (
          <span>
            <strong>Assigned:</strong> {report.assignedTo}
          </span>
        )}
      </div>

      {report.lastError && (
        <div className="alert alert-error" style={{ marginTop: 8 }}>
          Last error: {report.lastError}
        </div>
      )}

      {showActions && (
        <div className="actions">
          <Link
            className="btn btn-secondary btn-sm"
            to={`/report/${report.clientId}`}
          >
            View details
          </Link>
        </div>
      )}
    </div>
  );
}
