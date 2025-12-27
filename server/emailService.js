// server/emailService.js
require('dotenv').config(); 
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // --- FIX: Use Port 465 (SSL) to bypass Render Timeout ---
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Explicit host
      port: 465,              // Secure SSL port (often allowed when 587 is blocked)
      secure: true,           // Must be true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Dead Man's Switch" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text, 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${to}`);
    return info;

  } catch (error) {
    console.error("❌ Email failed to send:", error);
  }
};

module.exports = sendEmail;