import { pgTable, text, timestamp, integer, jsonb, boolean, numeric, index } from "drizzle-orm/pg-core"

/**
 * Catalog Products - Shopify product cache
 */
export const catalogProducts = pgTable("catalog_products", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),

    // Shopify info
    shopifyProductId: text("shopify_product_id").notNull(),
    shopifyHandle: text("shopify_handle"),

    // Product info
    title: text("title").notNull(),
    description: text("description"),
    vendor: text("vendor"),
    productType: text("product_type"),
    tags: jsonb("tags").$type<string[]>().default([]),

    // Images
    featuredImageUrl: text("featured_image_url"),
    images: jsonb("images").$type<ProductImage[]>().default([]),

    // Pricing (MSRP)
    priceMin: numeric("price_min", { precision: 10, scale: 2 }),
    priceMax: numeric("price_max", { precision: 10, scale: 2 }),
    compareAtPriceMin: numeric("compare_at_price_min", { precision: 10, scale: 2 }),
    compareAtPriceMax: numeric("compare_at_price_max", { precision: 10, scale: 2 }),
    currency: text("currency").default("USD"),

    // Inventory
    totalInventory: integer("total_inventory").default(0),
    isInStock: boolean("is_in_stock").default(true),
    trackInventory: boolean("track_inventory").default(true),

    // Wholesale settings
    wholesaleEnabled: boolean("wholesale_enabled").default(true),
    minOrderQuantity: integer("min_order_quantity").default(1),

    // Status
    status: text("status").$type<"active" | "draft" | "archived">().default("active"),
    isVisible: boolean("is_visible").default(true),

    // Sync info
    lastSyncedAt: timestamp("last_synced_at"),
    shopifyUpdatedAt: timestamp("shopify_updated_at"),

    // Metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("catalog_products_tenant_idx").on(table.tenantId),
    index("catalog_products_shopify_id_idx").on(table.shopifyProductId),
    index("catalog_products_status_idx").on(table.tenantId, table.status),
])

export type ProductImage = {
    id: string
    url: string
    altText?: string
    position: number
}

export type CatalogProduct = typeof catalogProducts.$inferSelect
export type NewCatalogProduct = typeof catalogProducts.$inferInsert

/**
 * Product Variants - Shopify variant cache
 */
export const productVariants = pgTable("product_variants", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),
    productId: text("product_id").notNull(),

    // Shopify info
    shopifyVariantId: text("shopify_variant_id").notNull(),

    // Variant info
    title: text("title").notNull(),
    sku: text("sku"),
    barcode: text("barcode"),

    // Options
    option1: text("option1"),
    option2: text("option2"),
    option3: text("option3"),

    // Pricing
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),

    // Inventory
    inventoryQuantity: integer("inventory_quantity").default(0),
    inventoryPolicy: text("inventory_policy").$type<"deny" | "continue">().default("deny"),

    // Fulfillment
    weight: numeric("weight", { precision: 10, scale: 2 }),
    weightUnit: text("weight_unit").$type<"kg" | "g" | "lb" | "oz">(),

    // Image
    imageUrl: text("image_url"),

    // Status
    isAvailable: boolean("is_available").default(true),

    // Metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("product_variants_product_idx").on(table.productId),
    index("product_variants_shopify_id_idx").on(table.shopifyVariantId),
])

export type ProductVariant = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert

/**
 * Price Tiers - Wholesale tier multipliers per tenant
 */
export const priceTiers = pgTable("price_tiers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),

    // Tier info
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),

    // Pricing
    discountType: text("discount_type").$type<"percentage" | "fixed">().default("percentage"),
    discountValue: numeric("discount_value", { precision: 5, scale: 2 }).notNull(),

    // Requirements
    minOrderValue: numeric("min_order_value", { precision: 10, scale: 2 }),
    minOrderQuantity: integer("min_order_quantity"),

    // Status
    isDefault: boolean("is_default").default(false),
    isActive: boolean("is_active").default(true),

    // Metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("price_tiers_tenant_idx").on(table.tenantId),
])

export type PriceTier = typeof priceTiers.$inferSelect
export type NewPriceTier = typeof priceTiers.$inferInsert

/**
 * Default price tiers
 */
export const DEFAULT_PRICE_TIERS = [
    {
        slug: "tier1",
        name: "Tier 1 - Premium",
        description: "Best pricing for top retailers",
        discountType: "percentage" as const,
        discountValue: "50.00",
        isDefault: false,
    },
    {
        slug: "tier2",
        name: "Tier 2 - Standard",
        description: "Standard wholesale pricing",
        discountType: "percentage" as const,
        discountValue: "40.00",
        isDefault: true,
    },
    {
        slug: "tier3",
        name: "Tier 3 - Starter",
        description: "Entry-level wholesale pricing",
        discountType: "percentage" as const,
        discountValue: "30.00",
        isDefault: false,
    },
] as const
