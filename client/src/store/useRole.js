// client/src/store/useRole.js
// Simulated auth: role persisted in localStorage
// All subscribers re-render when role changes (same tab + cross tab).

import { useEffect, useState } from "react";

const KEY = "offline-field-issue-tracker:role";
const DEFAULT = "field-worker";
const EVENT = "offline-field-issue-tracker:role-changed";

function readRole() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "field-worker" || v === "coordinator") return v;
    return DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function writeRole(role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* ignore */
  }
}

let currentRole = readRole();

export function getRole() {
  return currentRole;
}

export function setRole(role) {
  if (role !== "field-worker" && role !== "coordinator") return;
  currentRole = role;
  writeRole(role);

  // Notify all subscribers in this tab
  window.dispatchEvent(new CustomEvent(EVENT, { detail: role }));
}

export function useRole() {
  const [role, setLocal] = useState(currentRole);

  useEffect(() => {
    // Sync with changes from other tabs
    const onStorage = (e) => {
      if (e.key === KEY && e.newValue) {
        currentRole = e.newValue;
        setLocal(e.newValue);
      }
    };

    // Sync with changes in this tab
    const onCustom = (e) => {
      setLocal(e.detail);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT, onCustom);

    // Ensure in sync on mount
    const fresh = readRole();
    if (fresh !== role) setLocal(fresh);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT, onCustom);
    };
  }, [role]);

  return { role, setRole };
}
