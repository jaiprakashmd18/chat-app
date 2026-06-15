import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { kv } from "@vercel/kv";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const sort = searchParams.get("sort") || "featured";

    const cacheKey = `restaurants:${page}:${limit}:${search}:${cuisine}:${sort}`;

    try {
      const cached = await kv.get<string>(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    } catch {}

    const where: Record<string, unknown> = {
      status: "ACTIVE",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { cuisine: { has: search } },
          { tags: { has: search } },
        ],
      }),
      ...(cuisine && { cuisine: { has: cuisine } }),
    };

    const orderBy: Record<string, string> =
      sort === "rating" ? { rating: "desc" } :
      sort === "time" ? { estimatedTime: "asc" } :
      sort === "fee" ? { deliveryFee: "asc" } :
      { featured: "desc" };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, description: true, cuisine: true, images: true, logo: true,
          deliveryFee: true, estimatedTime: true, rating: true, reviewCount: true,
          isOpen: true, featured: true, tags: true, address: true, city: true,
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    const response = {
      data: restaurants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    try {
      await kv.set(cacheKey, JSON.stringify(response), { ex: 300 });
    } catch {}

    return NextResponse.json(response);
  } catch (error) {
    console.error("Restaurants GET error:", error);
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const restaurant = await prisma.restaurant.create({
      data: {
        ...body,
        ownerId: (session.user as any).id,
        status: "PENDING",
      },
    });
    return NextResponse.json({ data: restaurant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
  }
}
