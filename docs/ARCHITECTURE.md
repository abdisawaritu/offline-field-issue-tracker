# Architecture

## Overview

The Offline Field Issue Tracker follows a three-tier architecture:

1. **Client** (React + IndexedDB) — offline-first UI
2. **Server** (Node.js + Express) — REST API + business logic
3. **Database** (MySQL) — persistent storage

## Backend Foundation (Phase 3)

### Components

| Component | File | Purpose |
|---|---|---|
| Entry point | `server/server.js` | Starts HTTP server |
| Express app | `server/src/app.js` | Middleware + routes |
| DB pool | `server/src/config/db.js` | MySQL connection pool |
| Health route | `server/src/routes/health.js` | `/api/v1/health` |
| Error handler | `server/src/middleware/errorHandler.js` | Centralized errors |
| Async wrapper | `server/src/utils/asyncHandler.js` | Forwards async errors |

### Middleware Order

1. CORS
2. Body parser (`express.json`)
3. Routes
4. 404 handler
5. Error handler (must be last)

### Connection Pool

- `mysql2/promise` for async/await
- `connectionLimit: 10`
- `charset: utf8mb4`
- `timezone: Z` (UTC)

### Error Envelope

Every error returns:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR" | ...,
    "message": "...",
    "details": { ... }
  },
  "meta": {
    "timestamp": "...",
    "path": "..."
  }
}