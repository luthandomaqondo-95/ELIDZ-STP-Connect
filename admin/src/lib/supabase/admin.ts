import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  const missingVars: string[] = [];

  if (!supabaseUrl?.trim()) {
    missingVars.push('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  }

  if (!supabaseServerKey?.trim()) {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing Supabase environment variables for admin client: ${missingVars.join(', ')}`
    );
  }

  const resolvedSupabaseUrl = supabaseUrl?.trim() ?? '';
  const resolvedSupabaseServerKey = supabaseServerKey?.trim() ?? '';

  return createClient(resolvedSupabaseUrl, resolvedSupabaseServerKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

