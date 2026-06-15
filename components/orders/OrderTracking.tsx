"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock, MapPin, Phone, Store, Package, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

const ORDER_STAGES = [
  { status: "PENDING", label: "Order Placed", icon: Package, desc: "We've received your order" },
  { status: "ACCEPTED", label: "Accepted", icon: CheckCircle, desc: "Restaurant confirmed" },
  { status: "PREPARING", label: "Preparing", icon: Clock, desc: "Your food is being prepared" },
  { status: "PICKED_UP", label: "Picked Up", icon: Store, desc: "Delivery partner has your order" },
  { status: "OUT_FOR_DELIVERY", label: "On the Way", icon: MapPin, desc: "Coming to you!" },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle, desc: "Enjoy your order! 🎉" },
];

const STATUS_ORDER = ORDER_STAGES.map((s) => s.status);

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingUpdates: Array<{ status: string; timestamp: string; message: string }>;
  restaurant?: { name: string; phone?: string; address?: string; logo?: string };
  deliveryPartner?: { user?: { name: string; phone?: string; image?: string } };
  address?: { street: string; city: string };
  items: Array<{
    id: string; name: string; price: number; quantity: number; totalPrice: number;
    menuItem?: { images: string[] };
  }>;
}

export function OrderTracking({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.data) setOrder(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-2xl py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 max-w-2xl py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Order not found</h2>
        <Link href="/dashboard/customer?tab=orders" className="text-primary hover:underline">
          View all orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="container mx-auto px-4 max-w-2xl py-8">
      <Link href="/dashboard/customer?tab=orders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Order Header */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display font-bold text-xl">#{order.orderNumber}</h1>
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusColor(order.status))}>
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {order.restaurant?.name || "Personal Pickup"} •{" "}
          {order.estimatedDelivery && order.status !== "DELIVERED"
            ? `ETA: ${new Date(order.estimatedDelivery).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
            : order.deliveredAt ? `Delivered at ${formatDate(order.deliveredAt)}` : ""}
        </p>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h2 className="font-semibold mb-5">Order Progress</h2>
          <div className="space-y-4">
            {ORDER_STAGES.map((stage, i) => {
              const isCompleted = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              return (
                <motion.div
                  key={stage.status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4"
                >
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isCompleted ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    {i < ORDER_STAGES.length - 1 && (
                      <div className={cn(
                        "absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-4",
                        i < currentStatusIndex ? "bg-primary" : "bg-border"
                      )} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={cn("font-medium text-sm", !isCompleted && "text-muted-foreground")}>
                      {stage.label}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full animate-pulse">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stage.desc}</p>
                  </div>
                  {isCompleted && order.trackingUpdates.find((u) => u.status === stage.status) && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(order.trackingUpdates.find((u) => u.status === stage.status)!.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivery Partner */}
      {order.deliveryPartner?.user && (
        <div className="bg-card rounded-2xl border border-border p-5 mb-4">
          <h2 className="font-semibold mb-3">Your Delivery Partner</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {order.deliveryPartner.user.name?.[0]}
              </div>
              <div>
                <p className="font-medium">{order.deliveryPartner.user.name}</p>
                <p className="text-sm text-muted-foreground">Delivery Partner</p>
              </div>
            </div>
            {order.deliveryPartner.user.phone && (
              <a
                href={`tel:${order.deliveryPartner.user.phone}`}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <h2 className="font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                  {item.quantity}x
                </div>
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="font-semibold text-sm">₾{item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>₾{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span><span>₾{order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span><span>₾{order.tax.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-accent">
              <span>Discount</span><span>-₾{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
            <span>Total</span><span className="text-primary">₾{order.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Payment: {order.paymentMethod.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Delivery Address
          </h2>
          <p className="text-sm text-muted-foreground">{order.address.street}, {order.address.city}</p>
        </div>
      )}
    </div>
  );
}
