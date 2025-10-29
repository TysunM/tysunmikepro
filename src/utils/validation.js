/**
 * Input validation utilities
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { valid: boolean, message: string }
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long' };
  }
  
  return { valid: true, message: 'Password is valid' };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove < and > to prevent basic XSS
}

/**
 * Validate project package type
 * @param {string} packageType
 * @returns {boolean}
 */
export function isValidPackage(packageType) {
  const validPackages = ['basic', 'pro', 'master'];
  return validPackages.includes(packageType);
}

/**
 * Validate project size
 * @param {string} size
 * @returns {boolean}
 */
export function isValidSize(size) {
  const validSizes = ['normal', 'large'];
  return validSizes.includes(size);
}

/**
 * Validate project status
 * @param {string} status
 * @returns {boolean}
 */
export function isValidStatus(status) {
  const validStatuses = ['intake', 'mixing', 'mastering', 'revisions', 'delivered'];
  return validStatuses.includes(status);
}

