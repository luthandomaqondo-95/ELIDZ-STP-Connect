# ELIDZ STP Connect — Custom Auth Migration Checklist

**Status:** Phases 1–5 implemented. Phase 5 reviewed — see [`phase5-review-phase6-readiness.md`](phase5-review-phase6-readiness.md).  
**Phase 6:** Scaffolded behind flags. Staging soak **NOT READY** — see [`phase6-staging-soak-results.md`](phase6-staging-soak-results.md). Production default remains Supabase Auth.  
**Rule:** Keep the app runnable. Do not drop `profiles.id → auth.users` FK, delete Auth users, or cut over clients until acceptance tests pass.

---

## Phase 1 — Repository audit vs plan (2026-03-14)

### Plan decisions (confirmed)
| Decision | Status in repo |
|----------|----------------|
| Shared auth for mobile + admin | Not implemented — both use Supabase Auth |
| Argon2id hashing | Not present (`bcryptjs` only in unused drizzle scaffold) |
| Canonical identity = `profiles` | **Yes** — 13 profiles, 1:1 with `auth.users` |
| Ignore drizzle `public.users` scaffold | Correct — table does **not** exist in DB |
| BFF for private data | Not implemented — mobile hits PostgREST directly |
| Google/Apple server verify | Not implemented — client → `supabase.auth.signInWithIdToken` |

### Database (project `msngrgkyoozqysxtggfw`)
| Check | Result |
|-------|--------|
| Profile count | **13** |
| Auth users | **13** (all email-confirmed) |
| Orphans | None |
| `profiles.id` FK → `auth.users` | **Present** — must keep until later phase |
| Custom `auth_*` tables | **Absent** |
| Supabase branches (staging) | **None** — no branch DB; additive migrations only on primary until a branch is created |
| OAuth identities | Providers present in `auth.identities` (email + some google/apple dual) |
| RLS `chats` | **DISABLED** (policies exist but inactive) |
| RLS `smme_services_products` | **DISABLED** (no policies) |

### Mobile Supabase Auth call sites (must migrate)
| File | Auth APIs |
|------|-----------|
| `mobile/src/providers/auth-provider.tsx` | signInWithPassword, signUp, resend, signOut, getSession, onAuthStateChange, OAuth, signInWithIdToken |
| `mobile/src/services/auth.service.ts` | signInWithIdToken, getSession, updateUser(password) |
| `mobile/src/app/(auth)/forgot-password.tsx` | resetPasswordForEmail |
| `mobile/src/app/(auth)/change-password.tsx` | setSession, onAuthStateChange, signOut |
| `mobile/src/app/(auth)/email-confirmed.tsx` | getSession, setSession, exchangeCodeForSession, verifyOtp |
| `mobile/src/app/_layout.tsx` | deep-link session / OTP |
| Services using `getUser`/`getSession` | `opportunity`, `event`, `enquiry`, `connection`, `notification` |

### Mobile private-data operations → BFF targets
| Surface | Classification | Notes |
|---------|----------------|-------|
| connections | **Private** — BFF | Uses session user id |
| chat / messages / participants | **Private** — BFF + Realtime exception | Realtime channels in `message.tsx`, `messages.tsx` |
| applications | **Private** — BFF | `getUser()` then insert |
| event_rsvps | **Private** — BFF | |
| enquiries | **Private** — BFF | |
| notifications | **Private** — BFF | |
| smme_verifications + storage uploads | **Private** — BFF | |
| profile update / avatars | **Private** — BFF / Storage JWT | |
| opportunities, news, tenants, facilities, postal codes | **Mostly public read** | Keep anon reads where RLS allows; writes via BFF/admin |

### Admin Supabase Auth call sites (must migrate)
| Area | Files |
|------|-------|
| Middleware / layout | `middleware.ts`, `dashboard/layout.tsx` |
| Login / reset UI | `login-form`, `forgot-password-form`, `reset-password-form`, `email-confirmed` |
| Authz | `lib/authz.ts`, many `getUser()` in actions/APIs |
| User provisioning | `api/admin/smmes` inviteUser, `bootstrap-admin` createUser, `users/[id]/delete` deleteUser, `actions.ts` invite |
| Client logout | `nav-user.tsx` |

### Gaps vs plan (implementation debt)
1. No `/api/auth/*` routes.
2. No `/api/mobile/*` BFF.
3. No app JWT / refresh-session tables.
4. No Argon2id dependency.
5. No automated tests (`*.test.*` / `__tests__` absent).
6. Email service largely stubbed (`admin/src/lib/email-service.ts`).
7. Unused bcrypt/drizzle auth code must **not** be wired as-is.
8. Service role correctly server-only via `createAdminClient()` — keep that boundary.

### Security issues discovered (Phase 1)
| Issue | Severity | Plan action |
|-------|----------|-------------|
| RLS off on `chats` | Critical | Enable + tighten policies (later phase; prepare SQL now) |
| RLS off on `smme_services_products` | Critical | Enable + add policies |
| Client trusts Supabase Auth for all private rows | High | BFF + session auth |
| Stub SMTP may log email bodies in dev | Medium | Real nodemailer; never log tokens/passwords |

---

## Implementation phases (execution order)

### Phase 2 — Additive DB only
- [x] Create `auth_credentials`, `auth_sessions`, `auth_identities`, `auth_password_reset_tokens`, `auth_email_verification_tokens`
- [x] Backfill credentials for 13 profiles (`must_reset_password = true`, hash NULL)
- [x] Backfill `auth_identities` from `auth.identities` where provider ∈ (google, apple)
- [x] **Do not** drop `profiles_id_fkey` (still present)
- [x] **Do not** delete `auth.users`
- [x] Save reversible SQL under `admin/supabase/migrations/20260314100000_custom_auth_tables.sql`
- Note: `smme_verifications.user_id` still FKs to `auth.users` (deferred; keep until FK cutover phase)
- OAuth identity sources in Auth: email=6, google=8, apple=1 (users may have multiple)

### Phase 3 — Auth API (admin Next.js)
- [x] Argon2id password helpers + pepper
- [x] Session issue/rotate/revoke
- [x] Routes: register, login, logout, refresh, me, forgot/reset password, verify/resend email, change-password, oauth google/apple
- [x] Rate limiting + generic login errors
- [x] Env template for `AUTH_JWT_SECRET`, etc. (no secrets in git)
- [x] Registration uses Auth stub user until FK drop (documented)

### Phase 4 — Automated tests
- [x] Add Vitest (admin)
- [x] Unit tests for Argon2id + JWT tokens (6 passing)
- [x] Integration tests: register/login/refresh/logout/reset single-use (2 passing; `RUN_AUTH_INTEGRATION=1`)
- [ ] IDOR stubs for `/api/mobile/*` (after Phase 5 BFF exists)
- [x] Report actual pass/fail (**8/8 pass** with integration env)

### Phase 5 — Mobile BFF
- [x] `/api/mobile/*` for private surfaces (profile, connections, chats/messages, enquiries, applications, notifications, verifications, RSVPs, SMME services)
- [x] Dual auth: Supabase access token (live) + custom JWT (ready for Phase 6)
- [x] Mobile services call BFF when `EXPO_PUBLIC_API_BASE_URL` / `extra.apiBaseUrl` is set; otherwise keep direct Supabase (app stays runnable)
- [x] Authorization/IDOR tests (9) — pass with `RUN_AUTH_INTEGRATION=1`
- [x] RLS SQL reviewed/corrected (not applied): `20260314110000_enable_rls_chats_smme_services.sql`
- [x] Public catalogue reads (opportunities/news/tenants/facilities/events list) remain on direct anon/RLS path

### Phase 6 — Client cutover (feature-flagged; default Supabase)
- [x] Staging BFF config path documented (`phase6-staging-bff.md`); `eas.json` `preview-bff`; `BFF_REQUIRED` / no silent fallback when required
- [ ] Staging device smoke with live `EXPO_PUBLIC_API_BASE_URL` — **BLOCKED** (BFF never pushed to remotes; local 401 proven; needs Vercel login + deploy — see `phase6-staging-blocker-resolution.md`)
- [x] Realtime/Storage: JWT mint **unverified** (`SUPABASE_JWT_SECRET` missing) → poll + signed upload alternative implemented
- [x] Mobile auth-provider dual-path + SecureStore refresh (`EXPO_PUBLIC_CUSTOM_AUTH_ENABLED`, default false)
- [x] Admin cookie session `/api/auth/session/*` + middleware/login/forgot/reset behind `CUSTOM_AUTH_ENABLED` (default false)
- [x] Invite/delete/SMME provision credential-aware when custom auth enabled (Admin invite still Super-Admin only; SMME path cannot create admins)
- [x] Existing-user recovery: 13/13 `must_reset` + null hash confirmed; reset single-use tested; OAuth requires verified email
- [x] Feature flags default off; Supabase Auth left intact for rollback
- [ ] SMTP configured + real email delivery verified on staging
- [ ] Custom auth staging E2E (only after BFF device soak)
- [ ] Production default flip to custom auth — **forbidden until staging soak + SMTP + AUTH_JWT_SECRET**
- [ ] Phase 6 controlled production rollout sign-off — **NOT READY** ([soak results](phase6-staging-soak-results.md))

### Phase 7 — RLS, docs, acceptance, FK drop (later)
- [ ] Enable RLS on chats + smme_services_products
- [ ] Staging/branch validation preferred before production RLS flip
- [ ] `docs/auth-migration.md` cutover + rollback
- [ ] Drop `profiles_id_fkey` only when custom registration works end-to-end
- [ ] Retire Supabase Auth last

---

## Rollback (high level)
1. Clients keep using Supabase Auth until cutover flag flips — flip back immediately if issues.
2. Additive `auth_*` tables can be dropped (`DROP TABLE ... CASCADE`) without touching profiles.
3. After FK drop (future): restoring Auth linkage requires recreating `auth.users` with matching UUIDs — avoid FK drop until irreversible commitment is accepted.

---

## Acceptance criteria tracking (from brief)
| # | Criterion | Status |
|---|-----------|--------|
| 1 | New user register | Pass (integration, custom auth API) |
| 2 | Argon2id stored | Pass (unit + integration) |
| 3 | Independent salts | Pass (unit) |
| 4 | Valid login | Pass (integration) |
| 5 | Wrong password rejected | Pass (integration) |
| 6 | Duplicate registration safe | Pass (service throws on existing email) |
| 7 | Logout invalidates session | Pass (integration) |
| 8 | Expired/revoked tokens blocked | Pass (token unit + session assert) |
| 9 | Reset tokens expire / single-use | Pass (integration) |
| 10 | User A cannot access User B data | Pass (BFF IDOR suite, 9 tests) |
| 11 | Existing users recover without data loss | Partial — DB ready (13 must_reset); UI behind flag; staging email soak pending |
| 12 | Session restore / expiry | Partial — SecureStore + refresh implemented; device soak pending |
| 13 | Features still work | Partial — BFF paths coded; staging smoke pending |
| 14 | No secrets in logs/responses | Pass for reset tokens (not logged); continue monitoring |

### Latest automated results
`RUN_AUTH_INTEGRATION=1 npm test` (admin) → **30 passed / 30** (2026-03-14 staging soak session: +upload grants, +BFF_REQUIRED behavior).  
Staging device smoke / custom-auth staging E2E: **not executed** (blockers in soak results).
