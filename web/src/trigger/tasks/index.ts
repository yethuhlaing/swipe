/**
 * Trigger.dev Task Registry
 *
 * All tasks must be exported from this file for Trigger.dev to discover them.
 */

export { inboxProcess } from "./inbox-process"
export { aiDraft, classifyIntentTask } from "./ai-draft"
export { analyticsTrack } from "./analytics-track"

// Future tasks (to be implemented):
// export { shopifySyncProducts, shopifyProcessWebhook } from "./shopify"
// export { reorderCheck, reorderSend } from "./reorder"
