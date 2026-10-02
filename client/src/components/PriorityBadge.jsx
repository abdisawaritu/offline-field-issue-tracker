// client/src/components/PriorityBadge.jsx

const COLORS = {
  LOW: { bg: "#f3f4f6", color: "#374151", icon: "·" },
  MEDIUM: { bg: "#fef3c7", color: "#92400e", icon: "▲" },
  HIGH: { bg: "#fee2e2", color: "#991b1b", icon: "▲▲" },
};

export default function PriorityBadge({ priority }) {
  const c = COLORS[priority] || COLORS.LOW;
  return (
    <span className="badge" style={{ background: c.bg, color: c.color }}>
      {c.icon} {priority}
    </span>
  );
}
