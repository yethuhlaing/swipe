# SaaS Template

A modern SaaS template built with Next.js, Supabase, Drizzle ORM, and Better Auth.

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Icons**: Lucide React

## Features

✅ **Authentication System**
- Email & Password authentication
- Google OAuth integration
- Session management
- Protected routes

✅ **Database & ORM**
- PostgreSQL via Supabase
- Type-safe queries with Drizzle ORM
- Auto-generated TypeScript types
- Migration support

✅ **UI Components**
- Pre-built dashboard layouts
- Responsive design
- Dark mode support
- Accessible components (Radix UI)

✅ **Developer Experience**
- TypeScript for type safety
- ESLint & Prettier for code quality
- Hot module replacement
- Database GUI with Drizzle Studio

## Quick Start

### 1. Install Dependencies

```bash
cd web
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Client (optional, for direct Supabase usage)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Better Auth
BETTER_AUTH_SECRET=generate_a_random_32_char_string
```

### 3. Set Up Database

Push the schema to your Supabase database:

```bash
pnpm db:push
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

- **[Authentication Setup](AUTH_SETUP.md)** - Complete guide for setting up Better Auth with Google OAuth
- **[Drizzle ORM Setup](DRIZZLE_SETUP.md)** - Database setup, queries, and migrations
- **[Auth Fixes](AUTH_FIXES.md)** - Technical details about auth configuration

## Available Scripts

### Development
```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
```

### Database
```bash
pnpm db:push      # Push schema to database (development)
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio GUI
```

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (signin, signup)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Better Auth API
│   │   └── layout.tsx         # Root layout
│   ├── components/            # UI components
│   │   └── ui/               # shadcn/ui components
│   ├── db/                   # Database
│   │   ├── index.ts          # Drizzle client
│   │   ├── schema.ts         # Database schema
│   │   └── queries.example.ts # Query examples
│   ├── lib/                  # Utilities
│   │   ├── auth.ts          # Better Auth config
│   │   ├── auth-client.ts   # Auth client hooks
│   │   └── supabase.ts      # Supabase client
│   └── hooks/               # Custom React hooks
├── drizzle.config.ts        # Drizzle Kit config
├── tailwind.config.ts       # Tailwind CSS config
└── next.config.ts           # Next.js config
```

## Key Integrations

### Better Auth
Better Auth handles all authentication flows:
- Server-side auth in `src/lib/auth.ts`
- Client-side hooks in `src/lib/auth-client.ts`
- API routes at `/api/auth/*`

Usage:
```typescript
import { useSession } from '@/lib/auth-client'

export function Profile() {
    const { data: session } = useSession()
    return <div>Welcome, {session?.user?.name}</div>
}
```

### Drizzle ORM
Type-safe database queries:

```typescript
import { db } from '@/db'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Select user
const users = await db.select().from(user).where(eq(user.email, 'test@example.com'))

// Insert user
await db.insert(user).values({ id: '123', email: 'new@example.com' })
```

See [src/db/queries.example.ts](src/db/queries.example.ts) for more examples.

### Supabase
Direct Supabase client for advanced features:

```typescript
import { supabase } from '@/lib/supabase'

// Storage
await supabase.storage.from('avatars').upload('path', file)

// Realtime
supabase.channel('changes').on('postgres_changes', ...)
```

## Authentication Flow

1. **Sign Up**: User creates account with email/password or Google OAuth
2. **Email Verification**: Email verification tokens stored in database
3. **Sign In**: User logs in, session created in database
4. **Session Management**: Better Auth manages session tokens
5. **Protected Routes**: Middleware checks session validity

## Database Schema

The project includes these tables:
- `user` - User accounts
- `session` - Active user sessions
- `account` - OAuth provider accounts
- `verification` - Email verification tokens

Add your own tables in `src/db/schema.ts` and run `pnpm db:push`.

## Environment Variables

Required variables:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `BETTER_AUTH_SECRET` - Random 32+ character string

Optional:
- `NEXT_PUBLIC_APP_URL` - Your app URL (defaults to localhost:3000)
- `NEXT_PUBLIC_SUPABASE_URL` - For direct Supabase client usage
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For direct Supabase client usage

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

1. Build: `pnpm build`
2. Start: `pnpm start`
3. Ensure `DATABASE_URL` and other env vars are set

## Common Tasks

### Add a New Table

1. Define schema in `src/db/schema.ts`:
```typescript
export const posts = pgTable('posts', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
})
```

2. Push to database:
```bash
pnpm db:push
```

### Add OAuth Provider

Update `src/lib/auth.ts`:
```typescript
socialProviders: {
    google: { ... },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
}
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active (not paused)
- **Use the direct connection** (port **5432**), not the transaction pooler (port 6543). In Supabase: Project Settings → Database → Connection string → **URI** (Session mode, port 5432)
- If you see **`PostgresError: Tenant or user not found`** (code `XX000`) when signing in (e.g. Google OAuth or verification):
  - Confirm `DATABASE_URL` uses the **direct** connection string (host `db.[PROJECT-REF].supabase.co`, port **5432**)
  - Re-copy the connection string from Supabase and ensure the password has no typos or unencoded special characters
  - If the password contains special characters, URL-encode them in `DATABASE_URL`

### Authentication Issues
- Clear browser cookies
- Check `BETTER_AUTH_SECRET` is set
- Verify Google OAuth redirect URIs

### Build Errors
- Delete `.next` folder
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Support

For detailed guides, see:
- [AUTH_SETUP.md](AUTH_SETUP.md)
- [DRIZZLE_SETUP.md](DRIZZLE_SETUP.md)

## License

See [License.md](../License.md)
