-- Migration: 001_create_reports
-- Purpose: Core reports table with idempotency support

CREATE TABLE IF NOT EXISTS reports (
    id                  CHAR(36)        NOT NULL,
    client_id           CHAR(36)        NOT NULL,
    category            VARCHAR(50)     NOT NULL,
    description         TEXT            NOT NULL,
    location            VARCHAR(255)    NOT NULL,
    latitude            DECIMAL(10, 8)  NULL,
    longitude           DECIMAL(11, 8)  NULL,
    priority            ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    status              ENUM('DRAFT', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    created_by          VARCHAR(100)    NOT NULL,
    assigned_to         VARCHAR(100)    NULL,
    reported_at         DATETIME        NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    client_updated_at   DATETIME        NOT NULL,
    sync_version        INT             NOT NULL DEFAULT 1,
    deleted             BOOLEAN         NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_reports_client_id (client_id),
    KEY idx_reports_status (status),
    KEY idx_reports_priority (priority),
    KEY idx_reports_created_at (created_at),
    KEY idx_reports_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;