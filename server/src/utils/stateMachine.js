// server/src/utils/stateMachine.js
// Business status workflow enforcement

const STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

const ALL_STATUSES = Object.values(STATUS);

/**
 * Valid transitions from each state.
 * Any transition not listed here is INVALID.
 */
const VALID_TRANSITIONS = {
  [STATUS.DRAFT]: [STATUS.SUBMITTED],
  [STATUS.SUBMITTED]: [STATUS.ASSIGNED, STATUS.REJECTED],
  [STATUS.ASSIGNED]: [STATUS.IN_PROGRESS, STATUS.REJECTED],
  [STATUS.IN_PROGRESS]: [STATUS.RESOLVED, STATUS.REJECTED],
  [STATUS.RESOLVED]: [STATUS.IN_PROGRESS], // reopen
  [STATUS.REJECTED]: [STATUS.SUBMITTED], // reopen
};

/**
 * Reopen rules — only these transitions are allowed via /reopen endpoint.
 */
const REOPEN_TRANSITIONS = {
  [STATUS.RESOLVED]: STATUS.IN_PROGRESS,
  [STATUS.REJECTED]: STATUS.SUBMITTED,
};

function isValidStatus(value) {
  return ALL_STATUSES.includes(value);
}

function canTransition(fromStatus, toStatus) {
  if (!isValidStatus(fromStatus) || !isValidStatus(toStatus)) {
    return false;
  }
  return (VALID_TRANSITIONS[fromStatus] || []).includes(toStatus);
}

function getAllowedTransitions(fromStatus) {
  return VALID_TRANSITIONS[fromStatus] || [];
}

function canReopen(currentStatus) {
  return Object.prototype.hasOwnProperty.call(
    REOPEN_TRANSITIONS,
    currentStatus,
  );
}

function getReopenTarget(currentStatus) {
  return REOPEN_TRANSITIONS[currentStatus] || null;
}

module.exports = {
  STATUS,
  ALL_STATUSES,
  VALID_TRANSITIONS,
  REOPEN_TRANSITIONS,
  isValidStatus,
  canTransition,
  getAllowedTransitions,
  canReopen,
  getReopenTarget,
};
