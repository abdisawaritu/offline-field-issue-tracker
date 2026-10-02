-- Migration: 002_create_report_history
-- Purpose: Append-only audit log for report events

CREATE TABLE IF NOT EXISTS report_history (
    id              CHAR(36)        NOT NULL,
    report_id       CHAR(36)        NOT NULL,
    event_type      ENUM('CREATED', 'UPDATED', 'SYNC_STARTED', 'SYNC_SUCCEEDED', 'SYNC_FAILED', 'STATUS_CHANGED', 'CONFLICT_DETECTED', 'REOPENED', 'ASSIGNED') NOT NULL,
    from_status     ENUM('DRAFT', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NULL,
    to_status       ENUM('DRAFT', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NULL,
    actor           VARCHAR(100)    NOT NULL,
    details         JSON            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_history_report_id (report_id),
    KEY idx_history_event_type (event_type),
    KEY idx_history_created_at (created_at),
    CONSTRAINT fk_history_report
        FOREIGN KEY (report_id) REFERENCES reports(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;