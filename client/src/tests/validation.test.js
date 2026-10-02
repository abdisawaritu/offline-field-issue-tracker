// client/src/tests/validation.test.js

import { describe, it, expect } from "vitest";
import { validateReport } from "../utils/validation";

const validReport = {
  clientId: "550e8400-e29b-41d4-a716-446655440000",
  category: "Broken Water Point",
  description: "This is a valid description of sufficient length",
  location: "Test Location",
  priority: "HIGH",
  status: "SUBMITTED",
  createdBy: "test-worker",
};

describe("validateReport", () => {
  it("returns valid for a complete report", () => {
    const { valid, errors } = validateReport(validReport);
    expect(valid).toBe(true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("requires clientId", () => {
    const { valid, errors } = validateReport({ ...validReport, clientId: "" });
    expect(valid).toBe(false);
    expect(errors.clientId).toBeDefined();
  });

  it("requires valid UUID for clientId", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      clientId: "not-a-uuid",
    });
    expect(valid).toBe(false);
    expect(errors.clientId).toBeDefined();
  });

  it("requires valid category", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      category: "Invalid Category",
    });
    expect(valid).toBe(false);
    expect(errors.category).toBeDefined();
  });

  it("requires description of at least 10 chars", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      description: "short",
    });
    expect(valid).toBe(false);
    expect(errors.description).toBeDefined();
  });

  it("rejects description over 2000 chars", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      description: "x".repeat(2001),
    });
    expect(valid).toBe(false);
    expect(errors.description).toBeDefined();
  });

  it("requires location", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      location: "",
    });
    expect(valid).toBe(false);
    expect(errors.location).toBeDefined();
  });

  it("requires valid priority", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      priority: "URGENT",
    });
    expect(valid).toBe(false);
    expect(errors.priority).toBeDefined();
  });

  it("requires valid status", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      status: "FOO",
    });
    expect(valid).toBe(false);
    expect(errors.status).toBeDefined();
  });

  it("requires createdBy", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      createdBy: "",
    });
    expect(valid).toBe(false);
    expect(errors.createdBy).toBeDefined();
  });

  it("returns multiple errors for multiple issues", () => {
    const { valid, errors } = validateReport({
      ...validReport,
      description: "x",
      location: "",
    });
    expect(valid).toBe(false);
    expect(errors.description).toBeDefined();
    expect(errors.location).toBeDefined();
  });
});
