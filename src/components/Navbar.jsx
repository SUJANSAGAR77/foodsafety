// Navbar.jsx
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const PAGE_TITLES = {
  "/submit":    { title: "Report", accent: "Submission", sub: "File a new incident report" },
  "/dashboard": { title: "User", accent: "Dashboard", sub: "Monitor all reports" },
  "/handler":   { title: "Handler", accent: "Dashboard", sub: "Manage assigned incidents" },
  "/routing":   { title: "Routing", accent: "Management", sub: "Dispatch & escalation control" },
  "/analytics": { title: "Analytics", accent: "Dashboard", sub: "Insights & distributions" },
};

export default function Navbar() {
  const location = useLocation();
  const info = PAGE_TITLES[location.pathname] || { title: "IRMS", accent: "", sub: "" };
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="navbar">
      <div>
        <div className="navbar-title">
          {info.title} <span>{info.accent}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{info.sub}</div>
      </div>
      <div className="navbar-right">
        <div className="navbar-time">
          {time.toLocaleTimeString("en-IN", { hour12: false })}
        </div>
        <div className="navbar-status-dot" title="System Online" />
        <div style={{ fontSize: 12, color: "var(--priority-low)", fontWeight: 600 }}>LIVE</div>
      </div>
    </header>
  );
}
