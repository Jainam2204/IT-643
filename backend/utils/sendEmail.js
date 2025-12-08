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


// const apiInstance = require("../config/emailConfig");
// const dotenv = require("dotenv");
// dotenv.config();

// /**
//  * Send email using Brevo API
//  * @param {string} to - Recipient email address
//  * @param {string} subject - Email subject
//  * @param {string} text - Plain text content
//  * @param {string} html - HTML content (optional)
//  * @param {string} senderName - Sender name (optional)
//  */
// const sendEmail = async (to, subject, text, html = null, senderName = "Team SkillXChange") => {
//   // Validate email address
//   if (!to || typeof to !== 'string' || !to.includes('@')) {
//     throw new Error(`Invalid email address: ${to}`);
//   }

//   // Ensure EMAIL_FROM is set
//   if (!process.env.EMAIL_FROM) {
//     throw new Error("EMAIL_FROM environment variable is not set");
//   }

//   const sendSmtpEmail = {
//     sender: {
//       name: senderName,
//       email: process.env.EMAIL_FROM
//     },
//     to: [
//       {
//         email: to
//       }
//     ],
//     subject: subject,
//     textContent: text,
//     htmlContent: html || `<html><body><p>${text.replace(/\n/g, '<br>')}</p></body></html>`
//   };

//   try {
//     const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
//     console.log(`✅ Email sent successfully to ${to}`);
//     console.log(`📨 Message ID: ${response.messageId}`);
//     return response;
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
    
//     // Provide more specific error messages
//     if (error.status === 401) {
//       throw new Error("Authentication failed. Please check your BREVO_API_KEY in environment variables.");
//     } else if (error.status === 400) {
//       throw new Error(`Bad request: ${error.message}. Check sender email is verified in Brevo.`);
//     } else if (error.status === 402) {
//       throw new Error("Account credits exhausted. Please add credits to your Brevo account.");
//     } else if (error.status === 404) {
//       throw new Error("Brevo API endpoint not found. Check API version compatibility.");
//     } else if (error.response && error.response.body) {
//       throw new Error(`Brevo API error: ${JSON.stringify(error.response.body)}`);
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
 * Send email using Brevo API with clean HTML template
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional, will auto-generate if not provided)
 * @param {string} senderName - Sender name (optional)
 */
const sendEmail = async (to, subject, text, html = null, senderName = "Team SkillXChange") => {
  // Validate email address
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error(`Invalid email address: ${to}`);
  }

  // Ensure EMAIL_FROM is set
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }

  // Generate clean HTML template if not provided
  let htmlContent = html;
  
  if (!html) {
    // Check if the text contains a verification code
    const codeMatch = text.match(/(?:code is:?\s*)(\d{6})/i);
    
    if (codeMatch) {
      // This is a verification email
      const verificationCode = codeMatch[1];
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: normal;">SkillXChange</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: normal;">Email Verification</h2>
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 15px; line-height: 1.5;">
                Enter this code to verify your email address
              </p>
              
              <!-- Verification Code -->
              <div style="background-color: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 0 auto; display: inline-block;">
                <p style="margin: 0; color: #2563eb; font-size: 32px; font-weight: bold; letter-spacing: 6px;">${verificationCode}</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                © ${new Date().getFullYear()} SkillXChange • Team SkillXChange
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();
    } else {
      // Generic clean email template
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: normal;">SkillXChange</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <div style="color: #374151; font-size: 15px; line-height: 1.6;">
                ${text.replace(/\n/g, '<br>')}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                © ${new Date().getFullYear()} SkillXChange • Team SkillXChange
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();
    }
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
    htmlContent: htmlContent
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