import { task } from "@trigger.dev/sdk/v3"
import { db } from "@/db"
import { analyticsEvents } from "@/db/schema"
import type { AnalyticsTrackPayload } from "../client"
import type { AnalyticsEventType } from "@/db/schema"

/**
 * Analytics Track Task
 *
 * Records analytics events for dashboard metrics.
 * Fire-and-forget: doesn't block the main flow.
 */
export const analyticsTrack = task({
    id: "analytics.track",
    retry: {
        maxAttempts: 3,
        minTimeoutInMs: 500,
        maxTimeoutInMs: 5000,
    },
    run: async (payload: AnalyticsTrackPayload) => {
        const {
            tenantId,
            eventType,
            eventName,
            data,
            buyerId,
            conversationId,
            orderId,
        } = payload

        await db.insert(analyticsEvents).values({
            tenantId,
            eventType: eventType as AnalyticsEventType,
            eventName,
            data: data ?? {},
            buyerId,
            conversationId,
            orderId,
            occurredAt: new Date(),
        })

        return { success: true }
    },
})
