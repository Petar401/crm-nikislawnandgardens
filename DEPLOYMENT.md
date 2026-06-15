# Deployment — Niki's Lawn & Gardens CRM

This app runs on **Vercel** (frontend) + **Supabase** (database/auth/storage).
A Supabase project and a Vercel project both named `crm-nikislawnandgardens`
are already provisioned.

## Supabase

- **Project ref:** `ooirttushvcdsgfuccyk`
- **URL:** `https://ooirttushvcdsgfuccyk.supabase.co`
- **Schema:** all migrations in `supabase/migrations/` (0001–0012) and the
  permission catalog from `supabase/seed.sql` are already applied. There is **no
  business data** — the first person to sign up creates the shared workspace and
  becomes the owner.

To re-apply from scratch on another project:

```bash
supabase link --project-ref <ref>
supabase db push
# then run supabase/seed.sql in the SQL editor
```

## Environment variables (set these in Vercel → Settings → Environment Variables)

| Variable | Value / where to get it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ooirttushvcdsgfuccyk.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key | Yes |
| `NEXT_PUBLIC_SITE_URL` | The deployed Vercel URL (e.g. `https://crm-nikislawnandgardens.vercel.app`) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (server-only) | Needed for team invites & the leads feature |
| `GROQ_API_KEY` | Free key from <https://console.groq.com> (server-only) | Optional — enables the AI / Aria features |
| `CRON_SECRET` | Any random string (server-only) | Optional — only for scheduled lead discovery |

Only `NEXT_PUBLIC_*` values reach the browser. The service-role, Groq, and cron
secrets stay on the server.

## Supabase auth configuration

In Supabase → **Authentication → URL Configuration**, add the deployed origin
(the value of `NEXT_PUBLIC_SITE_URL`) to **Redirect URLs**, including
`<site-url>/auth/callback`. New signups are auto-confirmed at the database level
(migration `0007`), so no SMTP/email step is required.

## First login

1. Open the deployed URL and **Sign up** (full name, email, password).
2. On onboarding, set the workspace name to **Niki's Lawn & Gardens**.
3. You land on the dashboard as the owner with full access. Start adding
   **Clients**, contacts, deals, tasks, etc.
