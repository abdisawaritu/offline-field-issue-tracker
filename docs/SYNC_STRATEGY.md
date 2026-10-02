# Synchronization Strategy

## Invariants

1. No data loss — a report created locally is never lost
2. No duplicates — same `clientId` never creates two rows
3. At-least-once delivery — every report eventually reaches the server
4. Truthful state — UI never says "synced" unless server confirmed
5. Auditability — every sync attempt, success, failure logged

## Sync States (Client)
