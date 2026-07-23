# ProtocolOS

Operations platform for the Light Nation Protocol Department. Built against the ProtocolOS MVP
Product Specification (v1.0) — see that document for the full requirements, business rules, and
delivery plan this codebase implements incrementally.

## Status: Phase 2 — Attendance

Per the specification's roadmap (Section 8.1), Phase 2 adds the Attendance module end to end on
top of Phase 1's Member Directory and Activity model. Later phases (Leave Register, Message
Review, Celebrations, Leadership Dashboard) are not yet implemented; `/dashboard` is still a
placeholder confirming the leadership landing route from Section 6.2.

Implemented in this phase (FR-ATT-01 to 10):

- **Activity Management** (`/activities`) — Administrative Officer creates attendance activities
  (title, schedule, opening/closing time, optional location + geofence radius); a unique
  human-typeable keyword and check-in link are generated automatically. The list flags activities
  still `open` past their closing time, and past-dated activities are marked "Backfilled" and
  excluded from being treated as live.
- **Public self check-in** (`/checkin/[token]`) — unauthenticated, activity-scoped (Section 1.5:
  Protocol Members never get accounts). Searchable name list, keyword entry, optional device
  geolocation. All business logic — closed/wrong-keyword/duplicate rejection, Haversine geofence
  distance, non-blocking geofence flagging (BR-02) — runs inside a `SECURITY DEFINER` Postgres
  function (`submit_checkin`) so the public path never touches the underlying tables directly.
- **Manual overrides with audit trail** (FR-ATT-04, FR-ATT-05, BR-01) — Administrative Officer or
  Head of Department can close an activity early; only the Head of Department can reopen a closed
  one. Reopening on the same calendar day it closed needs no justification; reopening later
  requires a reason, which (like every override) is written to `audit_log` with the acting user
  and timestamp.
- **Automatic status transitions** (FR-ATT-03) — a Vercel Cron job calls `sync_activity_statuses()`
  on a schedule to flip `scheduled → open → closed` based on each activity's configured times, so
  no one has to remember to open or close a session manually.

Implemented in Phase 1: authentication & roles, the Member Directory, and the shared Activity data
model — see git history / the Phase 1 PR for that detail.

### A bug found and fixed in this phase

`submit_checkin` originally treated *any* existing submission row as a duplicate — including the
`absent` rows `close_activity` auto-creates for no-shows. That made it impossible for a late member
to actually check in after a Head of Department reopened a session (User Story ATT-2 exists
specifically for this). Fixed so only a genuine prior `present` submission blocks as a duplicate;
anything else (`absent`, `excused`) is upgraded in place to `present` on a real check-in.

## Stack

- Next.js (App Router, TypeScript, Tailwind)
- Supabase: Postgres (migrations via the Supabase MCP tooling), Auth, Row Level Security,
  `SECURITY DEFINER` RPC functions for the public check-in surface
- Vercel Cron for scheduled status transitions

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Supabase values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated requests are redirected to
`/login` by `src/proxy.ts` (Next.js 16 renamed Middleware to Proxy — see
`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`); `/checkin/*` and `/api/cron/*`
are explicitly public.

### Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | app | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/cron/sync-activities` only | **Server-only, never `NEXT_PUBLIC_`.** From Supabase dashboard → Project Settings → API → service_role secret. |
| `CRON_SECRET` | `/api/cron/sync-activities` only | Any random string. Set the same value in Vercel; Vercel automatically sends it as `Authorization: Bearer <value>` on Cron requests. |

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

Schema and RLS policies live in Supabase, applied as migrations. Phase 2 added `submissions`,
`audit_log`, and the check-in/staff RPC functions (`get_checkin_activity`, `list_checkin_members`,
`submit_checkin`, `close_activity`, `reopen_activity`, `sync_activity_statuses`). Regenerate
`src/lib/supabase/database.types.ts` after any schema change via the Supabase MCP
`generate_typescript_types` tool, or the Supabase CLI if you're working outside an MCP-enabled
session.

## Deployment

Deployed on Vercel. `vercel.json` runs `/api/cron/sync-activities` once daily (`0 3 * * *`) —
Vercel's Hobby plan rejects any cron schedule that fires more than once a day, so this is the
coarsest-but-simplest choice, not the primary mechanism. FR-ATT-03's real-time transitions instead
come from **opportunistic sync**: both `/activities` (staff) and `/checkin/[token]` (public) call
the same idempotent `sync_activity_statuses()` RPC on every page load before reading activity data,
so any traffic — staff checking the dashboard or a member opening the check-in link — self-heals a
stale status. The daily cron is just a catch-all for activities nobody visits between their
scheduled times. Set `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` in the Vercel project's
environment variables for the cron route to work (see table above). On a Pro plan (or self-hosted
cron), you can tighten `vercel.json`'s schedule for a shorter worst-case staleness window.

## Known limitation of the development sandbox (not the app)

This project has been developed across two environments: a sandboxed remote session (network
policy blocks direct outbound HTTPS from the running app to `*.supabase.co` and other
non-allowlisted hosts — confirmed via 403s from the environment's egress proxy; only the Supabase
MCP tooling can reach it from there) and local machines with normal internet access. Where the
sandbox couldn't exercise a flow live in a browser, the underlying logic was verified by calling
the same Postgres RPC functions directly via the Supabase MCP `execute_sql` tool against seeded
test data (checked in, cleaned up afterward), in addition to `tsc`, ESLint, and a production build.
