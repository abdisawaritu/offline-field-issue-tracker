# Data Model

## Database

- **DBMS:** MySQL 8 (via MAMP on Windows 11)
- **Database name:** `field_issue_tracker`
- **Port:** 8889
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci
- **Engine:** InnoDB

## Tables

### `reports`

Core entity. Each row is one issue report.

| Column | Type | Notes |
|---|---|---|
| id | CHAR(36) | Server PK |
| client_id | CHAR(36) | Idempotency key, UNIQUE |
| category | VARCHAR(50) | Required |
| description | TEXT | Required |
| location | VARCHAR(255) | Required |
| latitude | DECIMAL(10,8) | Optional |
| longitude | DECIMAL(11,8) | Optional |
| priority | ENUM | LOW, MEDIUM, HIGH |
| status | ENUM | DRAFT, SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED |
| created_by | VARCHAR(100) | Simulated role |
| assigned_to | VARCHAR(100) | Optional |
| reported_at | DATETIME | Required |
| created_at | DATETIME | Auto |
| updated_at | DATETIME | Auto on update |
| client_updated_at | DATETIME | For conflict resolution |
| sync_version | INT | Optimistic locking |
| deleted | BOOLEAN | Soft delete |

### `report_history`

Append-only audit log.

| Column | Type | Notes |
|---|---|---|
| id | CHAR(36) | PK |
| report_id | CHAR(36) | FK to reports.id |
| event_type | ENUM | CREATED, UPDATED, SYNC_STARTED, SYNC_SUCCEEDED, SYNC_FAILED, STATUS_CHANGED, CONFLICT_DETECTED, REOPENED, ASSIGNED |
| from_status | ENUM | Nullable |
| to_status | ENUM | Nullable |
| actor | VARCHAR(100) | Who did it |
| details | JSON | Flexible payload |
| created_at | DATETIME | Auto |

### `sync_log`

Server-side observability for sync attempts.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| client_id | CHAR(36) | Idempotency key |
| report_id | CHAR(36) | Nullable |
| event | ENUM | RECEIVED, CREATED, DUPLICATE, UPDATED, REJECTED, ERROR |
| http_status | INT | Response code |
| message | VARCHAR(500) | Optional |
| created_at | DATETIME | Auto |

## Relationships

- `reports` 1:N `report_history` (via `report_id`, ON DELETE CASCADE)

## Idempotency

`reports.client_id` has a `UNIQUE` constraint. This is the database-level
guarantee that retries never create duplicate server records.

## Constraints Verified

- [x] `client_id` UNIQUE constraint rejects duplicates (error #1062)
- [x] `report_id` FOREIGN KEY prevents orphan history (error #1452)
- [x] ENUM values enforce valid priorities and statuses

## Migrations

- `001_create_reports.sql`
- `002_create_report_history.sql`
- `003_create_sync_log.sql`

## Seed Data

`seeds/seed.sql` contains 3 demonstration reports.

## Verification Results

| Test | Result |
|---|---|
| Create database | ✅ |
| Create 3 tables | ✅ |
| Insert 3 seed reports | ✅ |
| Duplicate `client_id` insert | ✅ Rejected (error #1062) |
| Orphan history insert | ✅ Rejected (error #1452) |
| Valid history insert | ✅ Accepted |