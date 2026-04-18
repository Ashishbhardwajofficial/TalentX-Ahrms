// ============================================================================
// FIELD LENGTH CONSTANTS
// Aligned with database schema VARCHAR and TEXT constraints
// ============================================================================

export const FIELD_LENGTHS = {
  // ISO codes (critical - must match database exactly)
  COUNTRY_CODE: 2,        // ISO 3166-1 alpha-2
  CURRENCY_CODE: 3,       // ISO 4217

  // Identification fields
  EMPLOYEE_NUMBER: 50,
  PHONE_NUMBER: 20,
  MOBILE_NUMBER: 20,
  POSTAL_CODE: 20,

  // Name fields
  FIRST_NAME: 100,
  MIDDLE_NAME: 100,
  LAST_NAME: 100,
  PREFERRED_NAME: 100,
  USERNAME: 100,

  // Code fields
  DEPARTMENT_CODE: 50,
  ROLE_CODE: 50,
  PERMISSION_CODE: 50,
  COST_CENTER: 50,
  JOB_LEVEL: 50,
  TIMEZONE: 50,
  CATEGORY: 50,
  TAX_ID: 50,

  // Standard fields (255 characters)
  EMAIL: 255,
  NAME: 255,
  LEGAL_NAME: 255,
  JOB_TITLE: 255,
  CITY: 100,
  STATE_PROVINCE: 100,
  INDUSTRY: 100,

  // URL fields (need more space)
  URL: 500,
  PROFILE_PICTURE_URL: 500,
  LOGO_URL: 500,

  // TEXT fields (no limit, but good to have reasonable max for UI)
  BIO: 5000,
  DESCRIPTION: 5000,
  NOTES: 5000,
  REASON: 1000,
  COMMENTS: 2000,
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates that a field value does not exceed the maximum length
 * @param value - The value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field (for error message)
 * @returns Error message if validation fails, null if valid
 */
export const validateFieldLength = (
  value: string | undefined | null,
  maxLength: number,
  fieldName: string
): string | null => {
  if (!value) return null; // Empty values are handled by required validation

  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters (current: ${value.length})`;
  }

  return null;
};

/**
 * Validates ISO 3166-1 alpha-2 country code (2 uppercase letters)
 * Examples: IN, US, GB, CA, AU
 * @param code - Country code to validate
 * @returns true if valid, false otherwise
 */
export const validateISOCountryCode = (code: string | undefined | null): boolean => {
  if (!code) return false;
  return /^[A-Z]{2}$/.test(code);
};

/**
 * Validates ISO 4217 currency code (3 uppercase letters)
 * Examples: INR, USD, EUR, GBP, JPY
 * @param code - Currency code to validate
 * @returns true if valid, false otherwise
 */
export const validateISOCurrencyCode = (code: string | undefined | null): boolean => {
  if (!code) return false;
  return /^[A-Z]{3}$/.test(code);
};

/**
 * Gets a user-friendly error message for ISO country code validation
 * @param code - The invalid country code
 * @returns Error message
 */
export const getCountryCodeError = (code: string | undefined | null): string => {
  if (!code) return 'Country code is required';
  if (code.length !== 2) return 'Country code must be exactly 2 characters (ISO 3166-1 alpha-2)';
  if (!/^[A-Z]{2}$/.test(code)) return 'Country code must be 2 uppercase letters (e.g., IN, US, GB)';
  return 'Invalid country code';
};

/**
 * Gets a user-friendly error message for ISO currency code validation
 * @param code - The invalid currency code
 * @returns Error message
 */
export const getCurrencyCodeError = (code: string | undefined | null): string => {
  if (!code) return 'Currency code is required';
  if (code.length !== 3) return 'Currency code must be exactly 3 characters (ISO 4217)';
  if (!/^[A-Z]{3}$/.test(code)) return 'Currency code must be 3 uppercase letters (e.g., INR, USD, EUR)';
  return 'Invalid currency code';
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= FIELD_LENGTHS.EMAIL;
};

/**
 * Validates phone number format (Indian format)
 * Accepts: +91-XXXXXXXXXX, +91XXXXXXXXXX, XXXXXXXXXX
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export const validatePhoneNumber = (phone: string | undefined | null): boolean => {
  if (!phone) return false;

  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s-]/g, '');

  // Indian phone number: +91 followed by 10 digits, or just 10 digits
  const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;

  return indianPhoneRegex.test(cleaned) && phone.length <= FIELD_LENGTHS.PHONE_NUMBER;
};

/**
 * Validates Indian postal code (PIN code)
 * Format: 6 digits
 * @param postalCode - Postal code to validate
 * @returns true if valid, false otherwise
 */
export const validateIndianPostalCode = (postalCode: string | undefined | null): boolean => {
  if (!postalCode) return false;
  return /^\d{6}$/.test(postalCode);
};

/**
 * Validates employee number format
 * Alphanumeric, may include dashes and underscores
 * @param employeeNumber - Employee number to validate
 * @returns true if valid, false otherwise
 */
export const validateEmployeeNumber = (employeeNumber: string | undefined | null): boolean => {
  if (!employeeNumber) return false;

  // Alphanumeric with optional dashes/underscores
  const regex = /^[A-Za-z0-9_-]+$/;

  return regex.test(employeeNumber) && employeeNumber.length <= FIELD_LENGTHS.EMPLOYEE_NUMBER;
};

/**
 * Validates URL format
 * @param url - URL to validate
 * @param maxLength - Maximum length (default: FIELD_LENGTHS.URL)
 * @returns true if valid, false otherwise
 */
export const validateUrl = (
  url: string | undefined | null,
  maxLength: number = FIELD_LENGTHS.URL
): boolean => {
  if (!url) return false;

  try {
    new URL(url);
    return url.length <= maxLength;
  } catch {
    return false;
  }
};

/**
 * Validates that a number is within a range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param fieldName - Name of the field (for error message)
 * @returns Error message if validation fails, null if valid
 */
export const validateNumberRange = (
  value: number | undefined | null,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  if (value === undefined || value === null) return null;

  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }

  return null;
};

/**
 * Validates that a date is not in the future
 * @param date - Date string to validate (ISO format)
 * @param fieldName - Name of the field (for error message)
 * @returns Error message if validation fails, null if valid
 */
export const validateNotFutureDate = (
  date: string | undefined | null,
  fieldName: string
): string | null => {
  if (!date) return null;

  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  if (inputDate > today) {
    return `${fieldName} cannot be in the future`;
  }

  return null;
};

/**
 * Validates that a date is not in the past
 * @param date - Date string to validate (ISO format)
 * @param fieldName - Name of the field (for error message)
 * @returns Error message if validation fails, null if valid
 */
export const validateNotPastDate = (
  date: string | undefined | null,
  fieldName: string
): string | null => {
  if (!date) return null;

  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  if (inputDate < today) {
    return `${fieldName} cannot be in the past`;
  }

  return null;
};

/**
 * Validates that end date is after start date
 * @param startDate - Start date string (ISO format)
 * @param endDate - End date string (ISO format)
 * @returns Error message if validation fails, null if valid
 */
export const validateDateRange = (
  startDate: string | undefined | null,
  endDate: string | undefined | null
): string | null => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return 'End date must be after start date';
  }

  return null;
};

// ============================================================================
// COMMON INDIAN CONTEXT VALIDATORS
// ============================================================================

/**
 * List of valid Indian state/UT codes
 */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

/**
 * Validates Indian IFSC code format
 * Format: 4 letters (bank code) + 0 + 6 alphanumeric (branch code)
 * Example: SBIN0001234
 * @param ifscCode - IFSC code to validate
 * @returns true if valid, false otherwise
 */
export const validateIFSCCode = (ifscCode: string | undefined | null): boolean => {
  if (!ifscCode) return false;
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode);
};

/**
 * Validates Indian PAN (Permanent Account Number) format
 * Format: 5 letters + 4 digits + 1 letter
 * Example: ABCDE1234F
 * @param pan - PAN to validate
 * @returns true if valid, false otherwise
 */
export const validatePAN = (pan: string | undefined | null): boolean => {
  if (!pan) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
};

/**
 * Validates Indian Aadhaar number format
 * Format: 12 digits
 * @param aadhaar - Aadhaar number to validate
 * @returns true if valid, false otherwise
 */
export const validateAadhaar = (aadhaar: string | undefined | null): boolean => {
  if (!aadhaar) return false;
  // Remove spaces for validation
  const cleaned = aadhaar.replace(/\s/g, '');
  return /^\d{12}$/.test(cleaned);
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  FIELD_LENGTHS,
  validateFieldLength,
  validateISOCountryCode,
  validateISOCurrencyCode,
  getCountryCodeError,
  getCurrencyCodeError,
  validateEmail,
  validatePhoneNumber,
  validateIndianPostalCode,
  validateEmployeeNumber,
  validateUrl,
  validateNumberRange,
  validateNotFutureDate,
  validateNotPastDate,
  validateDateRange,
  INDIAN_STATES,
  validateIFSCCode,
  validatePAN,
  validateAadhaar,
};
