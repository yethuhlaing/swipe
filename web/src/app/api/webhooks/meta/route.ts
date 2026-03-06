import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { eq } from "drizzle-orm"
import {
    verifyMetaSignature,
    extractMessageEvents,
    type MetaWebhookEvent,
} from "@/lib/meta/verify"
import { triggerTask } from "@/trigger/client"

/**
 * Meta Webhook Endpoint
 *
 * Handles webhook verification (GET) and event processing (POST)
 * from Instagram Messaging API.
 *
 * Key requirements:
 * 1. Return 200 within 1 second (Meta requirement)
 * 2. Verify signature before processing
 * 3. Trigger background task for actual processing
 */

// Webhook verification (GET)
// Meta sends this to verify the endpoint when setting up webhooks
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN

    if (mode === "subscribe" && token === verifyToken) {
        console.log("Meta webhook verified successfully")
        return new NextResponse(challenge, { status: 200 })
    }

    console.log("Meta webhook verification failed")
    return new NextResponse("Forbidden", { status: 403 })
}

// Webhook event handler (POST)
export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        // 1. Read raw body for signature verification
        const rawBody = await request.text()
        const signature = request.headers.get("x-hub-signature-256")
        const appSecret = process.env.META_APP_SECRET

        if (!appSecret) {
            console.error("META_APP_SECRET not configured")
            return new NextResponse("Configuration error", { status: 500 })
        }

        // 2. Verify signature
        if (!verifyMetaSignature(rawBody, signature, appSecret)) {
            console.error("Invalid Meta webhook signature")
            return new NextResponse("Invalid signature", { status: 401 })
        }

        // 3. Parse payload
        const payload = JSON.parse(rawBody) as MetaWebhookEvent

        // 4. Extract message events
        const messageEvents = extractMessageEvents(payload)

        if (messageEvents.length === 0) {
            // No messages to process (might be read receipt, reaction, etc.)
            return new NextResponse("OK", { status: 200 })
        }

        // 5. Find tenant by Instagram Business ID
        // The recipient ID in the webhook is the Instagram Business Account ID
        const recipientId = messageEvents[0].recipientId

        const [tenant] = await db
            .select()
            .from(tenants)
            .where(eq(tenants.instagramBusinessId, recipientId))
            .limit(1)

        if (!tenant) {
            console.error(`No tenant found for Instagram Business ID: ${recipientId}`)
            // Still return 200 to prevent Meta from retrying
            return new NextResponse("OK", { status: 200 })
        }

        // 6. Trigger background tasks for each message
        // This is fire-and-forget - we don't await the task completion
        const triggerPromises = messageEvents.map((event) =>
            triggerTask("inbox.process", {
                tenantId: tenant.id,
                platform: event.platform,
                externalThreadId: `${event.senderId}-${event.recipientId}`,
                senderId: event.senderId,
                messageId: event.messageId,
                messageText: event.messageText,
                messageTimestamp: event.timestamp,
                messageType: event.messageType,
            })
        )

        // Trigger all tasks in parallel
        await Promise.all(triggerPromises)

        const duration = Date.now() - startTime
        console.log(`Meta webhook processed in ${duration}ms, triggered ${messageEvents.length} tasks`)

        // 7. Return 200 immediately (Meta requirement)
        return new NextResponse("OK", { status: 200 })
    } catch (error) {
        console.error("Meta webhook error:", error)
        // Still return 200 to prevent infinite retries
        // The error is logged for debugging
        return new NextResponse("OK", { status: 200 })
    }
}
