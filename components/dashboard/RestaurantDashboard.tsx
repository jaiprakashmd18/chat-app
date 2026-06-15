"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  ShoppingBag, DollarSign, Star, TrendingUp, Clock, CheckCircle,
  PlusCircle, Settings, Menu as MenuIcon, Bell, Package
} from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
  user?: { name: string };
}

const RESTAURANT_NAV = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "menu", label: "Menu", icon: MenuIcon },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

export function RestaurantDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeNav, setActiveNav] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, rating: 4.8, pendingOrders: 0 });

  useEffect(() => {
    fetch("/api/orders?limit=20")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setOrders(d.data);
          setStats({
            totalOrders: d.total || 0,
            revenue: d.data.reduce((s: number, o: Order) => s + o.total, 0),
            rating: 4.8,
            pendingOrders: d.data.filter((o: Order) => o.status === "PENDING").length,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((o) => o.map((order) => order.id === orderId ? { ...order, status } : order));
        toast({ title: "Order status updated!" });
      }
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <p className="font-bold">Restaurant Portal</p>
          <p className="text-sm text-muted-foreground mt-0.5">{session?.user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {RESTAURANT_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeNav === item.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === "orders" && stats.pendingOrders > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-2xl font-bold">Restaurant Dashboard</h1>
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              {stats.pendingOrders > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
              { label: "Revenue", value: `₾${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
              { label: "Rating", value: `${stats.rating}★`, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
              { label: "Pending", value: stats.pendingOrders, icon: Clock, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border p-5"
              >
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="font-bold text-2xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Orders */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">
                {activeNav === "menu" ? "Menu Management" : "Incoming Orders"}
              </h2>
              {activeNav === "menu" && (
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Add Item
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">#{order.orderNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.user?.name} • {order.items.slice(0, 2).map((i) => i.name).join(", ")}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-primary">₾{order.total.toFixed(2)}</span>

                    {order.status === "PENDING" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "ACCEPTED")}
                          className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                          className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {order.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                        className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "PICKED_UP")}
                        className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0"
                      >
                        Ready for Pickup
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
