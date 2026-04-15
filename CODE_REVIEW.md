# Anomaly Grid — Code Review

**Reviewer:** Senior Software Engineer (Intellusia Studios Engagement)  
**Date:** 2026-04-15  
**Scope:** Full codebase review — `/dashboard/src/`, `/supabase/migrations/`, configs  
**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + Auth)

---

## Executive Summary

Anomaly Grid is a well-designed product **demo** with impressive visual polish and a solid data model foundation. The UI is compelling, the MITRE/CVE/CWE integration is thoughtfully presented, and the 3D globe is a legitimate differentiator for demos.

**However, this codebase is not production-ready.** The most critical issue is that authentication is a UI stub — no actual auth logic exists anywhere. Every protected route is publicly accessible. All displayed data is hardcoded. The login form literally shows "Connect Supabase to enable auth" as its only behavior.

This review identifies **37 discrete issues** across 6 categories, ranging from critical security holes to medium code quality improvements.

---

## Issues by Severity

---

### 🔴 CRITICAL

---

#### ISSUE-001 — No Authentication Anywhere

- **File:** `src/app/login/page.tsx`, lines 56–62
- **Severity:** Critical
- **What's wrong:**

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')
  setTimeout(() => {
    setLoading(false)
    setError('Connect Supabase to enable auth')  // ← Not auth. This is a placeholder.
  }, 1000)
}
```

The login form does nothing except display an error after a fake delay. No Supabase `signInWithPassword`, no `signInWithOAuth`, no session creation. The OAuth buttons (`OAuthButton` component) also do nothing — they have no `onClick` handlers that trigger any OAuth flow.

- **How to fix:**

```typescript
import { createClient } from '@/lib/supabase/client'

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')
  const supabase = createClient()
  
  if (mode === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  } else {
    // sign up flow
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (error) { setError(error.message); setLoading(false); return }
    setError('Check your email to confirm your account.')
  }
  setLoading(false)
}
```

For OAuth:
```typescript
const handleOAuth = async (provider: 'google' | 'github' | 'azure') => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/auth/callback` } })
}
```

---

#### ISSUE-002 — No Route Protection (Missing `middleware.ts`)

- **File:** Root of `src/` — file does not exist
- **Severity:** Critical
- **What's wrong:**

There is no `middleware.ts`. Every route — including `/dashboard`, `/dashboard/actors`, `/dashboard/intel`, `/dashboard/stig-scanner`, and `/mission-control` — is publicly accessible without any authentication check. A user can navigate directly to `/dashboard` without ever logging in.

- **How to fix:**

Create `src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') ||
                      request.nextUrl.pathname.startsWith('/mission-control')

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/mission-control/:path*'],
}
```

---

#### ISSUE-003 — Mission Control Accessible to Everyone (Super-Admin Page With No Guard)

- **File:** `src/app/mission-control/page.tsx`
- **Severity:** Critical
- **What's wrong:**

`/mission-control` is described as "Super Admin" and displays all tenant names, MRR data (`$18,750`), sensor counts, and alert counts. Currently it has zero authentication, zero authorization check, zero role verification. Any unauthenticated visitor can see this page. This is a business-critical data exposure risk.

- **How to fix:**

1. Add `middleware.ts` protection (ISSUE-002).
2. Add a server-side role check at the top of the page:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MissionControlPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  // Check if platform admin
  const { data: admin } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('id', user.id)
    .single()
  
  if (!admin) redirect('/dashboard')
  // ... rest of page
}
```

---

#### ISSUE-004 — Trust Badges Are False Claims

- **File:** `src/app/login/page.tsx`, lines 246–252
- **Severity:** Critical (legal/compliance risk)
- **What's wrong:**

```tsx
<span className="text-xs font-mono text-gray-700">🔒 256-bit encryption</span>
<span className="text-xs font-mono text-gray-700">SOC 2 compliant</span>
<span className="text-xs font-mono text-gray-700">FedRAMP ready</span>
```

The application has no authentication, no real encryption implementation visible in this codebase, no SOC 2 certification, and no FedRAMP authorization. Displaying these to potential enterprise/government customers as-is constitutes misrepresentation. If Intellusia Studios is targeting government contractors, false FedRAMP claims are particularly dangerous.

- **How to fix:**

Either achieve these certifications before displaying them, or replace with accurate claims like "End-to-end encrypted • Supabase Auth • Built for CMMC-2" — something truthful to the current state.

---

### 🟠 HIGH

---

#### ISSUE-005 — Static Export Incompatible With Server-Side Auth

- **File:** `out/` directory (build artifact), `src/lib/supabase/server.ts`
- **Severity:** High
- **What's wrong:**

The `out/` directory contains a fully static HTML export (`dashboard.html`, `login.html`, etc.). The Supabase `server.ts` client uses `cookies()` from `next/headers` which requires a server runtime — it cannot work in a static export. The server client would be dead code in deployment, meaning no server-side auth verification is possible.

Additionally, there is no `next.config.ts` in the repo. The build configuration is undocumented and likely missing.

- **How to fix:**

Create `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Remove 'output: export' if using server features (middleware, server components with auth)
  // If you need static export for hosting, use Supabase client-side auth only
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
```

Choose one: server-rendered Next.js app (recommended for auth security) OR static export with client-only Supabase auth. Don't mix.

---

#### ISSUE-006 — Supabase Cookie Errors Silently Swallowed

- **File:** `src/lib/supabase/server.ts`, lines 13–18
- **Severity:** High
- **What's wrong:**

```typescript
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)
    )
  } catch {}  // ← Silent failure. Auth state loss in production.
}
```

The empty `catch {}` means any cookie setting failure — including auth session refresh failures — will be silently ignored. In production, this causes users to mysteriously lose their sessions with no error logged.

- **How to fix:**

```typescript
} catch (error) {
  // Expected to fail in Server Components (read-only cookie store)
  // Only matters in Server Actions and Route Handlers
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Supabase] Cookie set failed (expected in Server Components):', error)
  }
}
```

---

#### ISSUE-007 — Non-Null Assertions on Environment Variables With No Validation

- **File:** `src/lib/supabase/client.ts` line 5, `src/lib/supabase/server.ts` lines 7–8
- **Severity:** High
- **What's wrong:**

```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
```

The `!` operator suppresses TypeScript's null checks. If these env vars are missing (e.g., in a fresh deployment or CI environment), the Supabase client will be initialized with `undefined` values, leading to cryptic runtime errors instead of a clear startup failure.

There is also no `.env.example` file in the repository.

- **How to fix:**

```typescript
// src/lib/env.ts
function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

export const env = {
  SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
}
```

Create `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

#### ISSUE-008 — All Dashboard Data Is Hardcoded Mock Data

- **File:** `src/app/dashboard/page.tsx`, `src/app/dashboard/actors/page.tsx`, `src/app/dashboard/stig-scanner/page.tsx`, `src/app/mission-control/page.tsx`
- **Severity:** High
- **What's wrong:**

Every page uses hardcoded in-file constants (`MOCK_EVENTS`, `MOCK_ACTORS`, `MOCK_STIGS`, `MOCK_FINDINGS`, `MOCK`) instead of fetching from Supabase. Despite a complete, well-designed database schema existing in `/supabase/migrations/`, zero pages actually query it. The Supabase client is installed and configured but never used in any page component.

- **How to fix:**

Convert pages to server components with real data fetching:

```typescript
// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('threat_events')
    .select('*, threat_actors(*), device_fingerprints(*)')
    .order('timestamp', { ascending: false })
    .limit(50)
  
  // pass events to client component for interactivity
}
```

---

#### ISSUE-009 — No Dashboard Layout File (Nav Duplicated 4 Times)

- **File:** `src/app/dashboard/page.tsx`, `src/app/dashboard/intel/page.tsx`, `src/app/dashboard/stig-scanner/page.tsx`, `src/app/mission-control/page.tsx`
- **Severity:** High
- **What's wrong:**

The navigation bar (`<nav>` with logo, links, and LIVE indicator) is copy-pasted into every single page file. Any nav change must be made in 4+ places. There is also no `src/app/dashboard/layout.tsx` to provide shared auth checking, navigation, or context.

- **How to fix:**

Create `src/app/dashboard/layout.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  return (
    <div className="min-h-screen bg-[#030305]">
      <DashboardNav user={user} />
      {children}
    </div>
  )
}
```

---

#### ISSUE-010 — `<img>` Tags Instead of Next.js `<Image>` (Multiple Files)

- **File:** `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/intel/page.tsx`, `src/app/dashboard/stig-scanner/page.tsx`, `src/app/mission-control/page.tsx`
- **Severity:** High
- **What's wrong:**

All logo images use plain `<img>` tags:
```tsx
<img src="/logo.png" alt="Anomaly Grid" className="w-full h-full" />
```

This bypasses Next.js image optimization entirely — no WebP conversion, no lazy loading, no blur placeholders, no responsive sizes. The logo is loaded multiple times per page in some layouts.

- **How to fix:**

```tsx
import Image from 'next/image'
// ...
<Image src="/logo.png" alt="Anomaly Grid" width={32} height={32} className="w-full h-full" />
```

---

#### ISSUE-011 — Hardcoded Asset Path Bypasses `BASE_PATH` Config

- **File:** `src/app/page.tsx`, line ~170
- **Severity:** High
- **What's wrong:**

```tsx
style={{ backgroundImage: 'url(/anomaly-grid/hero-bg.png)' }}
```

The path `/anomaly-grid/hero-bg.png` is hardcoded with the production base path. The `config.ts` file provides an `asset()` helper for exactly this purpose, but it's not used here. In development this will 404 (since `BASE_PATH` is empty). There's also no `import` of the `asset` helper.

- **How to fix:**

```tsx
import { asset } from '@/lib/config'
// ...
style={{ backgroundImage: `url(${asset('/hero-bg.png')})` }}
```

---

#### ISSUE-012 — `<a>` Tag Used Instead of Next.js `<Link>` (Actors Page)

- **File:** `src/app/dashboard/actors/page.tsx`, line ~49
- **Severity:** High
- **What's wrong:**

```tsx
<a href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">← Dashboard</a>
```

A plain `<a>` tag causes a full browser navigation (page reload) instead of a client-side transition. All other pages correctly use `Link`.

- **How to fix:**

```tsx
import Link from 'next/link'
// ...
<Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">← Dashboard</Link>
```

---

#### ISSUE-013 — `MatrixRain` Component Causes Hydration Mismatch

- **File:** `src/app/page.tsx`, lines 10–24
- **Severity:** High
- **What's wrong:**

```tsx
style={{
  animation: `matrix-fall ${3 + Math.random() * 7}s linear infinite`,
  animationDelay: `${Math.random() * 5}s`,
}}
// ...
{Array.from({ length: 30 }, () =>
  String.fromCharCode(0x30A0 + Math.random() * 96)
).join('\n')}
```

`Math.random()` is called during render (not in `useEffect`). The server-rendered HTML will have different random values than the client-rendered output, causing a React hydration mismatch. While the page is `'use client'`, it still server-renders for initial HTML. The component should initialize random values in a `useEffect` or use stable seeds.

- **How to fix:**

Move all random calculations into a `useMemo` or `useEffect` that only runs client-side, or use a seeded PRNG.

---

#### ISSUE-014 — Dead Dependencies Bloating Bundle

- **File:** `package.json`
- **Severity:** High
- **What's wrong:**

Two heavy dependencies are installed but unused:
- `recharts` (~500KB) — zero usage found across all source files
- `react-globe.gl` — installed but the globe uses a custom Canvas implementation, not this library

Combined these add significant bundle weight with zero benefit.

- **How to fix:**

```bash
npm uninstall recharts react-globe.gl
```

Verify with: `npm ls recharts react-globe.gl` after removal.

---

#### ISSUE-015 — SQL: Missing RLS on Critical Tables

- **File:** `supabase/migrations/001_anomaly_grid_schema.sql`
- **Severity:** High
- **What's wrong:**

The following tables have no `enable row level security` or any RLS policies:
- `tenants` — All tenant records readable by any authenticated user
- `platform_admins` — Super admin list is completely unprotected
- `usage_snapshots` — Tenant usage/billing data exposed
- `platform_events` — Internal platform events exposed

The `tenants` table exposure is particularly dangerous: any authenticated user from Tenant A can query and see Tenant B's name, plan, MRR, and configuration.

- **How to fix:**

```sql
alter table tenants enable row level security;
alter table platform_admins enable row level security;
alter table usage_snapshots enable row level security;
alter table platform_events enable row level security;

-- Tenants: users can only see their own tenant
create policy "tenant_self_read" on tenants
  for select using (id = (select tenant_id from users where id = auth.uid()));

-- Platform admins: only platform admins can read
create policy "platform_admin_only" on platform_admins
  for all using (auth.uid() in (select id from platform_admins));

-- Usage snapshots: tenant isolation
create policy "tenant_isolation" on usage_snapshots
  for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
```

---

#### ISSUE-016 — SQL: RLS Policies Use Correlated Subquery (Performance)

- **File:** `supabase/migrations/001_anomaly_grid_schema.sql`, lines ~175–182
- **Severity:** High
- **What's wrong:**

```sql
create policy "tenant_isolation" on threat_events
  for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
```

This pattern runs a subquery against `users` **for every row evaluated** by RLS. On a table with millions of threat events, this is catastrophic for query performance. The standard Supabase pattern is to store `tenant_id` in JWT custom claims and use `auth.jwt() -> 'app_metadata' ->> 'tenant_id'`.

- **How to fix:**

Set `tenant_id` as a JWT claim via Supabase hook or use a helper function:

```sql
create or replace function auth.current_tenant_id() returns uuid as $$
  select (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
$$ language sql stable;

-- Then policies become:
create policy "tenant_isolation" on threat_events
  for all using (tenant_id = auth.current_tenant_id());
```

---

#### ISSUE-017 — SQL: Duplicate Index Name / Wrong Table Reference

- **File:** `supabase/migrations/001_anomaly_grid_schema.sql`, line ~226
- **Severity:** High
- **What's wrong:**

```sql
create index idx_alerts_tenant on threat_events(tenant_id);  -- ← Wrong table!
```

This index is named `idx_alerts_tenant` but is created on `threat_events`, not `alerts`. Additionally, `idx_threat_events_tenant` already exists on `threat_events(tenant_id)`, making this a redundant duplicate index that wastes storage and degrades write performance.

- **How to fix:**

```sql
-- Remove the duplicate index
-- drop index idx_alerts_tenant; -- if it was already applied

-- Create the correct alerts index
create index idx_alerts_tenant on alerts(tenant_id);

-- Also add a composite index for the common query pattern
create index idx_threat_events_tenant_ts on threat_events(tenant_id, timestamp desc);
```

---

#### ISSUE-018 — SQL: Missing Composite Index for Primary Query Pattern

- **File:** `supabase/migrations/001_anomaly_grid_schema.sql`
- **Severity:** High
- **What's wrong:**

The most common query on `threat_events` will be:
```sql
WHERE tenant_id = $1 ORDER BY timestamp DESC LIMIT 50
```

Individual indexes on `tenant_id` and `timestamp` exist separately, but no composite index exists. PostgreSQL won't efficiently combine them for this query pattern, leading to full scans or inefficient bitmap index operations at scale.

- **How to fix:**

```sql
create index idx_threat_events_tenant_ts on threat_events(tenant_id, timestamp desc);
-- Also useful:
create index idx_threat_events_tenant_severity on threat_events(tenant_id, severity, timestamp desc);
```

---

### 🟡 MEDIUM

---

#### ISSUE-019 — `actors/page.tsx` Missing `'use client'` But Is Inconsistent

- **File:** `src/app/dashboard/actors/page.tsx`
- **Severity:** Medium
- **What's wrong:**

The actors page has no `'use client'` directive (making it a Server Component), which is actually fine since it has no client-side interactivity. However, it imports Lucide icons and renders JSX that would benefit from being a proper async server component with data fetching. The inconsistency with other pages (all of which are client components) makes the pattern confusing.

- **How to fix:**

Convert to a proper async server component with Supabase data fetching:
```typescript
export default async function ActorsPage() {
  const supabase = await createClient()
  const { data: actors } = await supabase
    .from('threat_actors')
    .select('*')
    .order('last_seen', { ascending: false })
  // ...
}
```

---

#### ISSUE-020 — Duplicate Data: Threat Origins Defined in Two Places

- **File:** `src/components/ThreatGlobe.tsx` (THREATS array), `src/app/dashboard/page.tsx` (MOCK_EVENTS array)
- **Severity:** Medium
- **What's wrong:**

Both files independently define the same threat actors with the same geographic coordinates. `APT-SHADOW-7` at `{lat: 55.75, lon: 37.62}` appears in both. `SCAN-CLUSTER-44` at `{lat: 31.23, lon: 121.47}` appears in both. This is a DRY violation — when mock data is updated in one place, it won't be reflected in the other.

- **How to fix:**

Create a shared mock data file:
```typescript
// src/lib/mock/threats.ts
export const MOCK_THREAT_ACTORS = [...]
export const MOCK_EVENTS = [...]
```

Import from this in both components.

---

#### ISSUE-021 — Duplicate SVG Map Implementation

- **File:** `src/components/ThreatGlobe.tsx` (FlatMapView), `src/app/dashboard/page.tsx` (AttackMap)
- **Severity:** Medium
- **What's wrong:**

`FlatMapView` in ThreatGlobe and `AttackMap` in the dashboard page are nearly identical SVG world map implementations — same grid lines, same continent ellipses at the same coordinates, same animation patterns, same projection math (`toX`, `toY`). The only difference is the data source.

- **How to fix:**

Extract to a shared `<WorldMap>` component that accepts threat data as props.

---

#### ISSUE-022 — `GlobeView` Animation Has Stale Closure on `autoRotate`

- **File:** `src/components/ThreatGlobe.tsx`, lines ~70–120
- **Severity:** Medium
- **What's wrong:**

```typescript
useEffect(() => {
  // ...
  function draw() {
    // ...
    if (autoRotate && !draggingRef.current) rotationRef.current += 0.15  // ← stale closure
    animRef.current = requestAnimationFrame(draw)
  }
  draw()
}, [project, autoRotate])  // autoRotate in deps means effect re-runs on toggle
```

While `autoRotate` is in the deps array (causing the effect to re-run when toggled), a cleaner pattern uses a ref to avoid effect teardown/restart:

```typescript
const autoRotateRef = useRef(true)
// in RAF loop:
if (autoRotateRef.current && !draggingRef.current) rotationRef.current += 0.15
// toggle button:
autoRotateRef.current = !autoRotateRef.current
```

This avoids canceling and restarting the entire animation loop on toggle.

---

#### ISSUE-023 — `LiveCounter` Uses `Math.random()` in Interval With No Seed Stability

- **File:** `src/app/dashboard/page.tsx`, lines ~180–190
- **Severity:** Medium
- **What's wrong:**

```typescript
function LiveCounter({ label, base }: { label: string; base: number }) {
  const [count, setCount] = useState(base)
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3))
    }, 2000 + Math.random() * 3000)  // ← random interval duration
```

The `2000 + Math.random() * 3000` creates a new random interval every time the component mounts (including React Strict Mode double-mounts). While `Math.random()` in the `setInterval` callback is fine, the random in the interval delay creates different-duration intervals on re-mounts.

---

#### ISSUE-024 — Large Monolithic Components (No Separation of Concerns)

- **File:** `src/app/dashboard/page.tsx` (~500+ lines), `src/components/ThreatGlobe.tsx` (~400 lines)
- **Severity:** Medium
- **What's wrong:**

`dashboard/page.tsx` contains: `IntelTicker`, `ThreatLevelGauge`, `FingerprintBadge`, `LiveCounter`, `AttackMap`, `KpiCard` — all in one file, plus `MOCK_EVENTS` and multiple constant maps. `ThreatGlobe.tsx` contains three completely separate visualization modes (`GlobeView`, `FlatMapView`, `ThreatMatrix`).

This makes testing impossible and navigation difficult.

- **How to fix:**

Structure:
```
src/components/dashboard/
  IntelTicker.tsx
  ThreatLevelGauge.tsx
  FingerprintBadge.tsx
  AttackMap.tsx
  KpiCard.tsx
src/components/globe/
  GlobeView.tsx
  FlatMapView.tsx
  ThreatMatrix.tsx
```

---

#### ISSUE-025 — `KpiCard` and `Kpi` Defined After `export default` (Code Organization)

- **File:** `src/app/dashboard/page.tsx` (lines ~480+), `src/app/mission-control/page.tsx` (lines ~100+)
- **Severity:** Medium
- **What's wrong:**

Helper components are defined after the `export default` function that uses them. This is valid JavaScript but violates convention — components should be defined before use or in separate files.

---

#### ISSUE-026 — `globals.css` References Undefined CSS Variables

- **File:** `src/app/globals.css`, lines 10–13
- **Severity:** Medium
- **What's wrong:**

```css
@theme inline {
  --font-sans: var(--font-geist-sans);  /* ← never set; Geist fonts not loaded */
  --font-mono: var(--font-geist-mono);  /* ← never set; overridden by Share Tech Mono */
}
```

Geist fonts (`--font-geist-sans`, `--font-geist-mono`) are never loaded in `layout.tsx` — the actual fonts are Orbitron and Share_Tech_Mono. The CSS variables referenced here resolve to `undefined`, and the override in `.font-mono { font-family: var(--font-mono) !important }` points to these undefined vars before falling back to `ui-monospace`.

Also, `body { font-family: Arial, Helvetica, sans-serif }` in globals.css will flash Arial for a frame before the layout's Orbitron class takes effect.

---

#### ISSUE-027 — SQL: `device_fingerprints` Has No Uniqueness Constraint

- **File:** `supabase/migrations/001_anomaly_grid_schema.sql`
- **Severity:** Medium
- **What's wrong:**

```sql
create table device_fingerprints (
  ...
  tenant_id uuid not null,
  src_ip text not null,
  ...
);
-- No UNIQUE constraint on (tenant_id, src_ip)
```

Without a uniqueness constraint, the same IP can create duplicate fingerprint records. An upsert pattern (which is how fingerprint tracking should work) requires a unique constraint to function.

- **How to fix:**

```sql
alter table device_fingerprints add constraint uq_fp_tenant_ip unique (tenant_id, src_ip);
-- Then use upsert: on conflict (tenant_id, src_ip) do update set last_seen = now(), connection_count = connection_count + 1
```

---

#### ISSUE-028 — SQL: Users Table Duplicates `email` from `auth.users`

- **File:** `supabase/migrations/001_anomaly_grid_schema.sql`
- **Severity:** Medium
- **What's wrong:**

```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,  -- ← duplicate of auth.users.email
  ...
);
```

`email` is already stored in `auth.users`. Duplicating it here creates a synchronization problem — if a user changes their email in Supabase Auth, the `users` table won't update automatically.

- **How to fix:**

Remove the `email` column from `users` and always join with `auth.users` when email is needed, or use a trigger to keep it in sync.

---

#### ISSUE-029 — No Error Boundaries in React Tree

- **File:** Entire `src/` codebase
- **Severity:** Medium
- **What's wrong:**

There are zero React Error Boundaries. If any component throws (e.g., the canvas globe fails to initialize, a Supabase query throws), the entire page crashes with an unhandled error. The `ThreatGlobe` canvas implementation is especially risky since it uses direct DOM APIs.

- **How to fix:**

Wrap risky components:
```tsx
import { Suspense } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary' // create this

<ErrorBoundary fallback={<div>Globe unavailable</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <ThreatGlobe />
  </Suspense>
</ErrorBoundary>
```

---

#### ISSUE-030 — No Loading States or Suspense Boundaries

- **File:** All dashboard pages
- **Severity:** Medium
- **What's wrong:**

None of the pages implement loading states. When connected to real Supabase data, users will see content flash from empty/loading to populated. No `loading.tsx` files exist in any route segment. No Suspense boundaries wrap async data.

---

#### ISSUE-031 — Intel Page Filter Logic Recalculates on Every Render

- **File:** `src/app/dashboard/intel/page.tsx`, lines ~180–200
- **Severity:** Medium
- **What's wrong:**

```typescript
const filteredFeeds = INTEL_FEEDS.filter(f => { ... })
const filteredMitre = MITRE_DATA.filter(m => { ... })
const filteredVulns = VULN_DATA.filter(v => { ... })
```

These filter operations run on every render with no memoization. While the data arrays are small, this is a pattern that should use `useMemo`:

- **How to fix:**

```typescript
const filteredFeeds = useMemo(() =>
  INTEL_FEEDS.filter(f => {
    const matchCat = catFilter === 'all' || f.category === catFilter
    const matchSearch = searchQ === '' || f.name.toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchSearch
  }), [searchQ, catFilter])
```

---

### 🔵 LOW

---

#### ISSUE-032 — No `updated_at` Columns on Most Tables

- **File:** `supabase/migrations/001_anomaly_grid_schema.sql`
- **Severity:** Low
- **What's wrong:**

Tables like `threat_actors`, `sensors`, `alerts`, and `users` have `created_at` but no `updated_at`. Without `updated_at`, incremental syncs and changelog auditing are impossible.

- **How to fix:**

Add `updated_at timestamptz default now()` to key tables and a trigger:
```sql
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger set_updated_at before update on threat_actors
  for each row execute function update_updated_at();
```

---

#### ISSUE-033 — `'use client'` on Pages That Could Be Server Components

- **File:** `src/app/dashboard/actors/page.tsx` (no directive — correct), vs `src/app/dashboard/stig-scanner/page.tsx` (`'use client'`)
- **Severity:** Low
- **What's wrong:**

The STIG scanner page uses `'use client'` primarily for local filter state. This prevents any server-side data fetching benefit. The pattern should be: server component fetches data, passes to client component for interactivity.

---

#### ISSUE-034 — Inline `style` Props Mixed With Tailwind (Inconsistent Pattern)

- **File:** `src/app/page.tsx`, `src/components/ThreatGlobe.tsx`
- **Severity:** Low
- **What's wrong:**

Some components use inline `style` props for things that could be Tailwind classes (e.g., `style={{ left: '${i * 2.5}%' }}`), while others use Tailwind. Dynamic values that require interpolation are fine in inline styles, but static values should use Tailwind.

---

#### ISSUE-035 — `lucide-react` Version `^1.8.0` (Pre-Release / Unusual)

- **File:** `package.json`
- **Severity:** Low
- **What's wrong:**

```json
"lucide-react": "^1.8.0"
```

Lucide React is currently at 0.x versioning (e.g., `0.460.0`). Version `1.8.0` doesn't exist in the standard registry. This may be a typo and could cause `npm install` failures in CI. The installed version in `node_modules` should be verified.

- **How to fix:**

```bash
npm install lucide-react@latest
```

---

#### ISSUE-036 — No Tests (Zero Coverage)

- **File:** Entire codebase
- **Severity:** Low (for now — critical at scale)
- **What's wrong:**

There are no test files anywhere — no unit tests, no integration tests, no Playwright/Cypress E2E tests. For a security product that alerts operators to active breaches, test coverage is essential.

---

#### ISSUE-037 — `next.config.ts` Missing Entirely

- **File:** Expected at root of `dashboard/`
- **Severity:** Low
- **What's wrong:**

There is no `next.config.ts` or `next.config.js`. This means no image domain config, no custom headers (important for security — CSP, HSTS, X-Frame-Options), no redirects, no bundle analyzer. Security headers are especially important for a cybersecurity product.

- **How to fix:**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## What's Actually Good

Before the score, credit where it's due:

- ✅ **Database schema is excellent** — Well-normalized, thoughtful tenant isolation model, proper foreign keys, RLS enabled on the right tables (minus the gaps noted above), useful audit log and usage snapshots, smart composite view for Mission Control.
- ✅ **Type system is solid** — `src/types/index.ts` is comprehensive and well-organized. The type definitions align well with the DB schema.
- ✅ **Supabase client architecture is correct** — The split between `client.ts` (browser) and `server.ts` (server) follows Supabase SSR best practices.
- ✅ **MITRE/CVE/CWE/CAPEC data quality is high** — The intel content is accurate and well-linked. Real CVE IDs, correct technique mappings, legitimate external URLs.
- ✅ **`rel="noopener noreferrer"` on all external links** — Consistent and correct.
- ✅ **TypeScript strict mode enabled** — `tsconfig.json` has `"strict": true`.
- ✅ **The visual design is genuinely strong** — The UI will demo well to government/enterprise clients.

---

## Summary Score

| Category | Score | Notes |
|---|---|---|
| Security | 2/10 | No auth, no middleware, incomplete RLS |
| Architecture | 4/10 | Good schema, poor component structure, missing layouts |
| Code Quality | 6/10 | Types are solid, DRY violations, mock data everywhere |
| Performance | 6/10 | Mostly fine for a demo, some re-render concerns |
| Best Practices | 5/10 | Missing `next.config.ts`, no Error Boundaries, no tests |
| Production Readiness | 1/10 | Not deployable with real users in current state |

### **Overall: 4 / 10**

This is a strong demo / sales tool. It is not a production application.

---

## Top 5 Priorities Before Production

### Priority 1 — Implement Authentication (ISSUE-001, ISSUE-002, ISSUE-003)

This is the single biggest blocker. Do these three things together:
1. Wire up `handleSubmit` and OAuth buttons to real Supabase auth calls
2. Create `src/middleware.ts` to protect all `/dashboard/*` and `/mission-control` routes
3. Add server-side role check in `mission-control/page.tsx` to restrict to `platform_admins` only

**Estimated effort:** 1–2 days

---

### Priority 2 — Fix Supabase Row Level Security (ISSUE-015, ISSUE-016, ISSUE-017)

Enable RLS on `tenants`, `platform_admins`, `usage_snapshots`, `platform_events`. Fix the correlated subquery pattern to use JWT claims. Drop the duplicate `idx_alerts_tenant` index on `threat_events` and create it on `alerts`.

**Estimated effort:** Half a day

---

### Priority 3 — Connect to Real Supabase Data (ISSUE-008)

Replace all `MOCK_*` constants with actual Supabase queries. Convert pages to async Server Components. Create a dashboard layout with auth check.

**Estimated effort:** 3–5 days (the data layer architecture needs to be designed properly)

---

### Priority 4 — Remove False Claims and Fix Broken Build Config (ISSUE-004, ISSUE-005, ISSUE-037)

Remove "SOC 2 compliant / FedRAMP ready" badges until those certifications exist. Create `next.config.ts` with security headers. Create `.env.example`. Decide: static export vs server-rendered (this impacts the entire auth architecture).

**Estimated effort:** Half a day

---

### Priority 5 — Extract Dashboard Layout and Fix Duplicate Nav (ISSUE-009)

Create `src/app/dashboard/layout.tsx` with shared auth guard and navigation. Remove the 4 copy-pasted `<nav>` blocks. This pays down tech debt and is prerequisite for auth integration.

**Estimated effort:** 2–3 hours

---

*Report generated by Reviewer — Intellusia Studios Code Review Engagement — 2026-04-15*
