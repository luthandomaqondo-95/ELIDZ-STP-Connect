-- Make the buckets that hold private user files non-public.
--
-- verification-documents: SMME ID documents, tax clearance, business registration.
-- chat-attachments:       files exchanged in private chats.
--
-- Both are currently public, so anyone holding (or guessing) an object URL can read them.
-- Rows keep storing the public-style object URL; the admin API and mobile BFF now return
-- short-lived signed URLs for these buckets (admin/src/lib/storage-signing.ts).
--
-- APPLY ONLY WHEN:
--   1. The admin deployment with storage-signing.ts is live (signed URLs on every read path).
--   2. Every mobile build in use reads chats/verifications via the BFF and includes the
--      message.tsx realtime change (refetch messages that carry an attachment).
--      Older builds that read these rows straight from Supabase will show broken files.
--
-- Uploads are unaffected: they already use signed upload URLs from the service role.

begin;

update storage.buckets
set public = false
where id in ('verification-documents', 'chat-attachments');

commit;

-- Also review storage.objects policies for these buckets: any policy granting SELECT to
-- `anon` (or to all `authenticated` users) would still expose the files after this change.
--   select policyname, roles, cmd, qual
--   from pg_policies
--   where schemaname = 'storage' and tablename = 'objects';

-- Rollback:
-- update storage.buckets set public = true
-- where id in ('verification-documents', 'chat-attachments');
