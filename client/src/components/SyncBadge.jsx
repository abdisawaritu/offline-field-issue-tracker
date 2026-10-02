// client/src/components/SyncBadge.jsx

const SYNC_STYLES = {
  PENDING: { className: "badge badge-sync-pending", label: "Pending", icon: "●" },
  SYNCING: { className: "badge badge-sync-syncing", label: "Syncing", icon: "◐" },
  SYNCHRONIZED: { className: "badge badge-sync-synced", label: "Synced", icon: "●" },
  FAILED: { className: "badge badge-sync-failed", label: "Failed", icon: "●" }
};

export default function SyncBadge({ syncState }) {
  const style = SYNC_STYLES[syncState] || SYNC_STYLES.PENDING;
  return (
    <span className={style.className}>
      <span className="badge-icon">{style.icon}</span>
      {style.label}
    </span>
  );
}