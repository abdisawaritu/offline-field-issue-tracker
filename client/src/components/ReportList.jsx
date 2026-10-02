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

  const hasActiveFilters =
    filterStatus || filterPriority || filterCategory || search;

  function clearFilters() {
    setFilterStatus("");
    setFilterPriority("");
    setFilterCategory("");
    setSearch("");
  }

  return (
    <div>
      <div className="filters">
        <div className="filter-group filter-group-search">
          <label className="filter-label">Search</label>
          <input
            type="text"
            placeholder="Description, location, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
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
        </div>

        <div className="filter-group">
          <label className="filter-label">Priority</label>
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
        </div>

        <div className="filter-group">
          <label className="filter-label">Category</label>
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
        </div>

        {hasActiveFilters && (
          <button
            className="btn btn-ghost btn-sm filter-clear"
            onClick={clearFilters}
            type="button"
          >
            Clear
          </button>
        )}
      </div>

      <div className="list-summary">
        <span>
          Showing <strong>{filtered.length}</strong> of{" "}
          <strong>{reports.length}</strong> reports
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <div className="empty-title">
            {reports.length === 0 ? "No reports yet" : "No matches found"}
          </div>
          <div className="empty-text">
            {reports.length === 0
              ? "Create your first report to get started."
              : "Try clearing or changing your filters."}
          </div>
        </div>
      ) : (
        <div className="report-list">
          {filtered.map((r) => (
            <ReportCard key={r.clientId} report={r} showActions={showActions} />
          ))}
        </div>
      )}
    </div>
  );
}
