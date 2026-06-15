import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const FROM = process.env.EMAIL_FROM || "noreply@studentexpress.ge";
const APP_NAME = "StudentExpress Georgia";

export async function sendOTPEmail(email: string, otp: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${otp} - Your verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:32px;">🚀</span>
          <h1 style="color:#FF6B00;margin:8px 0;">${APP_NAME}</h1>
        </div>
        <h2 style="color:#1a1a1a;">Hi ${name},</h2>
        <p style="color:#555;">Your OTP verification code is:</p>
        <div style="background:#FFF3E8;border:2px dashed #FF6B00;border-radius:8px;padding:16px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:bold;color:#FF6B00;letter-spacing:8px;">${otp}</span>
        </div>
        <p style="color:#555;">This code expires in 10 minutes. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#999;font-size:12px;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#FF6B00;">${APP_NAME}</h1>
          <p style="color:#00C853;font-size:20px;font-weight:bold;">Welcome aboard! 🎓</p>
        </div>
        <h2 style="color:#1a1a1a;">Hey ${name}!</h2>
        <p style="color:#555;">Your account is ready. Start ordering food, request pickups, or schedule deliveries — all at your fingertips.</p>
        <div style="margin:24px 0;">
          <a href="${process.env.NEXTAUTH_URL}" style="background:#FF6B00;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Start Ordering 🍔
          </a>
        </div>
        <p style="color:#999;font-size:12px;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  total: number
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Order ${orderNumber} confirmed! 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <h1 style="color:#FF6B00;">${APP_NAME}</h1>
        <h2>Order Confirmed! ✅</h2>
        <p>Hi ${name}, your order <strong>${orderNumber}</strong> has been placed successfully.</p>
        <div style="background:#F5F5F5;border-radius:8px;padding:16px;margin:16px 0;">
          <p><strong>Order Total:</strong> ₾${total.toFixed(2)}</p>
        </div>
        <p>Track your order in real-time on the app.</p>
        <a href="${process.env.NEXTAUTH_URL}/orders/${orderNumber}" style="background:#FF6B00;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
          Track Order
        </a>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <h1 style="color:#FF6B00;">${APP_NAME}</h1>
        <h2>Reset Password</h2>
        <p>Hi ${name}, click below to reset your password. Link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background:#FF6B00;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
