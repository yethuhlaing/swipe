import { pgTable, text, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core"

/**
 * Pipeline Stages - Configurable stage definitions per tenant
 * Default 7 stages from docs/04-pipeline.md
 */
export const pipelineStages = pgTable("pipeline_stages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").notNull(),

    // Stage info
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    color: text("color").default("#6366f1"),

    // Order in pipeline
    position: integer("position").notNull(),

    // Automation settings
    autoAction: text("auto_action").$type<"none" | "send_catalog" | "create_draft_order" | "send_thank_you" | "start_reorder_timer">().default("none"),
    aiConfidenceThreshold: integer("ai_confidence_threshold").default(75),
    requiresHumanApproval: boolean("requires_human_approval").default(true),

    // Follow-up settings
    followUpDelayHours: integer("follow_up_delay_hours"),
    followUpTemplate: text("follow_up_template"),

    // Metadata
    isDefault: boolean("is_default").default(false),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("pipeline_stages_tenant_idx").on(table.tenantId),
    index("pipeline_stages_position_idx").on(table.tenantId, table.position),
])

export type PipelineStage = typeof pipelineStages.$inferSelect
export type NewPipelineStage = typeof pipelineStages.$inferInsert

/**
 * Default pipeline stages based on docs/04-pipeline.md
 */
export const DEFAULT_PIPELINE_STAGES = [
    {
        slug: "cold-outreach",
        name: "Cold Outreach",
        description: "Brand sends first DM. SWIPE logs contact when buyer replies.",
        position: 1,
        autoAction: "none" as const,
    },
    {
        slug: "interested",
        name: "Interested",
        description: "Buyer replies positively. AI classifies intent, sends catalog link.",
        position: 2,
        autoAction: "send_catalog" as const,
    },
    {
        slug: "needs-recommendation",
        name: "Needs Recommendation",
        description: "Buyer asks for product guidance. AI suggests starter pack.",
        position: 3,
        autoAction: "none" as const,
    },
    {
        slug: "catalog-sent",
        name: "Catalog Sent",
        description: "Digital lookbook sent. Track opens and schedule follow-up.",
        position: 4,
        autoAction: "none" as const,
        followUpDelayHours: 48,
    },
    {
        slug: "draft-order-sent",
        name: "Draft Order Sent",
        description: "Shopify draft order created. Invoice link dispatched via DM.",
        position: 5,
        autoAction: "create_draft_order" as const,
    },
    {
        slug: "paid",
        name: "Paid",
        description: "Payment received. Thank-you sent. Reorder timer started.",
        position: 6,
        autoAction: "start_reorder_timer" as const,
    },
    {
        slug: "reorder",
        name: "Reorder",
        description: "Automated reorder outreach. Multi-touch sequence if no response.",
        position: 7,
        autoAction: "none" as const,
    },
] as const
