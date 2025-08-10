/**
 * Middleware to ensure usernames can't be modified after creation
 */

module.exports = {
  /**
   * Removes user_public_name from request body to prevent it from being updated
   */
  preserveUsername: (req, res, next) => {
    // For update operations, remove user_public_name from the request
    // to ensure it cannot be modified
    if (req.body && req.method !== "POST") {
      // Delete the field to prevent any update
      delete req.body.user_public_name;
    }
    next();
  },
};
