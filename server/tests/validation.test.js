// server/tests/validation.test.js

const request = require("supertest");
const app = require("../src/app");
const { pool } = require("../src/config/db");

afterAll(async () => {
  await pool.end();
});

test("missing required fields returns 400 VALIDATION_ERROR", async () => {
  const res = await request(app)
    .post("/api/v1/reports/sync")
    .send({ clientId: "eeeeeeee-5555-4555-8555-555555555555" });

  expect(res.statusCode).toBe(400);
  expect(res.body.error.code).toBe("VALIDATION_ERROR");
  expect(Array.isArray(res.body.error.details)).toBe(true);
});

test("invalid priority returns 400", async () => {
  const res = await request(app).post("/api/v1/reports/sync").send({
    clientId: "eeeeeeee-5555-4555-8555-555555555555",
    category: "Broken Water Point",
    description: "Valid description length here",
    location: "Test Location",
    priority: "URGENT",
    status: "SUBMITTED",
    createdBy: "tester",
    reportedAt: "2026-10-01T10:00:00Z",
    clientUpdatedAt: "2026-10-01T10:00:00Z",
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.error.code).toBe("VALIDATION_ERROR");
});

test("invalid status returns 400", async () => {
  const res = await request(app).post("/api/v1/reports/sync").send({
    clientId: "eeeeeeee-5555-4555-8555-555555555555",
    category: "Broken Water Point",
    description: "Valid description length here",
    location: "Test Location",
    priority: "HIGH",
    status: "FOO",
    createdBy: "tester",
    reportedAt: "2026-10-01T10:00:00Z",
    clientUpdatedAt: "2026-10-01T10:00:00Z",
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.error.code).toBe("VALIDATION_ERROR");
});

test("unknown route returns 404 with standard envelope", async () => {
  const res = await request(app).get("/api/v1/does-not-exist");
  expect(res.statusCode).toBe(404);
  expect(res.body.error.code).toBe("NOT_FOUND");
});
