// ============================================================
// mockData.js — Simulated Flask/SQLite backend (in-memory)
// ============================================================

export const ZONES = ["NORTH", "SOUTH", "EAST", "WEST", "CENTRAL"];
export const CATEGORIES = ["FIRE", "MEDICAL", "CRIME", "FLOOD", "ACCIDENT"];
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL", "EMERGENCY"];
export const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "ESCALATED"];

export const HANDLERS = [
  { id: "H001", name: "Alpha Team",   zone: "NORTH",   capacity: 5, current: 3, available: true,  speciality: ["FIRE", "ACCIDENT"] },
  { id: "H002", name: "Beta Unit",    zone: "SOUTH",   capacity: 4, current: 4, available: false, speciality: ["MEDICAL", "FLOOD"] },
  { id: "H003", name: "Gamma Squad",  zone: "EAST",    capacity: 6, current: 2, available: true,  speciality: ["CRIME", "ACCIDENT"] },
  { id: "H004", name: "Delta Force",  zone: "WEST",    capacity: 3, current: 3, available: false, speciality: ["FIRE", "FLOOD"] },
  { id: "H005", name: "Echo Rangers", zone: "CENTRAL", capacity: 5, current: 1, available: true,  speciality: ["MEDICAL", "CRIME"] },
  { id: "H006", name: "Foxtrot Backup", zone: "NORTH", capacity: 8, current: 0, available: true,  speciality: ["FIRE","MEDICAL","CRIME","FLOOD","ACCIDENT"] },
];

export const ROUTING_RULES = [
  { id: "R001", zone: "NORTH",   category: "FIRE",     primaryHandler: "H001", backupHandler: "H006", priority: "HIGH" },
  { id: "R002", zone: "SOUTH",   category: "MEDICAL",  primaryHandler: "H002", backupHandler: "H005", priority: "CRITICAL" },
  { id: "R003", zone: "EAST",    category: "CRIME",    primaryHandler: "H003", backupHandler: "H005", priority: "MEDIUM" },
  { id: "R004", zone: "WEST",    category: "FLOOD",    primaryHandler: "H004", backupHandler: "H006", priority: "HIGH" },
  { id: "R005", zone: "CENTRAL", category: "MEDICAL",  primaryHandler: "H005", backupHandler: "H002", priority: "CRITICAL" },
  { id: "R006", zone: "NORTH",   category: "ACCIDENT", primaryHandler: "H001", backupHandler: "H006", priority: "MEDIUM" },
  { id: "R007", zone: "EAST",    category: "ACCIDENT", primaryHandler: "H003", backupHandler: "H006", priority: "MEDIUM" },
  { id: "R008", zone: "CENTRAL", category: "CRIME",    primaryHandler: "H005", backupHandler: "H003", priority: "HIGH" },
];

function randomDate(daysBack = 30) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

export const INITIAL_REPORTS = [
  { id: "RPT-NORTH-001", reporterName: "Ravi Kumar",    contact: "9876543210", zone: "NORTH",   category: "FIRE",     priority: "HIGH",      status: "ASSIGNED",    assignedHandler: "H001", description: "Building fire on 4th floor near market complex", urgency: "HIGH",    submittedAt: randomDate(2) },
  { id: "RPT-SOUTH-002", reporterName: "Priya Sharma",  contact: "9123456789", zone: "SOUTH",   category: "MEDICAL",  priority: "CRITICAL",  status: "IN_PROGRESS", assignedHandler: "H002", description: "Cardiac arrest patient needs immediate ambulance", urgency: "CRITICAL", submittedAt: randomDate(1) },
  { id: "RPT-EAST-003",  reporterName: "Ahmed Khan",    contact: "9988776655", zone: "EAST",    category: "CRIME",    priority: "MEDIUM",    status: "PENDING",     assignedHandler: null,   description: "Chain snatching incident near bus stop", urgency: "MEDIUM",   submittedAt: randomDate(3) },
  { id: "RPT-WEST-004",  reporterName: "Sunita Devi",   contact: "8877665544", zone: "WEST",    category: "FLOOD",    priority: "HIGH",      status: "ESCALATED",   assignedHandler: "H006", description: "Waterlogging in residential area causing damage", urgency: "HIGH",    submittedAt: randomDate(5) },
  { id: "RPT-CENTRAL-005", reporterName: "Mohit Verma", contact: "7766554433", zone: "CENTRAL", category: "MEDICAL",  priority: "EMERGENCY", status: "RESOLVED",    assignedHandler: "H005", description: "Mass poisoning at food stall — multiple victims", urgency: "EMERGENCY", submittedAt: randomDate(7) },
  { id: "RPT-NORTH-006", reporterName: "Deepa Nair",   contact: "6655443322", zone: "NORTH",   category: "ACCIDENT", priority: "HIGH",      status: "ASSIGNED",    assignedHandler: "H001", description: "Multi-vehicle collision on highway bypass", urgency: "HIGH",    submittedAt: randomDate(1) },
  { id: "RPT-EAST-007",  reporterName: "Farhan Ali",   contact: "9512348765", zone: "EAST",    category: "CRIME",    priority: "LOW",       status: "PENDING",     assignedHandler: null,   description: "Vandalism at public park — minor damage", urgency: "LOW",     submittedAt: randomDate(10) },
  { id: "RPT-SOUTH-008", reporterName: "Meena Pillai", contact: "8123456790", zone: "SOUTH",   category: "FLOOD",    priority: "CRITICAL",  status: "RESOLVED",    assignedHandler: "H002", description: "River overflow threatening low-lying homes", urgency: "CRITICAL", submittedAt: randomDate(14) },
  { id: "RPT-CENTRAL-009", reporterName: "Vinay Joshi", contact: "9900112233", zone: "CENTRAL", category: "FIRE",    priority: "MEDIUM",    status: "IN_PROGRESS", assignedHandler: "H005", description: "Electrical short-circuit in government office", urgency: "MEDIUM",   submittedAt: randomDate(4) },
  { id: "RPT-WEST-010",  reporterName: "Anjali Singh",  contact: "7700998811", zone: "WEST",    category: "ACCIDENT", priority: "HIGH",      status: "PENDING",     assignedHandler: null,   description: "Truck rollover blocking national highway", urgency: "HIGH",    submittedAt: randomDate(2) },
  { id: "RPT-NORTH-011", reporterName: "Kiran Reddy",  contact: "9191919191", zone: "NORTH",   category: "MEDICAL",  priority: "EMERGENCY", status: "ESCALATED",   assignedHandler: "H006", description: "Premature birth emergency — no hospital nearby", urgency: "EMERGENCY", submittedAt: randomDate(1) },
  { id: "RPT-EAST-012",  reporterName: "Pooja Gupta",  contact: "8282828282", zone: "EAST",    category: "FLOOD",    priority: "MEDIUM",    status: "RESOLVED",    assignedHandler: "H003", description: "Drainage overflow after heavy rain", urgency: "MEDIUM",   submittedAt: randomDate(20) },
];

export const ESCALATION_LOG = [
  { id: "ESC-001", reportId: "RPT-WEST-004",    reason: "Primary handler H004 at capacity", escalatedTo: "H006", timestamp: randomDate(5),  priority: "HIGH" },
  { id: "ESC-002", reportId: "RPT-NORTH-011",   reason: "EMERGENCY override — all primary handlers busy", escalatedTo: "H006", timestamp: randomDate(1), priority: "EMERGENCY" },
  { id: "ESC-003", reportId: "RPT-CENTRAL-009", reason: "Zone specialist unavailable", escalatedTo: "H005", timestamp: randomDate(4),  priority: "MEDIUM" },
];

export const QUEUED_REPORTS = [
  { id: "RPT-SOUTH-013", zone: "SOUTH", category: "MEDICAL", priority: "HIGH",   queuedAt: randomDate(0), reason: "All SOUTH handlers at capacity" },
  { id: "RPT-WEST-014",  zone: "WEST",  category: "CRIME",   priority: "MEDIUM", queuedAt: randomDate(0), reason: "No CRIME specialist in WEST zone" },
];
