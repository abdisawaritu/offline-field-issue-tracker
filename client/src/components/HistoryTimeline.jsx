// client/src/components/HistoryTimeline.jsx

export default function HistoryTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p className="text-muted">No history yet.</p>;
  }

  return (
    <ul className="timeline">
      {events.map((e) => (
        <li key={e.id}>
          <div>
            <span className="event-type">{e.eventType}</span>
            <span className="event-time">
              {new Date(e.createdAt).toLocaleString()}
            </span>
          </div>
          {(e.fromStatus || e.toStatus) && (
            <div className="event-details">
              {e.fromStatus && <span>from {e.fromStatus} </span>}
              {e.toStatus && <span>→ {e.toStatus}</span>}
            </div>
          )}
          <div className="event-details">
            <strong>actor:</strong> {e.actor}
            {e.details && Object.keys(e.details).length > 0 && (
              <span> — {JSON.stringify(e.details)}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
