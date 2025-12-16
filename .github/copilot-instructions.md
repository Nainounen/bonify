# Bonify - AI Agent Instructions

## Architecture Overview

**Tech Stack**: Next.js 16 (App Router) + React 19 + Supabase + shadcn/ui + Tailwind CSS v4

**Core Pattern**: Server Actions + Server Components with minimal client-side interactivity
- Server Components handle all data fetching and auth checks
- Client components (`'use client'`) only for interactivity (forms, animations)
- All mutations use Server Actions (`'use server'` functions)

**Data Flow**: 
1. User → Client Component → Server Action → Supabase → Revalidate → Server Component
2. Example: [`CounterButton`](components/counter-button.tsx) → [`logSale()`](app/dashboard/actions.ts) → Supabase insert → `revalidatePath('/dashboard')` → [`DashboardPage`](app/dashboard/page.tsx) re-renders

## Supabase Integration Patterns

### Client Creation (CRITICAL)
- **Server Components**: Use `createClient()` from [`lib/supabase/server.ts`](lib/supabase/server.ts) (async, cookie-based)
- **Client Components**: Use `createClient()` from [`lib/supabase/client.ts`](lib/supabase/client.ts) (browser client)
- **Never** import the wrong client type - TypeScript will error on await

### Authentication Flow
- Auth state managed by Supabase SSR cookies
- Protected routes: Check `await supabase.auth.getUser()` in Server Components
- Redirect to `/login` if no user (see [`dashboard/page.tsx`](app/dashboard/page.tsx#L14-L18))
- Auto-create employee record via database trigger (see [`supabase-schema.sql`](database/supabase-schema.sql#L89-L99))

### Database Schema
Three main tables with RLS enabled:
- `employees`: 1:1 with `auth.users`, stores name and email
- `sales`: Each row = 1 contract sale, links to employee and tier
- `bonus_tiers`: Read-only tier definitions (Starter → Bronze → Silver → Gold → Platinum → Diamond)

**Key Pattern**: Sales don't store bonus amounts directly - they reference `bonus_tier_id` to get amount at query time

## Server Actions Best Practices

### Standard Structure (see [`app/dashboard/actions.ts`](app/dashboard/actions.ts))
```typescript
'use server'
export async function actionName() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  // Perform database operation
  const { data, error } = await supabase.from('table').insert({...})
  
  if (error) return { error: error.message }
  
  revalidatePath('/path')  // Always revalidate after mutations
  return { success: true, ...data }
}
```

### Mutations Always Revalidate
- Use `revalidatePath('/', 'layout')` for auth changes affecting entire app
- Use `revalidatePath('/dashboard')` for dashboard-specific updates
- Never redirect without revalidating first

## Component Patterns

### Server Components (Default)
- Fetch data directly with `await` at component level
- No `useState`, `useEffect`, or event handlers
- Example: [`dashboard/page.tsx`](app/dashboard/page.tsx) fetches stats with `await getEmployeeStats()`

### Client Components (Minimal)
Only for:
1. Form submissions (e.g., [`login/page.tsx`](app/login/page.tsx))
2. Animations/confetti (e.g., [`counter-button.tsx`](components/counter-button.tsx))
3. Toast notifications (`toast()` from `sonner`)

**Pattern**: Use `useTransition()` for Server Action calls to get pending state:
```typescript
const [isPending, startTransition] = useTransition()
startTransition(async () => {
  const result = await serverAction()
  if (result.error) toast.error(result.error)
})
```

### Optimistic UI Example
[`counter-button.tsx`](components/counter-button.tsx) shows instant feedback while Server Action runs:
- Fire confetti immediately on click
- Show success toast after Server Action completes
- Extra celebration if new tier achieved

## Styling Conventions

- **Tailwind v4** (not v3) - use new syntax in `globals.css`
- Dark theme by default: `bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900`
- Glass morphism: `backdrop-blur-xl bg-white/10 border border-white/20`
- Icons from `lucide-react`: `import { IconName } from 'lucide-react'`
- Dynamic icon rendering: `const Icon = (Icons as any)[tier.icon]; <Icon />`

## Development Workflow

### Setup (See [`SETUP.md`](SETUP.md))
```bash
pnpm install
pnpm dev  # http://localhost:3000
```

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Common Tasks
- **Add new Server Action**: Create in `app/*/actions.ts`, export async function with `'use server'`
- **Add new route**: Create `app/route-name/page.tsx` (auto-routed)
- **Add UI component**: Use shadcn/ui CLI: `pnpm dlx shadcn@latest add component-name`
- **Modify tiers**: Update `bonus_tiers` table in Supabase (no code changes needed)

## Type Safety

- Supabase types auto-generated at [`lib/supabase/types.ts`](lib/supabase/types.ts)
- Import `Database` type for query results:
  ```typescript
  type BonusTier = Database['public']['Tables']['bonus_tiers']['Row']
  ```
- Use type assertions after error checks (see [`getEmployeeStats()`](app/dashboard/actions.ts#L92-L94))

## Debugging Tips

- Check Supabase dashboard for RLS policy errors (common auth issues)
- Verify environment variables loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
- Server Action errors: Always return `{ error: string }` for client-side toast display
- Missing employee record: Trigger should auto-create, but fallback logic in [`getEmployeeStats()`](app/dashboard/actions.ts#L60-L81)
