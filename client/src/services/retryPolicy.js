// client/src/services/retryPolicy.js
// Exponential backoff with jitter

import {
  MAX_RETRIES,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
} from "../utils/constants";

/**
 * Compute the delay before the next retry.
 * Formula: min(MAX_DELAY, BASE * 2^(retryCount - 1)) + jitter
 */
export function computeBackoffDelay(retryCount) {
  const attempt = Math.max(1, retryCount);
  const base = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
  const capped = Math.min(base, MAX_RETRY_DELAY_MS);
  const jitter = Math.floor(Math.random() * 1000);
  return capped + jitter;
}

export function hasRetriesLeft(retryCount) {
  return retryCount < MAX_RETRIES;
}

export function nextRetryDate(retryCount) {
  return new Date(Date.now() + computeBackoffDelay(retryCount)).toISOString();
}

export function isRetryDue(nextRetryAt) {
  if (!nextRetryAt) return true;
  return new Date(nextRetryAt).getTime() <= Date.now();
}

export { MAX_RETRIES };
