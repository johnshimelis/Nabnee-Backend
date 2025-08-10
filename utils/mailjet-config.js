const Mailjet = require("node-mailjet");

module.exports = () => {
  // Debug log for Mailjet configuration
  console.log("Mailjet Configuration:");
  console.log("MAILJET_API_KEY exists:", !!process.env.MAILJET_API_KEY);
  console.log("MAILJET_SECRET_KEY exists:", !!process.env.MAILJET_SECRET_KEY);
  console.log("MAILJET_FROM_EMAIL:", process.env.MAILJET_FROM_EMAIL || "noreply@nabnee.com");
  
  if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
    console.warn("WARNING: Mailjet API keys are missing! Emails will not be sent.");
    console.warn("Please set MAILJET_API_KEY and MAILJET_SECRET_KEY environment variables.");
    
    // Return a mock client that logs instead of sending when keys are missing
    return {
      post: () => ({
        request: async () => {
          console.log("Email sending skipped - missing API keys");
          return { 
            body: { 
              Messages: [{ To: [{ MessageID: "mock-id-no-keys" }] }] 
            } 
          };
        }
      })
    };
  }

  const mailjetClient = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY,
  });

  return mailjetClient;
};
