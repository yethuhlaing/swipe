# 6. Integrations

---

## Integration Stack

| Integration | Purpose | Required? | Tier |
|-------------|---------|-----------|------|
| **Instagram Graph API** | DM send/receive, profile data, story replies — official Meta partnership | Yes | All |
| **WhatsApp Business API** | Parallel pipeline for buyers who prefer WhatsApp | No | Growth+ |
| **Shopify** | Product sync, draft order creation, payment webhooks, order status | Yes | All |
| **Shopify B2B (Plus)** | Net terms, company accounts, custom price lists | No | Scale |
| **Stripe** | Native payment link as fallback for non-Shopify invoicing | No | Growth+ |
| **Gmail / Outlook** | Email fallback for buyers who share an email address | No | All |
| **Slack** | Human handoff alerts, daily pipeline summary digest | No | All |
| **Klaviyo** | Sync active buyer list as Klaviyo segment for email flows | No | Growth+ |
| **Zapier / Make** | Webhook out for custom integrations (power users) | No | Growth+ |
| **Faire Direct API** | Import existing Faire buyer relationships into SWIPE CRM | No | Scale |

---

## Meta / Instagram Integration Details

> ⚠️ **Critical dependency:** SWIPE requires Meta Business Partner status (or a white-label arrangement with an existing MBP) to send DMs at volume through the official API. This is the single most important pre-launch task.

### What we use
- **Instagram Messaging API** (part of Graph API v18+): send/receive DMs on behalf of Business accounts
- **Webhooks:** real-time push of new messages, message reads, message reactions
- **Instagram Basic Display API:** profile data enrichment (public fields only)
- **Instagram Business Account requirement:** SWIPE only works with IG Business or Creator accounts linked to a Facebook Page

### Rate limits to design around
- Instagram API message send limits are per-account and vary based on MBP tier
- All outbound messages must be in response to user-initiated conversations (within 24h window) or use approved Message Templates for re-engagement
- Reorder messages (Stage 7) that fire 30–90 days after last interaction must use approved Message Templates

### WhatsApp Business API
- Separate Meta product, same developer dashboard
- Message Templates required for all outbound messages outside 24h conversation window
- Templates must be pre-approved by Meta (1–3 day review typical)
- Enables true async wholesale outreach for international buyers

---

## Shopify Integration Details

### Connection method
- Shopify Partner app (private or public app listing)
- OAuth 2.0 installation flow — brand installs SWIPE from Shopify Admin
- Required scopes: `read_products`, `write_draft_orders`, `read_orders`, `write_orders`, `read_inventory`

### Data synced
| Data | Direction | Frequency |
|------|-----------|-----------|
| Products + variants + inventory | Shopify → SWIPE | Real-time webhook |
| Product images | Shopify → SWIPE | On sync |
| Wholesale price tiers | SWIPE → Shopify (metafields) | On change |
| Draft order creation | SWIPE → Shopify | On-demand |
| Order payment status | Shopify → SWIPE | Real-time webhook |
| Fulfillment / tracking | Shopify → SWIPE | Real-time webhook |
| Customer records | Shopify ↔ SWIPE | Bidirectional sync |

### Shopify B2B (Scale tier)
- Requires Shopify Plus ($2,000+/mo on Shopify side)
- Enables: company accounts, net payment terms natively in Shopify, custom price lists per company
- SWIPE acts as the IG-native frontend that creates/manages Shopify B2B company accounts

---

## Webhook Architecture

```
Meta Webhook → SWIPE Webhook Receiver → Queue (BullMQ) → Processing Worker
                                                              ↓
                                              AI Classification (OpenAI)
                                                              ↓
                                              CRM Update + Action Trigger
                                                              ↓
                                              Outbound DM (if auto-send enabled)

Shopify Webhook → SWIPE Webhook Receiver → Payment/Order Worker
                                                ↓
                                          CRM Status Update
                                                ↓
                                          Thank-you DM / Reorder Timer Start
```

---

## Future Integration Candidates (Post-v1)

- **WooCommerce** — opens non-Shopify market; 6–9 months post-launch
- **TikTok Shop API** — emerging wholesale channel for Gen Z brands
- **QuickBooks / Xero** — accounting sync for brands with bookkeepers
- **Notion / Google Sheets** — lightweight CRM export for brands already using these

---

*Prev: [05-features.md](./05-features.md) · Next: [07-pricing.md](./07-pricing.md)*
