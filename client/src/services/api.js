// client/src/services/api.js
// HTTP client for the backend API

import { API_BASE_URL } from "../utils/constants";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  const response = await fetch(url, config);

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(body?.error?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.code = body?.error?.code || "HTTP_ERROR";
    error.details = body?.error?.details || null;
    error.body = body;
    throw error;
  }

  return body;
}

export const api = {
  health: () => request("/health"),

  syncReport: (payload) =>
    request("/reports/sync", { method: "POST", body: payload }),

  listReports: (query = "") => request(`/reports${query}`),

  getReport: (id) => request(`/reports/${id}`),

  updateStatus: (id, body) =>
    request(`/reports/${id}/status`, { method: "PATCH", body }),

  reopen: (id, body) =>
    request(`/reports/${id}/reopen`, { method: "POST", body }),

  history: (id) => request(`/reports/${id}/history`),

  softDelete: (id) => request(`/reports/${id}`, { method: "DELETE" }),
};
