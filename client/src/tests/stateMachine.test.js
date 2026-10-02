// client/src/tests/stateMachine.test.js

import { describe, it, expect } from "vitest";
import {
  canTransition,
  getAllowedTransitions,
  canReopen,
} from "../utils/stateMachine";
import { BUSINESS_STATUS } from "../utils/constants";

describe("stateMachine", () => {
  it("allows DRAFT → SUBMITTED", () => {
    expect(canTransition("DRAFT", "SUBMITTED")).toBe(true);
  });

  it("allows SUBMITTED → ASSIGNED", () => {
    expect(canTransition("SUBMITTED", "ASSIGNED")).toBe(true);
  });

  it("allows SUBMITTED → REJECTED", () => {
    expect(canTransition("SUBMITTED", "REJECTED")).toBe(true);
  });

  it("allows ASSIGNED → IN_PROGRESS", () => {
    expect(canTransition("ASSIGNED", "IN_PROGRESS")).toBe(true);
  });

  it("allows ASSIGNED → REJECTED", () => {
    expect(canTransition("ASSIGNED", "REJECTED")).toBe(true);
  });

  it("allows IN_PROGRESS → RESOLVED", () => {
    expect(canTransition("IN_PROGRESS", "RESOLVED")).toBe(true);
  });

  it("allows IN_PROGRESS → REJECTED", () => {
    expect(canTransition("IN_PROGRESS", "REJECTED")).toBe(true);
  });

  it("allows RESOLVED → IN_PROGRESS (reopen)", () => {
    expect(canTransition("RESOLVED", "IN_PROGRESS")).toBe(true);
  });

  it("allows REJECTED → SUBMITTED (reopen)", () => {
    expect(canTransition("REJECTED", "SUBMITTED")).toBe(true);
  });

  it("rejects DRAFT → RESOLVED", () => {
    expect(canTransition("DRAFT", "RESOLVED")).toBe(false);
  });

  it("rejects ASSIGNED → RESOLVED", () => {
    expect(canTransition("ASSIGNED", "RESOLVED")).toBe(false);
  });

  it("rejects DRAFT → IN_PROGRESS", () => {
    expect(canTransition("DRAFT", "IN_PROGRESS")).toBe(false);
  });

  it("rejects RESOLVED → SUBMITTED", () => {
    expect(canTransition("RESOLVED", "SUBMITTED")).toBe(false);
  });

  it("returns correct allowed transitions for SUBMITTED", () => {
    const allowed = getAllowedTransitions("SUBMITTED");
    expect(allowed).toContain("ASSIGNED");
    expect(allowed).toContain("REJECTED");
    expect(allowed).not.toContain("RESOLVED");
  });

  it("canReopen returns true for RESOLVED", () => {
    expect(canReopen("RESOLVED")).toBe(true);
  });

  it("canReopen returns true for REJECTED", () => {
    expect(canReopen("REJECTED")).toBe(true);
  });

  it("canReopen returns false for SUBMITTED", () => {
    expect(canReopen("SUBMITTED")).toBe(false);
  });

  it("canReopen returns false for DRAFT", () => {
    expect(canReopen("DRAFT")).toBe(false);
  });
});
