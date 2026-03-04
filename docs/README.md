# SaaS Template

A production-ready SaaS starter built with Next.js, Supabase, Drizzle ORM, and Better Auth. Use it as a foundation for dashboards, B2B apps, or any product that needs auth, a database, and a polished UI.

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **UI** | shadcn/ui, Radix UI, Tailwind CSS 4 |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Auth** | Better Auth (sessions, email/password, OAuth) |
| **Email** | Resend (verification, transactional) |
| **Rate limiting** | Upstash Redis |
| **Forms** | React Hook Form, Zod |
| **State** | Zustand |
| **Env validation** | T3 Env (`@t3-oss/env-nextjs`) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Package manager** | pnpm |

## Features

- **Authentication** – Email/password, Google OAuth, email verification, session management
- **Database** – Type-safe Drizzle schema, migrations, Drizzle Studio
- **UI** – Dashboard layout, dark mode, accessible components
- **DX** – Server Actions over API routes, validated env, ESLint, Prettier

## Project Structure

```
saas-template/
├── web/                 # Next.js app (main application)
│   ├── src/
│   │   ├── app/         # App Router pages & layouts
│   │   ├── actions/     # Server Actions
│   │   ├── components/  # UI & shared components
│   │   ├── db/          # Drizzle schema & client
│   │   ├── lib/         # Auth, Supabase, utils
│   │   └── ...
│   ├── drizzle.config.ts
│   └── package.json
├── docs/                # AI guidelines, security
├── .github/workflows/   # CI/CD
└── README.md            # This file
```

## Quick Start

1. **Go to the web app**
   ```bash
   cd web
   ```

2. **Install and run**
   ```bash
   pnpm install
   cp .env.example .env.local   # then fill in your values
   pnpm db:push
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

For full setup (env vars, Supabase, Google OAuth, Better Auth), see **[web/README.md](web/README.md)**.

## Environment (overview)

You’ll need at least:

- `DATABASE_URL` – Supabase PostgreSQL connection string  
- `BETTER_AUTH_SECRET` – Random 32+ character secret  
- `RESEND_API_KEY` – For email verification  
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` – For rate limiting  
- Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for OAuth  

Details and optional vars are in [web/README.md#environment-variables](web/README.md#environment-variables).

## Documentation

- **[web/README.md](web/README.md)** – Setup, scripts, project structure, deployment  
- **[docs/AI_GUIDELINES.md](docs/AI_GUIDELINES.md)** – Architecture and patterns (Server Actions, data fetching)  
- **[docs/SECURITY.md](docs/SECURITY.md)** – Security practices  

## License

See [License.md](License.md).
