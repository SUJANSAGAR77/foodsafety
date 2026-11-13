// AnalyticsDashboard.jsx
import { useMemo, useState } from "react";
import { useApp } from "../store/AppContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, Sector,
  RadialBarChart, RadialBar,
} from "recharts";

const ZONE_COLORS   = { NORTH: "#3b82f6", SOUTH: "#22c55e", EAST: "#f97316", WEST: "#a855f7", CENTRAL: "#ef4444" };
const CAT_COLORS    = { FIRE: "#f97316", MEDICAL: "#ef4444", CRIME: "#a855f7", FLOOD: "#3b82f6", ACCIDENT: "#eab308" };
const STATUS_COLORS = { PENDING: "#eab308", ASSIGNED: "#3b82f6", IN_PROGRESS: "#f97316", RESOLVED: "#22c55e", ESCALATED: "#a855f7" };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--text-primary)", fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { state } = useApp();
  const { reports } = state;
  const [activePie, setActivePie] = useState(null);

  // Zone-wise distribution
  const zoneData = useMemo(() => {
    const zones = {};
    reports.forEach((r) => { zones[r.zone] = (zones[r.zone] || 0) + 1; });
    return Object.entries(zones).map(([zone, count]) => ({
      zone, count, fill: ZONE_COLORS[zone] || "#3b82f6",
      resolved: reports.filter(r => r.zone === zone && r.status === "RESOLVED").length,
      pending:  reports.filter(r => r.zone === zone && r.status !== "RESOLVED").length,
    }));
  }, [reports]);

  // Category-wise distribution
  const categoryData = useMemo(() => {
    const cats = {};
    reports.forEach((r) => { cats[r.category] = (cats[r.category] || 0) + 1; });
    return Object.entries(cats).map(([name, value]) => ({ name, value, fill: CAT_COLORS[name] || "#666" }));
  }, [reports]);

  // Resolved vs Unresolved
  const resolvedData = useMemo(() => {
    const zones = ["NORTH","SOUTH","EAST","WEST","CENTRAL"];
    return zones.map((z) => ({
      zone: z,
      Resolved:   reports.filter(r => r.zone === z && r.status === "RESOLVED").length,
      Unresolved: reports.filter(r => r.zone === z && r.status !== "RESOLVED").length,
    }));
  }, [reports]);

  // Status breakdown
  const statusData = useMemo(() => {
    const s = {};
    reports.forEach((r) => { s[r.status] = (s[r.status] || 0) + 1; });
    return Object.entries(s).map(([name, value]) => ({ name: name.replace("_"," "), value, fill: STATUS_COLORS[name] || "#666" }));
  }, [reports]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    const p = {};
    reports.forEach((r) => { p[r.priority] = (p[r.priority] || 0) + 1; });
    const order = ["EMERGENCY","CRITICAL","HIGH","MEDIUM","LOW"];
    return order.filter(k => p[k]).map((k) => ({
      name: k, value: p[k],
      fill: { EMERGENCY:"#a855f7",CRITICAL:"#ef4444",HIGH:"#f97316",MEDIUM:"#eab308",LOW:"#22c55e" }[k],
    }));
  }, [reports]);

  const resolved   = reports.filter(r => r.status === "RESOLVED").length;
  const unresolved = reports.length - resolved;
  const resolvePct = reports.length > 0 ? Math.round((resolved / reports.length) * 100) : 0;

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <div className="page-title">Analytics <span>Dashboard</span></div>
        <div className="page-subtitle">Zone-wise and category-wise report distributions with visual charts</div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total", val: reports.length, color: "#3b82f6" },
          { label: "Resolved", val: resolved, color: "#22c55e" },
          { label: "Unresolved", val: unresolved, color: "#ef4444" },
          { label: "Resolve Rate", val: `${resolvePct}%`, color: resolvePct >= 60 ? "#22c55e" : "#f97316" },
          { label: "Avg/Zone", val: (reports.length / 5).toFixed(1), color: "#a855f7" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "18px 12px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Zone bar + Category pie */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">📍 Zone-wise Report Distribution</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={zoneData} margin={{ top: 10, right: 10, bottom: 10, left: -15 }}>
              <XAxis dataKey="zone" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Reports">
                {zoneData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">🏷️ Category Distribution</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%" cy="50%"
                outerRadius={90}
                innerRadius={45}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Resolved vs Unresolved stacked + Status pie */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">✅ Resolved vs Unresolved by Zone</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={resolvedData} margin={{ top: 10, right: 10, bottom: 10, left: -15 }}>
              <XAxis dataKey="zone" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Bar dataKey="Resolved"   stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
              <Bar dataKey="Unresolved" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Status Breakdown</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                label={({ name, value }) => `${value}`} labelLine>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Priority + Zone detail table */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚨 Priority Distribution</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {priorityData.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: p.fill, minWidth: 80 }}>{p.name}</span>
                <div style={{ flex: 1, background: "var(--bg-raised)", borderRadius: 999, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${reports.length > 0 ? (p.value / reports.length * 100) : 0}%`, background: p.fill, height: "100%", borderRadius: 999, transition: "width 0.6s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: p.fill, minWidth: 24, textAlign: "right" }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Zone Summary Table</div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Zone</th><th>Total</th><th>Resolved</th><th>Pending</th><th>Rate</th></tr>
              </thead>
              <tbody>
                {zoneData.map((z) => {
                  const rate = z.count > 0 ? Math.round((z.resolved / z.count) * 100) : 0;
                  return (
                    <tr key={z.zone}>
                      <td><span className="tag" style={{ borderColor: z.fill, color: z.fill }}>📍 {z.zone}</span></td>
                      <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{z.count}</td>
                      <td style={{ color: "var(--priority-low)", fontWeight: 600 }}>{z.resolved}</td>
                      <td style={{ color: "var(--priority-critical)", fontWeight: 600 }}>{z.pending}</td>
                      <td>
                        <span style={{ color: rate >= 60 ? "var(--priority-low)" : "var(--priority-high)", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
