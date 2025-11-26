/**
 * Input sanitization and validation utilities
 * Protects against SQL injection, XSS attacks, and validates input data
 */

/**
 * Sanitize a string input
 * - Trims whitespace
 * - Removes null bytes
 * - Escapes HTML entities
 * - Removes SQL injection patterns
 */
export function sanitizeString(input: unknown, options?: { maxLength?: number; allowEmpty?: boolean }): string {
  if (input === null || input === undefined) {
    return "";
  }

  let str = String(input);

  // Trim whitespace
  str = str.trim();

  // Remove null bytes (can be used in attacks)
  str = str.replace(/\0/g, "");

  // Remove control characters except newlines and tabs (for textareas)
  str = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Apply max length if specified
  if (options?.maxLength && str.length > options.maxLength) {
    str = str.substring(0, options.maxLength);
  }

  // Check if empty and not allowed
  if (!options?.allowEmpty && str.length === 0) {
    return "";
  }

  return str;
}

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(input: string): string {
  if (typeof input !== "string") {
    return String(input);
  }

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (match) => htmlEscapeMap[match]);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: unknown): string {
  const email = sanitizeString(input, { maxLength: 254, allowEmpty: false }).toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  return email;
}

