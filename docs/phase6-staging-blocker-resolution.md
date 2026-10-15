# Phase 6 — Staging blocker resolution (in progress)

**Date:** 2026-03-14  
**Status:** Root cause fixed locally; **remote deploy blocked on operator credentials**

---

## 1. Cause of live HTML 404

| Finding | Evidence |
|---------|----------|
| Live host serves login | `GET https://elidzconnect.vercel.app/auth/login` → **200** |
| Live host has no BFF | `GET https://elidzconnect.vercel.app/api/mobile/profile` → **404 HTML** |
| Routes missing from git remotes | `git ls-tree origin/main` / `origin/tebogo-branch` / `origin/dev-branch` → **no** `admin/src/app/api/mobile/*` |
| Routes exist only locally | Working tree shows `?? admin/src/app/api/mobile/` and `?? admin/src/app/api/auth/` (untracked) |

**Conclusion:** The deployment is healthy App Router admin, but the BFF handlers were never committed/pushed, so Vercel never built them. This is not a Next.js rewrite bug or wrong `rootDirectory` for the login page.

Secondary local blockers discovered while preparing a deployable build:
- Missing modules (`publish-mobile-news`, `verified-smmes/actions`, `inviteUser`, `approveUser`, `react-is`)
- Edge middleware imported Node `crypto` via custom-auth session rotation → split to `tokens-jwt.ts`
- Pre-existing recharts typing drift → temporary `typescript.ignoreBuildErrors: true` in `admin/next.config.ts`

---

## 2. Local verification (executed)

Production build (`npm run build`) includes:

- `/api/mobile/profile`, `chats`, `connections`, `enquiries`, `applications`, `notifications`, `verifications`, `smme-services`, `uploads/sign`, `events/[id]/rsvp`, …
- `/api/auth/*` and `/api/auth/session/*`

`npx next start --port 3011` probe:

| Endpoint | Result |
|----------|--------|
| `GET /api/mobile/profile` (no auth) | **401** `application/json` `{"error":"Unauthorized"}` |
| `POST /api/mobile/uploads/sign` (no auth) | **401** JSON |
| `GET /api/mobile/chats` (no auth) | **401** JSON |

Automated: `RUN_AUTH_INTEGRATION=1 npm test` → **30/30 passed**.

Live Vercel probe remains **404** (unchanged — not redeployed).

---

## 3. Operator actions required (stop here)

### A. Deploy BFF to staging

Credentials **not available in this agent session** (`vercel whoami` → no credentials; `VERCEL_TOKEN` unset).

1. From a machine with Vercel access: `vercel login` (or set `VERCEL_TOKEN`).
2. **Commit and push** the BFF + auth + build-fix files on a branch Vercel builds from (or `cd admin && vercel deploy --prebuilt` after `vercel build`).  
   Do **not** commit `.env`. Prefer a **Preview / staging** deployment first, not production promotion, until soak passes.
3. Confirm the staging origin (preview URL or dedicated staging project).
4. Re-probe: unauthenticated `GET {STAGING}/api/mobile/profile` must return **401 JSON**, not HTML 404.

Suggested minimum paths to include in the commit:

- `admin/src/app/api/mobile/**`
- `admin/src/app/api/auth/**`
- `admin/src/lib/mobile-bff/**`
- `admin/src/lib/custom-auth/**`
- related middleware / authz / invite fixes, restored `publish-mobile-news.ts`, `verified-smmes/actions.ts`, `react-is` dependency, `next.config.ts` (note `ignoreBuildErrors`)

### B. Staging secrets (Vercel project → Environment Variables)

Set on the **staging** environment only (do not print values):

| Variable | Purpose | Local status |
|----------|---------|--------------|
| `AUTH_JWT_SECRET` | Custom JWT / dual BFF auth | Present locally after glue fix; **staging host unverified** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Local set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Local set |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client | Local set |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Reset/verify email | **Missing locally** — delivery **not verified** |
| `GOOGLE_CLIENT_IDS` | Server OAuth audiences | **Missing** — should include mobile `extra.googleAuth.webClientId` (+ iOS if used as aud) |
| `APPLE_CLIENT_IDS` | Server Apple audiences | **Missing** — typically `com.elidzstp.app` |
| `CUSTOM_AUTH_ENABLED` | Keep **`false`** for BFF soak | Default off |
| `NEXT_PUBLIC_CUSTOM_AUTH_ENABLED` | Keep **`false`** | Default off |
| `APP_PUBLIC_URL` | Email link base | Recommended |

SMTP check after deploy: trigger forgot-password for a test inbox; confirm delivery without logging tokens.

### C. EAS `preview-bff` (after step A returns 401)

EAS account available (`eas whoami` → `tebogo.l`). Preview/production env currently **empty**.

Only after staging BFF URL is verified:

```bash
cd mobile
eas env:create --environment preview --name EXPO_PUBLIC_API_BASE_URL --value "https://<verified-staging-host>" --visibility plaintext --non-interactive
eas env:create --environment preview --name EXPO_PUBLIC_BFF_REQUIRED --value "true" --visibility plaintext --non-interactive
eas env:create --environment preview --name EXPO_PUBLIC_CUSTOM_AUTH_ENABLED --value "false" --visibility plaintext --non-interactive
eas env:create --environment preview --name EXPO_PUBLIC_USE_CHAT_POLL --value "true" --visibility plaintext --non-interactive
eas env:create --environment preview --name EXPO_PUBLIC_USE_BFF_UPLOADS --value "true" --visibility plaintext --non-interactive
eas build --profile preview-bff --platform android   # or ios
```

Do **not** change production EAS flags.

### D. Then resume soak

Re-run device checklist in `phase6-staging-soak-results.md`. Custom-auth staging E2E stays blocked until BFF soak passes.

---

## 4. Safety

- Production custom-auth flags: **unchanged / disabled**
- No FK drop, Auth user deletion, or production RLS apply
- Device smoke / SMTP / OAuth staging: **not claimed passed**
