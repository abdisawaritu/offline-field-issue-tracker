// client/src/services/connectivity.js
// Tracks online/offline status with a secondary server ping

import { API_BASE_URL } from "../utils/constants";

let listeners = new Set();

export function isBrowserOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

export async function pingServer(timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(id);
    return res.ok;
  } catch {
    clearTimeout(id);
    return false;
  }
}

export async function isEffectivelyOnline() {
  if (!isBrowserOnline()) return false;
  return pingServer();
}

export function subscribeConnectivity(callback) {
  listeners.add(callback);
  const onOnline = () => callback(true);
  const onOffline = () => callback(false);

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}
