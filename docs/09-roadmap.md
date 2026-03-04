# 9. Build Roadmap

---

## Phase 0 — Validation (Month 1–2)

**Goal:** Confirm willingness-to-pay and identify the 3 features that matter most before writing SaaS code.

### Actions
- [ ] Interview 20 founders currently running wholesale via IG DMs
- [ ] Confirm willingness-to-pay at $79–$199/mo
- [ ] Offer 5 brands a done-for-you setup at $500 each using existing Make.com + Airtable stack
- [ ] Gather feedback: which manual step hurts most? what would they pay to eliminate it?
- [ ] Apply for Meta Business Partner status (long lead time — start immediately)
- [ ] Register as Shopify Partner
- [ ] Select domain + brand name, begin legal entity setup

### Success criteria
- 5 paying done-for-you clients ($2,500 revenue)
- 3 clear feature priorities validated by multiple founders
- Meta MBP application submitted
- Founder committed to build

---

## Phase 1 — MVP (Month 3–5)

**Goal:** Thin, functional product that replaces the most painful 3 steps of the manual workflow.

### Features
- [ ] Instagram OAuth connection + webhook receiver
- [ ] Basic Buyer CRM with auto-record creation on DM reply
- [ ] Pipeline Kanban board (7 stages, drag cards)
- [ ] AI DM drafting (human-in-loop only, no auto-send)
- [ ] Shopify connect: product sync + one-click draft order creation
- [ ] Invoice DM dispatch (send Shopify checkout link via DM)
- [ ] Payment detection webhook → buyer stage update to Paid
- [ ] Basic analytics: pipeline funnel, GMV, avg order value
- [ ] Manual reorder timer with configurable days
- [ ] Template library (stage-specific DM templates)
- [ ] CSV export of buyer list

### Tech tasks
- [ ] Next.js app scaffolding + Supabase setup + RLS policies
- [ ] Meta webhook receiver + signature verification
- [ ] Shopify OAuth app installation flow
- [ ] BullMQ job queue setup
- [ ] OpenAI integration: intent classification + DM drafting
- [ ] Basic auth (email + password via Supabase Auth)

### Launch target
- 10 paying beta customers at $79/mo = **$790 MRR**
- Offer white-glove onboarding call for all beta users
- Weekly async check-ins with beta cohort for feedback

---

## Phase 2 — Growth Features (Month 6–9)

**Goal:** Build the features that drive retention and upgrade to Growth tier.

### Features
- [ ] Full AI auto-responder with confidence threshold and human handoff
- [ ] Automated reorder engine (multi-touch sequence, AI-drafted messages)
- [ ] Buyer qualification scoring (AI 1–10)
- [ ] Net terms tracking (Net 15/30/60) + overdue DM reminders
- [ ] Product card DM generation (in-thread image cards)
- [ ] WhatsApp Business API integration (unified inbox)
- [ ] Slack integration (alerts + weekly digest)
- [ ] Bulk buyer import via CSV
- [ ] Seasonal reorder override
- [ ] Order status DMs (shipped + delivered)
- [ ] Hot lead alerts
- [ ] AI performance analytics

### GTM actions during Phase 2
- [ ] Launch content marketing (IG account documenting wholesale automation)
- [ ] Post in Faire seller communities, Shopify wholesale forums
- [ ] Launch VA/rep affiliate program
- [ ] Begin Shopify App Store listing preparation

### Target at end of Phase 2
- 50 customers, 60% on Growth tier
- ~**$8,000 MRR**

---

## Phase 3 — Scale & Distribution (Month 10–14)

**Goal:** Add enterprise features, open new acquisition channels, build moat.

### Features
- [ ] Brand voice AI training (per-tenant fine-tuning on approved messages)
- [ ] Competitor carry detection
- [ ] Territory map + geographic reporting
- [ ] Reorder one-click confirmation ('yes' → auto-draft order)
- [ ] Faire Direct buyer import
- [ ] Agency dashboard + multi-brand switcher
- [ ] White-label catalog option
- [ ] Multi-currency invoicing (Shopify Markets)
- [ ] Shopify App Store public listing
- [ ] Cohort retention analysis
- [ ] Custom domain for buyer catalog pages
- [ ] Zapier / Make webhook output

### Target at end of Phase 3
- 200 customers, healthy mix across tiers
- ~**$30,000 MRR** (~$360K ARR)

---

## MRR Growth Targets

| Milestone | Month | Customers | Blended ARPU | MRR |
|-----------|-------|-----------|--------------|-----|
| MVP launch | 5 | 10 | $79 | $790 |
| Phase 2 mid | 7 | 25 | $150 | $3,750 |
| Phase 2 end | 9 | 50 | $160 | $8,000 |
| Phase 3 mid | 12 | 120 | $170 | $20,400 |
| Phase 3 end | 14 | 200 | $175 | $35,000 |
| 18 months | 18 | 500 | $175 | $87,500 |

---

## Build Decisions for Cursor

### Suggested project structure

```
swipe/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Login, signup
│   │   │   ├── (dashboard)/    # Main app (pipeline, inbox, CRM, analytics)
│   │   │   └── api/            # Route handlers
│   │   └── components/         # UI components
│   └── workers/                # BullMQ job processors
│       ├── inbox-processor.ts  # Handle incoming DMs
│       ├── order-processor.ts  # Handle Shopify events
│       ├── ai-worker.ts        # AI drafting queue
│       └── reorder-worker.ts   # Reorder timer jobs
├── packages/
│   ├── db/                     # Prisma schema + migrations
│   ├── meta-api/               # Meta Graph API client
│   ├── shopify-api/            # Shopify API client
│   └── ai/                     # OpenAI integration + prompts
└── infrastructure/
    └── webhooks/               # Webhook receivers
```

### Priority order for MVP build
1. `packages/db` — schema first, get data model right
2. `packages/meta-api` — webhook receiver, DM send/receive
3. `packages/shopify-api` — product sync, draft order creation
4. `apps/workers/inbox-processor` — core loop
5. `packages/ai` — intent classification + drafting
6. `apps/web` — UI last, once data flows are working

---

*Prev: [08-technical-architecture.md](./08-technical-architecture.md) · Next: [10-go-to-market.md](./10-go-to-market.md)*
