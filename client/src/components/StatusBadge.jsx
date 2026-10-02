// client/src/components/StatusBadge.jsx

const COLORS = {
  DRAFT: { bg: "#f3f4f6", color: "#374151" },
  SUBMITTED: { bg: "#dbeafe", color: "#1e40af" },
  ASSIGNED: { bg: "#ede9fe", color: "#5b21b6" },
  IN_PROGRESS: { bg: "#fef3c7", color: "#92400e" },
  RESOLVED: { bg: "#d1fae5", color: "#065f46" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b" },
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || COLORS.DRAFT;
  return (
    <span className="badge" style={{ background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}
