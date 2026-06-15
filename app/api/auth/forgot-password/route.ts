import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateOTP } from "@/lib/utils";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, { limit: 3, window: 300 });
  if (!limit.success) return rateLimitResponse();

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = generateOTP(32);
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.otpToken.create({
      data: { userId: user.id, otp: token, type: "PASSWORD_RESET", expiresAt: expiry },
    });

    await sendPasswordResetEmail(email, user.name, token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
