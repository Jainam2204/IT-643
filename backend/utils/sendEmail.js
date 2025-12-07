// const transporter = require("../config/emailConfig"); 
// const dotenv = require("dotenv");
// dotenv.config();

// const sendEmail = async (to, subject, text) => {
//   const mailOptions = {
//     from: process.env.EMAIL,
//     to,
//     subject,
//     text,
//   };

//   try {
//     await transporter.sendMail(mailOptions); 
//     console.log(`Email sent successfully to ${to}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send email");
//   }
// };

// module.exports = sendEmail;

const transporter = require("../config/emailConfig");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (to, subject, text) => {
  // Validate email address
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error(`Invalid email address: ${to}`);
  }

  // Ensure EMAIL_FROM is set
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error("Email authentication failed. Please check your Brevo SMTP credentials (EMAIL_USER and EMAIL_PASS).");
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      throw new Error(`Could not connect to email server. Check EMAIL_HOST (${process.env.EMAIL_HOST}) and EMAIL_PORT (${process.env.EMAIL_PORT}).`);
    } else if (error.responseCode === 550) {
      throw new Error("Email rejected by server. Please verify the sender email is verified in Brevo.");
    } else {
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }
};

module.exports = sendEmail;