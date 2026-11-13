// ReportSubmission.jsx
import { useState, useMemo } from "react";
import { useApp } from "../store/AppContext";
import { validateReportForm } from "../utils/validator";
import { detectCategory, determinePriority, generateReportId } from "../utils/classifier";
import { dispatchReport } from "../utils/routerLogic";
import { ZONES, CATEGORIES, PRIORITIES } from "../store/mockData";

const URGENCY_OPTS = ["LOW", "MEDIUM", "HIGH", "CRITICAL", "EMERGENCY"];

const emptyForm = {
  reporterName: "", contact: "", zone: "", category: "",
  urgency: "", description: "", relevantCode: "",
};

export default function ReportSubmission() {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-detect category from description
  const detectedCategory = useMemo(() => {
    if (form.description.length > 10 && !form.category) {
      return detectCategory(form.description);
    }
    return form.category || null;
  }, [form.description, form.category]);

  const detectedPriority = useMemo(() => {
    if (detectedCategory && form.urgency) {
      return determinePriority(form.urgency, detectedCategory);
    }
    return null;
  }, [detectedCategory, form.urgency]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Clear error on change
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors: e } = validateReportForm({ ...form, [field]: form[field] });
    if (e[field]) setErrors((prev) => ({ ...prev, [field]: e[field] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { valid, errors: e2 } = validateReportForm(form);
    if (!valid) { setErrors(e2); setTouched(Object.fromEntries(Object.keys(emptyForm).map((k) => [k, true]))); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate API

    const finalCategory = form.category || detectedCategory || "ACCIDENT";
    const finalPriority = detectedPriority || "MEDIUM";
    const reportId = generateReportId(form.zone, state.reports);

    const { handler, isBackup, isQueued, reason } = dispatchReport(
      form.zone, finalCategory, finalPriority, state.handlers
    );

    const newReport = {
      id: reportId,
      reporterName: form.reporterName,
      contact: form.contact,
      zone: form.zone,
      category: finalCategory,
      priority: finalPriority,
      urgency: form.urgency,
      status: isQueued ? "PENDING" : "ASSIGNED",
      assignedHandler: handler?.id || null,
      description: form.description,
      relevantCode: form.relevantCode,
      submittedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_REPORT", payload: newReport });
    if (handler) {
      dispatch({ type: "UPDATE_HANDLER", payload: { id: handler.id, current: handler.current + 1 } });
    }

    setSubmitted({ report: newReport, handler, isBackup, isQueued, reason });
    setLoading(false);
    setForm(emptyForm);
    setTouched({});
    setErrors({});
  }

  function resetForm() { setSubmitted(null); }

  if (submitted) {
    const { report, handler, isBackup, isQueued, reason } = submitted;
    return (
      <div className="page-container animate-fade-up">
        <div className="page-header">
          <div className="page-title">Report <span>Submitted</span></div>
          <div className="page-subtitle">Your report has been registered successfully</div>
        </div>

        <div className="report-card-submitted" style={{ maxWidth: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 36 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Report ID Generated</div>
              <div className="report-id-display">{report.id}</div>
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              ["Reporter", report.reporterName],
              ["Contact", report.contact],
              ["Zone", report.zone],
              ["Urgency", report.urgency],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span className={`badge badge-${report.category.toLowerCase()}`}>
              {report.category === "FIRE" ? "🔥" : report.category === "MEDICAL" ? "🏥" : report.category === "CRIME" ? "🚔" : report.category === "FLOOD" ? "🌊" : "🚗"} {report.category}
            </span>
            <span className={`badge badge-${report.priority.toLowerCase()}`}>{report.priority}</span>
            <span className={`badge badge-${report.status.toLowerCase().replace("_","")}`}>{report.status}</span>
          </div>

          {isQueued ? (
            <div className="alert alert-warning">
              ⏳ <div>Report queued — all handlers in zone <strong>{report.zone}</strong> are at full capacity. Will be dispatched when capacity frees up.</div>
            </div>
          ) : (
            <div className="alert alert-success">
              {isBackup ? "⚡ " : "✅ "}
              <div>
                Dispatched to <strong>{handler?.name}</strong> (ID: {handler?.id})
                {isBackup && " [BACKUP HANDLER]"}
                <br /><span style={{ fontSize: 11, opacity: 0.8 }}>{reason}</span>
              </div>
            </div>
          )}

          <div className="divider" />
          <button className="btn btn-primary" onClick={resetForm}>+ Submit Another Report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <div className="page-title">Report <span>Submission</span></div>
        <div className="page-subtitle">File a new incident report with structured identifiers</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        <form onSubmit={handleSubmit} noValidate>
          {/* Reporter Details */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">👤 Reporter Details</div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Reporter Name <span className="required">*</span></label>
                <input
                  id="reporterName"
                  className={`form-input ${touched.reporterName && errors.reporterName ? "error" : touched.reporterName && !errors.reporterName ? "success" : ""}`}
                  value={form.reporterName}
                  onChange={(e) => handleChange("reporterName", e.target.value)}
                  onBlur={() => handleBlur("reporterName")}
                  placeholder="e.g. Ravi Kumar"
                />
                {touched.reporterName && errors.reporterName && <div className="form-error">⚠ {errors.reporterName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number <span className="required">*</span></label>
                <input
                  id="contact"
                  className={`form-input ${touched.contact && errors.contact ? "error" : touched.contact && !errors.contact ? "success" : ""}`}
                  value={form.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                  onBlur={() => handleBlur("contact")}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {touched.contact && errors.contact && <div className="form-error">⚠ {errors.contact}</div>}
              </div>
            </div>
          </div>

          {/* Structured Identifiers */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">🏷️ Structured Identifiers</div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Zone <span className="required">*</span></label>
                <select
                  id="zone"
                  className={`form-select ${touched.zone && errors.zone ? "error" : touched.zone && !errors.zone ? "success" : ""}`}
                  value={form.zone}
                  onChange={(e) => handleChange("zone", e.target.value)}
                  onBlur={() => handleBlur("zone")}
                >
                  <option value="">— Select Zone —</option>
                  {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
                {touched.zone && errors.zone && <div className="form-error">⚠ {errors.zone}</div>}
                {form.zone && <div className="form-hint">Report ID will be: RPT-{form.zone}-NNN</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select
                  id="category"
                  className={`form-select ${touched.category && errors.category ? "error" : ""}`}
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  onBlur={() => handleBlur("category")}
                >
                  <option value="">— Auto-detect or Select —</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {touched.category && errors.category && <div className="form-error">⚠ {errors.category}</div>}
                {!form.category && detectedCategory && (
                  <div className="form-success">🤖 Auto-detected: <strong>{detectedCategory}</strong></div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Level <span className="required">*</span></label>
                <select
                  id="urgency"
                  className={`form-select ${touched.urgency && errors.urgency ? "error" : touched.urgency && !errors.urgency ? "success" : ""}`}
                  value={form.urgency}
                  onChange={(e) => handleChange("urgency", e.target.value)}
                  onBlur={() => handleBlur("urgency")}
                >
                  <option value="">— Select Urgency —</option>
                  {URGENCY_OPTS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                {touched.urgency && errors.urgency && <div className="form-error">⚠ {errors.urgency}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Relevant Code <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
                <input
                  id="relevantCode"
                  className="form-input"
                  value={form.relevantCode}
                  onChange={(e) => handleChange("relevantCode", e.target.value)}
                  placeholder="e.g. IPC-302, NDMA-04"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">📝 Incident Description</div>
            </div>
            <div className="form-group">
              <label className="form-label">Description <span className="required">*</span></label>
              <textarea
                id="description"
                className={`form-textarea ${touched.description && errors.description ? "error" : touched.description && !errors.description ? "success" : ""}`}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={() => handleBlur("description")}
                placeholder="Describe the incident in detail (minimum 10 characters)..."
                rows={4}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {touched.description && errors.description
                  ? <div className="form-error">⚠ {errors.description}</div>
                  : <div />
                }
                <div className="form-hint">{form.description.length}/500</div>
              </div>
            </div>
          </div>

          <button id="submitReportBtn" type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
            {loading ? <><div className="spinner" /> Processing...</> : "🚀 Submit Report"}
          </button>
        </form>

        {/* Sidebar preview panel */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">🤖 Auto-Classification</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Detected Category</div>
                {detectedCategory
                  ? <span className={`badge badge-${detectedCategory.toLowerCase()}`}>{detectedCategory}</span>
                  : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Enter description to auto-detect</span>
                }
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Determined Priority</div>
                {detectedPriority
                  ? <span className={`badge badge-${detectedPriority.toLowerCase()}`}>{detectedPriority}</span>
                  : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Select urgency to determine</span>
                }
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Generated Report ID</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: form.zone ? "var(--accent-primary)" : "var(--text-muted)" }}>
                  {form.zone ? `RPT-${form.zone}-NNN` : "Select zone first"}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">ℹ️ Format Guide</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.8 }}>
              <div>📌 Report ID: <code style={{ color: "var(--accent-primary)" }}>RPT-ZONE-NNN</code></div>
              <div>🗺️ Zones: {["NORTH","SOUTH","EAST","WEST","CENTRAL"].join(", ")}</div>
              <div>🔢 Sequence: 3-digit (001–999)</div>
              <div style={{ marginTop: 8, padding: "8px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ color: "var(--priority-low)", fontSize: 11 }}>✅ Valid: RPT-NORTH-001</div>
                <div style={{ color: "var(--priority-critical)", fontSize: 11 }}>❌ Invalid: RPT--001</div>
                <div style={{ color: "var(--priority-critical)", fontSize: 11 }}>❌ Invalid: RPT-UNKNOWN-01</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
