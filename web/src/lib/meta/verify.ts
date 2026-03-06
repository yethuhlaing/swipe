import { createHmac } from "crypto"

/**
 * Meta Webhook Signature Verification
 *
 * Verifies that incoming webhooks are actually from Meta.
 * Uses HMAC SHA-256 with the app secret.
 */

/**
 * Verify Meta webhook signature
 *
 * @param rawBody - The raw request body as a string
 * @param signature - The X-Hub-Signature-256 header value
 * @param appSecret - The Meta app secret
 * @returns boolean indicating if the signature is valid
 */
export function verifyMetaSignature(
    rawBody: string,
    signature: string | null,
    appSecret: string
): boolean {
    if (!signature) {
        return false
    }

    // Signature format: "sha256=<hash>"
    const [algorithm, hash] = signature.split("=")

    if (algorithm !== "sha256" || !hash) {
        return false
    }

    const expectedHash = createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex")

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(hash, expectedHash)
}

/**
 * Constant-time string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
}

/**
 * Parse Meta webhook payload
 *
 * Meta sends different event types with different structures.
 * This normalizes them into a consistent format.
 */
export type MetaWebhookEvent = {
    object: "instagram" | "whatsapp_business_account"
    entry: Array<{
        id: string
        time: number
        messaging?: Array<MetaMessagingEvent>
        changes?: Array<MetaChangeEvent>
    }>
}

export type MetaMessagingEvent = {
    sender: { id: string }
    recipient: { id: string }
    timestamp: number
    message?: {
        mid: string
        text?: string
        attachments?: Array<{
            type: string
            payload: { url: string }
        }>
    }
    read?: {
        mid: string
        watermark: number
    }
    reaction?: {
        mid: string
        action: "react" | "unreact"
        reaction?: string
    }
}

export type MetaChangeEvent = {
    field: string
    value: Record<string, unknown>
}

/**
 * Extract message events from Meta webhook payload
 */
export function extractMessageEvents(
    payload: MetaWebhookEvent
): Array<{
    platform: "instagram" | "whatsapp"
    senderId: string
    recipientId: string
    messageId: string
    messageText: string
    timestamp: string
    messageType: "text" | "image" | "story_reply"
}> {
    const events: Array<{
        platform: "instagram" | "whatsapp"
        senderId: string
        recipientId: string
        messageId: string
        messageText: string
        timestamp: string
        messageType: "text" | "image" | "story_reply"
    }> = []

    const platform = payload.object === "instagram" ? "instagram" : "whatsapp"

    for (const entry of payload.entry) {
        if (!entry.messaging) continue

        for (const event of entry.messaging) {
            // Skip if no message (could be read receipt or reaction)
            if (!event.message) continue

            // Extract text content
            const messageText = event.message.text ?? ""
            if (!messageText) continue

            events.push({
                platform,
                senderId: event.sender.id,
                recipientId: event.recipient.id,
                messageId: event.message.mid,
                messageText,
                timestamp: new Date(event.timestamp).toISOString(),
                messageType: "text",
            })
        }
    }

    return events
}
