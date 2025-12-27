// server/emailService.js
const axios = require('axios');

const sendEmail = async (to, subject, text) => {
  // 1. Get Keys from Environment Variables (We will add these next)
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional security

  try {
    console.log(`🚀 Attempting to send email via EmailJS API to ${to}...`);

    // 2. Prepare the Payload
    const data = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: to,       // Must match the variable in EmailJS template if you set one
        subject: subject,
        message: text,
      },
      accessToken: privateKey, // To allow server-side sending
    };

    // 3. Send the HTTP Request (Port 443 - Bypasses Firewall)
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data);
    
    console.log(`✅ Email sent successfully! Status: ${response.status}`);
    return response.data;

  } catch (error) {
    console.error("❌ Email API Failed:", error.response ? error.response.data : error.message);
  }
};

module.exports = sendEmail;