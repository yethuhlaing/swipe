import { createHmac } from "crypto"

/**
 * Shopify Webhook HMAC Verification
 *
 * Verifies that incoming webhooks are actually from Shopify.
 * Uses HMAC SHA-256 with the client secret.
 */

/**
 * Verify Shopify webhook HMAC
 *
 * @param rawBody - The raw request body as a string
 * @param hmacHeader - The X-Shopify-Hmac-Sha256 header value
 * @param clientSecret - The Shopify app client secret
 * @returns boolean indicating if the HMAC is valid
 */
export function verifyShopifyHmac(
    rawBody: string,
    hmacHeader: string | null,
    clientSecret: string
): boolean {
    if (!hmacHeader) {
        return false
    }

    const expectedHmac = createHmac("sha256", clientSecret)
        .update(rawBody, "utf8")
        .digest("base64")

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(hmacHeader, expectedHmac)
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
 * Parse Shopify webhook topic from header
 */
export type ShopifyWebhookTopic =
    | "orders/create"
    | "orders/updated"
    | "orders/paid"
    | "orders/fulfilled"
    | "orders/cancelled"
    | "draft_orders/create"
    | "draft_orders/update"
    | "products/create"
    | "products/update"
    | "products/delete"
    | "inventory_levels/update"
    | "app/uninstalled"

export function parseShopifyTopic(topic: string | null): ShopifyWebhookTopic | null {
    const validTopics: ShopifyWebhookTopic[] = [
        "orders/create",
        "orders/updated",
        "orders/paid",
        "orders/fulfilled",
        "orders/cancelled",
        "draft_orders/create",
        "draft_orders/update",
        "products/create",
        "products/update",
        "products/delete",
        "inventory_levels/update",
        "app/uninstalled",
    ]

    if (topic && validTopics.includes(topic as ShopifyWebhookTopic)) {
        return topic as ShopifyWebhookTopic
    }

    return null
}

/**
 * Extract shop domain from Shopify webhook headers
 */
export function extractShopDomain(shopDomain: string | null): string | null {
    if (!shopDomain) return null

    // Remove .myshopify.com if present, then add it back for consistency
    const cleanDomain = shopDomain
        .toLowerCase()
        .replace(".myshopify.com", "")
        .replace(/[^a-z0-9-]/g, "")

    return cleanDomain ? `${cleanDomain}.myshopify.com` : null
}
