import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core"

/**
 * Templates - DM template library
 * Brand-voice templates for each pipeline stage
 */
export const templates = pgTable("templates", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),

    // Template info
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").$type<"greeting" | "catalog" | "follow_up" | "recommendation" | "invoice" | "thank_you" | "reorder" | "custom">().default("custom"),

    // Associated stage (optional)
    stageId: text("stage_id"),

    // Content
    content: text("content").notNull(),

    // Variables that can be interpolated
    variables: jsonb("variables").$type<TemplateVariable[]>().default([]),

    // Usage
    isDefault: boolean("is_default").default(false),
    isActive: boolean("is_active").default(true),
    usageCount: text("usage_count").default("0"),

    // Metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("templates_tenant_idx").on(table.tenantId),
    index("templates_category_idx").on(table.category),
])

export type TemplateVariable = {
    key: string
    label: string
    defaultValue?: string
}

export type Template = typeof templates.$inferSelect
export type NewTemplate = typeof templates.$inferInsert

/**
 * Default templates
 */
export const DEFAULT_TEMPLATES = [
    {
        category: "greeting" as const,
        name: "Welcome Message",
        content: "Hi {{buyer_name}}! Thanks for reaching out about wholesale. We'd love to partner with {{store_name}}! Would you like me to send over our latest catalog?",
        variables: [
            { key: "buyer_name", label: "Buyer Name", defaultValue: "there" },
            { key: "store_name", label: "Store Name", defaultValue: "your store" },
        ],
    },
    {
        category: "catalog" as const,
        name: "Catalog Link",
        content: "Here's our wholesale catalog: {{catalog_link}}\n\nLet me know if you have any questions or would like recommendations based on your store!",
        variables: [
            { key: "catalog_link", label: "Catalog Link" },
        ],
    },
    {
        category: "follow_up" as const,
        name: "Catalog Follow-up",
        content: "Hi {{buyer_name}}! Just checking in - did you get a chance to look through our catalog? Happy to help with any questions or put together a recommended starter pack for {{store_name}}.",
        variables: [
            { key: "buyer_name", label: "Buyer Name", defaultValue: "there" },
            { key: "store_name", label: "Store Name", defaultValue: "your store" },
        ],
    },
    {
        category: "recommendation" as const,
        name: "Product Recommendation",
        content: "Based on your store, I'd recommend starting with:\n\n{{product_recommendations}}\n\nThis is a popular starter pack that does well with stores like yours. Want me to put together a draft order?",
        variables: [
            { key: "product_recommendations", label: "Product Recommendations" },
        ],
    },
    {
        category: "invoice" as const,
        name: "Invoice / Draft Order",
        content: "Great! I've put together your order:\n\n{{order_summary}}\n\nTotal: {{order_total}}\n\nHere's your invoice link: {{invoice_link}}\n\nLet me know if you need any changes!",
        variables: [
            { key: "order_summary", label: "Order Summary" },
            { key: "order_total", label: "Order Total" },
            { key: "invoice_link", label: "Invoice Link" },
        ],
    },
    {
        category: "thank_you" as const,
        name: "Thank You / Order Confirmation",
        content: "Thank you so much for your order, {{buyer_name}}! 🙏\n\nWe'll get this shipped out ASAP and send you tracking info. So excited to see our products in {{store_name}}!",
        variables: [
            { key: "buyer_name", label: "Buyer Name", defaultValue: "there" },
            { key: "store_name", label: "Store Name", defaultValue: "your store" },
        ],
    },
    {
        category: "reorder" as const,
        name: "Reorder Outreach",
        content: "Hi {{buyer_name}}! It's been about {{days_since_order}} days since your last order. How are those {{last_order_products}} doing?\n\nWould you like to restock? I can put together your usual order or help you try some new items!",
        variables: [
            { key: "buyer_name", label: "Buyer Name", defaultValue: "there" },
            { key: "days_since_order", label: "Days Since Order" },
            { key: "last_order_products", label: "Last Order Products" },
        ],
    },
] as const
