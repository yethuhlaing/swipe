import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { tenants, buyers, orders, draftOrders } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import {
    verifyShopifyHmac,
    parseShopifyTopic,
    extractShopDomain,
} from "@/lib/shopify/verify"
import { triggerTask } from "@/trigger/client"

/**
 * Shopify Webhook Endpoint
 *
 * Handles webhook events from Shopify:
 * - orders/paid: Update buyer stage, send thank you DM
 * - orders/fulfilled: Send shipping notification
 * - products/update: Sync product catalog
 * - etc.
 *
 * Key requirements:
 * 1. Verify HMAC signature
 * 2. Return 200 quickly
 * 3. Trigger background tasks for processing
 */

export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        // 1. Read raw body for HMAC verification
        const rawBody = await request.text()

        // 2. Extract headers
        const hmacHeader = request.headers.get("x-shopify-hmac-sha256")
        const topicHeader = request.headers.get("x-shopify-topic")
        const shopDomainHeader = request.headers.get("x-shopify-shop-domain")

        const clientSecret = process.env.SHOPIFY_CLIENT_SECRET

        if (!clientSecret) {
            console.error("SHOPIFY_CLIENT_SECRET not configured")
            return new NextResponse("Configuration error", { status: 500 })
        }

        // 3. Verify HMAC
        if (!verifyShopifyHmac(rawBody, hmacHeader, clientSecret)) {
            console.error("Invalid Shopify webhook HMAC")
            return new NextResponse("Invalid signature", { status: 401 })
        }

        // 4. Parse topic and shop
        const topic = parseShopifyTopic(topicHeader)
        const shopDomain = extractShopDomain(shopDomainHeader)

        if (!topic || !shopDomain) {
            console.error("Invalid Shopify webhook: missing topic or shop")
            return new NextResponse("OK", { status: 200 })
        }

        // 5. Find tenant by Shopify shop
        const [tenant] = await db
            .select()
            .from(tenants)
            .where(eq(tenants.shopifyShop, shopDomain))
            .limit(1)

        if (!tenant) {
            console.error(`No tenant found for Shopify shop: ${shopDomain}`)
            return new NextResponse("OK", { status: 200 })
        }

        // 6. Parse payload
        const payload = JSON.parse(rawBody)

        // 7. Handle different webhook topics
        switch (topic) {
            case "orders/paid":
                await handleOrderPaid(tenant.id, payload)
                break

            case "orders/fulfilled":
                await handleOrderFulfilled(tenant.id, payload)
                break

            case "products/create":
            case "products/update":
            case "products/delete":
                await handleProductChange(tenant.id, shopDomain, topic, payload)
                break

            case "inventory_levels/update":
                await handleInventoryUpdate(tenant.id, shopDomain, payload)
                break

            case "app/uninstalled":
                await handleAppUninstalled(tenant.id)
                break

            default:
                console.log(`Unhandled Shopify webhook topic: ${topic}`)
        }

        const duration = Date.now() - startTime
        console.log(`Shopify webhook ${topic} processed in ${duration}ms`)

        return new NextResponse("OK", { status: 200 })
    } catch (error) {
        console.error("Shopify webhook error:", error)
        return new NextResponse("OK", { status: 200 })
    }
}

/**
 * Handle orders/paid webhook
 *
 * 1. Update order status
 * 2. Update buyer stage to "Paid"
 * 3. Trigger thank you DM
 * 4. Start reorder timer
 */
async function handleOrderPaid(tenantId: string, payload: ShopifyOrderPayload) {
    const shopifyOrderId = String(payload.id)

    // Find order by Shopify order ID
    const [order] = await db
        .select()
        .from(orders)
        .where(
            and(
                eq(orders.tenantId, tenantId),
                eq(orders.shopifyOrderId, shopifyOrderId)
            )
        )
        .limit(1)

    if (order) {
        // Update order status
        await db
            .update(orders)
            .set({
                status: "paid",
                paymentStatus: "paid",
                paidAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id))

        // Track analytics
        await triggerTask("analytics.track", {
            tenantId,
            eventType: "order.paid",
            eventName: "Order Paid",
            orderId: order.id,
            buyerId: order.buyerId,
            data: {
                total: payload.total_price,
                currency: payload.currency,
                itemCount: payload.line_items?.length ?? 0,
            },
        })
    } else {
        // Order not found - might have been created directly in Shopify
        // Create order record if we can find the buyer by email
        const customerEmail = payload.customer?.email
        if (customerEmail) {
            const [buyer] = await db
                .select()
                .from(buyers)
                .where(
                    and(eq(buyers.tenantId, tenantId), eq(buyers.email, customerEmail))
                )
                .limit(1)

            if (buyer) {
                await db.insert(orders).values({
                    tenantId,
                    buyerId: buyer.id,
                    shopifyOrderId,
                    shopifyOrderNumber: payload.order_number?.toString(),
                    status: "paid",
                    paymentStatus: "paid",
                    total: payload.total_price,
                    currency: payload.currency,
                    paidAt: new Date(),
                    lineItems: payload.line_items?.map((item) => ({
                        productId: String(item.product_id),
                        variantId: String(item.variant_id),
                        title: item.title,
                        variantTitle: item.variant_title,
                        quantity: item.quantity,
                        price: item.price,
                        sku: item.sku,
                    })) ?? [],
                    itemCount: payload.line_items?.length ?? 0,
                })

                await triggerTask("analytics.track", {
                    tenantId,
                    eventType: "order.paid",
                    eventName: "Order Paid",
                    buyerId: buyer.id,
                    data: {
                        total: payload.total_price,
                        currency: payload.currency,
                        source: "shopify_direct",
                    },
                })
            }
        }
    }
}

/**
 * Handle orders/fulfilled webhook
 *
 * Update order status and track analytics
 */
async function handleOrderFulfilled(
    tenantId: string,
    payload: ShopifyOrderPayload
) {
    const shopifyOrderId = String(payload.id)

    const [order] = await db
        .select()
        .from(orders)
        .where(
            and(
                eq(orders.tenantId, tenantId),
                eq(orders.shopifyOrderId, shopifyOrderId)
            )
        )
        .limit(1)

    if (order) {
        const trackingInfo = payload.fulfillments?.[0]

        await db
            .update(orders)
            .set({
                fulfillmentStatus: "fulfilled",
                trackingNumber: trackingInfo?.tracking_number,
                trackingUrl: trackingInfo?.tracking_url,
                shippedAt: trackingInfo?.created_at
                    ? new Date(trackingInfo.created_at)
                    : new Date(),
                updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id))

        await triggerTask("analytics.track", {
            tenantId,
            eventType: "order.shipped",
            eventName: "Order Shipped",
            orderId: order.id,
            buyerId: order.buyerId,
        })
    }
}

/**
 * Handle product create/update/delete webhooks
 *
 * Trigger product sync task
 */
async function handleProductChange(
    tenantId: string,
    shopDomain: string,
    topic: string,
    payload: ShopifyProductPayload
) {
    // For now, just track the event
    // Full product sync will be implemented with the Shopify integration
    await triggerTask("analytics.track", {
        tenantId,
        eventType: "catalog.product_changed",
        eventName: "Product Changed",
        data: {
            topic,
            productId: payload.id,
            productTitle: payload.title,
        },
    })
}

/**
 * Handle inventory update webhook
 */
async function handleInventoryUpdate(
    tenantId: string,
    shopDomain: string,
    payload: ShopifyInventoryPayload
) {
    // Track inventory change for analytics
    await triggerTask("analytics.track", {
        tenantId,
        eventType: "catalog.inventory_changed",
        eventName: "Inventory Changed",
        data: {
            inventoryItemId: payload.inventory_item_id,
            available: payload.available,
        },
    })
}

/**
 * Handle app/uninstalled webhook
 *
 * Clean up tenant's Shopify connection
 */
async function handleAppUninstalled(tenantId: string) {
    await db
        .update(tenants)
        .set({
            shopifyShop: null,
            shopifyAccessToken: null,
            shopifyConnectedAt: null,
            updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))

    console.log(`Shopify app uninstalled for tenant: ${tenantId}`)
}

// Type definitions for Shopify payloads

type ShopifyOrderPayload = {
    id: number
    order_number?: number
    total_price: string
    currency: string
    customer?: {
        id: number
        email: string
    }
    line_items?: Array<{
        product_id: number
        variant_id: number
        title: string
        variant_title?: string
        quantity: number
        price: string
        sku?: string
    }>
    fulfillments?: Array<{
        id: number
        tracking_number?: string
        tracking_url?: string
        created_at: string
    }>
}

type ShopifyProductPayload = {
    id: number
    title: string
    handle: string
    variants?: Array<{
        id: number
        title: string
        price: string
        sku?: string
        inventory_quantity: number
    }>
}

type ShopifyInventoryPayload = {
    inventory_item_id: number
    location_id: number
    available: number
}
