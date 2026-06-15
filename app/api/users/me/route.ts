import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: { isDefault: "desc" } },
        wallet: { include: { transactions: { take: 10, orderBy: { createdAt: "desc" } } } },
        notifications: { where: { isRead: false }, take: 20, orderBy: { createdAt: "desc" } },
        _count: { select: { orders: true, reviews: true } },
      },
    });

    const { password: _, ...userWithoutPassword } = user || {} as any;

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ data: userWithoutPassword });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, image } = body;
    const userId = (session.user as any).id;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, image },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
