import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalUsers, totalRestaurants, totalOrders, activeOrders,
      totalRevenue, pendingRestaurants, totalDeliveryPartners
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PENDING", "ACCEPTED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY"] } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
      prisma.restaurant.count({ where: { status: "PENDING" } }),
      prisma.deliveryPartner.count(),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        restaurant: { select: { name: true } },
      },
    });

    return NextResponse.json({
      data: {
        totalUsers, totalRestaurants, totalOrders, activeOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingRestaurants, totalDeliveryPartners,
        recentOrders,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
