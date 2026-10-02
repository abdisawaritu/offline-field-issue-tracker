// client/src/store/useReports.js
// Reactive hook that subscribes to IndexedDB report changes

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../services/db";

export function useReports() {
  const reports =
    useLiveQuery(async () => {
      const all = await db.reports.orderBy("createdAt").reverse().toArray();
      return all;
    }, []) || [];

  return reports;
}

export function useReport(clientId) {
  const report = useLiveQuery(async () => {
    if (!clientId) return null;
    return db.reports.get(clientId);
  }, [clientId]);

  return report || null;
}

export function useReportHistory(clientId) {
  const history = useLiveQuery(async () => {
    if (!clientId) return [];
    return db.history
      .where("reportClientId")
      .equals(clientId)
      .sortBy("createdAt");
  }, [clientId]);

  return history || [];
}
