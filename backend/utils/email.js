const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'MeCHAT <noreply@mechat.app>',
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const emailTemplates = {
  verification: (name, url) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e0e0e0;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#7c3aed;font-size:28px;margin:0;">MeCHAT</h1>
        <p style="color:#a0a0b0;margin:5px 0;">Connect. Chat. Create.</p>
      </div>
      <h2 style="color:#fff;text-align:center;">Verify Your Email</h2>
      <p>Hi ${name},</p>
      <p>Welcome to MeCHAT! Please verify your email address to get started.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${url}" style="background:#7c3aed;color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color:#a0a0b0;font-size:14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
    </div>
  `,
  resetPassword: (name, url) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e0e0e0;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="color:#7c3aed;font-size:28px;margin:0;">MeCHAT</h1>
        <p style="color:#a0a0b0;margin:5px 0;">Connect. Chat. Create.</p>
      </div>
      <h2 style="color:#fff;text-align:center;">Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${url}" style="background:#7c3aed;color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color:#a0a0b0;font-size:14px;">This link expires in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };
