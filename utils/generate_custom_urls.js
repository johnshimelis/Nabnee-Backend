/**
 * Migration script to generate custom URLs for existing business users
 * 
 * This script will:
 * 1. Find all business users without a custom URL
 * 2. Generate a custom URL based on their business name
 * 3. Update the user record with the custom URL
 * 
 * Usage: node generate_custom_urls.js
 */

const mongoose = require('mongoose');
const config = require('../config/config');

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  migrateCustomUrls();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import the Business User model
const BusinessUser = require('../models/model_business_user');

// Helper function to sanitize a string to a valid URL
function sanitizeCustomUrl(input) {
  if (!input) return null;
  // Convert to lowercase and replace spaces with hyphens
  let url = input.toLowerCase().trim().replace(/\s+/g, '-');
  // Remove any non-alphanumeric characters except hyphens
  url = url.replace(/[^a-z0-9-]/g, '');
  // Remove multiple consecutive hyphens
  url = url.replace(/-+/g, '-');
  // Remove leading and trailing hyphens
  url = url.replace(/^-+|-+$/g, '');
  return url;
}

// Function to validate a custom URL
function validateCustomUrl(url) {
  if (!url) {
    return { isValid: false, reason: 'URL cannot be empty' };
  }
  
  if (url.length < 3) {
    return { isValid: false, reason: 'URL must be at least 3 characters long' };
  }
  
  if (url.length > 50) {
    return { isValid: false, reason: 'URL cannot exceed 50 characters' };
  }
  
  // Check that URL only contains alphanumeric characters and hyphens
  if (!/^[a-z0-9-]+$/.test(url)) {
    return { isValid: false, reason: 'URL can only contain lowercase letters, numbers, and hyphens' };
  }
  
  // URL cannot start or end with a hyphen
  if (url.startsWith('-') || url.endsWith('-')) {
    return { isValid: false, reason: 'URL cannot start or end with a hyphen' };
  }
  
  return { isValid: true };
}

// Function to check if a custom URL is already in use by another user
async function isCustomUrlAvailable(customUrl, userId) {
  try {
    const existingUser = await BusinessUser.findOne({ custom_url: customUrl });
    // URL is available if no user has it, or if the user who has it is the same as the one we're checking
    return !existingUser || existingUser.user_id === userId;
  } catch (error) {
    console.error('Error checking URL availability:', error);
    return false;
  }
}

// Function to generate a unique custom URL from a base URL
async function generateUniqueCustomUrl(baseUrl, userId) {
  let customUrl = baseUrl;
  let suffix = 1;
  
  while (!(await isCustomUrlAvailable(customUrl, userId))) {
    // URL is already taken, add a suffix
    customUrl = `${baseUrl}-${suffix}`;
    suffix++;
    
    // Prevent infinite loops
    if (suffix > 100) {
      console.error(`Couldn't find a unique URL for user ${userId} after 100 attempts`);
      return null;
    }
  }
  
  return customUrl;
}

// Main migration function
async function migrateCustomUrls() {
  try {
    // Find all business users without a custom URL
    const businessUsers = await BusinessUser.find({ 
      user_type: 'Business',
      $or: [
        { custom_url: { $exists: false } },
        { custom_url: null },
        { custom_url: '' }
      ]
    });
    
    console.log(`Found ${businessUsers.length} business users without a custom URL`);
    
    // Track the number of successful updates
    let updatedCount = 0;
    
    // Process each user
    for (const user of businessUsers) {
      // Try to generate a custom URL from the business name first
      let baseUrl = null;
      
      if (user.business_name_english) {
        baseUrl = sanitizeCustomUrl(user.business_name_english);
      } else if (user.business_name_arabic) {
        baseUrl = sanitizeCustomUrl(user.business_name_arabic);
      } else if (user.user_public_name) {
        baseUrl = sanitizeCustomUrl(user.user_public_name);
      } else if (user.user_name) {
        baseUrl = sanitizeCustomUrl(user.user_name);
      }
      
      // Skip if we couldn't generate a base URL
      if (!baseUrl) {
        console.log(`Skipping user ${user.user_id} - couldn't generate a base URL`);
        continue;
      }
      
      // Validate the URL
      const validation = validateCustomUrl(baseUrl);
      if (!validation.isValid) {
        console.log(`Skipping user ${user.user_id} - invalid base URL: ${validation.reason}`);
        continue;
      }
      
      // Generate a unique URL
      const customUrl = await generateUniqueCustomUrl(baseUrl, user.user_id);
      if (!customUrl) {
        console.log(`Skipping user ${user.user_id} - couldn't generate a unique URL`);
        continue;
      }
      
      // Update the user
      await BusinessUser.updateOne(
        { user_id: user.user_id },
        { custom_url: customUrl }
      );
      
      console.log(`Updated user ${user.user_id} with custom URL: ${customUrl}`);
      updatedCount++;
    }
    
    console.log(`Migration complete. Updated ${updatedCount} out of ${businessUsers.length} business users.`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}
