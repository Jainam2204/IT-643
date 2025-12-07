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

// const transporter = require("../config/emailConfig");
// const dotenv = require("dotenv");
// dotenv.config();

// const sendEmail = async (to, subject, text) => {
//   // Validate email address
//   if (!to || typeof to !== 'string' || !to.includes('@')) {
//     throw new Error(`Invalid email address: ${to}`);
//   }

//   // Ensure EMAIL_FROM is set
//   if (!process.env.EMAIL_FROM) {
//     throw new Error("EMAIL_FROM environment variable is not set");
//   }

//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to,
//     subject,
//     text,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfully to ${to}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
    
//     // Provide more specific error messages
//     if (error.code === 'EAUTH') {
//       throw new Error("Email authentication failed. Please check your Brevo SMTP credentials (EMAIL_USER and EMAIL_PASS).");
//     } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
//       throw new Error(`Could not connect to email server. Check EMAIL_HOST (${process.env.EMAIL_HOST}) and EMAIL_PORT (${process.env.EMAIL_PORT}).`);
//     } else if (error.responseCode === 550) {
//       throw new Error("Email rejected by server. Please verify the sender email is verified in Brevo.");
//     } else {
//       throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
//     }
//   }
// };

// module.exports = sendEmail;


const apiInstance = require("../config/emailConfig");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Send email using Brevo API
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 * @param {string} senderName - Sender name (optional)
 */
const sendEmail = async (to, subject, text, html = null, senderName = "SkillSwap") => {
  // Validate email address
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error(`Invalid email address: ${to}`);
  }

  // Ensure EMAIL_FROM is set
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }

  // Prepare email payload
  const sendSmtpEmail = {
    sender: {
      name: senderName,
      email: process.env.EMAIL_FROM
    },
    to: [
      {
        email: to
      }
    ],
    subject: subject,
    textContent: text,
    // Use HTML content if provided, otherwise convert text to simple HTML
    htmlContent: html || `<html><body><p>${text.replace(/\n/g, '<br>')}</p></body></html>`
  };

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📨 Message ID: ${response.messageId}`);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    
    // Provide more specific error messages
    if (error.status === 401) {
      throw new Error("Authentication failed. Please check your BREVO_API_KEY in environment variables.");
    } else if (error.status === 400) {
      throw new Error(`Bad request: ${error.message}. Check sender email is verified in Brevo.`);
    } else if (error.status === 402) {
      throw new Error("Account credits exhausted. Please add credits to your Brevo account.");
    } else if (error.status === 404) {
      throw new Error("Brevo API endpoint not found. Check API version compatibility.");
    } else if (error.response && error.response.body) {
      throw new Error(`Brevo API error: ${JSON.stringify(error.response.body)}`);
    } else {
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }
};

module.exports = sendEmail;