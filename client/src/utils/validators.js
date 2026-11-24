/**
 * Client-Side Validation Utilities for JobScout
 * Standardizes form input validation across modals, forms, and calculators.
 */

// RFC simplified email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Standard 10-digit Indian mobile number
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validates an email address.
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 254) return 'Email must be between 5 and 254 characters';
  if (!EMAIL_REGEX.test(clean)) return 'Please enter a valid email address (e.g. name@example.com)';
  return null;
}

/**
 * Validates an Indian mobile number.
 */
export function validateIndianPhone(phone) {
  if (!phone) return 'Mobile number is required';
  let digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (!INDIAN_PHONE_REGEX.test(digits)) {
    return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
  }
  return null;
}

/**
 * Validates password strength (minimum 6 characters, recommend 8+ with mix).
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return null;
}

/**
 * Validates job posting inputs.
 */
export function validateJobForm({ title, salary, address, lat, lng }) {
  const errors = {};
  if (!title || title.trim().length < 3) {
    errors.title = 'Job Title must be at least 3 characters long';
  }
  if (!salary || salary.trim().length < 2) {
    errors.salary = 'Please enter a valid Salary / Compensation';
  }
  if (!address || address.trim().length < 3) {
    errors.address = 'Please enter a valid Location / Area name';
  }
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng) || nLat < 6 || nLat > 38 || nLng < 68 || nLng > 98) {
    errors.coords = 'Coordinates must be within India (Lat 6–38, Lng 68–98)';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates offer letter inputs.
 */
export function validateOfferForm({ candidateEmail, designation, salary }) {
  const errors = {};
  if (candidateEmail) {
    const emailErr = validateEmail(candidateEmail);
    if (emailErr) errors.candidateEmail = emailErr;
  }
  if (!designation || designation.trim().length < 2) {
    errors.designation = 'Please enter a valid designation (at least 2 characters)';
  }
  if (!salary || salary.trim().length < 2) {
    errors.salary = 'Please enter valid compensation terms (e.g. ₹15,00,000 / yr)';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates profile editing inputs.
 */
export function validateProfileForm({ name, email, phone }) {
  const errors = {};
  if (name !== undefined && name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters long';
  }
  if (email) {
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
  }
  if (phone) {
    const phoneErr = validateIndianPhone(phone);
    if (phoneErr) errors.phone = phoneErr;
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
