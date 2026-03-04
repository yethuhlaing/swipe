# 5. Feature Specifications

All features listed by module. Tier tags:
- `[All]` — Starter, Growth, and Scale
- `[Growth]` — Growth and Scale only
- `[Scale]` — Scale tier only

---

## 5.1 Buyer CRM

The central database of all retailer relationships. Auto-populated from DM activity, enriched by AI, and queryable.

| Feature | Tier | Notes |
|---------|------|-------|
| Auto-create buyer record on first DM reply | `[All]` | Triggered by any inbound reply to brand's IG |
| AI-enrichment: scrape IG profile for store type, location, follower count | `[All]` | Uses public IG profile data |
| Manual buyer fields: store name, email, phone, website, MOQ notes | `[All]` | Free-form fields, exportable |
| Buyer scoring: AI-generated 1–10 quality score based on profile signals | `[Growth]` | See §5.6 for scoring logic |
| Buyer tags: segment by product category interest, geography, tier | `[All]` | Multi-tag support |
| Full DM thread history synced and searchable in CRM record | `[All]` | Indexed for keyword search |
| Order history: all past orders, invoice amounts, payment dates per buyer | `[All]` | Pulled from Shopify |
| Notes + internal memos per buyer record (team-visible) | `[All]` | Markdown supported |
| CSV export of full buyer database at any time | `[All]` | GDPR compliance |
| Bulk import: upload existing buyer list via CSV to pre-populate CRM | `[Growth]` | Maps to standard field schema |
| Duplicate detection: flag buyers who DM from multiple accounts | `[Growth]` | Email or store name matching |
| Buyer merge: combine duplicate records | `[Growth]` | |

---

## 5.2 AI Inbox & DM Automation

Connects to Instagram's official Graph API and WhatsApp Business API. All automation runs through official channels — no scraping, no account risk.

| Feature | Tier | Notes |
|---------|------|-------|
| Unified inbox: IG DM + WhatsApp threads in single view | `[Growth]` | Starter: IG only |
| Intent classification: detect wholesale inquiry vs. general message | `[All]` | GPT-4o with structured output |
| AI draft reply: generate contextually appropriate response for brand to approve/edit/send | `[All]` | Always human-in-loop on Starter |
| One-click send: approve AI draft and send with single click | `[All]` | |
| Auto-responder: fully automated responses for predefined intents (e.g., MOQ questions) | `[Growth]` | Requires confidence > threshold |
| Human handoff: low-confidence classifications flagged and routed to human via Slack/email | `[All]` | Confidence threshold configurable |
| Confidence threshold setting: brand sets % confidence floor before auto-send | `[Growth]` | Default: 75% |
| Info extraction: auto-pull name, store name, location from DM conversation | `[All]` | Populates CRM record |
| Template library: brand-voice DM templates for each pipeline stage | `[All]` | Editable per brand |
| Conversation snooze: pause automation on a thread for manual handling | `[All]` | Duration: 24h / 7 days / indefinite |
| Brand voice training: AI learns from brand's past approved messages | `[Scale]` | Per-tenant fine-tuning |
| Read receipts: detect when buyer has read a sent DM | `[All]` | Via Meta Graph API where supported |
| Bulk DM: send templated message to segment of buyers (e.g., new collection drop) | `[Growth]` | Rate-limited to Meta API limits |

---

## 5.3 Digital Catalog & Product Card Engine

Replaces Brandboom dependency. Product cards sent directly inside DM — no external link required for initial discovery.

| Feature | Tier | Notes |
|---------|------|-------|
| Shopify product sync: real-time inventory, price, and variant sync | `[All]` | Webhook-based, < 60s lag |
| Wholesale price tiers: set custom multipliers per buyer tier (e.g., Tier 1 = 50% MSRP) | `[All]` | Up to 3 tiers on Starter, unlimited on Growth+ |
| Digital lookbook: shareable, branded catalog page with linklist + MOQ info | `[All]` | Hosted on SWIPE subdomain or custom domain |
| Product card DM: auto-generated image card with product photo, price, MOQ sent in-thread | `[Growth]` | Canvas-rendered image sent via IG API |
| Starter pack builder: curated assortment builder based on buyer profile / store type | `[Growth]` | Drag-and-drop product selection tool |
| AI recommendation: suggest 3–5 products based on buyer store signals | `[Growth]` | Requires buyer store type data |
| Link tracking: track catalog link opens and time-on-page per buyer | `[All]` | Branded short link with UTM |
| Password-protected catalog: gated access for approved buyers only | `[Scale]` | Per-buyer access token |
| Catalog version history: maintain multiple catalog versions (seasonal collections) | `[Growth]` | Archive past collections |
| Out-of-stock handling: auto-hide OOS products from catalog, alert brand | `[All]` | Synced from Shopify inventory |

---

## 5.4 Order Management & Invoicing

Full Shopify draft order creation and invoice dispatch from within SWIPE. Supports net terms, not just upfront payment.

| Feature | Tier | Notes |
|---------|------|-------|
| One-click draft order: create Shopify draft order from DM conversation context | `[All]` | Pre-fills products from conversation |
| Auto-apply wholesale pricing tier to draft order | `[All]` | Based on buyer's tier tag |
| Invoice DM: send invoice link directly via DM thread | `[All]` | Shopify-hosted checkout link |
| Net terms support: set Net 15/30/60 terms per buyer, track due dates | `[Growth]` | Manual net terms tracking; no lending |
| Overdue alerts: automated reminder DMs for unpaid net-terms invoices | `[Growth]` | Configurable cadence |
| Payment detection: Shopify webhook confirms payment, triggers thank-you DM | `[All]` | < 30s lag via webhook |
| Order status DMs: auto-notify buyer at shipped and delivered milestones | `[Growth]` | Requires Shopify fulfillment data |
| MOQ enforcement: warning if order is below brand's minimum | `[All]` | Soft warning — brand can override |
| Multi-currency support: invoice in buyer's local currency | `[Scale]` | Via Shopify Markets |
| Order editing: modify draft order from within SWIPE before sending | `[All]` | |
| Partial payment tracking: log deposit + balance for net-terms orders | `[Scale]` | |

---

## 5.5 Reorder Engine

The highest-ROI module: automated reorder outreach timed to each buyer's purchase cycle.

| Feature | Tier | Notes |
|---------|------|-------|
| Per-buyer reorder timer: set 30/45/60/90 day cycle individually or globally | `[All]` | Global default + per-buyer override |
| AI reorder message: draft personalized DM referencing prior order items and quantities | `[Growth]` | Uses order history from CRM |
| Reorder sequence: multi-touch cadence (DM → 7-day follow-up → final nudge) | `[Growth]` | Configurable number of touches |
| Reorder one-click: buyer confirms reorder via single DM reply ('yes') → auto-create draft order | `[Scale]` | Requires structured intent detection |
| Seasonal override: suppress/trigger reorders around brand's collection drops | `[Growth]` | Calendar-based scheduling |
| Reorder rate tracking: per-buyer and aggregate reorder conversion metrics | `[All]` | Core analytics metric |
| Pause reorder: manually pause timer for a buyer (e.g., they're on hold) | `[All]` | |
| Reorder history: log all reorder attempts and outcomes per buyer | `[All]` | |

---

## 5.6 Buyer Qualification Engine

Prioritize time on buyers most likely to convert and stick.

| Feature | Tier | Notes |
|---------|------|-------|
| AI buyer score (1–10): based on IG engagement rate, follower count, store type signals | `[Growth]` | Recalculated on profile changes |
| Store type detection: classify boutique, department store, online-only, marketplace seller | `[Growth]` | Used in product recommendations |
| Geo-tagging: auto-detect buyer location from profile for territory management | `[All]` | Country + city level |
| Competitor carry flag: detect if buyer's IG shows competing brand product tags | `[Scale]` | Heuristic — not guaranteed |
| Lead score decay: score drops if buyer is unresponsive for 30+ days | `[Scale]` | Configurable decay rate |
| Hot lead alerts: notify brand when high-score buyer enters pipeline | `[Growth]` | Push notification + Slack |
| Disqualify action: mark buyer as not a fit, remove from pipeline, retain in CRM | `[All]` | |

### Buyer Scoring Signals (Growth tier)

| Signal | Weight |
|--------|--------|
| IG follower count (boutique range: 1K–50K) | 20% |
| IG engagement rate (> 2% = positive signal) | 25% |
| Profile mentions physical store location | 15% |
| Bio includes "boutique", "shop", "store" keywords | 15% |
| History of tagging wholesale brands in posts | 15% |
| Response speed to initial DM | 10% |

---

## 5.7 Analytics Dashboard

Founder-level insights into wholesale pipeline performance.

| Feature | Tier | Notes |
|---------|------|-------|
| Pipeline funnel: conversion rate at each of 7 stages, with drop-off alerts | `[All]` | |
| Revenue dashboard: GMV, avg order value, reorder revenue vs. new buyer revenue | `[All]` | |
| Buyer lifecycle: new vs. active vs. churned buyer counts over time | `[All]` | |
| Response time metrics: avg time-to-reply across team, per stage | `[Growth]` | |
| Reorder rate: % of paid buyers who reordered, by cohort | `[All]` | |
| AI performance: % of AI drafts approved vs. edited vs. rejected | `[Growth]` | For brand voice calibration |
| Territory map: geographic distribution of active buyers | `[Scale]` | |
| Custom date ranges and CSV export for all reports | `[All]` | |
| Weekly digest email: auto-send pipeline summary every Monday | `[All]` | Opt-in |
| Cohort analysis: track buyer retention by acquisition month | `[Scale]` | |

---

*Prev: [04-pipeline.md](./04-pipeline.md) · Next: [06-integrations.md](./06-integrations.md)*
