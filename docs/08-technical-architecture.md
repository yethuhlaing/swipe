# 8. Technical Architecture

SWIPE is a standard multi-tenant SaaS. Each brand's data is isolated by tenant ID at the database and API level. Meta compliance is foundational — SWIPE must maintain Meta Business Partner status or operate under a partner arrangement.

---

## Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SWIPE Frontend                           │
│              Next.js 15 · Tailwind · shadcn/ui                  │
│         Real-time inbox via WebSockets (Supabase Realtime)      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ API calls
┌──────────────────────────▼──────────────────────────────────────┐
│                      SWIPE API Layer                             │
│              Node.js / TypeScript · REST + WebSocket             │
│              Auth: Supabase Auth + JWT                           │
└──────┬─────────────┬─────────────┬──────────────────────────────┘
       │             │             │
┌──────▼──────┐ ┌────▼────┐ ┌─────▼──────┐
│  PostgreSQL  │ │  Redis  │ │  BullMQ    │
│ (Supabase)  │ │  Cache  │ │  Job Queue │
│  RLS tenants│ │  Rate   │ │  Reorders  │
│             │ │  Limits │ │  AI Tasks  │
└─────────────┘ └─────────┘ └────────────┘

External APIs:
  Meta Graph API (IG DMs) ←→ SWIPE Webhook Receiver
  WhatsApp Business API   ←→ SWIPE Webhook Receiver
  Shopify Partner API     ←→ SWIPE Webhook Receiver
  OpenAI GPT-4o           ←→ AI Worker
```

---

## Frontend

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Framework | Next.js 15 (App Router) | RSC for performance, familiar stack |
| Styling | Tailwind CSS + shadcn/ui | Fast iteration, accessible components |
| Real-time | Supabase Realtime (WebSockets) | Inbox updates without polling |
| State management | Zustand + React Query | Simple, performant for this use case |
| Mobile | Responsive web (v1) | No native iOS/Android in v1 |

**Key UI screens:**
- Inbox (unified DM feed, IG + WhatsApp)
- Pipeline Kanban board
- Buyer CRM record view
- Order creation modal
- Analytics dashboard
- Settings (account connections, tier configs, templates)

---

## Backend

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Runtime | Node.js 20 + TypeScript | Type safety, ecosystem fit |
| API style | REST + WebSocket | REST for CRUD, WS for inbox real-time |
| Database | PostgreSQL via Supabase | RLS for tenant isolation, managed |
| Cache | Redis (Upstash) | Inbox queue, sessions, rate limits |
| Job queue | BullMQ | Reorder timers, AI drafting queue, follow-up sequences |
| Auth | Supabase Auth + JWT | Handles OAuth flows + session management |
| File storage | Supabase Storage | Catalog images, product card generation |

### Multi-tenancy Model

```sql
-- Every table has tenant_id
-- Supabase RLS policies enforce isolation

CREATE POLICY "brand_isolation" ON buyers
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

All queries are automatically scoped to the authenticated brand's `tenant_id`. No cross-tenant data leakage is possible at the database level.

---

## AI Layer

| Task | Model | Output format |
|------|-------|---------------|
| Intent classification | GPT-4o | JSON: `{ intent, confidence, stage_suggestion }` |
| Info extraction (name, store, location) | GPT-4o | JSON: structured buyer fields |
| DM draft generation | GPT-4o | String: message text |
| Buyer scoring | GPT-4o + signals | JSON: `{ score, reasoning, signals }` |
| Product recommendation | GPT-4o + catalog context | JSON: `[ { product_id, reasoning } ]` |
| Reorder message drafting | GPT-4o + order history | String: personalized DM text |

**Key AI design decisions:**
- All classification tasks use **JSON mode** (structured output) — no regex parsing of free text
- Every classification includes a `confidence` field (0–1)
- Confidence < threshold → message routed to human queue, never auto-actioned
- Brand voice training (Scale tier): fine-tuned model per tenant using approved message history
- AI costs are COGS — budget ~$0.02–0.05 per DM conversation processed

---

## Webhook Infrastructure

### Inbound webhooks

```typescript
// Meta webhook receiver
POST /webhooks/meta
  → Verify signature (X-Hub-Signature-256)
  → Parse event type (message, read, reaction)
  → Enqueue to BullMQ: 'inbox-processor'
  → Return 200 immediately (Meta requires < 1s response)

// Shopify webhook receiver  
POST /webhooks/shopify
  → Verify HMAC signature
  → Parse topic (orders/paid, fulfillments/create, etc.)
  → Enqueue to BullMQ: 'order-processor'
  → Return 200 immediately
```

### Outbound message queue

```typescript
// All outbound DMs go through rate-limited queue
// Respects Meta's per-account message limits
// Exponential backoff on rate limit errors
// Dead letter queue for failed sends → alert to brand
```

---

## Data Model (Key Tables)

```
tenants           → brand accounts
buyers            → retailer CRM records (tenant_id FK)
conversations     → DM thread metadata (buyer_id FK)
messages          → individual DM messages (conversation_id FK)
pipeline_stages   → configurable stage definitions (tenant_id FK)
buyer_stages      → buyer's current + history of stages (buyer_id FK)
orders            → Shopify order records (buyer_id FK)
draft_orders      → pending invoices (buyer_id FK)
reorder_timers    → scheduled reorder jobs (buyer_id FK)
catalog_products  → Shopify product cache (tenant_id FK)
price_tiers       → wholesale tier multipliers (tenant_id FK)
templates         → DM template library (tenant_id FK)
ai_drafts         → generated drafts pending approval (message_id FK)
analytics_events  → event stream for dashboard (tenant_id FK)
```

---

## Infrastructure & Deployment

| Concern | Approach |
|---------|----------|
| Hosting | Vercel (frontend) + Railway or Fly.io (API + workers) |
| Database | Supabase managed PostgreSQL |
| Redis | Upstash serverless Redis |
| CDN | Cloudflare (catalog pages, product card images) |
| Monitoring | Sentry (errors) + Grafana/Loki (logs) |
| Analytics | PostHog (product analytics, via Cloudflare Worker proxy) |
| CI/CD | GitHub Actions → Vercel + Railway deploy |
| Secrets | Doppler or Vercel env vars |

---

## Compliance & Risk

- All Instagram messaging uses **official Meta Graph API** — no scraping, no browser automation, no third-party IG bots
- **GDPR compliance:** buyer data exportable and permanently deletable on request; data retention policy configurable
- **SOC 2 Type II:** target for Scale tier (required by larger brand enterprise customers)
- **Meta Business Partner:** application required before public launch; interim option: white-label under existing MBP
- **Shopify Partner program:** enrollment required for App Store listing and to use Partner-level API access
- **OpenAI data usage:** use `no-training` API option to prevent brand conversation data being used in OpenAI training

---

*Prev: [07-pricing.md](./07-pricing.md) · Next: [09-roadmap.md](./09-roadmap.md)*
