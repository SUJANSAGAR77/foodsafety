// Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/submit",    icon: "📋", label: "Submit Report" },
  { to: "/dashboard", icon: "📊", label: "User Dashboard" },
  { to: "/handler",   icon: "🛡️", label: "Handler Dashboard" },
  { to: "/routing",   icon: "🗺️", label: "Routing Management" },
  { to: "/analytics", icon: "📈", label: "Analytics" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚨</div>
        <div>
          <div className="sidebar-logo-text">IRMS</div>
          <div className="sidebar-logo-sub">Incident Report System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        IRMS v1.0 &nbsp;·&nbsp; © 2026
      </div>
    </aside>
  );
}
