# SWIPE — Wholesale Sales OS for Instagram-First Brands

**The wholesale CRM built for brands who close deals via Instagram DM** — automating everything from first reply to paid invoice to reorder, without Faire's 15–25% commission or the complexity of enterprise B2B tools.

---

## The Problem

Thousands of small apparel, beauty, and CPG brands run their entire wholesale operation through Instagram DMs. Founders and VAs manually message boutique buyers, share catalog links, follow up over days, build draft orders in Shopify, chase payment, and try to remember reorder follow-ups weeks later. Every step is ad-hoc, undocumented, and doesn't scale.

- **No CRM** — buyer conversations live in DM threads, unsearchable and untracked  
- **Manual invoicing** — draft orders built from scratch per buyer, 20–40 minutes each  
- **No follow-up system** — reorder reminders forgotten or inconsistent  
- **Expensive alternatives** — Faire charges 15–25% and owns your buyer relationships  
- **Complex alternatives** — Shopify B2B requires Plus ($2,000+/mo) and full migration  

---

## What SWIPE Does

| Layer | Description |
|-------|-------------|
| **Wholesale CRM** | Structured buyer database auto-populated from DM activity |
| **AI Inbox** | Unified IG DM + WhatsApp inbox with AI-drafted replies |
| **Pipeline Manager** | 7-stage Kanban tracking every buyer relationship |
| **Order Automation** | One-click Shopify draft order creation and invoice dispatch |
| **Reorder Engine** | Automated reorder outreach timed to each buyer's purchase cycle |
| **Analytics** | Revenue, funnel, and buyer lifecycle reporting |

**Positioning:** SWIPE is to Instagram wholesale what Pipedrive is to B2B sales — a purpose-built pipeline tool that fits the workflow you already use.

---

## Who It's For

- **Independent brand founders** in apparel, beauty, home goods, CPG — $50K–$2M wholesale revenue, 10–200 active buyers, currently using Instagram DMs + Shopify + spreadsheets  
- **Wholesale reps / VAs** managing wholesale for multiple brands — Agency tier with per-brand dashboards  

**Not for:** Enterprise sales teams (use HubSpot + Shopify Plus), brands with no direct outreach (use Faire), or brands with fewer than ~10 wholesale buyers.

---

## Why SWIPE

- **Instagram-native** — buyers stay on the platform they already use  
- **Zero commission** — flat SaaS fee; you keep 100% of order value  
- **You own the data** — full export of buyers, orders, and conversations anytime  
- **Human-in-the-loop** — AI assists; you stay in control of high-value decisions  
- **WhatsApp parity** — same pipeline across IG DM and WhatsApp Business  

---

## Pricing (Overview)

| Tier | Price | Best for |
|------|--------|----------|
| **Starter** | $79/mo | 10–50 active buyers, getting started |
| **Growth** | $199/mo | 50–200 buyers, $100K–$1M wholesale |
| **Scale** | $499/mo | 200+ buyers, advanced automation |
| **Agency** | $299/mo per brand | Reps/VAs managing multiple brands |

No commission on orders. No per-seat fees at Starter and Growth. Full details in [docs/07-pricing.md](docs/07-pricing.md).

---

## Tech Stack

Next.js · PostgreSQL (Supabase) · Redis · Better Auth · shadcn/ui · Drizzle ORM  

See [web/README.md](web/README.md) for setup and development.

---

## Documentation

| Resource | Description |
|----------|-------------|
| [docs/](docs/) | Product spec: problem, features, pipeline, integrations, pricing, roadmap |
| [web/README.md](web/README.md) | Developer setup, env vars, scripts, deployment |
| [License.md](License.md) | License terms |

---

## Quick Start (Developers)

```bash
cd web
pnpm install
cp .env.example .env.local   # then fill in your values
pnpm db:push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). For full environment and auth setup, see [web/README.md](web/README.md).

---

## License

See [License.md](License.md).
