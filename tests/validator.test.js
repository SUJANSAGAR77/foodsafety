// validator.test.js — TC1–TC5: Input format & DFA validation
import { describe, it, expect } from "vitest";
import {
  validateReportIdDFA,
  validateName,
  validateContact,
  validateDescription,
  validateReportForm,
} from "../src/utils/validator";

// ──────────────────────────────────────────────────────────────
// TC-1: Valid input format passes DFA
// ──────────────────────────────────────────────────────────────
describe("TC-1: Valid report ID format", () => {
  it("accepts RPT-NORTH-001", () => {
    const result = validateReportIdDFA("RPT-NORTH-001");
    expect(result.valid).toBe(true);
    expect(result.reason).toBeNull();
  });

  it("accepts RPT-SOUTH-123", () => {
    expect(validateReportIdDFA("RPT-SOUTH-123").valid).toBe(true);
  });

  it("accepts lowercase input (normalised)", () => {
    const result = validateReportIdDFA("rpt-east-007");
    expect(result.valid).toBe(true);
    expect(result.normalised).toBe("RPT-EAST-007");
  });
});

// ──────────────────────────────────────────────────────────────
// TC-2: Malformed identifier is rejected with reason
// ──────────────────────────────────────────────────────────────
describe("TC-2: Malformed identifier rejection", () => {
  it("rejects RPT--001 (missing zone)", () => {
    const result = validateReportIdDFA("RPT--001");
    expect(result.valid).toBe(false);
    // Empty zone string is treated as an unknown zone
    expect(result.reason).toMatch(/Unknown zone|segment/i);
  });

  it("rejects REPORT-NORTH-001 (bad prefix)", () => {
    const result = validateReportIdDFA("REPORT-NORTH-001");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("prefix");
  });

  it("rejects RPT-NORTH-01 (2-digit sequence)", () => {
    const result = validateReportIdDFA("RPT-NORTH-01");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("3-digit");
  });

  it("rejects empty string", () => {
    expect(validateReportIdDFA("").valid).toBe(false);
  });

  it("rejects null input", () => {
    expect(validateReportIdDFA(null).valid).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// TC-3: Unknown zone code is rejected
// ──────────────────────────────────────────────────────────────
describe("TC-3: Unknown zone rejection", () => {
  it("rejects RPT-UNKNOWN-001", () => {
    const result = validateReportIdDFA("RPT-UNKNOWN-001");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Unknown zone");
    expect(result.reason).toContain("UNKNOWN");
  });

  it("rejects RPT-MIDWEST-001", () => {
    const result = validateReportIdDFA("RPT-MIDWEST-001");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Unknown zone");
  });

  it("includes valid zones in rejection reason", () => {
    const result = validateReportIdDFA("RPT-XYZ-001");
    expect(result.reason).toContain("NORTH");
  });
});

// ──────────────────────────────────────────────────────────────
// TC-4: Field-level validation
// ──────────────────────────────────────────────────────────────
describe("TC-4: Field-level validation", () => {
  it("validates name: too short", () => {
    expect(validateName("A").valid).toBe(false);
  });

  it("validates name: valid", () => {
    expect(validateName("Ravi Kumar").valid).toBe(true);
  });

  it("validates contact: invalid number", () => {
    expect(validateContact("12345").valid).toBe(false);
  });

  it("validates contact: valid 10-digit", () => {
    expect(validateContact("9876543210").valid).toBe(true);
  });

  it("validates contact: starts with 5 (invalid)", () => {
    expect(validateContact("5876543210").valid).toBe(false);
  });

  it("validates description: too short", () => {
    expect(validateDescription("Fire").valid).toBe(false);
  });

  it("validates description: valid", () => {
    expect(validateDescription("Building fire on 4th floor near market").valid).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// TC-5: Full form validation
// ──────────────────────────────────────────────────────────────
describe("TC-5: Full form validation", () => {
  it("valid form returns no errors", () => {
    const { valid, errors } = validateReportForm({
      reporterName: "Ravi Kumar",
      contact: "9876543210",
      zone: "NORTH",
      category: "FIRE",
      urgency: "HIGH",
      description: "Building fire on 4th floor near market complex",
    });
    expect(valid).toBe(true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("invalid form returns errors for all missing fields", () => {
    const { valid, errors } = validateReportForm({
      reporterName: "", contact: "", zone: "", category: "", urgency: "", description: "",
    });
    expect(valid).toBe(false);
    expect(Object.keys(errors).length).toBeGreaterThan(3);
  });
});
