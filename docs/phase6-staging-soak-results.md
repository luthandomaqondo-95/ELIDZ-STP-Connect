# Phase 6 — Staging Soak Results

**Date:** 2026-03-14 (updated after blocker diagnosis)  
**Sign-off:** **NOT READY** for controlled production custom-auth rollout  
**Production state:** Unchanged — custom-auth flags remain disabled; no FK drop; no Auth user deletion; RLS migration not applied  
**Follow-up:** [`phase6-staging-blocker-resolution.md`](phase6-staging-blocker-resolution.md)

---

## 1. Staging configuration audit

| Prerequisite | Expected | Actual | Status |
|--------------|----------|--------|--------|
| Staging admin origin with `/api/mobile/*` deployed | Live BFF | Live `elidzconnect.vercel.app` still **404**. **Root cause:** BFF routes were **never pushed** to any remote branch. Local production build + `next start` now serve **401 JSON**. Remote redeploy needs Vercel auth + git push. | **BLOCKER (operator deploy)** |
| `AUTH_JWT_SECRET` (staging backend) | Set ≥32 chars | Local fixed (was glued to `DATABASE_URL`). Staging host **unverified** (no Vercel access). | **BLOCKER / unverified** |
| SMTP deliverability | Working | `SMTP_HOST` **MISSING**; emails skipped in tests | **BLOCKER** |
| Google / Apple client IDs | Match staging apps | Server `GOOGLE_CLIENT_IDS` / `APPLE_CLIENT_IDS` **MISSING**. Mobile Google IDs exist in `app.json` extras only. | **BLOCKER** for OAuth |
| `EXPO_PUBLIC_API_BASE_URL` | Staging admin URL | Intentionally **not** set in EAS until remote 401 verified | **BLOCKER** |
| `EXPO_PUBLIC_CUSTOM_AUTH_ENABLED` | `false` (initial BFF soak) | `preview-bff` / `app.json` = `false` | OK |
| `EXPO_PUBLIC_BFF_REQUIRED` | `true` | In `preview-bff` profile | OK in profile |
| Chat poll + BFF uploads | `true` | In `preview-bff` | OK in profile |
| Secrets not in git / mobile bundle | No secrets committed | `apiBaseUrl` empty; `.env` gitignored | OK |

### Local fix applied (not a staging deploy)
- Repaired malformed `admin/.env` where `AUTH_JWT_SECRET` was concatenated onto `DATABASE_URL` (local file only; **do not commit `.env`**).

### EAS
- Project id present in `app.json`.
- `eas env:list --environment preview` → **No variables found** — `EXPO_PUBLIC_API_BASE_URL` must be added to EAS env for `preview` / `preview-bff` after admin BFF is deployed.

---

## 2. Device smoke checklist (12 items)

**Device / build / environment:** Not executed — no staging build with BFF URL, and live admin does not expose `/api/mobile/*`.

| # | Check | Result |
|---|-------|--------|
| 1 | Supabase Auth login | **NOT EXECUTED** (device) |
| 2 | Profile via BFF | **NOT EXECUTED** |
| 3 | Connections | **NOT EXECUTED** |
| 4 | Enquiries / applications | **NOT EXECUTED** |
| 5 | Notifications | **NOT EXECUTED** |
| 6 | Chat polling | **NOT EXECUTED** |
| 7 | Send messages / create chats | **NOT EXECUTED** |
| 8 | Signed uploads (verification / avatar / chat) | **NOT EXECUTED** (device) |
| 9 | SMME services / RSVPs | **NOT EXECUTED** |
| 10 | Unauthenticated BFF → 401 | **PARTIAL** — live host returns **404** (route absent). Local `requireMobileAuth` unit/integration → **401** (automated) |
| 11 | Cross-user private access denied | **PASS (automated IDOR suite)** — not a device UI soak |
| 12 | `BFF_REQUIRED` + empty URL fails safely | **PASS (unit behavior tests)** — not a device build |

---

## 3. Uploads & chat polling (automated / code)

| Check | Result |
|-------|--------|
| Upload sign requires auth | **PASS** — unauthenticated POST handler → 401 (integration) |
| Path scoped to caller / chat | **PASS** — verification `userId/...`; chat `chatId/userId/...` |
| Disallowed bucket / MIME rejected | **PASS** |
| Short-lived grant | **PASS** — `expiresIn` ≤ 600s |
| Cross-user chat message read/send | **PASS** — Forbidden for non-participant |
| Pagination caps | **PASS** |
| Device poll interval / duplicate UX | **NOT EXECUTED** |
| Failed upload leaves no unauthorized metadata | **NOT EXECUTED** (no live upload soak) |
| Realtime under custom auth | **Disabled by design** until JWT verified (`SUPABASE_JWT_SECRET` still unset) |

---

## 4. Custom authentication on staging

**Not started.** Exit rule: enable only after BFF soak passes. Prerequisites missing (deployed BFF, SMTP, OAuth IDs, EAS API base URL).

---

## 5. Exit criteria

| Criterion | Status |
|-----------|--------|
| Staging BFF smoke passes | **FAIL** — blocked |
| Upload / polling authorization | **PARTIAL** — automated pass; device pending |
| Recovery emails delivered | **FAIL** — SMTP missing |
| Mobile + admin custom-auth E2E | **NOT RUN** |
| No critical authz issues unresolved | Open: BFF not on staging host |
| Rollback rehearsed | Documented in `phase6-staging-bff.md`; **not rehearsed on staging deploy** |

**Verdict:** Phase 6 remains **scaffolded only**. Controlled production rollout **blocked**.

---

## 6. Required next actions (operators)

1. Deploy admin containing `/api/mobile/*` and `/api/auth/*` to a **staging** Vercel project (or promote a preview deployment). Confirm routes return JSON 401, not HTML 404.
2. Set staging secrets: `AUTH_JWT_SECRET`, SMTP_*, `GOOGLE_CLIENT_IDS`, `APPLE_CLIENT_IDS` (and keep `CUSTOM_AUTH_ENABLED=false` for BFF soak).
3. Add EAS env for `preview-bff`: `EXPO_PUBLIC_API_BASE_URL=<staging-admin-origin>` plus existing flag defaults.
4. Build `preview-bff`, run the 12-item device checklist, record device/OS/build number here.
5. Only then enable custom auth on staging and run section 4.

---

## Automated tests executed this session

```
RUN_AUTH_INTEGRATION=1 npm test   # admin
→ 30 passed (30)
```

Includes: feature flags, tokens, Argon2id, auth register/login/refresh/reset, BFF IDOR (9), signed uploads (4), BFF_REQUIRED behavior (4).
