# Phase 6 — Staging BFF activation guide

**Status:** Configured in-repo; **staging soak blocked** — see [`phase6-staging-soak-results.md`](phase6-staging-soak-results.md).  
**Production default:** Supabase Auth + empty `apiBaseUrl` (BFF inactive).  
**Live probe (2026-03-14):** `https://elidzconnect.vercel.app/api/mobile/*` → **404** because BFF source was never on the deployed git branch. Local `next start` now returns **401 JSON**. Redeploy steps: [`phase6-staging-blocker-resolution.md`](phase6-staging-blocker-resolution.md).

---

## Environment requirements

### Admin (staging deployment)

| Variable | Required | Notes |
|----------|----------|-------|
| `AUTH_JWT_SECRET` | Yes for custom JWT / dual BFF auth | ≥32 chars; currently often missing in local `.env` |
| `SUPABASE_JWT_SECRET` | Optional | **Absent in local env** — Realtime/Storage JWT mint **not verified** |
| `CUSTOM_AUTH_ENABLED` | Default `false` | Server cutover; keep off for Step 1 BFF soak |
| `NEXT_PUBLIC_CUSTOM_AUTH_ENABLED` | Default `false` | Must match server for admin UI |
| SMTP + OAuth client IDs | For recovery/OAuth | See `.env.example` |

### Mobile (staging / EAS `preview-bff`)

| Variable / extra | Value for Step 1 |
|------------------|------------------|
| `EXPO_PUBLIC_API_BASE_URL` or `extra.apiBaseUrl` | Staging admin origin (e.g. `https://your-staging-admin.vercel.app`) |
| `EXPO_PUBLIC_CUSTOM_AUTH_ENABLED` / `extra.customAuthEnabled` | `false` (keep Supabase Auth login) |
| `EXPO_PUBLIC_BFF_REQUIRED` | `true` on staging BFF builds — **no silent Supabase fallback** |
| `EXPO_PUBLIC_USE_CHAT_POLL` | `true` recommended (Realtime JWT unverified) |
| `EXPO_PUBLIC_USE_BFF_UPLOADS` | `true` recommended |

EAS profile `preview-bff` sets the poll/upload/BFF-required flags. **You must still set `EXPO_PUBLIC_API_BASE_URL` in EAS secrets / env** for that profile — do not commit production or staging secrets into `app.json`.

---

## Step 1 smoke checklist (Supabase Auth still active)

Build with staging admin URL + `BFF_REQUIRED=true`, then verify:

1. Login via **existing Supabase Auth** succeeds.
2. Profile GET/PATCH via BFF.
3. Connections, enquiries, applications, notifications, chat messages, verification, SMME services via BFF.
4. Unauthenticated `/api/mobile/*` → 401.
5. Cross-user resource access → 403.
6. With `BFF_REQUIRED=true` and empty `apiBaseUrl`, private ops **throw** (no silent direct Supabase).

Do **not** use the production store build as the first test harness.

---

## Realtime / Storage decision (evidence-based)

| Check | Result (2026-03-14 / Phase 6 prep) |
|-------|--------------------------------------|
| `SUPABASE_JWT_SECRET` in admin env | **MISSING** |
| Minted JWT → live Realtime subscribe | **Not executed** |
| Minted JWT → Storage RLS | **Not executed** |

**Decision:** Do **not** claim Supabase-compatible data JWTs work. Ship verified alternatives:

- Chat: `useChatPolling` / custom-auth auto → BFF-backed list refresh (poll) instead of Realtime channels.
- Uploads: `/api/mobile/uploads/sign` owned signed URLs (service role server-side).

**Token revocation note (if JWT mint is later verified):** short TTL (≤10m) only; logout does not revoke already-issued data JWTs. Treat them as ephemeral capability tokens, not sessions.

---

## Rollback

1. Unset `EXPO_PUBLIC_API_BASE_URL` / set `extra.apiBaseUrl` to `""` → direct Supabase again (when `BFF_REQUIRED` is false).
2. Keep `EXPO_PUBLIC_CUSTOM_AUTH_ENABLED=false` and `CUSTOM_AUTH_ENABLED=false`.
3. Do not drop `profiles.id → auth.users` or delete Auth users.
