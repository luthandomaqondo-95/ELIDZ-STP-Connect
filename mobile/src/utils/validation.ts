/**
 * Shared validation helpers – use across auth and forms to avoid duplication.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$/;

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test((value ?? '').trim());
}

export function validateEmail(value: string): { valid: boolean; message?: string } {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return { valid: false, message: 'Please enter your email address' };
  if (!isValidEmail(trimmed)) return { valid: false, message: 'Please enter a valid email address (e.g. name@gmail.com)' };
  return { valid: true };
}

export function validatePassword(
  password: string,
  options: { minLength?: number } = {}
): { valid: boolean; message?: string } {
  const min = options.minLength ?? MIN_PASSWORD_LENGTH;
  if (!(password ?? '').trim()) return { valid: false, message: 'Please enter a password' };
  if (password.length < min) {
    return { valid: false, message: `Password must be at least ${min} characters` };
  }
  return { valid: true };
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): { valid: boolean; message?: string } {
  if (!confirm?.trim()) return { valid: false, message: 'Please confirm your password' };
  if (password !== confirm) return { valid: false, message: 'Passwords do not match' };
  return { valid: true };
}
