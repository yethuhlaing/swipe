import { db } from "@/db"
import { orders, type Order } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"

/**
 * Orders Data Access
 *
 * Used by CRM detail (orders tab) and analytics.
 */

export async function listOrdersByBuyerId(
    tenantId: string,
    buyerId: string,
    limit = 50
): Promise<Order[]> {
    return db
        .select()
        .from(orders)
        .where(
            and(
                eq(orders.tenantId, tenantId),
                eq(orders.buyerId, buyerId)
            )
        )
        .orderBy(desc(orders.createdAt))
        .limit(limit)
}
