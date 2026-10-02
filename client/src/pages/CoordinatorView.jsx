// client/src/pages/CoordinatorView.jsx

import ReportList from "../components/ReportList";
import { useReports } from "../store/useReports";

export default function CoordinatorView() {
  const reports = useReports();

  // Coordinator sees all non-draft reports
  const visible = reports.filter((r) => r.status !== "DRAFT");

  return (
    <div>
      <h2>Coordinator</h2>
      <p className="text-muted">
        Review submitted reports, assign work, update status, and view history.
      </p>

      <div className="mb-4">
        <strong>Total visible:</strong> {visible.length}
      </div>

      <ReportList reports={visible} />
    </div>
  );
}
