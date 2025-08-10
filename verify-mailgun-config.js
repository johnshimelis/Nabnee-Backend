/**
 * Mailgun Configuration Verification Tool
 * 
 * This script tests your Mailgun configuration and helps diagnose issues
 */

require('dotenv').config();
const mailgun = require('mailgun-js');

console.log('------------------------------------------------------------');
console.log('MAILGUN CONFIGURATION VERIFICATION TOOL');
console.log('------------------------------------------------------------');

// Check environment variables
console.log('\n1. Checking environment variables:');
if (!process.env.MAILGUN_API_KEY) {
  console.log('❌ MAILGUN_API_KEY is not set in environment variables');
  console.log('   Please set your API key using:');
  console.log('   $env:MAILGUN_API_KEY="your-api-key-here" (PowerShell)');
  console.log('   or create a .env file with MAILGUN_API_KEY=your-api-key-here');
} else {
  const maskedKey = process.env.MAILGUN_API_KEY.substring(0, 6) + '**********';
  console.log(`✅ MAILGUN_API_KEY is set: ${maskedKey}`);
}

// Import and check email config
console.log('\n2. Checking email configuration:');
try {
  const emailConfig = require('./utils/email-config')();
  console.log(`✅ Email configuration loaded successfully`);
  console.log(`   Domain: ${emailConfig.domain}`);
  console.log(`   Host: ${emailConfig.host}`);
  
  // Check if using sandbox domain
  if (emailConfig.domain.includes('sandbox')) {
    console.log('\n⚠️  You are using a sandbox domain which can only send to authorized recipients!');
    console.log('   Make sure to authorize test recipients in your Mailgun dashboard.');
  }
  
  // Initialize Mailgun
  console.log('\n3. Initializing Mailgun client:');
  try {
    const mg = mailgun(emailConfig);
    console.log('✅ Mailgun client initialized successfully');
    
    // Test domain verification status
    console.log('\n4. Checking domain verification status:');
    mg.get(`/domains/${emailConfig.domain}`, (error, body) => {
      if (error) {
        console.log(`❌ Error retrieving domain information: ${error.message}`);
        console.log('   Please check if your API key has the correct permissions.');
        
        // Move to final output
        finalOutput(emailConfig);
      } else {
        console.log('✅ Domain information retrieved successfully');
        console.log(`   Domain: ${body.domain.name}`);
        console.log(`   State: ${body.domain.state}`);
        
        if (body.domain.state !== 'active') {
          console.log('\n⚠️  Your domain is not in active state! DNS records might not be set up correctly.');
        }
        
        // Check DNS records
        console.log('\n5. Checking DNS records:');
        if (body.domain.receiving_dns_records) {
          const missingRecords = body.domain.receiving_dns_records.filter(record => !record.valid);
          const missingSendingRecords = body.domain.sending_dns_records.filter(record => !record.valid);
          
          if (missingRecords.length > 0 || missingSendingRecords.length > 0) {
            console.log('❌ Missing or invalid DNS records detected:');
            
            [...missingRecords, ...missingSendingRecords].forEach(record => {
              if (!record.valid) {
                console.log(`   - ${record.record_type} record: ${record.name} (NOT CONFIGURED)`);
              }
            });
            
            console.log('\n   You need to add these DNS records to your domain provider.');
          } else {
            console.log('✅ All DNS records verified successfully');
          }
        }
        
        // Move to final output
        finalOutput(emailConfig);
      }
    });
  } catch (error) {
    console.log(`❌ Error initializing Mailgun client: ${error.message}`);
    finalOutput(emailConfig);
  }
} catch (error) {
  console.log(`❌ Error loading email configuration: ${error.message}`);
  finalOutput(null);
}

function finalOutput(emailConfig) {
  console.log('\n------------------------------------------------------------');
  console.log('SUMMARY & RECOMMENDATIONS');
  console.log('------------------------------------------------------------');
  
  if (!emailConfig) {
    console.log('❌ Your email configuration could not be loaded.');
    console.log('   Please check the email-config.js file and make sure it exports a valid configuration.');
  } else if (emailConfig.domain.includes('sandbox')) {
    console.log('⚠️  You are using a Mailgun sandbox domain:');
    console.log('   1. Sandbox domains can ONLY send to authorized recipients');
    console.log('   2. Go to Mailgun dashboard and authorize recipient email addresses');
    console.log('   3. Use the same authorized email in your tests');
    console.log('\n   For production, you should:');
    console.log('   1. Set up a custom domain like mail.nabnee.com');
    console.log('   2. Add all required DNS records');
    console.log('   3. Wait for verification (up to 48 hours)');
  } else {
    console.log('ℹ️  You are using a custom domain. Make sure:');
    console.log('   1. All DNS records are properly configured at your domain provider');
    console.log('   2. The domain shows as "Active" in Mailgun dashboard');
    console.log('   3. Your API key has the right permissions');
  }
  
  console.log('\nFor detailed instructions, see:');
  console.log('c:\\Projects\\esmael\\nabee\\backend\\mailgun-complete-setup-guide.md');
}
