# 4. Core Pipeline: The 7-Stage Wholesale Funnel

SWIPE structures every buyer relationship through a defined pipeline. Each stage has automated triggers, AI-assisted actions, and clear exit criteria. Brands can rename stages and configure triggers per their own workflow.

---

## Pipeline Overview

```
[1. Cold Outreach] → [2. Interested] → [3. Needs Recommendation] → [4. Catalog Sent]
                                                                          ↓
                                          [7. Reorder] ← [6. Paid] ← [5. Draft Order Sent]
```

---

## Stage Definitions

### Stage 1 — Cold Outreach
- **Description:** Brand sends first DM (manually or via VA). SWIPE logs the contact in CRM automatically when a reply is received.
- **Action type:** Manual initiation → Auto-capture on reply
- **Automated action:** Create buyer record, tag with `new-lead`, timestamp first contact
- **Exit criteria:** Buyer replies with any message

---

### Stage 2 — Interested
- **Description:** Buyer replies positively. SWIPE's AI classifies intent as wholesale interest, auto-sends digital catalog link, and moves buyer to this stage.
- **Action type:** AI trigger
- **Automated action:** Intent classification → catalog link DM dispatch → stage update
- **Exit criteria:** Buyer asks for recommendation OR requests a specific product/order

> **AI confidence note:** If classification confidence < threshold (default 75%), the message is flagged for human review before any action is taken.

---

### Stage 3 — Needs Recommendation
- **Description:** Buyer asks for product guidance (e.g., "what should I start with for my store?"). AI recommendation engine suggests a starter pack based on detected store type and prior conversation context.
- **Action type:** AI assist — human approves before sending
- **Automated action:** Generate 3–5 product recommendation with pricing + MOQ → present to brand for approval
- **Exit criteria:** Buyer selects products or requests a draft order

---

### Stage 4 — Catalog Sent
- **Description:** Digital lookbook or product card sent. SWIPE tracks whether the catalog link was opened via branded short link.
- **Action type:** Auto-track
- **Automated action:** Link-open webhook triggers status update; if no open after 48 hrs → schedule follow-up nudge
- **Exit criteria:** Buyer confirms interest in specific products

---

### Stage 5 — Draft Order Sent
- **Description:** Shopify draft order created automatically from buyer's product selection. Invoice link dispatched via DM.
- **Action type:** Automated
- **Automated action:** Create draft order with buyer's wholesale price tier applied → send invoice link via DM → log order in buyer CRM record
- **Exit criteria:** Payment confirmed via Shopify webhook

---

### Stage 6 — Paid
- **Description:** Payment received. Thank-you DM sent automatically. Buyer tagged as `active-retailer`. Reorder timer started.
- **Action type:** Automated (webhook-triggered)
- **Automated action:** Payment webhook → thank-you DM → buyer tag update → reorder timer starts
- **Exit criteria:** Reorder timer fires (30–90 days, configurable per buyer)

---

### Stage 7 — Reorder
- **Description:** Automated reorder outreach sent, personalized to prior order context. Multi-touch sequence if no response.
- **Action type:** AI + Automated
- **Automated action:** AI drafts DM referencing prior order items and quantities → send at configured interval → 7-day follow-up if no reply → final nudge at day 14
- **Exit criteria:** Buyer places reorder (loops back to Stage 5) OR buyer marked as churned after no response

---

## Pipeline Configuration Options

| Setting | Default | Configurable? |
|---------|---------|---------------|
| Stage names | Predefined 7 above | Yes — rename any stage |
| AI confidence threshold | 75% | Yes — per stage |
| Catalog link follow-up delay | 48 hours | Yes |
| Reorder timer | 45 days | Yes — per buyer or globally |
| Reorder sequence length | 3 touches | Yes |
| Auto-send vs. human-in-loop | Human-in-loop | Yes — per stage, per tier |

---

## Kanban Board View

Each buyer appears as a card on the pipeline Kanban. Cards show:
- Buyer name + store name
- Last activity timestamp
- Buyer score (Growth tier)
- Days in current stage
- Outstanding invoice amount (if applicable)
- Quick actions: Send DM · Create Order · View History

---

*Prev: [03-target-customer.md](./03-target-customer.md) · Next: [05-features.md](./05-features.md)*
