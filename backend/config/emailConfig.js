// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// dotenv.config();

// // Validate and convert port
// const emailPort = parseInt(process.env.EMAIL_PORT, 10);
// if (isNaN(emailPort)) {
//   throw new Error(`Invalid EMAIL_PORT: ${process.env.EMAIL_PORT}. Must be a number.`);
// }

// // Determine secure flag based on port (465 = SSL, 587 = STARTTLS)
// const isSecure = emailPort === 465;

// // Validate required environment variables
// if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
//   throw new Error('Missing required email environment variables: EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM');
// }

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: emailPort,
//   secure: isSecure, // true for 465 (SSL), false for 587 (STARTTLS)
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
//   // Brevo requires STARTTLS for port 587
//   requireTLS: !isSecure, // Enable STARTTLS for port 587
//   tls: {
//     // Do not fail on invalid certificates
//     rejectUnauthorized: false
//   }
// });

// module.exports = transporter;


// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// dotenv.config();

// // Validate required environment variables
// const requiredVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'EMAIL_PORT'];
// const missingVars = requiredVars.filter(varName => !process.env[varName]);

// if (missingVars.length > 0) {
//   throw new Error(`Missing required email environment variables: ${missingVars.join(', ')}`);
// }

// // Validate and convert port
// const emailPort = parseInt(process.env.EMAIL_PORT, 10);
// if (isNaN(emailPort)) {
//   throw new Error(`Invalid EMAIL_PORT: ${process.env.EMAIL_PORT}. Must be a number (587 or 465).`);
// }

// // Validate port is correct for Brevo
// if (![587, 465, 2525].includes(emailPort)) {
//   console.warn(`Warning: Brevo recommends using port 587, 465, or 2525. You're using: ${emailPort}`);
// }

// // Determine secure flag based on port
// // 465 = SSL (secure: true)
// // 587 = STARTTLS (secure: false, but requireTLS: true)
// const isSecure = emailPort === 465;

// // Validate Brevo host
// const validBrevoHosts = ['smtp-relay.brevo.com', 'smtp-relay.sendinblue.com'];
// if (!validBrevoHosts.includes(process.env.EMAIL_HOST.trim().toLowerCase())) {
//   console.warn(`Warning: Email host should be "smtp-relay.brevo.com". Current: ${process.env.EMAIL_HOST}`);
// }

// console.log('Email Configuration:');
// console.log(`- Host: ${process.env.EMAIL_HOST}`);
// console.log(`- Port: ${emailPort}`);
// console.log(`- Secure: ${isSecure}`);
// console.log(`- User: ${process.env.EMAIL_USER}`);
// console.log(`- From: ${process.env.EMAIL_FROM}`);

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST.trim(), // Remove any accidental spaces
//   port: emailPort,
//   secure: isSecure, // true for 465 (SSL), false for 587 (STARTTLS)
//   auth: {
//     user: process.env.EMAIL_USER.trim(), // Your Brevo SMTP login email
//     pass: process.env.EMAIL_PASS.trim()  // Your SMTP key (NOT API key)
//   },
//   // Brevo requires STARTTLS for port 587
//   requireTLS: emailPort === 587,
//   // Connection timeout
//   connectionTimeout: 10000, // 10 seconds
//   greetingTimeout: 10000,
//   socketTimeout: 20000,
//   // TLS options
//   tls: {
//     // Don't fail on invalid certificates (useful for testing)
//     rejectUnauthorized: false,
//     // Minimum TLS version
//     minVersion: 'TLSv1.2'
//   },
//   // Enable debug output
//   debug: process.env.NODE_ENV === 'development',
//   logger: process.env.NODE_ENV === 'development'
// });

// // Verify connection configuration
// transporter.verify(function(error, success) {
//   if (error) {
//     console.error('❌ SMTP Connection Error:', error);
//     console.error('Please check your Brevo SMTP credentials in your .env file');
//   } else {
//     console.log('✅ SMTP Server is ready to send emails');
//   }
// });

// module.exports = transporter;

const { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } = require('@getbrevo/brevo');
const dotenv = require("dotenv");
dotenv.config();

// Validate required environment variables
if (!process.env.BREVO_API_KEY) {
  throw new Error('Missing required environment variable: BREVO_API_KEY');
}

if (!process.env.EMAIL_FROM) {
  throw new Error('Missing required environment variable: EMAIL_FROM');
}

// Initialize Brevo API client
const apiInstance = new TransactionalEmailsApi();

// Set API Key
apiInstance.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey, 
  process.env.BREVO_API_KEY
);

console.log('✅ Brevo API initialized successfully');
console.log(`📧 Default sender: ${process.env.EMAIL_FROM}`);

module.exports = apiInstance;