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
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'jainamvora2201@gmail.com',
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;

// await transporter.sendMail({
//       from: `"Packify" ${process.env.EMAIL_FROM}`,
//       to: user.email,
//       subject: 'Password Reset',
//       html: `<p>Hi ${user.name},</p>

//             <p>We received a password reset request for your account. Click the link below to set a new password:</p>

//             <p><a href=${passwordResetLink} target="_blank">${passwordResetLink}</a></p>

//             <p>If you didn't request this, you can ignore this email.</p>

//             <p>Thanks,<br>
//             Packify Team</p>`
//     });