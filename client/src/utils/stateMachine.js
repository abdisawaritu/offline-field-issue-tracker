// client/src/utils/stateMachine.js
// Mirrors the backend state machine — keep in sync

import { BUSINESS_STATUS } from "./constants";

const VALID_TRANSITIONS = {
  [BUSINESS_STATUS.DRAFT]: [BUSINESS_STATUS.SUBMITTED],
  [BUSINESS_STATUS.SUBMITTED]: [
    BUSINESS_STATUS.ASSIGNED,
    BUSINESS_STATUS.REJECTED,
  ],
  [BUSINESS_STATUS.ASSIGNED]: [
    BUSINESS_STATUS.IN_PROGRESS,
    BUSINESS_STATUS.REJECTED,
  ],
  [BUSINESS_STATUS.IN_PROGRESS]: [
    BUSINESS_STATUS.RESOLVED,
    BUSINESS_STATUS.REJECTED,
  ],
  [BUSINESS_STATUS.RESOLVED]: [BUSINESS_STATUS.IN_PROGRESS],
  [BUSINESS_STATUS.REJECTED]: [BUSINESS_STATUS.SUBMITTED],
};

export function canTransition(fromStatus, toStatus) {
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

export function getAllowedTransitions(fromStatus) {
  return VALID_TRANSITIONS[fromStatus] || [];
}

export function canReopen(status) {
  return (
    status === BUSINESS_STATUS.RESOLVED || status === BUSINESS_STATUS.REJECTED
  );
}
