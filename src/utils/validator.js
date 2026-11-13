// ============================================================
// validator.js — DFA + Regex based report ID validation
// ============================================================

import { ZONES, CATEGORIES } from "../store/mockData";

// Valid format: RPT-{ZONE}-{3-digit-number}
// e.g., RPT-NORTH-001, RPT-SOUTH-123
export const REPORT_ID_REGEX = /^RPT-(NORTH|SOUTH|EAST|WEST|CENTRAL)-\d{3}$/;

/**
 * DFA states for validating report ID format
 * States: START -> PREFIX -> DASH1 -> ZONE -> DASH2 -> NUMBER -> ACCEPT
 */
export function validateReportIdDFA(id) {
  if (!id || typeof id !== "string") return { valid: false, reason: "Report ID is required" };

  const upper = id.toUpperCase().trim();

  // State machine validation
  const parts = upper.split("-");
  // Expect: ["RPT", <ZONE>, <3-digit>]
  if (parts.length !== 3) {
    return { valid: false, reason: `Malformed identifier: expected format RPT-ZONE-NNN, got ${parts.length} segment(s)` };
  }
  if (parts[0] !== "RPT") {
    return { valid: false, reason: `Invalid prefix "${parts[0]}" — must start with RPT` };
  }
  if (!ZONES.includes(parts[1])) {
    return { valid: false, reason: `Unknown zone "${parts[1]}" — valid zones: ${ZONES.join(", ")}` };
  }
  if (!/^\d{3}$/.test(parts[2])) {
    return { valid: false, reason: `Invalid sequence "${parts[2]}" — must be a 3-digit number (e.g., 001)` };
  }

  return { valid: true, reason: null, normalised: `${parts[0]}-${parts[1]}-${parts[2]}` };
}

/**
 * Validate reporter name: 2–50 chars, letters/spaces only
 */
export function validateName(name) {
  if (!name || name.trim().length < 2) return { valid: false, reason: "Name must be at least 2 characters" };
  if (name.trim().length > 50) return { valid: false, reason: "Name must be under 50 characters" };
  if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) return { valid: false, reason: "Name must contain only letters, spaces, or . ' -" };
  return { valid: true, reason: null };
}

/**
 * Validate 10-digit Indian mobile number
 */
export function validateContact(contact) {
  if (!contact) return { valid: false, reason: "Contact number is required" };
  if (!/^[6-9]\d{9}$/.test(contact.replace(/\s/g, ""))) {
    return { valid: false, reason: "Contact must be a valid 10-digit Indian mobile number starting with 6-9" };
  }
  return { valid: true, reason: null };
}

/**
 * Validate description: 10–500 chars
 */
export function validateDescription(desc) {
  if (!desc || desc.trim().length < 10) return { valid: false, reason: "Description must be at least 10 characters" };
  if (desc.trim().length > 500) return { valid: false, reason: "Description must be under 500 characters" };
  return { valid: true, reason: null };
}

/**
 * Validate entire report submission form
 */
export function validateReportForm(form) {
  const errors = {};
  const nameV = validateName(form.reporterName);
  if (!nameV.valid) errors.reporterName = nameV.reason;

  const contactV = validateContact(form.contact);
  if (!contactV.valid) errors.contact = contactV.reason;

  if (!form.zone) errors.zone = "Zone selection is required";
  if (!form.category) errors.category = "Category is required";
  if (!form.urgency) errors.urgency = "Urgency level is required";

  const descV = validateDescription(form.description);
  if (!descV.valid) errors.description = descV.reason;

  return { valid: Object.keys(errors).length === 0, errors };
}
