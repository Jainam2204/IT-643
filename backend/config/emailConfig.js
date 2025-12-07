const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Validate and convert port
const emailPort = parseInt(process.env.EMAIL_PORT, 10);
if (isNaN(emailPort)) {
  throw new Error(`Invalid EMAIL_PORT: ${process.env.EMAIL_PORT}. Must be a number.`);
}

// Determine secure flag based on port (465 = SSL, 587 = STARTTLS)
const isSecure = emailPort === 465;

// Validate required environment variables
if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
  throw new Error('Missing required email environment variables: EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: emailPort,
  secure: isSecure, // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Brevo requires STARTTLS for port 587
  requireTLS: !isSecure, // Enable STARTTLS for port 587
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
  }
});

module.exports = transporter;
