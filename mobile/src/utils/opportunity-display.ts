/** Escape string for safe use inside a RegExp (incl. hyphen). */
function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
}

/**
 * Removes a duplicated organization name next to a separator (hyphen, dash, pipe, colon).
 * e.g. "ACME - Graduate Programme" + org "ACME" → "Graduate Programme"
 */
export function formatOpportunityDisplayTitle(
	title: string | undefined | null,
	org?: string | null
): string {
	if (title == null) return '';
	const original = String(title).trim();
	if (!original) return original;
	const o = org?.trim();
	if (!o) return original;

	// Hyphen, en dash, em dash, pipe, ASCII/full-width colon, middle dot
	const sepClass = '[-–—|:：·]';

	const escaped = escapeRegExp(o);
	const rePrefix = new RegExp(`^${escaped}\\s*${sepClass}\\s*`, 'i');
	const reSuffix = new RegExp(`\\s*${sepClass}\\s*${escaped}$`, 'i');

	let t = original;
	for (let i = 0; i < 3; i++) {
		const next = t.replace(rePrefix, '').replace(reSuffix, '').trim();
		if (next === t) break;
		t = next;
	}
	return t || original;
}
