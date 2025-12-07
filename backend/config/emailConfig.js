// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD, 
//   },
// });

// module.exports = transporter;

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '933ab5001@smtp-brevo.com',
    pass: process.env.EMAIL_PASS || '15cgWBGVAwLrs7QY'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    console.log('SMTP server is ready to take messages');
  }
});

module.exports = transporter;
