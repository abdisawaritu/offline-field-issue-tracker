// client/src/store/useRole.js
// Simulated auth: role persisted in localStorage

import { useEffect, useState } from "react";

const KEY = "offline-field-issue-tracker:role";
const DEFAULT = "field-worker";

let subscribers = new Set();
let currentRole = (() => {
  try {
    return localStorage.getItem(KEY) || DEFAULT;
  } catch {
    return DEFAULT;
  }
})();

function emit() {
  for (const fn of subscribers) fn(currentRole);
}

export function getRole() {
  return currentRole;
}

export function setRole(role) {
  currentRole = role;
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* ignore */
  }
  emit();
}

export function useRole() {
  const [role, setLocal] = useState(currentRole);

  useEffect(() => {
    const fn = (r) => setLocal(r);
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }, []);

  return { role, setRole };
}
