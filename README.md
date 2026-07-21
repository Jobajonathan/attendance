# ProtocolOS

Operations platform for the Light Nation Protocol Department. Built against the ProtocolOS MVP
Product Specification (v1.0) — see that document for the full requirements, business rules, and
delivery plan this codebase implements incrementally.

## Status: Phase 1 — Foundation

Per the specification's roadmap (Section 8.1), Phase 1 covers the Member Directory, the shared
Activity data model, and role-based authentication. Later phases (Attendance, Leave Register,
Message Review, Celebrations, Leadership Dashboard) build on this foundation and are not yet
implemented; `/dashboard` and `/activities` are placeholder pages confirming the role-based
landing routes from Section 6.2.

Implemented in this phase:

- **Authentication & roles** — Supabase Auth session cookies via `@supabase/ssr`, with a
  `profiles` table mapping each signed-in user to a ProtocolOS role (Administrative Officer, Head
  of Department, Assistant Head of Department, Minister in Charge). Role permissions are enforced
  at the database layer via Postgres Row Level Security, not only in the client.
- **Member Directory** (FR-MEM-01 to 06) — list/search, create, edit, and deactivate (via a status
  override) member records; CSV import from a Google Sheets export with per-row exception
  reporting and duplicate/near-duplicate flagging (User Story MEM-1, FR-MEM-06).
- **Activity data model** (Section 5.2, 5.4) — the shared `activities` table that Attendance and
  Message Review will both build on in later phases. No screens yet; this phase only lays down
  the schema and its RLS policies.

Protocol Members never get accounts (Section 1.5) — there is no public signup. Every authenticated
user is provisioned manually with a role; see "Provisioning the first account" below.

## Stack

- Next.js (App Router, TypeScript, Tailwind)
- Supabase: Postgres (migrations via the Supabase MCP tooling), Auth, Row Level Security

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated requests are redirected to
`/login` by `src/proxy.ts` (Next.js 16 renamed Middleware to Proxy — see
`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`).

### Provisioning the first account

There is no signup flow. Create the first staff account directly in the Supabase dashboard
(Authentication → Users → Add user), then give it a role:

```sql
insert into public.profiles (id, full_name, role)
values ('<auth-user-uuid>', 'Full Name', 'administrative_officer');
```

Valid roles: `administrative_officer`, `head_of_department`, `assistant_head_of_department`,
`minister_in_charge`.

## Database

Schema and RLS policies live in Supabase, applied as migrations named `phase1_*`
(`phase1_roles_and_profiles`, `phase1_members`, `phase1_activities`,
`phase1_security_lint_fixes`). Regenerate `src/lib/supabase/database.types.ts` after any schema
change via the Supabase MCP `generate_typescript_types` tool, or the Supabase CLI if you're working
outside an MCP-enabled session.

## Known limitation of this sandbox (not of the app)

This development sandbox's network policy blocks direct outbound HTTPS from the app process to
`*.supabase.co` (confirmed via a 403 from the environment's egress proxy) — only the Supabase MCP
tooling can reach it from here. As a result, the Auth/CRUD flows were verified via `tsc`, ESLint, a
production build, and the unauthenticated-redirect path (`curl`), but the authenticated
sign-in → Member Directory round trip could not be exercised end-to-end in a browser from this
session. It should be tested in an environment with normal outbound internet access (e.g. a
deployed preview, or a local machine) before this phase is considered done.
