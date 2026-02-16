# Supabase "Error loading data" – diagnosis and fix

A diagnostic script and Supabase checks found the following.

## App was using a different Supabase project (fixed)

The app reads Supabase URL/keys from **`Constants.expoConfig.extra`** first (from `app.json`), then falls back to `process.env.EXPO_PUBLIC_*` (from `.env`). `app.json` had a different project (`kxyievpdwggcglokjwgy`) than `.env` (`msngrgkyoozqysxtggfw`), so the running app was hitting the wrong project and saw "OpportunityService.getOpportunities error: null" / "Error loading dashboard data". **`app.json` → `extra.supabaseUrl` and `extra.supabaseAnonKey` were updated to match `.env`** so the app uses the same project as the diagnostic and migrations.

## What was wrong

1. **`search_za_postal_codes` RPC**  
   Two overloads existed with the same parameter names in different order. PostgREST could not choose between them, so the RPC failed (signup postal code dropdown would get no data / errors).

2. **`progress_reports` table missing**  
   The table `public.progress_reports` was not present in the project (or not in the schema cache). That causes "Failed to load data" on the **Progress Reports** screen.

3. **`profiles.address` column missing (signup fails)**  
   The mobile app writes an `address` string to `public.profiles.address` during signup. If the column does not exist (or PostgREST schema cache is stale), signup can fail with:  
   `"Could not find the address column of profiles in the schema cache"`.

## Fixes

### 1. Fix postal code RPC (Supabase SQL Editor)

Run this in **Supabase Dashboard → SQL Editor**:

- **File:** `mobile/database/fix_search_za_postal_codes_duplicate.sql`

It drops the duplicate overload and keeps the correct `(p_limit, p_query)` function.

### 2. Create `progress_reports` table

Run the progress reports migration in **Supabase Dashboard → SQL Editor**:

- **File:** `mobile/database/create_progress_reports_table.sql`

Note: it uses `update_updated_at_column()`. If that function does not exist, create it first or add it from your existing migrations.

### 3. (Optional) Re-run diagnostic

From the `mobile` folder:

```bash
node scripts/supabase-diagnose.mjs
```

All checks should show **OK**.

## Fix signup "address column" error

Run this in **Supabase Dashboard → SQL Editor**:

- **File:** `mobile/database/fix_profiles_address_column_schema_cache.sql`

## Supabase MCP – full database setup applied

The following migrations were applied via Supabase MCP (tracked in Dashboard → Database → Migrations):

1. **fix_postal_codes_and_function_search_path** – Removed duplicate `search_za_postal_codes` overload, set `search_path = public` on `search_za_postal_codes` and `update_updated_at_column` (security).
2. **fix_profiles_address_role_and_create_user_profile** – Ensured `profiles.address` exists, expanded `profiles.role` check to include SMME, Admin, Super Admin, added `create_user_profile()` for signup, sent `NOTIFY pgrst, 'reload schema'`.
3. **add_messages_chat_id_foreign_key** – Added FK `messages.chat_id` → `chats.id`.
4. **enable_rls_and_baseline_policies** – Enabled RLS on profiles, tenants, opportunities, applications, events, news, resources, connections, messages, chats, chat_participants and created baseline policies (connections use `user_id` / `connected_user_id`).
5. **fix_progress_reports_rls_initplan** – Replaced `auth.uid()` with `(select auth.uid())` in progress_reports RLS policies for better performance.
6. **add_missing_fk_indexes** – Added indexes on FK columns for chat_participants, chats, events, news, opportunities, progress_reports, resources, tenants, messages.

Security advisors now show no RLS or function search_path issues. Optional: enable **Leaked password protection** in Supabase Dashboard → Authentication → Settings for stronger password checks.

Supabase MCP is in `mobile/.cursor/mcp.json` and `.cursor/mcp.json`. The diagnostic script uses `.env` and the Supabase JS client.
