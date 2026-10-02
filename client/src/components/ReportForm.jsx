// client/src/components/ReportForm.jsx

import { useState } from "react";
import { createLocalReport } from "../services/reportStore";
import { CATEGORIES, PRIORITIES, BUSINESS_STATUS } from "../utils/constants";
import { useRole } from "../store/useRole";

export default function ReportForm({ onCreated }) {
  const { role } = useRole();

  const [form, setForm] = useState({
    category: CATEGORIES[0],
    description: "",
    location: "",
    priority: "MEDIUM",
    status: BUSINESS_STATUS.SUBMITTED,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);

    const localErrors = {};
    if (!form.category) localErrors.category = "Required";
    if (!form.description || form.description.length < 10)
      localErrors.description = "At least 10 characters";
    if (!form.location || form.location.trim().length === 0)
      localErrors.location = "Required";
    if (!form.priority) localErrors.priority = "Required";

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createLocalReport({
        category: form.category,
        description: form.description,
        location: form.location,
        priority: form.priority,
        status: form.status,
        createdBy: role,
      });

      setSuccess(true);
      setForm({
        category: CATEGORIES[0],
        description: "",
        location: "",
        priority: "MEDIUM",
        status: BUSINESS_STATUS.SUBMITTED,
      });

      if (onCreated) onCreated();

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <header className="card-header">
        <h2>Create new report</h2>
        <p className="card-subtitle">
          Reports are saved locally and sync automatically when online.
        </p>
      </header>

      {success && (
        <div className="alert alert-success">
          <strong>Report created.</strong> It will sync automatically when
          online.
        </div>
      )}

      {errors.submit && (
        <div className="alert alert-error">{errors.submit}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the issue in detail — location, context, symptoms"
            rows={4}
          />
          {errors.description ? (
            <div className="form-error">{errors.description}</div>
          ) : (
            <div className="form-hint">
              Minimum 10 characters. Include what is broken and how it affects
              people.
            </div>
          )}
        </div>

        <div className="form-row">
          <label>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Gode village, near the health center"
          />
          {errors.location ? (
            <div className="form-error">{errors.location}</div>
          ) : (
            <div className="form-hint">
              Be as specific as possible for the coordinator.
            </div>
          )}
        </div>

        <div className="form-row-2col">
          <div className="form-row">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value={BUSINESS_STATUS.DRAFT}>Draft</option>
              <option value={BUSINESS_STATUS.SUBMITTED}>Submitted</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create report"}
          </button>
        </div>
      </form>
    </div>
  );
}
