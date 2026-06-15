import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { orderSchema } from "@/lib/validations";
import { generateOrderNumber, calculateTax } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const where: Record<string, unknown> = role === "ADMIN" ? {} : { userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          restaurant: { select: { id: true, name: true, images: true, logo: true } },
          items: true,
          address: { select: { street: true, city: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ data: orders, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const result = orderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { restaurantId, addressId, items, paymentMethod, couponCode, notes, type } = result.data;
    const userId = (session.user as any).id;

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) } },
    });

    const orderItems = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        customization: item.customization,
        totalPrice: menuItem.price * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.totalPrice, 0);
    const deliveryFee = restaurantId
      ? (await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { deliveryFee: true } }))?.deliveryFee || 5
      : 5;
    const tax = calculateTax(subtotal);

    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase(), isActive: true } });
      if (coupon && coupon.validUntil > new Date()) {
        discount = coupon.discountType === "PERCENTAGE"
          ? Math.min(subtotal * (coupon.discountValue / 100), coupon.maxDiscount || Infinity)
          : coupon.discountValue;
        await prisma.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
      }
    }

    const total = subtotal + deliveryFee + tax - discount;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        restaurantId,
        addressId,
        type,
        paymentMethod,
        paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PENDING",
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        couponCode,
        notes,
        status: "PENDING",
        estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000),
        trackingUpdates: [
          {
            status: "PENDING",
            timestamp: new Date().toISOString(),
            message: "Order placed successfully",
          },
        ],
        items: { create: orderItems },
        payment: { create: { userId, amount: total, currency: "GEL", method: paymentMethod } },
      },
      include: { items: true },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Order Placed!",
        message: `Your order ${orderNumber} has been placed. Total: ₾${total.toFixed(2)}`,
        type: "ORDER",
        data: { orderId: order.id, orderNumber },
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user) {
      try {
        await sendOrderConfirmationEmail(user.email, user.name, orderNumber, total);
      } catch {}
    }

    return NextResponse.json({ data: order, orderNumber }, { status: 201 });
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
