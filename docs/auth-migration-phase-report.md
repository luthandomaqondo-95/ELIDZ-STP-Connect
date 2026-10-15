# Custom Auth Migration — Phase Progress Report

## Phase 1 — Repository audit (complete)

**Deliverable:** [`docs/auth-migration-checklist.md`](auth-migration-checklist.md)

### Findings
- Mobile + admin both depend on Supabase Auth; 13 profiles linked 1:1 to `auth.users`.
- `profiles.id → auth.users` FK **retained** (not dropped).
- Private mobile data accessed directly via Supabase client (connections, chat, applications, RSVPs, enquiries, notifications, verifications).
- RLS disabled on `chats` and `smme_services_products` (critical).
- No existing automated test suite.
- No Supabase preview branches available for isolated staging DB.
- Unused drizzle/`bcrypt` auth scaffold must not be used as-is.

### Tests
- N/A (audit only)

---

## Phase 2 — Additive database (complete)

### Applied migration
- Name: `custom_auth_tables` (via Supabase MCP `apply_migration`)
- File: [`admin/supabase/migrations/20260314100000_custom_auth_tables.sql`](../admin/supabase/migrations/20260314100000_custom_auth_tables.sql)

### Results
| Check | Result |
|-------|--------|
| `auth_credentials` rows | 13 |
| `must_reset_password` + null hash | 13 |
| `auth_identities` | 9 (google 8, apple 1) |
| `profiles_id_fkey` still present | **Yes** |
| `auth.users` deleted | **No** |

### Reversibility
```sql
DROP TABLE IF EXISTS public.auth_email_verification_tokens CASCADE;
DROP TABLE IF EXISTS public.auth_password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.auth_identities CASCADE;
DROP TABLE IF EXISTS public.auth_sessions CASCADE;
DROP TABLE IF EXISTS public.auth_credentials CASCADE;
```
Does not affect `profiles` or related app data.

### Not done (deferred)
- Dropping `profiles_id_fkey`
- Changing `smme_verifications` FK off `auth.users`
- Enabling RLS on chats / smme_services_products (SQL prepared, not applied)

---

## Phase 3 — Auth API (complete; clients not cut over)

### Implemented
- Argon2id hashing (`admin/src/lib/custom-auth/password.ts`) — m=65536, t=3, p=1
- Access JWT + hashed refresh rotation (`tokens.ts`, `session.ts`)
- Google/Apple ID-token verification (`oauth.ts`)
- Service + routes under `/api/auth/*`:
  - register, login, logout, refresh, me
  - forgot-password, reset-password
  - verify-email, resend-verification, change-password
  - oauth/google, oauth/apple
- Email helpers updated (nodemailer; no token body logging when SMTP missing)
- `.env.example` documents required secrets
- Registration still creates a **stub** `auth.users` row (random unusable password) to satisfy FK until FK drop phase

### Files changed (high level)
- `admin/src/lib/custom-auth/**`
- `admin/src/app/api/auth/**`
- `admin/src/lib/email-service.ts`
- `admin/package.json` (argon2, jose, google-auth-library, jwks-rsa, vitest)
- `admin/.env.example`
- `admin/vitest.config.ts`
- `admin/supabase/migrations/*`
- `docs/auth-migration-checklist.md`, `docs/auth-migration-phase-report.md`

### Security notes
- Auth tables have RLS enabled with **no** anon/authenticated policies (service role only).
- Existing mobile/admin still use Supabase Auth — dual readiness, not cutover.
- `AUTH_JWT_SECRET` required for token routes.

### Tests (Phase 4)
```
npm test                              → 6 passed (password + tokens); integration skipped
RUN_AUTH_INTEGRATION=1 npm test       → 8 passed (includes live DB register/login/refresh/logout/reset)
```
| Criterion | Result |
|-----------|--------|
| 2 Argon2id stored | Pass (unit + integration DB assert) |
| 3 Independent salts | Pass (unit) |
| 4 Valid login | Pass (integration) |
| 5 Wrong password | Pass (unit + integration) |
| 7 Logout invalidates | Pass (integration; refresh after logout fails) |
| 8 Revoked/rotated tokens | Pass (integration; old refresh fails after rotate) |
| 9 Reset single-use | Pass (integration) |
| 1 New register | Pass (integration; disposable user cleaned up) |

### Deployment prerequisites before client cutover
1. Set `AUTH_JWT_SECRET` (≥32 chars) in admin runtime env
2. Configure SMTP for reset/verify emails
3. Set `GOOGLE_CLIENT_IDS` / `APPLE_CLIENT_IDS`
4. Optionally `SUPABASE_JWT_SECRET` for Realtime/Storage data tokens
5. Complete password-reset path for all 13 existing users before flipping clients

---

## Phase 5 — Mobile BFF (complete; auth path unchanged)

### Auth model for BFF
- `requireMobileAuth` accepts **Supabase Auth access token** (current live login) via `auth.getUser(jwt)`.
- Also accepts **custom access JWT** when `AUTH_JWT_SECRET` is set (Phase 6 ready).
- User identity always from verified token — never from client-supplied `userId` for ownership.

### Endpoints implemented (`/api/mobile/*`)
| Area | Routes |
|------|--------|
| Profile | `GET/PATCH /profile` |
| Notifications | `GET/POST /notifications`, `PATCH/DELETE /notifications/[id]` |
| Enquiries | `GET/POST /enquiries`, `GET /enquiries/[id]` |
| Applications | `GET/POST /applications` |
| Event RSVPs | `GET/POST/DELETE /events/[id]/rsvp` |
| Connections | `GET/POST /connections`, `PATCH/DELETE /connections/[id]`, `GET/POST/DELETE /connections/block` |
| Chats | `GET/POST /chats`, `GET/POST /chats/[id]/messages`, `POST /chats/reports` |
| Verifications | `GET/POST /verifications` |
| SMME services | `GET/POST /smme-services`, `PATCH/DELETE /smme-services/[id]` |

### Mobile services migrated (BFF when `apiBaseUrl` set)
- `enquiry.service`, `opportunity.applyToOpportunity`, `event` RSVP methods
- `notification.service` list/count/read/delete
- `connection.service` accepted/pending/send/accept/block status
- `chat.service` list chats/messages/send/createDirect
- `verification.service` list/submit
- `smme.service` createServiceProduct
- `auth-provider.updateProfile`

Fallback: if `extra.apiBaseUrl` / `EXPO_PUBLIC_API_BASE_URL` is empty, services keep direct Supabase (current Expo config has empty `apiBaseUrl` so production UX unchanged until URL is configured).

### Direct Supabase operations remaining (documented)
| Operation | Reason / protection |
|-----------|---------------------|
| Public catalogue (opportunities, news, tenants, facilities, events list, postal codes) | Public/read-heavy; existing RLS |
| Chat Realtime channels (`message.tsx`, `messages.tsx`) | Needs client Realtime; Phase 6 short-lived Supabase data JWT |
| Storage uploads (chat attachments, verification docs, avatars) | Client upload then BFF metadata; Storage policies + session |
| Connection discovery / getAllContacts / some chat group ops | Partially still direct; extend BFF before Phase 6 cutover |
| Admin dashboard data access | Still Supabase SSR Auth (Phase 6) |

### RLS review (not applied)
- File updated: `admin/supabase/migrations/20260314110000_enable_rls_chats_smme_services.sql`
- Removes `chats_insert_anon`, tightens participant SELECT, adds SMME owner policies
- **Not applied to production** pending staging review

### Tests (actual)
```
RUN_AUTH_INTEGRATION=1 npm test  →  17 passed (17)
```
Includes 9 mobile BFF authorization/IDOR tests:
- Unauthenticated → 401
- User B cannot read/modify User A enquiry/notification
- Non-participant cannot read/send chat messages
- Participant can read own messages
- User cannot update/delete another user's SMME service
- Pagination cap enforced

Mobile targeted typecheck: no new errors in BFF-touched files.

### Known limitations
- BFF inactive in mobile until `apiBaseUrl` is set to the admin deployment URL.
- Some connection/chat helpers still use direct Supabase when BFF off.
- Creating notifications from mobile client remains discouraged (admin-side).
- No Phase 6 cutover performed.

### Production migration still required
- Configure `EXPO_PUBLIC_API_BASE_URL` / `app.json` `extra.apiBaseUrl` to admin origin to activate BFF.
- Apply reviewed RLS migration in Phase 7 after staging validation.
- Phase 6: replace Supabase Auth UI/session with custom auth.

---

## Phase 5 review (2026-03-14) — see `docs/phase5-review-phase6-readiness.md`

### Reproduced tests
`RUN_AUTH_INTEGRATION=1 npm test` → **17+ passed** (JWT negative cases added in review).

### Blockers fixed in review
- OAuth email auto-link now requires IdP `email_verified`
- Message report `reported_user_id` taken from DB message sender only

### Remaining Phase 6 blockers (pre–feature-flag scaffolding)
- `SUPABASE_JWT_SECRET` not configured / Realtime+Storage mint unverified
- Mobile `apiBaseUrl` empty (BFF inactive until set)
- Group-chat / connection-discovery still partly direct Supabase
- Admin Auth + invite/delete still Supabase Auth (until flag on)

**Do not switch production clients or drop FKs until readiness checklist is green.**

---

## Phase 6 preparation (feature-flagged; production default unchanged)

**Date:** 2026-03-14 (continued)  
**Guide:** [`docs/phase6-staging-bff.md`](phase6-staging-bff.md)

### Realtime / Storage decision (evidence)
| Check | Result |
|-------|--------|
| Local `SUPABASE_JWT_SECRET` | **MISSING** |
| Live Realtime mint test | **Not run** |
| Live Storage RLS with minted JWT | **Not run** |

**Verified alternative shipped:** chat list/thread polling when `useChatPoll` / custom auth; signed uploads via `/api/mobile/uploads/sign` when `useBffUploads` / custom auth / BFF. Do not claim data-JWT Realtime works.

### Feature flags (default off)
| Flag | Default | Effect |
|------|---------|--------|
| `EXPO_PUBLIC_CUSTOM_AUTH_ENABLED` / `extra.customAuthEnabled` | `false` | Mobile custom `/api/auth/*` + SecureStore |
| `CUSTOM_AUTH_ENABLED` / `AUTH_PROVIDER=custom` | `false` | Admin cookie session + middleware |
| `NEXT_PUBLIC_CUSTOM_AUTH_ENABLED` | `false` | Admin UI branch (must match server) |
| `EXPO_PUBLIC_BFF_REQUIRED` | `false` | No silent direct Supabase when true |
| `EXPO_PUBLIC_USE_CHAT_POLL` / uploads | `false` | Forced on when custom auth enabled |

### Changed files (high level)
- Mobile: `feature-flags.ts`, `custom-auth-session.ts`, `mobile-api.ts`, `auth-provider.tsx`, `message.tsx`, `messages.tsx`, forgot/change-password, chat/verification uploads, `app.json` extras, `eas.json` `preview-bff`
- Admin: cookie session routes `/api/auth/session/*`, middleware dual-path, login/forgot/reset/nav-user, invite/delete/SMME provision behind flag, uploads sign API, `.env.example`, vitest dotenv load
- Docs: this report, checklist, `phase6-staging-bff.md`

### Existing-user recovery (SQL evidence)
| Metric | Count |
|--------|-------|
| profiles | 13 |
| auth.users | 13 |
| `must_reset_password` + null hash | **13** |
| auth_identities | 9 |

Password-reset single-use covered by integration test. Profile UUIDs unchanged. OAuth link still requires IdP `email_verified`.

### Tests (actual)
```
RUN_AUTH_INTEGRATION=1 npm test  → 30 passed (30)
```
Includes feature flags, tokens, Argon2id, auth register/login/refresh/reset, BFF IDOR (9), signed upload grants (4), BFF_REQUIRED safe-failure behavior (4).

### Staging soak (2026-03-14) — NOT READY
Full record: [`phase6-staging-soak-results.md`](phase6-staging-soak-results.md)

| Gate | Result |
|------|--------|
| Deployed BFF on `elidzconnect.vercel.app` | **FAIL** — `/api/mobile/*` returns **404** |
| EAS `EXPO_PUBLIC_API_BASE_URL` | **FAIL** — preview env empty |
| SMTP | **FAIL** — not configured (emails skipped in tests) |
| Device 12-item BFF smoke | **NOT EXECUTED** |
| Custom auth staging E2E | **NOT STARTED** (blocked by BFF soak) |
| Production flags / FK / Auth delete / RLS apply | **Unchanged** (preserved) |

Local note: `admin/.env` had `AUTH_JWT_SECRET` glued to `DATABASE_URL`; repaired locally only.

### Rollback
1. Keep / restore `CUSTOM_AUTH_ENABLED=false`, `NEXT_PUBLIC_CUSTOM_AUTH_ENABLED=false`, `EXPO_PUBLIC_CUSTOM_AUTH_ENABLED=false`.
2. Clear mobile `apiBaseUrl` / unset `EXPO_PUBLIC_API_BASE_URL` (and `BFF_REQUIRED`) to fall back to direct Supabase when not required.
3. Do not drop FK or delete Auth users.

### Outstanding risks / defects
- **Critical:** Staging (or current Vercel) admin build does not serve mobile BFF routes.
- SMTP and OAuth client IDs missing for recovery/social soak.
- Staging host `AUTH_JWT_SECRET` not verified via deployment dashboard.
- Group chat / connection discovery still partial direct Supabase.
- Feature flags are **not** a security boundary.

## Remaining work
1. Deploy admin with `/api/mobile/*` to staging; confirm unauthenticated **401** JSON (not HTML 404).
2. Configure EAS `preview-bff` `EXPO_PUBLIC_API_BASE_URL` + SMTP + OAuth IDs + `AUTH_JWT_SECRET` on that host.
3. Run device smoke checklist; then staging custom-auth only if BFF soak passes.
4. Phase 7: Apply RLS migration (staging preferred), then FK drop after E2E green.

**Supabase Auth remains the production default.** Custom auth is opt-in via flags only. **Phase 6 production rollout: blocked.**
