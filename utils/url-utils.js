/**
 * URL Utility functions for creating custom URLs for business pages
 */
const BusinessUser = require("../models/model_business_user");

/**
 * Converts a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The URL-friendly slug
 */
const generateSlug = (text) => {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

/**
 * Checks if a custom URL already exists in the database
 * @param {string} customUrl - The URL to check
 * @returns {Promise<boolean>} - True if URL is available, false if taken
 */
const isCustomUrlAvailable = async (customUrl) => {
  if (!customUrl) return false;

  try {
    const existingUser = await BusinessUser.findOne({ custom_url: customUrl });
    return !existingUser; // Return true if no user found with this URL
  } catch (error) {
    console.error("Error checking URL availability:", error);
    return false;
  }
};

/**
 * Generates a unique slug for a business
 * If the slug is taken, appends a number to make it unique
 * @param {string} businessName - The business name to base the slug on
 * @returns {Promise<string>} - A unique URL slug
 */
const generateUniqueSlug = async (businessName) => {
  if (!businessName) return "";

  let baseSlug = generateSlug(businessName);
  let slug = baseSlug;
  let counter = 1;

  // Keep checking until we find an available slug
  while (!(await isCustomUrlAvailable(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety check to prevent infinite loops
    if (counter > 100) {
      // Generate a random suffix if we can't find an available slug
      slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
      break;
    }
  }

  return slug;
};

module.exports = {
  generateSlug,
  isCustomUrlAvailable,
  generateUniqueSlug,
};
