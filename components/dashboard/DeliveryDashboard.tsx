"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Package, DollarSign, Star, Clock, CheckCircle, MapPin, Phone, Navigation, Loader2 } from "lucide-react";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryFee: number;
  createdAt: string;
  restaurant?: { name: string; address?: string; phone?: string };
  address?: { street: string; city: string };
  user?: { name: string; phone?: string };
  items: Array<{ name: string; quantity: number }>;
}

export function DeliveryDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, total: 0, rating: 4.8, deliveries: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/orders?status=ACCEPTED&limit=20").then((r) => r.json()),
      fetch("/api/orders?limit=20").then((r) => r.json()),
    ]).then(([available, mine]) => {
      if (available.data) setAvailableOrders(available.data.filter((o: Order) => o.status === "ACCEPTED"));
      if (mine.data) setMyOrders(mine.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PICKED_UP" }),
      });
      if (res.ok) {
        toast({ title: "Order accepted! 🚴" });
        setAvailableOrders((o) => o.filter((order) => order.id !== orderId));
      }
    } catch {
      toast({ title: "Failed to accept order", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setMyOrders((o) => o.map((order) => order.id === orderId ? { ...order, status } : order));
      toast({ title: "Status updated!" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`transition-colors ${isOnline ? "bg-gradient-to-r from-accent to-green-600" : "bg-gradient-to-r from-gray-600 to-gray-700"} text-white`}>
        <div className="container mx-auto px-4 max-w-3xl py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className={`text-sm mb-1 ${isOnline ? "text-green-100" : "text-gray-300"}`}>
                {isOnline ? "🟢 You're Online" : "🔴 You're Offline"}
              </p>
              <h1 className="font-display text-2xl font-bold">Hey, {session?.user?.name?.split(" ")[0]}!</h1>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isOnline ? "bg-white/20 hover:bg-white/30" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Today", value: `₾${earnings.today.toFixed(2)}`, icon: DollarSign },
              { label: "This Week", value: `₾${earnings.week.toFixed(2)}`, icon: DollarSign },
              { label: "Rating", value: `${earnings.rating}★`, icon: Star },
              { label: "Deliveries", value: earnings.deliveries, icon: Package },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="font-bold text-lg leading-tight">{s.value}</p>
                <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex gap-1">
            {["available", "active", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-xl capitalize transition-colors ${
                  activeTab === tab ? "bg-background text-foreground" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-6">
        {!isOnline && activeTab === "available" && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="font-semibold text-lg mb-2">You're offline</p>
            <p className="text-muted-foreground mb-6">Go online to start receiving delivery requests</p>
            <button
              onClick={() => setIsOnline(true)}
              className="bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
            >
              Go Online Now
            </button>
          </div>
        )}

        {activeTab === "available" && isOnline && (
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Available Deliveries ({availableOrders.length})
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="text-4xl mb-3">🚴</p>
                <p className="font-medium">No orders available right now</p>
                <p className="text-sm text-muted-foreground mt-1">Stay online and we'll notify you!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.restaurant?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">+₾{order.deliveryFee.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">delivery fee</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-green-500" />
                        <span className="truncate">{order.restaurant?.address || "Restaurant address"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span className="truncate">{order.address?.street}, {order.address?.city}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {order.items.slice(0, 3).map((i) => i.name).join(", ")}
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors"
                      >
                        Accept Order
                      </button>
                      <button className="px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                        Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "active" && (
          <div>
            <h2 className="font-semibold text-lg mb-4">Active Deliveries</h2>
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
              <p className="font-medium">No active deliveries</p>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="font-semibold text-lg mb-4">Delivery History</h2>
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-muted-foreground">No delivery history yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
