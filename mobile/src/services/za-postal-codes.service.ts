import { supabase } from '@/lib/supabase';

function getCityVariants(city: string): string[] {
  const trimmed = city.trim();
  if (!trimmed) return [];

  const variants: string[] = [trimmed];

  const inParens = /\(([^)]+)\)/.exec(trimmed);
  if (inParens) {
    variants.push(inParens[1].trim());
    const beforeParens = trimmed.replace(/\s*\([^)]+\)\s*/, '').trim();
    if (beforeParens) variants.push(beforeParens);
  }

  // Deduplicate while preserving order
  return variants.filter((v, idx) => variants.indexOf(v) === idx);
}

export async function fetchZaPostalCodesForCity(city: string, limit: number = 800): Promise<string[]> {
  if (!city || city === 'Other') return [];

  const variants = getCityVariants(city);
  const allCodes: string[] = [];

  for (const q of variants) {
    const { data, error } = await supabase.rpc('search_za_postal_codes', {
      p_limit: Math.min(Math.max(limit, 1), 2000),
      p_query: q,
    });
  console.log('Postal RPC', { q, data: data?.length, error: error?.message });
    if (error) {
      // If RPC doesn't exist yet (before SQL applied), surface a helpful message.
      console.warn('Postal code RPC error:', error);
      continue;
    }

    const codes = (data as Array<{ postal_code?: string; postalCode?: string }> | null)
      ?.map((r) => (r.postal_code ?? r.postalCode)?.toString().trim())
      .filter(Boolean) as string[] | undefined;

    if (codes?.length) {
      allCodes.push(...codes);
      break; // first variant with results wins
    }
  }

  return [...new Set(allCodes)].sort();
}

