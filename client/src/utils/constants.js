// client/src/utils/constants.js
// Shared constants — must match the backend

export const CATEGORIES = [
  "Broken Water Point",
  "Damaged Equipment",
  "Service Interruption",
  "Safety Concern",
  "Maintenance Requirement",
  "Other",
];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export const BUSINESS_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

export const ALL_BUSINESS_STATUSES = Object.values(BUSINESS_STATUS);

export const SYNC_STATUS = {
  PENDING: "PENDING",
  SYNCING: "SYNCING",
  SYNCHRONIZED: "SYNCHRONIZED",
  FAILED: "FAILED",
};

export const ALL_SYNC_STATUSES = Object.values(SYNC_STATUS);

export const HISTORY_EVENTS = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  SYNC_STARTED: "SYNC_STARTED",
  SYNC_SUCCEEDED: "SYNC_SUCCEEDED",
  SYNC_FAILED: "SYNC_FAILED",
  STATUS_CHANGED: "STATUS_CHANGED",
  CONFLICT_DETECTED: "CONFLICT_DETECTED",
  REOPENED: "REOPENED",
  ASSIGNED: "ASSIGNED",
};

export const MAX_RETRIES = 5;
export const BASE_RETRY_DELAY_MS = 1000;
export const MAX_RETRY_DELAY_MS = 60000;
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
