// KPICard.jsx
export default function KPICard({ icon, value, label, color, bg }) {
  return (
    <div className="kpi-card" style={{ "--kpi-color": color, "--kpi-bg": bg }}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-info">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  );
}
