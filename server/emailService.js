// server/emailService.js
require('dotenv').config(); // Load variables from .env file
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // 1. Create the Transporter (The Mailman)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Reads from your .env file
        pass: process.env.EMAIL_PASS, // Reads from your .env file
      },
    });

    // 2. Configure the Email Options
    const mailOptions = {
      from: `"Dead Man's Switch" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text, 
      // html: '<b>HTML version of the message</b>' // Optional: if you want pretty emails later
    };

    // 3. Send the Email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${to}`);
    return info;

  } catch (error) {
    console.error("❌ Email failed to send:", error);
    // We don't throw the error because we don't want to crash the whole server 
    // if one email fails.
  }
};

module.exports = sendEmail;