# Phase 5 Code Review & Phase 6 Readiness Assessment

**Date:** 2026-03-14  
**Verdict:** Phase 5 is largely substantiated by code. **Phase 6 cutover is blocked** until Realtime/Storage JWT strategy is verified (or replaced with BFF polling) and remaining private direct queries are migrated. Security blockers found in review have been patched in-repo (see below).

---

## 1. Phase 5 verification vs actual code

### Confirmed (matches report)
| Claim | Evidence |
|-------|----------|
| All `/api/mobile/*` routes call `requireMobileAuth` | Grep across 16 `route.ts` files — every handler authenticates |
| Ownership from session, not client user IDs | Handlers use `auth.auth.userId`; ignore client `requesterId` / `smme_id` / notification owner |
| Dual auth (custom JWT + Supabase access token) | [`admin/src/lib/mobile-bff/auth.ts`](../admin/src/lib/mobile-bff/auth.ts) |
| Custom JWT checks `typ=access`, `sub`, `sid` + active `auth_sessions` | [`tokens.ts`](../admin/src/lib/custom-auth/tokens.ts) `jwtVerify` (enforces `exp`) + `assertSessionActive` |
| Service role server-only | `createAdminClient` only under `admin/src`; mobile has no service-role imports |
| Mobile BFF gated by `apiBaseUrl` | [`mobile/src/lib/mobile-api.ts`](../mobile/src/lib/mobile-api.ts); `app.json` `extra.apiBaseUrl` is `""` → BFF **inactive** in current Expo config |
| Supabase Auth still live | Full `auth-provider.tsx` / admin middleware unchanged for login |

### Discrepancies / gaps vs report
| Issue | Severity | Status |
|-------|----------|--------|
| OAuth auto-link by email without requiring IdP `email_verified` | **High** (account takeover) | **Fixed** — link-by-email requires `identity.emailVerified`; otherwise refuse if profile exists |
| `reportMessage` trusted client `reportedUserId` | Medium | **Fixed** — always uses `message.sender_id` |
| `AUTH_JWT_SECRET` not reliably present in `admin/.env` | High for custom auth | Tests inject it; **deployment prerequisite** |
| `SUPABASE_JWT_SECRET` absent | **Blocker** for Realtime/Storage mint | See §3 |
| BFF not activated in mobile (`apiBaseUrl` empty) | Operational | Expected until admin URL configured |
| Incomplete BFF coverage (group chat, connection discovery, decline/block some paths, message.tsx deletes) | Medium | Remaining direct Supabase when BFF on/off |
| Progress report said auth tables “Absent” in Phase 1 snapshot | Doc drift | Tables now exist (Phase 2 applied) |

### Tests reproduced (actual)
```
RUN_AUTH_INTEGRATION=1 npm test  →  17 passed (17)
```
After JWT negative-test additions, re-run expected ≥19 (see §6).

---

## 2. Remaining direct Supabase inventory (pre–Auth removal)

| Operation | Class | Replacement before Auth retirement |
|-----------|-------|--------------------------------------|
| Login/signup/logout/OAuth/reset/verify (`auth-provider`, auth screens) | **Private auth** | Custom `/api/auth/*` + SecureStore (Phase 6) |
| Admin middleware / login / invite / deleteUser | **Private auth/admin** | Custom cookie session + credential-aware admin APIs |
| BFF-eligible CRUD still on fallback path when `apiBaseUrl` empty | **Private** | Set `apiBaseUrl`; remove fallbacks after soak |
| `getAvailableUsers` / `getAllContacts` / decline-cancel variants | **Private** | Extend `/api/mobile/connections*` |
| Group chat create/leave/rename/participants | **Private** | Extend `/api/mobile/chats*` |
| Realtime `.channel(...)` in `message.tsx`, `messages.tsx` | **Infrastructure** | Short-lived Supabase JWT **or** BFF polling |
| Storage: `chat-attachments`, `verification-documents`, `profile-avatars` | **Infrastructure** | Signed upload via BFF **or** verified data JWT |
| Public catalogues (opportunities, news, tenants, facilities, events list, postal) | **Public** | Keep anon/RLS reads |
| Admin dashboard PostgREST via SSR user | **Private admin** | Phase 6 cookie + service role / BFF |

---

## 3. Realtime & Storage strategy validation

### Proposed approach (plan)
Mint short-lived JWTs with `SUPABASE_JWT_SECRET`, claims `{ role: "authenticated", aud: "authenticated", sub: <profileId> }` for Realtime/Storage only.

### Verification status: **NOT SAFE TO RELY ON YET**
| Check | Result |
|-------|--------|
| `SUPABASE_JWT_SECRET` in admin env | **Missing** |
| Token mint exercised against live Realtime | **Not done** |
| Storage RLS/policies validated with minted JWT | **Not done** |
| Revocation (logout) of already-issued data JWT | **Inherent limitation** — short TTL (≤10m) only; must not treat as session |
| Effect of Auth user deletion on such JWTs | N/A until FK drop; JWT accepts `sub` without Auth row **if** gateway only checks signature |

### Required before Phase 6 production cutover affecting chat/uploads
1. Add `SUPABASE_JWT_SECRET` from Supabase Dashboard → Settings → API → JWT Secret.
2. Integration test: mint token → subscribe to a private channel / upload under Storage policy using `auth.uid()`.
3. If unverifiable: **route chat reads via BFF polling** and **uploads via authenticated upload URLs from `/api/mobile/*`** — do not remove Supabase Auth until that lands.

**Decision for Phase 6 scaffolding:** Feature-flag custom auth **off** by default. Do not disable Realtime dependent on unverified JWT minting.

**Phase 6 update:** With `SUPABASE_JWT_SECRET` still **MISSING**, the verified alternative is implemented: BFF chat polling + `/api/mobile/uploads/sign`. See [`phase6-staging-bff.md`](phase6-staging-bff.md).

---

## 4. Existing-user recovery readiness

| Check | Result |
|-------|--------|
| 13 profiles with `must_reset_password` + null hash | **Confirmed** (SQL) |
| 9 social identities backfilled (google/apple) | **Confirmed** |
| Password reset API single-use | Covered by integration test |
| Mobile/admin UI wired to `/api/auth/forgot-password` | **Not yet** (still Supabase Auth) |
| Social users with pre-linked `auth_identities` | Can sign in via OAuth without password once Phase 6 OAuth is live |
| Email-password users | **Must** complete reset before first custom login |

---

## 5. Phase 6 go / no-go

| Criterion | Status |
|-----------|--------|
| Phase 5 authz tests pass | Go |
| Critical takeover bugs fixed | Go (patched) |
| BFF activated in a staging mobile build | **No-go until `apiBaseUrl` set + smoke** |
| Realtime/Storage strategy verified | **No-go** |
| Remaining private helpers on BFF | Partial — **blocker for Auth retirement**, not for flagged dual-run |
| Destructive FK/Auth deletion | Explicitly deferred |

**Allowed next step:** Implement Phase 6 **behind `EXPO_PUBLIC_AUTH_PROVIDER=custom` / `AUTH_PROVIDER=custom` defaulting to `supabase`**, with documented rollback (unset flag).  
**Not allowed yet:** Production default cutover, FK drop, deleting `auth.users`, applying RLS migration unreviewed.

---

## 6. Deployment prerequisites (before any custom-auth rollout)
1. Persist `AUTH_JWT_SECRET` (≥32 chars) in admin runtime secrets.
2. Configure SMTP for reset/verify emails.
3. Set `GOOGLE_CLIENT_IDS` / `APPLE_CLIENT_IDS`.
4. Set mobile `EXPO_PUBLIC_API_BASE_URL` to admin origin (activate BFF).
5. Obtain and verify `SUPABASE_JWT_SECRET` **or** ship BFF polling/upload URLs.
6. Communicate password-reset requirement to all 13 email/password users.
7. Keep Supabase Auth enabled for rollback.

---

## Changed in this review pass
- OAuth email-link requires IdP-verified email; refuse unverified link-to-existing.
- Message reports use DB `sender_id` only.
- Added JWT negative tests (wrong secret, expired, wrong `typ`).
