export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

export const MOBILE_ROLES = ["Entrepreneur", "SMME", "Student", "Tenant"] as const;
export type MobileRole = (typeof MOBILE_ROLES)[number];

export function isMobileRole(role: string): role is MobileRole {
  return (MOBILE_ROLES as readonly string[]).includes(role);
}
