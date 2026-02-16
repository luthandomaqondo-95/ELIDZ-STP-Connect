import Constants from 'expo-constants';

// HTTPS endpoint (secure.geonames.org); free API over http is api.geonames.org
const GEONAMES_BASE = 'https://secure.geonames.org';
const username =
  Constants.expoConfig?.extra?.geonamesUsername ??
  process.env.EXPO_PUBLIC_GEONAMES_USERNAME ??
  'elidz';

export type PostalCodeResult = {
  postalCode?: string;
  postalcode?: string;
  placeName?: string;
  countryCode?: string;
  lat?: string;
  lng?: string;
};

type GeoNamesStatus = { message?: string; value?: number };

/**
 * Fetch postal codes for a place (city/town) in a country using GeoNames API.
 * API returns array as "postalcodes" (lowercase); each item has "postalcode" (lowercase).
 * On error, API returns { status: { message, value } } instead of postalcodes.
 */
export async function fetchPostalCodesForPlace(
  placename: string,
  countryCode: string = 'ZA'
): Promise<string[]> {
  const trimmed = placename.trim();
  if (!trimmed || trimmed === 'Other') {
    return [];
  }
  if (!username) {
    console.warn(
      'GeoNames username not set. Set EXPO_PUBLIC_GEONAMES_USERNAME or app.json extra.geonamesUsername for postal code lookup.'
    );
    return [];
  }

  // Try full name first, then variants (e.g. "Gqeberha (Port Elizabeth)" → try "Port Elizabeth", "Gqeberha")
  const placenamesToTry = [trimmed];
  const inParens = /\(([^)]+)\)/.exec(trimmed);
  if (inParens) {
    placenamesToTry.push(inParens[1].trim());
    const beforeParens = trimmed.replace(/\s*\([^)]+\)\s*/, '').trim();
    if (beforeParens) placenamesToTry.push(beforeParens);
  }

  let lastStatusMessage: string | null = null;

  for (const name of placenamesToTry) {
    const params = new URLSearchParams({
      placename: name,
      country: countryCode,
      username,
      maxRows: '100',
    });
    const url = `${GEONAMES_BASE}/postalCodeSearchJSON?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        continue;
      }
      const data = (await res.json()) as Record<string, unknown>;

      // API error response: { status: { message, value } }
      const status = data.status as GeoNamesStatus | undefined;
      if (status?.message != null) {
        lastStatusMessage = status.message;
        if (status.message.includes('not enabled')) {
          console.warn(
            'GeoNames: Enable the free webservice at https://www.geonames.org/manageaccount —',
            status.message
          );
        }
        continue;
      }

      // Success: "postalcodes" (lowercase) or "postalCodes"
      const list = (data.postalcodes ?? data.postalCodes) as PostalCodeResult[] | undefined;
      if (!list || !Array.isArray(list) || list.length === 0) {
        continue;
      }
      const codes = list
        .map((p) => (p.postalcode ?? p.postalCode)?.toString?.()?.trim())
        .filter(Boolean) as string[];
      if (codes.length > 0) {
        return [...new Set(codes)].sort();
      }
    } catch (e) {
      console.warn('GeoNames request failed:', e);
      continue;
    }
  }

  if (lastStatusMessage) {
    console.warn('GeoNames:', lastStatusMessage);
  }
  return [];
}
