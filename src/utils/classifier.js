// ============================================================
// classifier.js — Category & Priority auto-classifier
// ============================================================

// Keyword → category mapping
const CATEGORY_KEYWORDS = {
  FIRE:     ["fire", "burn", "flame", "smoke", "blaze", "arson", "electrical", "explosion"],
  MEDICAL:  ["medical", "hospital", "ambulance", "cardiac", "accident", "injury", "poison", "birth", "overdose", "unconscious"],
  CRIME:    ["crime", "theft", "robbery", "assault", "murder", "vandalism", "snatch", "attack", "drug", "kidnap"],
  FLOOD:    ["flood", "water", "overflow", "drainage", "rain", "inundation", "waterlog", "river"],
  ACCIDENT: ["accident", "crash", "collision", "vehicle", "truck", "car", "bike", "rollover", "highway"],
};

// Priority rules: urgency → priority mapping
const URGENCY_PRIORITY_MAP = {
  LOW:       "LOW",
  MEDIUM:    "MEDIUM",
  HIGH:      "HIGH",
  CRITICAL:  "CRITICAL",
  EMERGENCY: "EMERGENCY",
};

// Category default priorities
const CATEGORY_BASE_PRIORITY = {
  FIRE:     "HIGH",
  MEDICAL:  "CRITICAL",
  CRIME:    "MEDIUM",
  FLOOD:    "HIGH",
  ACCIDENT: "HIGH",
};

/**
 * Auto-detect category from description text
 * Returns best-match category or null if ambiguous
 */
export function detectCategory(description, explicitCategory = null) {
  if (explicitCategory) return explicitCategory;

  const lower = description.toLowerCase();
  const scores = {};

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.filter((kw) => lower.includes(kw)).length;
  }

  const topScore = Math.max(...Object.values(scores));
  if (topScore === 0) return "ACCIDENT"; // default fallback

  const topCats = Object.entries(scores)
    .filter(([, s]) => s === topScore)
    .map(([c]) => c);

  // Conflict: pick highest-priority category
  if (topCats.length > 1) {
    const priorityOrder = ["MEDICAL", "FIRE", "FLOOD", "ACCIDENT", "CRIME"];
    for (const p of priorityOrder) {
      if (topCats.includes(p)) return p;
    }
  }

  return topCats[0];
}

/**
 * Determine final priority from urgency + category
 */
export function determinePriority(urgency, category) {
  const urgencyLevel = URGENCY_PRIORITY_MAP[urgency] || "MEDIUM";
  const categoryLevel = CATEGORY_BASE_PRIORITY[category] || "MEDIUM";

  const levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL", "EMERGENCY"];
  const urgIdx = levels.indexOf(urgencyLevel);
  const catIdx = levels.indexOf(categoryLevel);

  // Take the higher of the two
  return levels[Math.max(urgIdx, catIdx)];
}

/**
 * Generate a unique report ID: RPT-{ZONE}-{NNN}
 */
export function generateReportId(zone, existingReports) {
  const zoneReports = existingReports.filter((r) => r.id.startsWith(`RPT-${zone}-`));
  const nums = zoneReports.map((r) => {
    const parts = r.id.split("-");
    return parseInt(parts[2], 10);
  }).filter((n) => !isNaN(n));

  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `RPT-${zone}-${String(next).padStart(3, "0")}`;
}
