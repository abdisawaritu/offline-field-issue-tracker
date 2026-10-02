// client/src/components/SyncBadge.jsx
// Visual indicator for sync state

import { SYNC_STATUS } from "../utils/constants";

const STYLES = {
  [SYNC_STATUS.PENDING]: {
    background: "#fef3c7",
    color: "#92400e",
    label: "Pending",
    icon: "🟡",
  },
  [SYNC_STATUS.SYNCING]: {
    background: "#dbeafe",
    color: "#1e40af",
    label: "Syncing",
    icon: "🔵",
  },
  [SYNC_STATUS.SYNCHRONIZED]: {
    background: "#d1fae5",
    color: "#065f46",
    label: "Synced",
    icon: "🟢",
  },
  [SYNC_STATUS.FAILED]: {
    background: "#fee2e2",
    color: "#991b1b",
    label: "Failed",
    icon: "🔴",
  },
};

export default function SyncBadge({ syncState }) {
  const style = STYLES[syncState] || STYLES[SYNC_STATUS.PENDING];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: style.background,
        color: style.color,
      }}
    >
      {style.icon} {style.label}
    </span>
  );
}
