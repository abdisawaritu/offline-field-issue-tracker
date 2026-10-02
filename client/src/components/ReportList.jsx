// client/src/components/ReportList.jsx

import { useMemo, useState } from "react";
import ReportCard from "./ReportCard";
import {
  ALL_BUSINESS_STATUSES,
  PRIORITIES,
  CATEGORIES,
} from "../utils/constants";

export default function ReportList({ reports, showActions = true }) {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterPriority && r.priority !== filterPriority) return false;
      if (filterCategory && r.category !== filterCategory) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay =
          `${r.description} ${r.location} ${r.category}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [reports, filterStatus, filterPriority, filterCategory, search]);

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search description / location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {ALL_BUSINESS_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className="text-muted" style={{ fontSize: 13 }}>
          {filtered.length} of {reports.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No reports match the filters.</div>
      ) : (
        <div>
          {filtered.map((r) => (
            <ReportCard key={r.clientId} report={r} showActions={showActions} />
          ))}
        </div>
      )}
    </div>
  );
}
