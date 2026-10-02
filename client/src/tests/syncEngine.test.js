// client/src/tests/syncEngine.test.js

import { describe, it, expect, beforeEach, vi } from "vitest";
import { clearAll, getReport, getQueue } from "../services/db";
import { createLocalReport } from "../services/reportStore";
import { runSyncCycle } from "../services/syncEngine";
import * as api from "../services/api";
import * as connectivity from "../services/connectivity";

beforeEach(async () => {
  await clearAll();
  vi.restoreAllMocks();
});

describe("syncEngine", () => {
  it("syncs a pending report successfully", async () => {
    vi.spyOn(connectivity, "isEffectivelyOnline").mockResolvedValue(true);
    vi.spyOn(api.api, "syncReport").mockResolvedValue({
      success: true,
      data: {
        id: "server-uuid-1",
        clientId: "client-uuid-1",
        syncVersion: 1,
        duplicate: false,
        updated: false,
      },
    });

    const report = await createLocalReport({
      category: "Other",
      description: "Sync test report description",
      location: "Test",
      priority: "LOW",
      status: "SUBMITTED",
      createdBy: "tester",
    });

    const result = await runSyncCycle();

    expect(result.status).toBe("completed");
    expect(result.results[0].status).toBe("synced");

    const stored = await getReport(report.clientId);
    expect(stored.syncState).toBe("SYNCHRONIZED");
    expect(stored.serverId).toBe("server-uuid-1");

    const queue = await getQueue();
    expect(queue.length).toBe(0);
  });

  it("marks report as failed on permanent (400) error", async () => {
    vi.spyOn(connectivity, "isEffectivelyOnline").mockResolvedValue(true);
    const error = new Error("Validation error");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    vi.spyOn(api.api, "syncReport").mockRejectedValue(error);

    const report = await createLocalReport({
      category: "Other",
      description: "Permanent failure test description",
      location: "Test",
      priority: "LOW",
      status: "SUBMITTED",
      createdBy: "tester",
    });

    await runSyncCycle();

    const stored = await getReport(report.clientId);
    expect(stored.syncState).toBe("FAILED");
    expect(stored.lastError).toContain("Validation");
  });

  it("schedules retry on transient network error", async () => {
    vi.spyOn(connectivity, "isEffectivelyOnline").mockResolvedValue(true);
    const error = new Error("Network unreachable");
    error.status = 0;
    vi.spyOn(api.api, "syncReport").mockRejectedValue(error);

    const report = await createLocalReport({
      category: "Other",
      description: "Transient failure test description",
      location: "Test",
      priority: "LOW",
      status: "SUBMITTED",
      createdBy: "tester",
    });

    await runSyncCycle();

    const stored = await getReport(report.clientId);
    expect(stored.syncState).toBe("PENDING");
    expect(stored.lastError).toContain("Network");

    const queue = await getQueue();
    const item = queue.find((q) => q.clientId === report.clientId);
    expect(item.retryCount).toBe(1);
    expect(item.nextRetryAt).toBeDefined();
  });

  it("does not sync when offline", async () => {
    vi.spyOn(connectivity, "isEffectivelyOnline").mockResolvedValue(false);

    await createLocalReport({
      category: "Other",
      description: "Offline test report description",
      location: "Test",
      priority: "LOW",
      status: "SUBMITTED",
      createdBy: "tester",
    });

    const result = await runSyncCycle();
    expect(result.status).toBe("offline");
  });

  it("recovers interrupted sync (SYNCING → PENDING) and syncs", async () => {
    vi.spyOn(connectivity, "isEffectivelyOnline").mockResolvedValue(true);
    vi.spyOn(api.api, "syncReport").mockResolvedValue({
      success: true,
      data: { id: "server-uuid-2", syncVersion: 1, duplicate: false },
    });

    const report = await createLocalReport({
      category: "Other",
      description: "Interrupted sync test description",
      location: "Test",
      priority: "LOW",
      status: "SUBMITTED",
      createdBy: "tester",
    });

    // Simulate interrupted sync
    const { putReport } = await import("../services/db");
    const stored = await getReport(report.clientId);
    await putReport({ ...stored, syncState: "SYNCING" });

    const result = await runSyncCycle();
    expect(result.status).toBe("completed");

    const final = await getReport(report.clientId);
    expect(final.syncState).toBe("SYNCHRONIZED");
  });
});
