// UserDashboard.jsx
import { useState, useMemo } from "react";
import { useApp } from "../store/AppContext";
import KPICard from "../components/KPICard";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../components/StatusBadge";

export default function UserDashboard() {
  const { state } = useApp();
  const { reports, handlers } = state;
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const kpis = useMemo(() => ({
    total:      reports.length,
    pending:    reports.filter((r) => r.status === "PENDING").length,
    assigned:   reports.filter((r) => r.status === "ASSIGNED" || r.status === "IN_PROGRESS").length,
    resolved:   reports.filter((r) => r.status === "RESOLVED").length,
    escalated:  reports.filter((r) => r.status === "ESCALATED").length,
  }), [reports]);

  function handleSearch(e) {
    e.preventDefault();
    const id = searchId.trim().toUpperCase();
    if (!id) { setSearchError("Enter a Report ID to search"); return; }
    const found = reports.find((r) => r.id === id);
    if (!found) { setSearchResult(null); setSearchError(`No report found with ID: ${id}`); return; }
    const handler = handlers.find((h) => h.id === found.assignedHandler);
    setSearchResult({ report: found, handler });
    setSearchError("");
  }

  const filteredReports = useMemo(() =>
    filterStatus === "ALL"
      ? reports
      : reports.filter((r) => r.status === filterStatus),
  [reports, filterStatus]);

  const sortedReports = [...filteredReports].sort((a, b) =>
    new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  const priorityOrder = ["EMERGENCY","CRITICAL","HIGH","MEDIUM","LOW"];

  return (
    <div className="page-container animate-fade-up">
      <div className="page-header">
        <div className="page-title">User <span>Dashboard</span></div>
        <div className="page-subtitle">Monitor all incident reports and their current status</div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard icon="📋" value={kpis.total}    label="Total Reports"    color="#3b82f6" bg="rgba(59,130,246,0.1)" />
        <KPICard icon="⏳" value={kpis.pending}  label="Pending"          color="#eab308" bg="rgba(234,179,8,0.1)" />
        <KPICard icon="📌" value={kpis.assigned}  label="Assigned / Active" color="#f97316" bg="rgba(249,115,22,0.1)" />
        <KPICard icon="✅" value={kpis.resolved} label="Resolved"         color="#22c55e" bg="rgba(34,197,94,0.1)" />
        <KPICard icon="⚠️" value={kpis.escalated} label="Escalated"       color="#a855f7" bg="rgba(168,85,247,0.1)" />
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">🔍 Search by Report ID</div>
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              id="searchInput"
              className="form-input"
              value={searchId}
              onChange={(e) => { setSearchId(e.target.value); setSearchError(""); setSearchResult(null); }}
              placeholder="Enter Report ID (e.g. RPT-NORTH-001)"
              style={{ paddingLeft: 40 }}
            />
          </div>
          <button id="searchBtn" type="submit" className="btn btn-primary">Search</button>
        </form>

        {searchError && <div className="alert alert-danger">{searchError}</div>}

        {searchResult && (
          <div className="alert alert-info animate-fade-in">
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 700, color: "var(--accent-primary)", marginBottom: 4 }}>
                    {searchResult.report.id}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>{searchResult.report.description}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <StatusBadge status={searchResult.report.status} />
                    <PriorityBadge priority={searchResult.report.priority} />
                    <CategoryBadge category={searchResult.report.category} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Assigned Handler</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {searchResult.handler ? searchResult.handler.name : "Unassigned"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(searchResult.report.submittedAt).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 All Reports</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL","PENDING","ASSIGNED","IN_PROGRESS","RESOLVED","ESCALATED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`select-btn ${filterStatus === s ? "selected" : ""}`}
              >
                {s === "ALL" ? "All" : s.replace("_"," ")}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Reporter</th>
                <th>Zone</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Handler</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No reports found</td></tr>
              ) : (
                sortedReports.map((r) => {
                  const handler = state.handlers.find((h) => h.id === r.assignedHandler);
                  return (
                    <tr key={r.id}>
                      <td><span className="report-id-cell">{r.id}</span></td>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{r.reporterName}</td>
                      <td><span className="tag">📍 {r.zone}</span></td>
                      <td><CategoryBadge category={r.category} /></td>
                      <td><PriorityBadge priority={r.priority} /></td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>{handler ? <span style={{ fontSize: 13 }}>{handler.name}</span> : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Unassigned</span>}</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                        {new Date(r.submittedAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
