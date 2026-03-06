/**
 * Database Schema - SWIPE Wholesale Sales OS
 *
 * Organized by module for scalability:
 * - tenants: Brand accounts and members
 * - buyers: Retailer CRM records
 * - pipeline: Pipeline stages and configuration
 * - conversations: DM threads and messages
 * - orders: Shopify orders and draft orders
 * - catalog: Products, variants, and price tiers
 * - templates: DM template library
 * - analytics: Event stream and reorder timers
 */

// Tenants
export {
    tenants,
    tenantMembers,
    type Tenant,
    type NewTenant,
    type TenantSettings,
    type TenantMember,
    type NewTenantMember,
} from "./tenants"

// Buyers
export {
    buyers,
    buyerStageHistory,
    type Buyer,
    type NewBuyer,
    type BuyerStageHistory,
    type NewBuyerStageHistory,
} from "./buyers"

// Pipeline
export {
    pipelineStages,
    DEFAULT_PIPELINE_STAGES,
    type PipelineStage,
    type NewPipelineStage,
} from "./pipeline"

// Conversations
export {
    conversations,
    messages,
    aiDrafts,
    type Conversation,
    type NewConversation,
    type Message,
    type NewMessage,
    type ExtractedMessageInfo,
    type AiDraft,
    type NewAiDraft,
} from "./conversations"

// Orders
export {
    orders,
    draftOrders,
    type Order,
    type NewOrder,
    type DraftOrder,
    type NewDraftOrder,
    type OrderLineItem,
} from "./orders"

// Catalog
export {
    catalogProducts,
    productVariants,
    priceTiers,
    DEFAULT_PRICE_TIERS,
    type CatalogProduct,
    type NewCatalogProduct,
    type ProductImage,
    type ProductVariant,
    type NewProductVariant,
    type PriceTier,
    type NewPriceTier,
} from "./catalog"

// Templates
export {
    templates,
    DEFAULT_TEMPLATES,
    type Template,
    type NewTemplate,
    type TemplateVariable,
} from "./templates"

// Analytics
export {
    analyticsEvents,
    reorderTimers,
    type AnalyticsEvent,
    type NewAnalyticsEvent,
    type AnalyticsEventType,
    type ReorderTimer,
    type NewReorderTimer,
} from "./analytics"
