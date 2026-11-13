// StatusBadge.jsx
export function StatusBadge({ status }) {
  const map = {
    PENDING:     "pending",
    ASSIGNED:    "assigned",
    IN_PROGRESS: "inprogress",
    RESOLVED:    "resolved",
    ESCALATED:   "escalated",
  };
  const cls = map[status] || "pending";
  const labels = {
    PENDING: "⏳ Pending", ASSIGNED: "📌 Assigned",
    IN_PROGRESS: "🔄 In Progress", RESOLVED: "✅ Resolved", ESCALATED: "⚠️ Escalated",
  };
  return <span className={`badge badge-${cls}`}>{labels[status] || status}</span>;
}

export function PriorityBadge({ priority }) {
  const labels = {
    LOW: "🟢 Low", MEDIUM: "🟡 Medium",
    HIGH: "🟠 High", CRITICAL: "🔴 Critical", EMERGENCY: "🚨 Emergency",
  };
  return (
    <span className={`badge badge-${priority?.toLowerCase()}`}>
      {labels[priority] || priority}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const labels = {
    FIRE: "🔥 Fire", MEDICAL: "🏥 Medical",
    CRIME: "🚔 Crime", FLOOD: "🌊 Flood", ACCIDENT: "🚗 Accident",
  };
  return (
    <span className={`badge badge-${category?.toLowerCase()}`}>
      {labels[category] || category}
    </span>
  );
}
