import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const { restaurantId, orderId, rating, comment } = result.data;

    const review = await prisma.review.create({
      data: { userId, restaurantId, orderId, rating, comment },
    });

    const stats = await prisma.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        rating: Math.round((stats._avg.rating || 0) * 10) / 10,
        reviewCount: stats._count.rating,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 5 } },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const restaurantId = searchParams.get("restaurantId");
  if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });

  try {
    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true, image: true } } },
    });
    return NextResponse.json({ data: reviews });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
