const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // In some dev environments, outgoing SMTP is intercepted with a self-signed cert.
  // This avoids TLS handshake failures locally. For production, prefer proper CA.
  tls: {
    rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED === "true",
  },
  // Add timeout to prevent hanging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
  socketTimeout: 10000,     // 10 seconds
});

async function sendAppointmentNotification(to, subject, htmlContent) {
  // Guard: skip if email not configured or recipient missing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email not configured (EMAIL_USER/EMAIL_PASS missing). Skipping send.");
    return false;
  }
  if (!to) {
    console.warn("⚠️ No recipient email provided. Skipping send.");
    return false;
  }

  const mailOptions = {
    from: `"MedPal Klinika" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${subject} -> ${info.messageId || info.response || "OK"}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send appointment email:", err.message || err);
    console.warn("⚠️ Email sending failed, but appointment was still created successfully");
    return false; // Do not throw; callers shouldn't fail booking on email issues
  }
}

module.exports = sendAppointmentNotification;
