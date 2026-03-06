# AI Development Guidelines

This document contains architectural decisions and best practices for AI assistants (Claude Code, Cursor, etc.) working on this project.

## Table of Contents
- [API Routes vs Server Actions](#api-routes-vs-server-actions)
- [Event-Driven Architecture (Trigger.dev)](#event-driven-architecture-triggerdev)
- [Project Architecture](#project-architecture)
- [Code Style](#code-style)

---

## API Routes vs Server Actions

### ❌ When You DON'T Need API Endpoints

**1. Server-to-Database Operations**
- ✅ Use Server Actions for mutations
- ✅ Use direct data fetching in Server Components
- No need for an API route as middleman
- More efficient, less network overhead

**Example - WRONG:**
```typescript
// ❌ DON'T: Create API route for internal operations
// app/api/update-profile/route.ts
export async function POST(req: Request) {
  const session = await auth();
  const data = await req.json();
  await db.user.update({ where: { id: session.user.id }, data });
  return Response.json({ success: true });
}

// Client calls it
await fetch('/api/update-profile', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**Example - CORRECT:**
```typescript
// ✅ DO: Use Server Action
// actions/profile.ts
'use server'

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const data = Object.fromEntries(formData);
  await db.user.update({
    where: { id: session.user.id },
    data
  });

  revalidatePath('/dashboard/profile');
  return { success: true };
}

// Client component uses it directly
<form action={updateProfile}>
  <input name="name" />
  <button type="submit">Update</button>
</form>
```

**2. Data Fetching in Server Components**
```typescript
// ✅ DO: Direct data access in Server Component
// app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { posts: true }
  });

  return <div>{user.name}</div>;
}
```

### ✅ When You DO Need API Endpoints

**1. External Client Access**
- Mobile apps need to call your backend
- External services or integrations
- Public APIs for third parties

**2. Webhooks from External Services**
- Webhooks must return 200 quickly (e.g. Meta requires &lt; 1s). Do **not** do heavy work in the request.
- Verify signature, parse payload, then **trigger a Trigger.dev task** and return 200. Let the task do DB writes, AI calls, and external API calls.

```typescript
// ✅ CORRECT: Webhook verifies, enqueues to Trigger.dev, returns 200
// app/api/webhooks/meta/route.ts
import { tasks } from "@/trigger";

export async function POST(req: Request) {
  const signature = req.headers.get("x-hub-signature-256");
  if (!verifyMetaSignature(req.body, signature)) {
    return new Response("Invalid", { status: 401 });
  }
  const payload = await req.json();
  await tasks.trigger("inbox.process", { payload });
  return new Response("OK", { status: 200 });
}
```

**3. Cron Jobs / Scheduled Tasks**
- Prefer **Trigger.dev scheduled tasks** for recurring work (reorder checks, digest emails, cleanup). They run on Trigger.dev's schedule and don't consume Vercel function time.
- Use Vercel Cron HTTP endpoints only when you need a simple cron that calls an API route (e.g. to trigger a Trigger.dev task or run very fast logic).

```typescript
// ✅ CORRECT: Trigger.dev task with schedule (preferred for heavy or recurring work)
// trigger/inbox.ts
export const reorderCheck = task({
  id: "reorder-check",
  run: async (payload) => { /* ... */ },
});

// Or Vercel Cron that triggers a task / runs quick logic
// app/api/cron/cleanup/route.ts
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await tasks.trigger("cleanup.unverified", {});
  return Response.json({ success: true });
}
```

**4. Rate Limiting at Edge**
- When you need to rate limit BEFORE authentication
- Public endpoints that need protection at the edge

**5. Real-time / Streaming Endpoints**
- Server-Sent Events (SSE)
- WebSocket upgrades
- Streaming responses

### Summary Decision Tree

```
Need to perform an operation?
├─ Is it called by external service? → API Route
├─ Is it a webhook? → API Route (verify → trigger Trigger.dev task → return 200)
├─ Is it a cron/scheduled job? → Trigger.dev task (or Vercel Cron that triggers a task)
├─ Is it a form submission/mutation? → Server Action
├─ Is it data fetching for UI? → Direct in Server Component
└─ Is it client-side data fetching? → Consider Server Action or RSC
```

---

## Event-Driven Architecture (Trigger.dev)

Background and async work (webhook processing, reorders, AI drafting, follow-up sequences) runs on **Trigger.dev**, not inside Vercel serverless. This keeps webhooks fast and avoids timeouts.

### When to use Trigger.dev

- **Webhook payload processing** — After a webhook route returns 200, trigger a task to process the payload (DB writes, AI, external APIs).
- **Scheduled work** — Reorder checks, digest emails, cleanup. Define tasks with cron or interval in Trigger.dev.
- **User-triggered async work** — e.g. "generate catalog" or "bulk export" that can run in the background.

### Patterns

1. **Webhooks:** In the API route: verify → `tasks.trigger("task.id", { payload })` → return 200. Implement the actual logic in the Trigger.dev task.
2. **From Server Actions:** For long-running or fire-and-forget work, call `tasks.trigger(...)` from a Server Action; don't await the full job if the UI doesn't need to wait.
3. **Task definitions:** Keep task handlers in `trigger/` (or similar) and register them with the Trigger.dev SDK. Use the same DB, env, and types as the Next.js app.

### What not to do

- Don't run heavy work (OpenAI, multi-step flows, large DB writes) inside the webhook request.
- Don't use a separate worker container (e.g. BullMQ on Railway) for these jobs; Trigger.dev is the chosen event-driven layer.

---

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Auth**: Better Auth
- **Database**: PostgreSQL with Drizzle
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Deployment**: Vercel (single app)
- **Background jobs**: Trigger.dev (event-driven; no separate worker container)

### Folder Structure
```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth-related pages
│   │   ├── (marketing)/     # Public marketing pages
│   │   ├── dashboard/       # Protected dashboard
│   │   └── api/
│   │       ├── webhooks/    # External webhooks (Meta, Shopify, etc.) → trigger Trigger.dev
│   │       └── cron/        # Vercel Cron (optional; can trigger Trigger.dev tasks)
│   ├── actions/             # Server Actions (prefer this)
│   ├── components/
│   ├── lib/
│   │   ├── auth.ts          # Better Auth setup
│   │   ├── db.ts            # Drizzle client
│   │   ├── email.ts         # Email utilities
│   │   └── rate-limit.ts    # Rate limiting
│   ├── trigger/             # Trigger.dev task definitions (inbox, orders, reorders, etc.)
│   └── hooks/               # React hooks
```

### Best Practices

1. **Server Actions Over API Routes**
   - Use Server Actions for all form submissions and mutations
   - Only create API routes for external access, webhooks, or cron jobs

2. **Data Fetching**
   - Fetch data directly in Server Components
   - Use React Server Components (RSC) by default
   - Mark components as `'use client'` only when needed (interactivity, hooks, etc.)

3. **Webhooks and background work**
   - Webhook API routes: verify request, trigger a Trigger.dev task with the payload, return 200 immediately.
   - Put processing logic (DB, AI, external APIs) in Trigger.dev tasks, not in the webhook handler.

4. **Type Safety**
   - Use TypeScript strictly
   - Define Zod schemas for validation
   - Use Drizzle types for database operations

5. **Error Handling**
   - Use `try/catch` in Server Actions
   - Return structured error objects: `{ success: false, error: string }`
   - Use `redirect()` for navigation after mutations

6. **Rate Limiting**
   - Apply rate limiting to public endpoints
   - Use the `@/lib/rate-limit` utilities
   - Protect auth endpoints and public forms

---

## Code Style

### General
- Use TypeScript strictly
- Prefer `const` over `let`
- Use async/await over promises
- Use template literals for string interpolation

### React Components
```typescript
// ✅ Prefer Server Components by default
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Only use 'use client' when needed
'use client'

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Server Actions
```typescript
'use server'

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function updateUser(formData: FormData) {
  // 1. Authenticate
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate
  const result = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { success: false, error: result.error.message };
  }

  // 3. Execute
  try {
    await db.user.update({
      where: { id: session.user.id },
      data: result.data,
    });

    // 4. Revalidate & redirect
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update user' };
  }
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Server Actions**: camelCase with action suffix (e.g., `updateUserAction`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Files**: kebab-case for routes (e.g., `verify-email/page.tsx`)

---

## Environment Variables

Required environment variables are documented in `.env.example`. Always:
- Use `process.env.VARIABLE_NAME` with proper validation
- Use `@/env.ts` for centralized environment variable validation
- Never commit `.env` files to git
- Use Vercel environment variables for production

---

## Testing

(To be added as testing infrastructure is implemented)

---

## Additional Notes

- This file should be updated as architectural decisions are made
- All AI assistants working on this project should reference this file
- When in doubt, prefer simplicity over complexity
- Avoid over-engineering and premature abstractions
