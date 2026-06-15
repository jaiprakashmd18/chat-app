import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, { limit: 5, window: 60 });
  if (!limit.success) return rateLimitResponse();

  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, phone, referralCode } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userReferralCode = `SE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let referredBy: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) referredBy = referrer.id;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        referralCode: userReferralCode,
        referredBy,
        wallet: { create: {} },
      },
    });

    if (referredBy) {
      await prisma.referral.create({
        data: {
          referrerId: referredBy,
          referredId: user.id,
          code: referralCode!,
          status: "PENDING",
        },
      });
    }

    try {
      await sendWelcomeEmail(email, name);
    } catch {}

    return NextResponse.json({ success: true, message: "Account created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
