// server/src/validators/reportValidators.js
// Zod schemas for request validation

const { z } = require("zod");
const { ALL_STATUSES } = require("../utils/stateMachine");

const CATEGORIES = [
  "Broken Water Point",
  "Damaged Equipment",
  "Service Interruption",
  "Safety Concern",
  "Maintenance Requirement",
  "Other",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const historyEventSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid history id"),
  eventType: z.string().min(1),
  fromStatus: z.enum(ALL_STATUSES).nullable().optional(),
  toStatus: z.enum(ALL_STATUSES).nullable().optional(),
  actor: z.string().min(1).max(100),
  details: z.record(z.any()).optional().nullable(),
  createdAt: z.string().datetime(),
});

const syncReportSchema = z.object({
  clientId: z.string().regex(uuidRegex, "clientId must be a valid UUID"),

  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),

  location: z
    .string()
    .min(1, "Location is required")
    .max(255, "Location must be at most 255 characters"),

  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),

  priority: z.enum(PRIORITIES, {
    errorMap: () => ({
      message: `Priority must be one of: ${PRIORITIES.join(", ")}`,
    }),
  }),

  status: z.enum(ALL_STATUSES, {
    errorMap: () => ({
      message: `Status must be one of: ${ALL_STATUSES.join(", ")}`,
    }),
  }),

  createdBy: z.string().min(1).max(100),
  assignedTo: z.string().min(1).max(100).nullable().optional(),

  reportedAt: z.string().datetime(),
  clientUpdatedAt: z.string().datetime(),

  history: z.array(historyEventSchema).optional().default([]),
});

const updateStatusSchema = z.object({
  toStatus: z.enum(ALL_STATUSES, {
    errorMap: () => ({
      message: `toStatus must be one of: ${ALL_STATUSES.join(", ")}`,
    }),
  }),
  actor: z.string().min(1).max(100),
  assignedTo: z.string().min(1).max(100).nullable().optional(),
  reason: z.string().max(500).optional().nullable(),
});

const reopenSchema = z.object({
  actor: z.string().min(1).max(100),
  reason: z.string().max(500).optional().nullable(),
});

module.exports = {
  CATEGORIES,
  PRIORITIES,
  syncReportSchema,
  updateStatusSchema,
  reopenSchema,
};
