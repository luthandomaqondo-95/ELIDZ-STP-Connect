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

/** Fetch distinct postal_code for a city from za_postal_codes (place_name). */
export async function fetchZaPostalCodesForCity(city: string, limit: number = 800): Promise<string[]> {
	if (!city || city === 'Other') return [];

	const variants = getCityVariants(city);
	const allCodes: string[] = [];

	for (const q of variants) {
		const { data, error } = await supabase
			.from('za_postal_codes')
			.select('postal_code')
			.eq('country_code', 'ZA')
			.ilike('place_name', `%${q}%`)
			.limit(Math.min(limit, 2000));

		if (error) {
			console.warn('Postal code query error:', error);
			continue;
		}

		const codes = (data ?? [])
			.map((r) => r.postal_code?.trim())
			.filter(Boolean) as string[];

		if (codes.length) {
			allCodes.push(...codes);
			break;
		}
	}

	return [...new Set(allCodes)].sort().slice(0, limit);
}

/** Fetch distinct provinces (admin_name1) from za_postal_codes. */
export async function fetchZaProvinces(): Promise<string[]> {
	const { data, error } = await supabase
		.from('za_postal_codes')
		.select('admin_name1')
		.eq('country_code', 'ZA')
		.not('admin_name1', 'is', null);

	if (error) {
		console.warn('fetchZaProvinces error:', error);
		return [];
	}

	return [...new Set(
		(data ?? [])
			.map((r) => r.admin_name1?.trim())
			.filter((n): n is string => Boolean(n) && n !== '')
	)].sort();
}

/** Fetch distinct cities (place_name) for a province from za_postal_codes. */
export async function fetchZaCitiesByProvince(province: string): Promise<string[]> {
	if (!province?.trim()) return [];
	const p = province.trim();
	const { data, error } = await supabase
		.from('za_postal_codes')
		.select('place_name')
		.eq('country_code', 'ZA')
		.ilike('admin_name1', p)
		.not('place_name', 'is', null)
		.limit(5000);

	if (error) {
		console.warn('fetchZaCitiesByProvince error:', error);
		return [];
	}

	const cities = [...new Set(
		(data ?? [])
			.map((r) => r.place_name?.trim())
			.filter((n): n is string => Boolean(n) && n !== '')
	)].sort();

	if (cities.length > 0 && !cities.includes('Other')) {
		cities.push('Other');
	}
	return cities;
}

