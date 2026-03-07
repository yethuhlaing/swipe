# Code Infrastructure & Data Flow

This document describes how application code is layered and how data and control flow between UI, actions, services, and the database.

---

## Layer Overview

| Layer | Path | Role |
|-------|------|------|
| **DTOs** | `web/src/dto/` | Boundary types used at API/service edges (e.g. `BuyerWithStage`, `RevenueTrendDatum`). Not all types are DTOs; schema types live in `db/schema`. |
| **Data** | `web/src/data/` | Pure data access: single-purpose queries and simple writes. No business logic or orchestration. |
| **Services** | `web/src/services/` | Business logic and orchestration. Call data layer and external APIs; used by actions and Trigger.dev tasks. |
| **Actions** | `web/src/actions/` | Server Actions and callable entry points. Validate input, call services (or data for simple reads), return results. |
| **Schema** | `web/src/db/schema/` | Drizzle table definitions and DB types. Used by `data` and by `db` client. |

**Other paths:**

- `web/src/lib/` — Auth, session, rate-limit, shared utilities (no single “lib” barrel).
- `web/src/db/` — Drizzle client and schema re-exports; used by `data` and `lib/auth`.
- `web/src/trigger/tasks/` — Trigger.dev task definitions; they import from `data`, `services`, and `dto` as needed.

**Note:** `web/src/services/` holds both **business services** (e.g. `buyer.service`, `tenant.service`) and **feature services** (e.g. `intent.service` for AI). Both are used by actions or Trigger tasks; only the business services sit strictly in the “actions → services → data” chain.

---

## Request Flow

### Reads (e.g. Server Components, RSC)

- **Pages / Server Components** → call **data** (and optionally **db/schema** for types) for reads.
- Example: CRM page calls `listPipelineStages`, `listBuyers` from `@/data/...` and uses types from `@/dto` or `@/db/schema`.

### Mutations (user actions, forms)

- **Client** → **Server Action** (in `actions/`) → **Service** (in `services/`) → **Data** (in `data/`).
- Actions validate and delegate; services contain business rules and orchestration; data performs DB operations.
- Example: Moving a buyer on the pipeline: `moveBuyerToStageAction` → `moveBuyerToStage` (buyer.service) → data layer (`closeBuyerStageHistory`, `insertBuyerStageHistory`, etc.).

### Background jobs (Trigger.dev)

- **Trigger tasks** import **data**, **services**, and **dto** as needed. They behave like “server-side callers” and may call services or data directly.

---

## Import rules (no single-entry barrel)

**Single-entry barrels are forbidden.** Do not add or use a top-level barrel (e.g. `web/src/index.ts`) that re-exports dto, data, and services.

**Use direct imports** from the concrete module:

- DTOs: `import type { BuyerWithStage } from "@/dto/buyer"`, `import type { RevenueTrendDatum } from "@/dto/analytics"`.
- Data: `import { listBuyers } from "@/data/buyers"`, `import { getTenantById } from "@/data/tenants"`.
- Services: `import { moveBuyerToStage } from "@/services/buyer.service"`, `import { createTenant } from "@/services/tenant.service"`.

You may use the layer folder with index (e.g. `@/dto`, `@/data`, `@/services`) only when importing from multiple modules in that layer in the same file; prefer one import per module for clarity and tree-shaking.

---

## DTOs vs Other Types

- **DTOs** live in `dto/` and are used at boundaries: action ↔ service, service ↔ data, or API response shapes. Examples: `BuyerWithStage`, `BuyerListParams`, `RevenueTrendDatum`, `AiDraftMetrics`.
- **Schema types** (`Tenant`, `Buyer`, `PipelineStage`, etc.) come from `db/schema` and represent DB rows; they are used inside the data layer and when mapping to DTOs.
- Not every type in the codebase is a DTO; only those used as boundary contracts are in `dto/`.

---

## Summary Diagram

```
                    ┌─────────────────────────────────────────┐
                    │  Server Components / Pages / Client      │
                    └──────────────────┬──────────────────────┘
                                       │
         Reads                         │                        Mutations
         ─────                         │                        ─────────
              ┌────────────────────────┼────────────────────────┐
              │                        │                         │
              ▼                        ▼                         ▼
     ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
     │  data/         │      │  actions/      │      │  services/     │
     │  (pure DB)     │◄─────│  (entry)       │─────►│  (business     │
     └────────┬───────┘      └────────────────┘      │   logic)       │
              │                                       └────────┬───────┘
              │                                                │
              │  dto/ (types at boundaries)                     │
              │  db/schema (table types)                       │
              ▼                                                ▼
     ┌────────────────────────────────────────────────────────────────┐
     │  db (Drizzle client) + PostgreSQL (Supabase)                   │
     └────────────────────────────────────────────────────────────────┘
```

*Prev: [08-technical-architecture.md](./08-technical-architecture.md)*
