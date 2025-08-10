/**
 * Validation utilities
 * Checks if passwords and emails meet minimum security requirements
 */

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Object containing validation result and reason if invalid
 */
const validatePassword = (password) => {
  // Simplified requirements
  const minLength = 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!password || password.length < minLength) {
    return {
      isValid: false,
      reason: `Password must be at least ${minLength} characters long`
    };
  }
  
  // Check for basic complexity (must have at least one letter and one number)
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      reason: "Password must contain at least one letter and one number"
    };
  }
  
  return { isValid: true };
};

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {Object} - Object containing validation result and reason if invalid
 */
const validateEmail = (email) => {
  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      reason: "Please enter a valid email address"
    };
  }
  
  return { isValid: true };
};

module.exports = {
  validatePassword,
  validateEmail
};
