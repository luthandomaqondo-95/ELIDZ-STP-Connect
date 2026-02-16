#!/usr/bin/env node
/**
 * Supabase diagnostic script – uses same .env as the app to test tables and RPCs.
 * Run from mobile/: node scripts/supabase-diagnose.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load .env manually (no dotenv dependency required)
try {
  const envPath = join(root, '.env');
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["']?([^"'\n#]*)["']?\s*$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
} catch (e) {
  console.warn('Could not load .env:', e.message);
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

const results = { ok: [], fail: [] };

function report(name, ok, detail) {
  const entry = { name, detail };
  if (ok) results.ok.push(entry);
  else results.fail.push(entry);
}

async function run() {
  console.log('Supabase diagnostic (project:', url.replace(/https?:\/\//, '').split('.')[0], ')\n');

  // 1. Dashboard: tenants
  try {
    const { data, error } = await supabase.from('tenants').select('id,name').limit(3);
    if (error) throw error;
    report('tenants (dashboard)', true, `count: ${data?.length ?? 0}`);
  } catch (e) {
    report('tenants (dashboard)', false, e.message);
  }

  // 2. Dashboard: opportunities (exact same query as OpportunityService.getOpportunities)
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*, posted_by(organization, name)')
      .eq('status', 'active');
    if (error) throw error;
    report('opportunities with posted_by join', true, `count: ${data?.length ?? 0}`);
  } catch (e) {
    const detail = e?.message || e?.details || e?.code || JSON.stringify(e);
    report('opportunities with posted_by join', false, detail);
    if (e?.message) console.error('Opportunities error details:', e);
  }

  // 3. Dashboard: events
  try {
    const { data, error } = await supabase.from('events').select('id,title').limit(3);
    if (error) throw error;
    report('events (dashboard)', true, `count: ${data?.length ?? 0}`);
  } catch (e) {
    report('events (dashboard)', false, e.message);
  }

  // 4. Postal codes RPC (signup)
  try {
    const { data, error } = await supabase.rpc('search_za_postal_codes', {
      p_limit: 10,
      p_query: 'Cape Town',
    });
    if (error) throw error;
    const count = Array.isArray(data) ? data.length : 0;
    report('search_za_postal_codes RPC', true, `Cape Town: ${count} codes`);
  } catch (e) {
    report('search_za_postal_codes RPC', false, e.message);
  }

  // 5. Progress reports: applications + progress_reports
  try {
    const { data: apps, error: e1 } = await supabase
      .from('applications')
      .select('id')
      .limit(1);
    if (e1) throw e1;
    report('applications (progress reports)', true, 'accessible');
  } catch (e) {
    report('applications (progress reports)', false, e.message);
  }

  try {
    const { data: reports, error: e2 } = await supabase
      .from('progress_reports')
      .select('id')
      .limit(1);
    if (e2) throw e2;
    report('progress_reports', true, 'accessible');
  } catch (e) {
    report('progress_reports', false, e.message);
  }

  // 6. News (for "Failed to load news")
  try {
    const { data, error } = await supabase.from('news').select('id,title').limit(3);
    if (error) throw error;
    report('news', true, `count: ${data?.length ?? 0}`);
  } catch (e) {
    report('news', false, e.message);
  }

  // 7. List tables (via a simple query – Supabase doesn't expose info_schema to anon by default)
  console.log('--- Results ---\n');
  for (const { name, detail } of results.ok) {
    console.log('OK   ', name, '—', detail);
  }
  for (const { name, detail } of results.fail) {
    console.log('FAIL ', name, '—', detail);
  }
  if (results.fail.length > 0) {
    console.log('\nThese failures likely cause "error loading data" in the app.');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
