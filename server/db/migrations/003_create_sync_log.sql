-- Migration: 003_create_sync_log
-- Purpose: Server-side observability for sync attempts

CREATE TABLE IF NOT EXISTS sync_log (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    client_id       CHAR(36)        NOT NULL,
    report_id       CHAR(36)        NULL,
    event           ENUM('RECEIVED', 'CREATED', 'DUPLICATE', 'UPDATED', 'REJECTED', 'ERROR') NOT NULL,
    http_status     INT             NOT NULL,
    message         VARCHAR(500)    NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sync_log_client_id (client_id),
    KEY idx_sync_log_event (event),
    KEY idx_sync_log_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;