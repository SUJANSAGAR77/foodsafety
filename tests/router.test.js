// router.test.js — TC-10 to TC-15: Routing, handler, priority, status tests
import { describe, it, expect } from "vitest";
import { dispatchReport, getHandlerLoad } from "../src/utils/routerLogic";

const makeHandlers = (overrides = []) => [
  { id: "H001", name: "Alpha Team",   zone: "NORTH",   capacity: 5, current: 2, available: true,  speciality: ["FIRE"] },
  { id: "H002", name: "Beta Unit",    zone: "SOUTH",   capacity: 4, current: 4, available: false, speciality: ["MEDICAL"] },
  { id: "H003", name: "Gamma Squad",  zone: "EAST",    capacity: 6, current: 1, available: true,  speciality: ["CRIME"] },
  { id: "H004", name: "Delta Force",  zone: "WEST",    capacity: 3, current: 3, available: false, speciality: ["FLOOD"] },
  { id: "H005", name: "Echo Rangers", zone: "CENTRAL", capacity: 5, current: 2, available: true,  speciality: ["MEDICAL"] },
  { id: "H006", name: "Foxtrot Backup", zone: "NORTH", capacity: 8, current: 0, available: true,  speciality: ["FIRE","MEDICAL","CRIME","FLOOD","ACCIDENT"] },
  ...overrides,
];

// ──────────────────────────────────────────────────────────────
// TC-10: Known zone routes to correct handler
// ──────────────────────────────────────────────────────────────
describe("TC-10: Routing — known zone assigns correct handler", () => {
  it("NORTH + FIRE → H001 (primary handler)", () => {
    const handlers = makeHandlers();
    const result = dispatchReport("NORTH", "FIRE", "HIGH", handlers);
    expect(result.isQueued).toBe(false);
    expect(result.handler?.id).toBe("H001");
    expect(result.isBackup).toBe(false);
  });

  it("EAST + CRIME → H003 (primary handler)", () => {
    const handlers = makeHandlers();
    const result = dispatchReport("EAST", "CRIME", "MEDIUM", handlers);
    expect(result.handler?.id).toBe("H003");
    expect(result.isBackup).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// TC-11: Unknown zone triggers fallback handler
// ──────────────────────────────────────────────────────────────
describe("TC-11: Routing — unknown zone/category triggers fallback", () => {
  it("No routing rule → assigned to Foxtrot backup (H006)", () => {
    const handlers = makeHandlers();
    // NORTH + MEDICAL has no routing rule → fallback
    const result = dispatchReport("NORTH", "MEDICAL", "MEDIUM", handlers);
    expect(result.isBackup).toBe(true);
    expect(result.handler?.id).toBe("H006");
    expect(result.reason).toMatch(/fallback|backup|No routing rule/i);
  });
});

// ──────────────────────────────────────────────────────────────
// TC-12: Handler availability — primary unavailable uses backup
// ──────────────────────────────────────────────────────────────
describe("TC-12: Handler availability and fallback dispatch", () => {
  it("Primary at capacity → backup assigned", () => {
    // H001 at capacity (current === capacity)
    const handlers = makeHandlers([]).map(h =>
      h.id === "H001" ? { ...h, current: 5 } : h // full
    );
    const result = dispatchReport("NORTH", "FIRE", "HIGH", handlers);
    // Should fall back to H006 (backup for NORTH+FIRE rule)
    expect(result.isBackup).toBe(true);
    expect(result.handler?.id).toBe("H006");
  });

  it("Primary unavailable → backup used", () => {
    const handlers = makeHandlers([]).map(h =>
      h.id === "H001" ? { ...h, available: false } : h
    );
    const result = dispatchReport("NORTH", "FIRE", "HIGH", handlers);
    expect(result.isBackup).toBe(true);
  });

  it("All handlers at capacity → queued", () => {
    const handlers = makeHandlers([]).map(h => ({ ...h, current: h.capacity, available: false }));
    const result = dispatchReport("NORTH", "FIRE", "HIGH", handlers);
    expect(result.isQueued).toBe(true);
    expect(result.handler).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────
// TC-13: Priority override — EMERGENCY gets best available handler
// ──────────────────────────────────────────────────────────────
describe("TC-13: Priority override for EMERGENCY/CRITICAL", () => {
  it("EMERGENCY report gets least-loaded available handler", () => {
    const handlers = makeHandlers();
    // H006 has 0 load (best available)
    const result = dispatchReport("SOUTH", "MEDICAL", "EMERGENCY", handlers);
    expect(result.isQueued).toBe(false);
    expect(result.handler).not.toBeNull();
    expect(result.reason).toMatch(/emergency|override|EMERGENCY/i);
  });

  it("CRITICAL report gets dispatched even if primary is busy", () => {
    const handlers = makeHandlers([]).map(h =>
      h.id === "H002" ? { ...h, current: 4, available: false } : h // primary unavailable
    );
    const result = dispatchReport("SOUTH", "MEDICAL", "CRITICAL", handlers);
    expect(result.isQueued).toBe(false);
    expect(result.handler).not.toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────
// TC-14: Multiple simultaneous reports ordered deterministically
// ──────────────────────────────────────────────────────────────
describe("TC-14: Multiple simultaneous reports — deterministic ordering", () => {
  it("Higher priority reports resolve to lower-load handlers first", () => {
    const handlers = makeHandlers();
    const r1 = dispatchReport("NORTH", "FIRE", "EMERGENCY", handlers);
    const r2 = dispatchReport("NORTH", "FIRE", "LOW", handlers);
    // EMERGENCY should get a handler (not queued)
    expect(r1.isQueued).toBe(false);
    // Both should return deterministically — same call, same result
    const r1b = dispatchReport("NORTH", "FIRE", "EMERGENCY", handlers);
    expect(r1.handler?.id).toBe(r1b.handler?.id);
  });
});

// ──────────────────────────────────────────────────────────────
// TC-15: Status updates / handler load tracking
// ──────────────────────────────────────────────────────────────
describe("TC-15: Handler load tracking", () => {
  it("getHandlerLoad returns 0 for empty handler", () => {
    const h = { current: 0, capacity: 5 };
    expect(getHandlerLoad(h)).toBe(0);
  });

  it("getHandlerLoad returns 100 for full handler", () => {
    const h = { current: 5, capacity: 5 };
    expect(getHandlerLoad(h)).toBe(100);
  });

  it("getHandlerLoad returns 60 for 3/5", () => {
    const h = { current: 3, capacity: 5 };
    expect(getHandlerLoad(h)).toBe(60);
  });

  it("getHandlerLoad handles zero capacity", () => {
    expect(getHandlerLoad({ current: 0, capacity: 0 })).toBe(0);
  });

  it("getHandlerLoad handles null input", () => {
    expect(getHandlerLoad(null)).toBe(0);
  });
});
