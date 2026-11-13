// ============================================================
// routerLogic.js — Routing/dispatch logic
// ============================================================

import { ROUTING_RULES, HANDLERS } from "../store/mockData";

/**
 * Find the best handler for a report
 * Returns { handler, isBackup, isQueued, reason }
 */
export function dispatchReport(zone, category, priority, allHandlers) {
  const handlers = allHandlers || HANDLERS;

  // Find matching routing rule
  const rule = ROUTING_RULES.find((r) => r.zone === zone && r.category === category);

  if (!rule) {
    // No routing rule — escalate to backup (Foxtrot)
    const fallback = handlers.find((h) => h.id === "H006");
    return {
      handler: fallback || null,
      isBackup: true,
      isQueued: false,
      reason: `No routing rule found for zone ${zone} + category ${category}. Assigned to backup.`,
    };
  }

  const primary = handlers.find((h) => h.id === rule.primaryHandler);
  const backup  = handlers.find((h) => h.id === rule.backupHandler);

  // Emergency / Critical override — force assign to best available
  if (priority === "EMERGENCY" || priority === "CRITICAL") {
    const available = handlers
      .filter((h) => h.available && h.current < h.capacity)
      .sort((a, b) => (a.current / a.capacity) - (b.current / b.capacity));

    if (available.length > 0) {
      return { handler: available[0], isBackup: available[0].id !== primary?.id, isQueued: false, reason: `Priority override: EMERGENCY/CRITICAL — assigned to least-loaded available handler.` };
    }
  }

  // Check primary handler
  if (primary && primary.available && primary.current < primary.capacity) {
    return { handler: primary, isBackup: false, isQueued: false, reason: `Assigned to primary handler.` };
  }

  // Try backup
  if (backup && backup.available && backup.current < backup.capacity) {
    return { handler: backup, isBackup: true, isQueued: false, reason: `Primary handler unavailable or at capacity — using backup.` };
  }

  // Queue the report
  return { handler: null, isBackup: false, isQueued: true, reason: `All handlers for zone ${zone} at capacity — report queued.` };
}

/**
 * Get handler load percentage
 */
export function getHandlerLoad(handler) {
  if (!handler || handler.capacity === 0) return 0;
  return Math.round((handler.current / handler.capacity) * 100);
}
