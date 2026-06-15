import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: paramId }, { orderNumber: paramId }],
        ...(role !== "ADMIN" && { userId }),
      },
      include: {
        restaurant: { select: { id: true, name: true, images: true, logo: true, phone: true, address: true } },
        items: { include: { menuItem: { select: { images: true } } } },
        address: true,
        deliveryPartner: true,
        review: true,
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ data: order });
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { status } = body;
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const order = await prisma.order.findUnique({ where: { id: paramId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const canUpdate =
      role === "ADMIN" ||
      role === "RESTAURANT_OWNER" ||
      role === "DELIVERY_PARTNER" ||
      (role === "CUSTOMER" && status === "CANCELLED" && order.userId === userId);

    if (!canUpdate) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const trackingUpdate = {
      status,
      timestamp: new Date().toISOString(),
      message: getStatusMessage(status),
    };

    const updated = await prisma.order.update({
      where: { id: paramId },
      data: {
        status,
        ...(status === "DELIVERED" && { deliveredAt: new Date() }),
        trackingUpdates: {
          push: trackingUpdate,
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order ${getStatusMessage(status)}`,
        message: `Your order #${order.orderNumber} status: ${status}`,
        type: "ORDER",
        data: { orderId: order.id, status },
      },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    ACCEPTED: "Order accepted by restaurant",
    PREPARING: "Restaurant is preparing your order",
    PICKED_UP: "Order picked up by delivery partner",
    OUT_FOR_DELIVERY: "Your order is on its way!",
    DELIVERED: "Order delivered successfully",
    CANCELLED: "Order has been cancelled",
  };
  return messages[status] || status;
}
