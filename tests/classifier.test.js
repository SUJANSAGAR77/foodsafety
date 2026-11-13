// classifier.test.js — TC-6 to TC-9: Category & Priority classification
import { describe, it, expect } from "vitest";
import { detectCategory, determinePriority, generateReportId } from "../src/utils/classifier";

// ──────────────────────────────────────────────────────────────
// TC-6: Five report categories are detected
// ──────────────────────────────────────────────────────────────
describe("TC-6: Category auto-detection", () => {
  it("detects FIRE from description", () => {
    expect(detectCategory("Building fire on 4th floor, smoke billowing")).toBe("FIRE");
  });

  it("detects MEDICAL from description", () => {
    expect(detectCategory("Cardiac arrest patient needs ambulance immediately")).toBe("MEDICAL");
  });

  it("detects CRIME from description", () => {
    expect(detectCategory("Chain snatching robbery near bus stop")).toBe("CRIME");
  });

  it("detects FLOOD from description", () => {
    expect(detectCategory("River overflow and waterlogging in residential area")).toBe("FLOOD");
  });

  it("detects ACCIDENT from description", () => {
    expect(detectCategory("Multi-vehicle collision on highway crash")).toBe("ACCIDENT");
  });

  it("uses explicit category when provided", () => {
    expect(detectCategory("some fire description", "MEDICAL")).toBe("MEDICAL");
  });
});

// ──────────────────────────────────────────────────────────────
// TC-7: Conflicting classification patterns resolved by priority
// ──────────────────────────────────────────────────────────────
describe("TC-7: Conflicting classification patterns", () => {
  it("MEDICAL beats ACCIDENT in conflict (ambulance + vehicle crash)", () => {
    // 2 MEDICAL keywords (ambulance, injured) vs 1 ACCIDENT keyword (crash) → MEDICAL wins by count
    const cat = detectCategory("Ambulance needed for injured patient, medical emergency at crash site");
    expect(cat).toBe("MEDICAL");
  });

  it("FIRE beats ACCIDENT in conflict (blaze + vehicle)", () => {
    const cat = detectCategory("Vehicle fire blaze on highway, car burned");
    expect(cat).toBe("FIRE"); // FIRE has higher priority
  });

  it("No keywords defaults to ACCIDENT", () => {
    const cat = detectCategory("Something happened near the location");
    expect(cat).toBe("ACCIDENT"); // fallback
  });
});

// ──────────────────────────────────────────────────────────────
// TC-8: Priority determination
// ──────────────────────────────────────────────────────────────
describe("TC-8: Priority determination", () => {
  it("MEDICAL + HIGH urgency → CRITICAL (category takes precedence)", () => {
    expect(determinePriority("HIGH", "MEDICAL")).toBe("CRITICAL");
  });

  it("FIRE + LOW urgency → HIGH (category base)", () => {
    expect(determinePriority("LOW", "FIRE")).toBe("HIGH");
  });

  it("ACCIDENT + EMERGENCY urgency → EMERGENCY (urgency higher)", () => {
    expect(determinePriority("EMERGENCY", "ACCIDENT")).toBe("EMERGENCY");
  });

  it("CRIME + MEDIUM urgency → MEDIUM", () => {
    expect(determinePriority("MEDIUM", "CRIME")).toBe("MEDIUM");
  });

  it("FLOOD + CRITICAL urgency → CRITICAL", () => {
    expect(determinePriority("CRITICAL", "FLOOD")).toBe("CRITICAL");
  });
});

// ──────────────────────────────────────────────────────────────
// TC-9: Report ID generation
// ──────────────────────────────────────────────────────────────
describe("TC-9: Report ID generation", () => {
  const existing = [
    { id: "RPT-NORTH-001" },
    { id: "RPT-NORTH-002" },
    { id: "RPT-NORTH-010" },
  ];

  it("generates next sequential ID for zone", () => {
    expect(generateReportId("NORTH", existing)).toBe("RPT-NORTH-011");
  });

  it("starts at 001 for empty zone", () => {
    expect(generateReportId("SOUTH", [])).toBe("RPT-SOUTH-001");
  });

  it("pads correctly to 3 digits", () => {
    const e = [{ id: "RPT-EAST-001" }];
    expect(generateReportId("EAST", e)).toBe("RPT-EAST-002");
  });
});
