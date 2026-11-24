/**
 * JobScout Centralized Full-Stack Validation & Sanitization Engine
 * Provides RFC-compliant email, Indian mobile number, geographic bounding,
 * text sanitization, and entity validation helpers.
 */

// RFC 5322 simplified email validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Standard Indian mobile number regex (10 digits starting with 6, 7, 8, or 9)
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

// Geographic bounding box for the Indian subcontinent
export const INDIA_GEO_BOUNDS = {
  MIN_LAT: 6.0,
  MAX_LAT: 38.0,
  MIN_LNG: 68.0,
  MAX_LNG: 98.0
};

// Allowed application status transitions
export const VALID_APPLICATION_STATUSES = [
  'pending',
  'reviewed',
  'interview',
  'accepted',
  'rejected',
  'offered',
  'hired'
];

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Extracts and returns the normalized 10 digits of an Indian phone number string.
 * Strips +91 or leading 0 prefix if present.
 * @param {string|number} phone
 * @returns {string}
 */
export function cleanPhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Validates if the phone number is a valid 10-digit Indian mobile number.
 * @param {string|number} phone
 * @returns {boolean}
 */
export function isValidIndianPhone(phone) {
  const cleaned = cleanPhone(phone);
  return INDIAN_PHONE_REGEX.test(cleaned);
}

/**
 * Validates if coordinates are finite numbers within the Indian landmass.
 * @param {number|string} lat
 * @param {number|string} lng
 * @returns {boolean}
 */
export function isWithinIndiaCoords(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return false;
  return (
    nLat >= INDIA_GEO_BOUNDS.MIN_LAT &&
    nLat <= INDIA_GEO_BOUNDS.MAX_LAT &&
    nLng >= INDIA_GEO_BOUNDS.MIN_LNG &&
    nLng <= INDIA_GEO_BOUNDS.MAX_LNG
  );
}

/**
 * Strips dangerous HTML/script tags and trims whitespace.
 * @param {string} input
 * @param {number} [maxLength=2000]
 * @returns {string}
 */
export function sanitizeString(input, maxLength = 2000) {
  if (input === null || input === undefined) return '';
  let str = String(input).trim();
  // Strip dangerous script and event handler tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  str = str.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  str = str.replace(/on\w+="[^"]*"/gi, '');
  str = str.replace(/on\w+='[^']*'/gi, '');
  return str.slice(0, maxLength);
}

/**
 * Sanitizes and normalizes a list of skills.
 * Supports string arrays or comma-delimited strings.
 * @param {Array<string>|string} skills
 * @param {number} [maxCount=40]
 * @param {number} [maxItemLength=50]
 * @returns {Array<string>}
 */
export function sanitizeSkills(skills, maxCount = 40, maxItemLength = 50) {
  let list = [];
  if (Array.isArray(skills)) {
    list = skills;
  } else if (typeof skills === 'string') {
    list = skills.split(',');
  }
  return list
    .map(s => sanitizeString(s, maxItemLength))
    .filter(s => s.length >= 1)
    .slice(0, maxCount);
}

/**
 * Validates salary text or number representation.
 * @param {string|number} salary
 * @returns {boolean}
 */
export function isValidSalary(salary) {
  if (salary === null || salary === undefined) return false;
  const str = String(salary).trim();
  return str.length >= 2 && str.length <= 100;
}

/**
 * Validates a job posting creation/update payload.
 * Returns { valid: boolean, errors: string[], sanitized?: object }
 */
export function validateJobPayload(body) {
  const errors = [];
  const title = sanitizeString(body?.title, 150);
  const company = sanitizeString(body?.company, 150);
  const salary = sanitizeString(body?.salary, 100);
  const description = sanitizeString(body?.description, 5000);
  const address = sanitizeString(body?.address, 250);
  const category = sanitizeString(body?.category || 'Technology', 60);
  const jobType = sanitizeString(body?.jobType || 'Full-time', 50);

  if (title.length < 3) {
    errors.push('Job title must be at least 3 characters long');
  }
  if (!isValidSalary(salary)) {
    errors.push('Valid salary information is required');
  }
  if (!isWithinIndiaCoords(body?.lat, body?.lng)) {
    errors.push('Valid job coordinates within India (Lat 6–38, Lng 68–98) are required');
  }

  const skills = sanitizeSkills(body?.skills);

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      title,
      company,
      salary,
      description,
      address,
      category,
      jobType,
      lat: Number(body?.lat),
      lng: Number(body?.lng),
      skills,
      urgent: Boolean(body?.urgent)
    }
  };
}

/**
 * Validates an offer letter issuance payload.
 */
export function validateOfferPayload(body) {
  const errors = [];
  const candidateEmail = sanitizeString(body?.candidateEmail, 150).toLowerCase();
  const designation = sanitizeString(body?.designation, 120);
  const salary = sanitizeString(body?.salary || body?.salaryOffered, 100);
  const joiningDate = sanitizeString(body?.joiningDate, 100);
  const location = sanitizeString(body?.location, 200);
  const terms = sanitizeString(body?.terms, 2000);
  const customNote = sanitizeString(body?.customNote, 1000);

  if (candidateEmail && !isValidEmail(candidateEmail)) {
    errors.push('A valid candidate email address is required');
  }
  if (designation && designation.length < 2) {
    errors.push('Job designation must be at least 2 characters long');
  }
  if (salary && salary.length < 2) {
    errors.push('Valid compensation / salary is required');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      candidateEmail,
      designation,
      salary,
      joiningDate,
      location,
      terms,
      customNote
    }
  };
}

/**
 * Validates user profile update payload.
 */
export function validateProfilePayload(body) {
  const errors = [];
  const updates = {};

  if (body?.email !== undefined) {
    const email = sanitizeString(body.email, 150).toLowerCase();
    if (email && !isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    } else {
      updates.email = email;
    }
  }

  if (body?.phone !== undefined) {
    const cleaned = cleanPhone(body.phone);
    if (cleaned && !isValidIndianPhone(cleaned)) {
      errors.push('Please enter a valid 10-digit Indian phone number');
    } else if (cleaned) {
      updates.phone = `+91 ${cleaned}`;
    }
  }

  if (body?.name !== undefined) {
    const name = sanitizeString(body.name, 100);
    if (name.length < 2) {
      errors.push('Full name must be at least 2 characters long');
    } else {
      updates.name = name;
    }
  }

  if (body?.title !== undefined) updates.title = sanitizeString(body.title, 100);
  if (body?.bio !== undefined) updates.bio = sanitizeString(body.bio, 2000);
  if (body?.skills !== undefined) updates.skills = sanitizeSkills(body.skills);
  if (body?.experience !== undefined) updates.experience = sanitizeString(body.experience, 60);
  if (body?.expectedSalary !== undefined) updates.expectedSalary = sanitizeString(body.expectedSalary, 60);
  if (body?.availability !== undefined) updates.availability = sanitizeString(body.availability, 60);
  if (body?.companyName !== undefined) updates.companyName = sanitizeString(body.companyName, 100);
  if (body?.website !== undefined) updates.website = sanitizeString(body.website, 200);
  if (body?.address !== undefined) updates.address = sanitizeString(body.address, 250);
  if (body?.avatar !== undefined) updates.avatar = sanitizeString(body.avatar, 300);

  return {
    valid: errors.length === 0,
    errors,
    sanitized: updates
  };
}
