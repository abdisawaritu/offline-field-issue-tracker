// client/src/utils/validation.js
// Client-side validation — mirrors backend rules

import { CATEGORIES, PRIORITIES, ALL_BUSINESS_STATUSES } from "./constants";
import { isValidUuid } from "./uuid";

/**
 * Validate a report object.
 * Returns { valid: boolean, errors: { field: message } }.
 */
export function validateReport(report) {
  const errors = {};

  if (!report) {
    return { valid: false, errors: { _: "Report is required" } };
  }

  if (!report.clientId || !isValidUuid(report.clientId)) {
    errors.clientId = "A valid clientId (UUID) is required";
  }

  if (!report.category || !CATEGORIES.includes(report.category)) {
    errors.category = "Please select a valid category";
  }

  if (!report.description || report.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  } else if (report.description.length > 2000) {
    errors.description = "Description must be at most 2000 characters";
  }

  if (!report.location || report.location.trim().length === 0) {
    errors.location = "Location is required";
  } else if (report.location.length > 255) {
    errors.location = "Location must be at most 255 characters";
  }

  if (!report.priority || !PRIORITIES.includes(report.priority)) {
    errors.priority = "Please select a valid priority";
  }

  if (!report.status || !ALL_BUSINESS_STATUSES.includes(report.status)) {
    errors.status = "Please select a valid status";
  }

  if (!report.createdBy || report.createdBy.trim().length === 0) {
    errors.createdBy = "Creator is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
