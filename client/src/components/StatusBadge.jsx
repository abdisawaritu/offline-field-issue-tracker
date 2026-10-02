// client/src/components/StatusBadge.jsx

const STATUS_STYLES = {
  DRAFT: { className: "badge badge-draft", label: "Draft" },
  SUBMITTED: { className: "badge badge-submitted", label: "Submitted" },
  ASSIGNED: { className: "badge badge-assigned", label: "Assigned" },
  IN_PROGRESS: { className: "badge badge-progress", label: "In Progress" },
  RESOLVED: { className: "badge badge-resolved", label: "Resolved" },
  REJECTED: { className: "badge badge-rejected", label: "Rejected" },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  return <span className={style.className}>{style.label}</span>;
}
