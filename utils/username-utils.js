/**
 * Utilities for generating and validating usernames
 */

const uniqid = require("uniqid");

/**
 * Sanitizes a string to create a valid username
 * Removes special characters, replaces spaces with underscores
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string suitable for a username
 */
function sanitizeUsername(input) {
  if (!input) return "";

  // Convert to lowercase, replace spaces with underscores
  let username = input.toLowerCase().trim().replace(/\s+/g, "_");

  // Remove any characters that aren't alphanumeric or underscores
  username = username.replace(/[^a-z0-9_]/g, "");

  // Remove multiple consecutive underscores
  username = username.replace(/_+/g, "_");

  // Remove leading and trailing underscores
  username = username.replace(/^_+|_+$/g, "");

  return username;
}

/**
 * Generates a username from an email address
 * @param {string} email - Email address to generate username from
 * @returns {string} - Username based on email
 */
function generateUniqueUsername(email) {
  if (!email) {
    return "user_" + uniqid().substring(0, 8);
  }

  // Extract the part before @ in the email
  let username = email.split("@")[0];

  // Sanitize the username
  username = sanitizeUsername(username);

  // Make sure it's at least 3 characters
  if (username.length < 3) {
    username = "user_" + username;
  }

  return username;
}

module.exports = {
  sanitizeUsername,
  generateUniqueUsername,
};
