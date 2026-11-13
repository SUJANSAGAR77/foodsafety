// RoutingDashboard.jsx
import { useState } from "react";
import { useApp } from "../store/AppContext";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../components/StatusBadge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

function LoadBar({ current, capacity }) {
  const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  const color = pct >= 100 ? "var(--priority-critical)" : pct >= 75 ? "var(--priority-high)" : pct >= 50 ? "var(--priority-medium)" : "var(--priority-low)";
  return (
    <div className="load-bar-wrap">
      <div className="load-bar-bg" style={{ flex: 1 }}>
        <div className="load-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="load-bar-label" style={{ color }}>{pct}%</span>
    </div>
  );
}

const CAT_COLORS = { FIRE: "#f97316", MEDICAL: "#ef4444", CRIME: "#a855f7", FLOOD: "#3b82f6", ACCIDENT: "#eab308" };
const PRIORITY_COLORS = { LOW: "#22c55e", MEDIUM: "#eab308", HIGH: "#f97316", CRITICAL: "#ef4444", EMERGENCY: "#a855f7" };

export default function RoutingDashboard() {
  const { state } = useApp();
  const { handlers, routingRules, escalationLog, queuedReports } = state;
  const [activeTab, setActiveTab] = useState("routing");

  const handlerLoadData = handlers.map((h) => ({
    name: h.name.split(" ")[0],
    load: h.capacity > 0 ? Math.round((h.current / h.capacity) * 100) : 0,
    current: h.current,
    capacity: h.capacity,
    id: h.id,
  }));

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <div className="page-title">Routing <span>Management</span></div>
        <div className="page-subtitle">Dispatch table, handler loads, escalation decisions, and queue</div>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { icon: "🗺️", val: routingRules.length, label: "Routing Rules", color: "#3b82f6" },
          { icon: "⚡", val: escalationLog.length, label: "Escalations", color: "#a855f7" },
          { icon: "⏳", val: queuedReports.length, label: "Queued Reports", color: "#eab308" },
          { icon: "✅", val: handlers.filter(h=>h.available && h.current<h.capacity).length, label: "Available Handlers", color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: "routing", label: "🗺️ Routing Table" },
          { key: "loads",   label: "📊 Handler Loads" },
          { key: "queue",   label: "⏳ Queue & Backups" },
          { key: "escalation", label: "⚡ Escalations" },
        ].map((t) => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Routing Table */}
      {activeTab === "routing" && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div className="card-title">🗺️ Active Routing Rules</div>
            <span className="tag">{routingRules.length} rules</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Zone</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Primary Handler</th>
                  <th>Backup Handler</th>
                  <th>Primary Status</th>
                </tr>
              </thead>
              <tbody>
                {routingRules.map((rule) => {
                  const primary = handlers.find((h) => h.id === rule.primaryHandler);
                  const backup  = handlers.find((h) => h.id === rule.backupHandler);
                  const isFull  = primary && primary.current >= primary.capacity;
                  return (
                    <tr key={rule.id}>
                      <td><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--accent-primary)" }}>{rule.id}</span></td>
                      <td><span className="tag">📍 {rule.zone}</span></td>
                      <td><CategoryBadge category={rule.category} /></td>
                      <td><PriorityBadge priority={rule.priority} /></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className={`handler-dot ${primary?.available && !isFull ? "available" : "unavailable"}`} />
                          <span style={{ fontSize: 13 }}>{primary?.name || rule.primaryHandler}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className={`handler-dot ${backup?.available ? "available" : "unavailable"}`} />
                          <span style={{ fontSize: 13 }}>{backup?.name || rule.backupHandler}</span>
                        </div>
                      </td>
                      <td>
                        {isFull
                          ? <span className="badge badge-critical">At Capacity</span>
                          : !primary?.available
                          ? <span className="badge badge-escalated">Unavailable</span>
                          : <span className="badge badge-resolved">Ready</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Handler Loads */}
      {activeTab === "loads" && (
        <div className="animate-fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">📊 Load Distribution</div></div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={handlerLoadData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`${v}%`, "Load"]}
                  />
                  <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                    {handlerLoadData.map((entry, i) => (
                      <Cell key={i} fill={entry.load >= 100 ? "#ef4444" : entry.load >= 75 ? "#f97316" : entry.load >= 50 ? "#eab308" : "#22c55e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">🛡️ Handler Status</div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {handlers.map((h) => (
                  <div key={h.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`handler-dot ${h.available && h.current < h.capacity ? "available" : !h.available ? "unavailable" : "partial"}`} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--text-muted)" }}>
                        {h.current}/{h.capacity}
                      </span>
                    </div>
                    <LoadBar current={h.current} capacity={h.capacity} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue & Backups */}
      {activeTab === "queue" && (
        <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">⏳ Queued Reports</div>
              <span className="badge badge-medium">{queuedReports.length}</span>
            </div>
            {queuedReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-text">No reports in queue</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {queuedReports.map((q) => (
                  <div key={q.id} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--accent-primary)", marginBottom: 6 }}>{q.id}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      <span className="tag">📍 {q.zone}</span>
                      <CategoryBadge category={q.category} />
                      <PriorityBadge priority={q.priority} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>⚠️ {q.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">🔄 Backup Assignments</div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Zone</th><th>Category</th><th>Backup</th><th>Load</th></tr>
                </thead>
                <tbody>
                  {routingRules.map((rule) => {
                    const backup = handlers.find((h) => h.id === rule.backupHandler);
                    return (
                      <tr key={rule.id}>
                        <td><span className="tag">📍 {rule.zone}</span></td>
                        <td><CategoryBadge category={rule.category} /></td>
                        <td style={{ fontSize: 13 }}>{backup?.name}</td>
                        <td>
                          {backup && (
                            <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: backup.current >= backup.capacity ? "var(--priority-critical)" : "var(--priority-low)" }}>
                              {backup.current}/{backup.capacity}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Log */}
      {activeTab === "escalation" && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div className="card-title">⚡ Escalation & Priority Override Log</div>
            <span className="badge badge-escalated">{escalationLog.length} events</span>
          </div>
          {escalationLog.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🟢</div><div className="empty-state-text">No escalations recorded</div></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {escalationLog.map((esc) => {
                const h = handlers.find((h) => h.id === esc.escalatedTo);
                return (
                  <div key={esc.id} style={{
                    display: "flex", gap: 14, alignItems: "flex-start",
                    background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
                    borderRadius: "var(--radius-md)", padding: "16px",
                  }}>
                    <div style={{ fontSize: 24, flexShrink: 0 }}>⚡</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                        <div>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--accent-primary)", marginRight: 10 }}>{esc.reportId}</span>
                          <PriorityBadge priority={esc.priority} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                          {new Date(esc.timestamp).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{esc.reason}</div>
                      <div style={{ fontSize: 12, color: "var(--priority-emergency)" }}>
                        → Escalated to: <strong>{h?.name || esc.escalatedTo}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
