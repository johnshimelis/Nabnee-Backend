require("dotenv").config();

// This file is kept for backward compatibility but no longer used
// All email functionality now uses Mailjet service

module.exports = () => {
  console.log("email-config.js is deprecated - using Mailjet service instead");
  return null;
};
