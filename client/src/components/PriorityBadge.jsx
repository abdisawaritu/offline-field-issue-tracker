// client/src/components/PriorityBadge.jsx

const PRIORITY_STYLES = {
  LOW: { className: "badge badge-priority-low", label: "Low", icon: "•" },
  MEDIUM: {
    className: "badge badge-priority-medium",
    label: "Medium",
    icon: "▲",
  },
  HIGH: { className: "badge badge-priority-high", label: "High", icon: "▲▲" },
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;
  return (
    <span className={style.className}>
      <span className="badge-icon">{style.icon}</span>
      {style.label}
    </span>
  );
}
