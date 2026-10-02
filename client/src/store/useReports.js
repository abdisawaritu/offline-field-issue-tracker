// client/src/store/useReports.js
// Reactive hooks over IndexedDB via Dexie's useLiveQuery

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../services/db";

/**
 * Returns all reports, newest first.
 * Reactively updates when IndexedDB changes.
 */
export function useReports() {
  const reports =
    useLiveQuery(async () => {
      return db.reports.orderBy("createdAt").reverse().toArray();
    }, []) || [];
  return reports;
}

/**
 * Returns a single report by clientId, or null.
 */
export function useReport(clientId) {
  const report = useLiveQuery(async () => {
    if (!clientId) return null;
    return db.reports.get(clientId);
  }, [clientId]);
  return report || null;
}

/**
 * Returns history for a report, ordered by createdAt ascending.
 */
export function useReportHistory(clientId) {
  const history =
    useLiveQuery(async () => {
      if (!clientId) return [];
      return db.history
        .where("reportClientId")
        .equals(clientId)
        .sortBy("createdAt");
    }, [clientId]) || [];
  return history;
}
