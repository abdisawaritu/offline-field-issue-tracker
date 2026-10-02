// client/src/tests/db.test.js

import { describe, it, expect, beforeEach } from "vitest";
import {
  db,
  putReport,
  getReport,
  getAllReports,
  enqueueSync,
  getQueue,
  clearAll,
  putHistory,
  getHistoryForReport,
} from "../services/db";
import {
  createLocalReport,
  updateLocalReport,
  markSyncing,
  markSynced,
  markFailed,
} from "../services/reportStore";

beforeEach(async () => {
  await clearAll();
});

describe("IndexedDB basic operations", () => {
  it("stores and retrieves a report by clientId", async () => {
    const report = {
      clientId: "test-uuid-1",
      category: "Other",
      description: "test description long enough",
      location: "Test",
      priority: "LOW",
      status: "DRAFT",
      createdBy: "tester",
      syncState: "PENDING",
      createdAt: new Date().toISOString(),
    };

    await putReport(report);
    const fetched = await getReport("test-uuid-1");

    expect(fetched).toBeDefined();
    expect(fetched.clientId).toBe("test-uuid-1");
    expect(fetched.category).toBe("Other");
  });

  it("returns all reports ordered by createdAt", async () => {
    await putReport({
      clientId: "a",
      createdAt: "2026-01-01T00:00:00Z",
      syncState: "PENDING",
    });
    await putReport({
      clientId: "b",
      createdAt: "2026-01-02T00:00:00Z",
      syncState: "PENDING",
    });

    const all = await getAllReports();
    expect(all.length).toBe(2);
    expect(all[0].clientId).toBe("b"); // newest first
  });
});

describe("Sync queue", () => {
  it("enqueues and retrieves items", async () => {
    await enqueueSync("uuid-1");
    await enqueueSync("uuid-2");

    const queue = await getQueue();
    expect(queue.length).toBe(2);
    expect(queue.map((q) => q.clientId)).toContain("uuid-1");
  });
});

describe("createLocalReport", () => {
  it("creates a report with PENDING sync state and history entry", async () => {
    const report = await createLocalReport({
      category: "Safety Concern",
      description: "There is exposed wiring here",
      location: "School",
      priority: "HIGH",
      status: "SUBMITTED",
      createdBy: "worker-1",
    });

    expect(report.clientId).toBeDefined();
    expect(report.syncState).toBe("PENDING");

    const stored = await getReport(report.clientId);
    expect(stored).toBeDefined();

    const history = await getHistoryForReport(report.clientId);
    expect(history.length).toBe(1);
    expect(history[0].eventType).toBe("CREATED");

    const queue = await getQueue();
    expect(queue.length).toBe(1);
  });
});

describe("Report state transitions", () => {
  it("markSyncing → markSynced sets SYNCHRONIZED state", async () => {
    const report = await createLocalReport({
      category: "Other",
      description: "Test description long enough",
      location: "Test",
      priority: "LOW",
      status: "SUBMITTED",
      createdBy: "tester",
    });

    await markSyncing(report.clientId);
    let stored = await getReport(report.clientId);
    expect(stored.syncState).toBe("SYNCING");

    await markSynced(report.clientId, { id: "server-123", syncVersion: 1 });
    stored = await getReport(report.clientId);
    expect(stored.syncState).toBe("SYNCHRONIZED");
    expect(stored.serverId).toBe("server-123");
  });

  it("markFailed sets FAILED state with error message", async () => {
    const report = await createLocalReport({
      category: "Other",
      description: "Test description long enough",
      location: "Test",
      priority: "LOW",
      status: "SUBMITTED",
      createdBy: "tester",
    });

    await markFailed(report.clientId, "Network unreachable");
    const stored = await getReport(report.clientId);
    expect(stored.syncState).toBe("FAILED");
    expect(stored.lastError).toBe("Network unreachable");
  });
});

describe("Persistence", () => {
  it("reports survive a simulated reload (fresh read from DB)", async () => {
    await createLocalReport({
      category: "Other",
      description: "Persistent report description",
      location: "Test",
      priority: "LOW",
      status: "DRAFT",
      createdBy: "tester",
    });

    // Simulate reload by reading fresh from DB
    const all = await getAllReports();
    expect(all.length).toBe(1);
  });
});
