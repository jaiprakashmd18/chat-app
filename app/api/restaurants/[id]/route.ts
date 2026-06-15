import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { kv } from "@vercel/kv";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramsId } = await params;
  try {
    const cacheKey = `restaurant:${paramsId}`;
    try {
      const cached = await kv.get<string>(cacheKey);
      if (cached) return NextResponse.json(JSON.parse(cached));
    } catch {}

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: paramsId },
      include: {
        categories: { orderBy: { sortOrder: "asc" }, where: { isActive: true } },
        menuItems: {
          where: { isAvailable: true },
          orderBy: { isPopular: "desc" },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, image: true } } },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    try {
      await kv.set(cacheKey, JSON.stringify({ data: restaurant }), { ex: 180 });
    } catch {}

    return NextResponse.json({ data: restaurant });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
  }
}
