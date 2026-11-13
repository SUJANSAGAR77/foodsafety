// HandlerDashboard.jsx
import { useState, useMemo } from "react";
import { useApp } from "../store/AppContext";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../components/StatusBadge";

const STATUSES = ["PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","ESCALATED"];

function LoadBar({ current, capacity }) {
  const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  const color = pct >= 100 ? "var(--priority-critical)" : pct >= 75 ? "var(--priority-high)" : pct >= 50 ? "var(--priority-medium)" : "var(--priority-low)";
  return (
    <div className="load-bar-wrap">
      <div className="load-bar-bg" style={{ flex: 1 }}>
        <div className="load-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="load-bar-label">{current}/{capacity}</span>
    </div>
  );
}

export default function HandlerDashboard() {
  const { state, dispatch } = useApp();
  const { reports, handlers } = state;
  const [selectedHandler, setSelectedHandler] = useState(handlers[0]?.id || "");
  const [updatingId, setUpdatingId] = useState(null);

  const handler = handlers.find((h) => h.id === selectedHandler);
  const handlerReports = useMemo(() =>
    reports.filter((r) => r.assignedHandler === selectedHandler)
      .sort((a, b) => {
        const po = ["EMERGENCY","CRITICAL","HIGH","MEDIUM","LOW"];
        return po.indexOf(a.priority) - po.indexOf(b.priority);
      }),
    [reports, selectedHandler]
  );

  async function updateStatus(reportId, newStatus) {
    setUpdatingId(reportId);
    await new Promise((r) => setTimeout(r, 400));
    dispatch({ type: "UPDATE_REPORT_STATUS", payload: { id: reportId, status: newStatus } });
    setUpdatingId(null);
  }

  function toggleAvailability() {
    dispatch({ type: "UPDATE_HANDLER", payload: { id: handler.id, available: !handler.available } });
  }

  function updateCapacity(delta) {
    const newCap = Math.max(handler.current, Math.min(10, handler.capacity + delta));
    dispatch({ type: "UPDATE_HANDLER", payload: { id: handler.id, capacity: newCap } });
  }

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <div className="page-title">Handler <span>Dashboard</span></div>
        <div className="page-subtitle">Manage assigned reports and handler availability</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>
        {/* Handler Selector */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">🛡️ Select Handler</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {handlers.map((h) => {
                const load = h.capacity > 0 ? Math.round((h.current / h.capacity) * 100) : 0;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHandler(h.id)}
                    style={{
                      background: selectedHandler === h.id ? "rgba(59,130,246,0.1)" : "var(--bg-raised)",
                      border: `1px solid ${selectedHandler === h.id ? "var(--accent-primary)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "12px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "var(--transition)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: selectedHandler === h.id ? "var(--accent-primary)" : "var(--text-primary)" }}>{h.name}</span>
                      <span className={`handler-dot ${h.available && h.current < h.capacity ? "available" : !h.available ? "unavailable" : "partial"}`} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                      {h.id} · {h.zone}
                    </div>
                    <LoadBar current={h.current} capacity={h.capacity} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Handler Details */}
        <div>
          {handler && (
            <>
              {/* Handler Info */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                      {handler.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span className="tag">🆔 {handler.id}</span>
                      <span className="tag">📍 {handler.zone}</span>
                      {handler.speciality.map((s) => <span key={s} className={`badge badge-${s.toLowerCase()}`}>{s}</span>)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {/* Availability Toggle */}
                    <div className="toggle-wrap">
                      <div
                        id={`toggle-${handler.id}`}
                        className={`toggle ${handler.available ? "on" : ""}`}
                        onClick={toggleAvailability}
                      />
                      <span className="toggle-label" style={{ color: handler.available ? "var(--priority-low)" : "var(--priority-critical)", fontWeight: 600 }}>
                        {handler.available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    {/* Capacity control */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 10px" }}>
                      <button onClick={() => updateCapacity(-1)} className="btn-icon" style={{ fontSize: 14, padding: "4px 8px" }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "JetBrains Mono, monospace", minWidth: 60, textAlign: "center" }}>
                        Cap: {handler.capacity}
                      </span>
                      <button onClick={() => updateCapacity(1)} className="btn-icon" style={{ fontSize: 14, padding: "4px 8px" }}>+</button>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  {[
                    { label: "Total Assigned", val: handlerReports.length, color: "#3b82f6" },
                    { label: "Active", val: handlerReports.filter(r=>r.status!=="RESOLVED").length, color: "#f97316" },
                    { label: "Resolved", val: handlerReports.filter(r=>r.status==="RESOLVED").length, color: "#22c55e" },
                    { label: "Capacity %", val: `${handler.capacity>0?Math.round((handler.current/handler.capacity)*100):0}%`, color: handler.current>=handler.capacity?"#ef4444":"#eab308" },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center", padding: "12px", background: "var(--bg-raised)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reports Table */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">📋 Assigned Reports ({handlerReports.length})</div>
                </div>
                {handlerReports.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-text">No reports assigned to this handler</div>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Report ID</th>
                          <th>Category</th>
                          <th>Zone</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Update Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {handlerReports.map((r) => (
                          <tr key={r.id}>
                            <td><span className="report-id-cell">{r.id}</span></td>
                            <td><CategoryBadge category={r.category} /></td>
                            <td><span className="tag">📍 {r.zone}</span></td>
                            <td><PriorityBadge priority={r.priority} /></td>
                            <td><StatusBadge status={r.status} /></td>
                            <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                              {new Date(r.submittedAt).toLocaleDateString("en-IN")}
                            </td>
                            <td>
                              {updatingId === r.id ? (
                                <div className="spinner" style={{ width: 16, height: 16 }} />
                              ) : (
                                <select
                                  className="form-select"
                                  value={r.status}
                                  onChange={(e) => updateStatus(r.id, e.target.value)}
                                  style={{ padding: "4px 8px", fontSize: 12, minWidth: 130 }}
                                >
                                  {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s.replace("_"," ")}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
