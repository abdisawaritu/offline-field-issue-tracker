// client/src/tests/retryPolicy.test.js

import { describe, it, expect } from "vitest";
import {
  computeBackoffDelay,
  hasRetriesLeft,
  nextRetryDate,
  isRetryDue,
  MAX_RETRIES,
} from "../services/retryPolicy";

describe("retryPolicy", () => {
  it("computes backoff delay for attempt 1", () => {
    const delay = computeBackoffDelay(1);
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(2000);
  });

  it("computes larger delay for attempt 2", () => {
    const d1 = computeBackoffDelay(1);
    const d2 = computeBackoffDelay(2);
    // Both have jitter, but d2 base is 2000, so minimum is 2000
    expect(d2).toBeGreaterThanOrEqual(2000);
  });

  it("caps delay at MAX_RETRY_DELAY_MS", () => {
    const delay = computeBackoffDelay(20);
    expect(delay).toBeLessThanOrEqual(61000);
  });

  it("hasRetriesLeft is true for 0-4", () => {
    expect(hasRetriesLeft(0)).toBe(true);
    expect(hasRetriesLeft(4)).toBe(true);
  });

  it("hasRetriesLeft is false for MAX_RETRIES", () => {
    expect(hasRetriesLeft(MAX_RETRIES)).toBe(false);
    expect(hasRetriesLeft(MAX_RETRIES + 1)).toBe(false);
  });

  it("nextRetryDate returns ISO string in the future", () => {
    const next = nextRetryDate(1);
    expect(new Date(next).getTime()).toBeGreaterThan(Date.now());
  });

  it("isRetryDue returns true when nextRetryAt is null", () => {
    expect(isRetryDue(null)).toBe(true);
  });

  it("isRetryDue returns true when nextRetryAt is in the past", () => {
    const past = new Date(Date.now() - 60000).toISOString();
    expect(isRetryDue(past)).toBe(true);
  });

  it("isRetryDue returns false when nextRetryAt is in the future", () => {
    const future = new Date(Date.now() + 60000).toISOString();
    expect(isRetryDue(future)).toBe(false);
  });
});
