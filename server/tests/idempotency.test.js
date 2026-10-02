// server/tests/idempotency.test.js

const request = require("supertest");
const app = require("../src/app");
const { pool } = require("../src/config/db");

const CLIENT_ID = "cccccccc-3333-4333-8333-333333333333";

function payload(overrides = {}) {
  return {
    clientId: CLIENT_ID,
    category: "Broken Water Point",
    description: "Test report for idempotency check",
    location: "Test Location",
    priority: "HIGH",
    status: "SUBMITTED",
    createdBy: "test-worker",
    reportedAt: "2026-10-01T10:00:00Z",
    clientUpdatedAt: "2026-10-01T10:00:00Z",
    ...overrides,
  };
}

beforeAll(async () => {
  await pool.query("DELETE FROM sync_log WHERE client_id = ?", [CLIENT_ID]);
  await pool.query(
    "DELETE FROM report_history WHERE report_id IN (SELECT id FROM reports WHERE client_id = ?)",
    [CLIENT_ID],
  );
  await pool.query("DELETE FROM reports WHERE client_id = ?", [CLIENT_ID]);
});

afterAll(async () => {
  await pool.query("DELETE FROM sync_log WHERE client_id = ?", [CLIENT_ID]);
  await pool.query(
    "DELETE FROM report_history WHERE report_id IN (SELECT id FROM reports WHERE client_id = ?)",
    [CLIENT_ID],
  );
  await pool.query("DELETE FROM reports WHERE client_id = ?", [CLIENT_ID]);
  await pool.end();
});

test("first sync creates a new report (201, duplicate:false)", async () => {
  const res = await request(app).post("/api/v1/reports/sync").send(payload());
  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.duplicate).toBe(false);
});

test("retry with same clientId does NOT create a duplicate (200, duplicate:true)", async () => {
  const res = await request(app).post("/api/v1/reports/sync").send(payload());
  expect(res.statusCode).toBe(200);
  expect(res.body.data.duplicate).toBe(true);

  const [rows] = await pool.query(
    "SELECT COUNT(*) AS c FROM reports WHERE client_id = ?",
    [CLIENT_ID],
  );
  expect(rows[0].c).toBe(1);
});

test("newer clientUpdatedAt updates the existing row", async () => {
  const res = await request(app)
    .post("/api/v1/reports/sync")
    .send(
      payload({
        description: "Updated description after inspection",
        clientUpdatedAt: "2026-10-01T11:00:00Z",
      }),
    );

  expect(res.statusCode).toBe(200);
  expect(res.body.data.updated).toBe(true);

  const [rows] = await pool.query(
    "SELECT description FROM reports WHERE client_id = ?",
    [CLIENT_ID],
  );
  expect(rows[0].description).toContain("Updated");
});
