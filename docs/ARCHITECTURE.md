## Client-Side Offline Storage (Phase 5/6)

### IndexedDB via Dexie

Three object stores:

| Store | Primary Key | Indexes | Purpose |
|---|---|---|---|
| `reports` | `clientId` | `serverId`, `status`, `priority`, `category`, `syncState`, `createdAt`, `updatedAt`, `createdBy` | Local report copies |
| `history` | `id` | `reportClientId`, `eventType`, `createdAt`, `synced` | Local audit log |
| `syncQueue` | `clientId` | `syncState`, `enqueuedAt`, `nextRetryAt` | Pending sync items |

### Modules

| Module | Responsibility |
|---|---|
| `db.js` | Raw IndexedDB operations |
| `reportStore.js` | High-level report CRUD with history |
| `connectivity.js` | Online/offline detection |
| `utils/uuid.js` | UUID generation and validation |
| `utils/validation.js` | Client-side validation |
| `utils/stateMachine.js` | Mirrors backend state machine |
| `utils/constants.js` | Shared enums and config |

### Persistence Guarantees

- Reports survive page refresh
- Reports survive browser restart
- History is append-only
- Sync queue is durable

### Interrupted Sync Recovery

`getPendingReports()` treats any report in `SYNCING` state as `PENDING` on
retrieval. This recovers from browser crashes during sync.