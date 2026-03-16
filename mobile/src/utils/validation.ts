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

/**
 * South African ID number validation.
 * Format: YYMMDDGSSSCAZ (13 digits)
 * - YYMMDD: Date of birth
 * - G: Gender (0-4 Female, 5-9 Male)
 * - SSS: Serial number
 * - C: Citizenship (0 = SA citizen, 1 = permanent resident)
 * - A: Usually 8 or 9
 * - Z: Luhn checksum digit
 */
export function validateIdNumber(value: string): { valid: boolean; message?: string } {
  const trimmed = (value ?? '').trim().replace(/\s/g, '');
  if (!trimmed) return { valid: false, message: 'Please enter your ID number' };
  if (!/^\d{13}$/.test(trimmed)) {
    return { valid: false, message: 'ID number must be exactly 13 digits (numbers only)' };
  }

  // Validate date of birth (YYMMDD)
  const yy = parseInt(trimmed.slice(0, 2), 10);
  const mm = parseInt(trimmed.slice(2, 4), 10);
  const dd = parseInt(trimmed.slice(4, 6), 10);
  if (mm < 1 || mm > 12) {
    return { valid: false, message: 'Invalid ID number: invalid month' };
  }
  const daysInMonth = new Date(2000 + (yy > 49 ? yy - 100 : yy), mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) {
    return { valid: false, message: 'Invalid ID number: invalid date' };
  }

  // Luhn algorithm (mod 10) for checksum
  let sum = 0;
  let alternate = false;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    let n = parseInt(trimmed[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  if (sum % 10 !== 0) {
    return { valid: false, message: 'Invalid ID number: checksum failed' };
  }

  return { valid: true };
}
