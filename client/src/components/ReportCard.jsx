// client/src/components/ReportCard.jsx

import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import SyncBadge from "./SyncBadge";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export default function ReportCard({ report, showActions = true }) {
  return (
    <article className="report-card">
      <header className="report-card-header">
        <h3>{report.category}</h3>
        <div className="report-card-badges">
          <PriorityBadge priority={report.priority} />
          <StatusBadge status={report.status} />
          <SyncBadge syncState={report.syncState} />
        </div>
      </header>

      <p className="report-card-description">{report.description}</p>

      <div className="report-card-meta">
        <span className="meta-item">
          <span className="meta-label">Location</span>
          <span className="meta-value">{report.location}</span>
        </span>
        <span className="meta-item">
          <span className="meta-label">By</span>
          <span className="meta-value">{report.createdBy}</span>
        </span>
        {report.assignedTo && (
          <span className="meta-item">
            <span className="meta-label">Assigned</span>
            <span className="meta-value">{report.assignedTo}</span>
          </span>
        )}
        <span className="meta-item">
          <span className="meta-label">Reported</span>
          <span className="meta-value">{formatDate(report.createdAt)}</span>
        </span>
      </div>

      {report.lastError && (
        <div className="report-card-error">
          <strong>Last sync error:</strong> {report.lastError}
        </div>
      )}

      {showActions && (
        <footer className="report-card-footer">
          <Link
            className="btn btn-secondary btn-sm"
            to={`/report/${report.clientId}`}
          >
            View details
          </Link>
        </footer>
      )}
    </article>
  );
}
