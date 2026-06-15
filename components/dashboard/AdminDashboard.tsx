"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Store, ShoppingBag, DollarSign, Truck, AlertCircle,
  TrendingUp, Package, Star, Clock, Settings, Bell, LogOut
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  pendingRestaurants: number;
  totalDeliveryPartners: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    user?: { name: string };
    restaurant?: { name: string };
  }>;
}

const statsConfig = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", format: (v: number) => v.toLocaleString() },
  { key: "totalRestaurants", label: "Restaurants", icon: Store, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", format: (v: number) => v.toLocaleString() },
  { key: "totalOrders", label: "Total Orders", icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", format: (v: number) => v.toLocaleString() },
  { key: "totalRevenue", label: "Revenue", icon: DollarSign, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", format: (v: number) => `₾${v.toFixed(2)}` },
  { key: "activeOrders", label: "Active Orders", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30", format: (v: number) => v.toLocaleString() },
  { key: "totalDeliveryPartners", label: "Delivery Partners", icon: Truck, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", format: (v: number) => v.toLocaleString() },
  { key: "pendingRestaurants", label: "Pending Approval", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", format: (v: number) => v.toLocaleString() },
];

const navItems = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "restaurants", label: "Restaurants", icon: Store },
  { id: "users", label: "Users", icon: Users },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "coupons", label: "Coupons", icon: Package },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.data) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-orange rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <div>
              <p className="font-bold text-sm">StudentExpress</p>
              <p className="text-xs text-primary font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
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
              {item.id === "restaurants" && stats?.pendingRestaurants ? (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.pendingRestaurants}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">StudentExpress Georgia Control Center</p>
            </div>
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              {stats?.pendingRestaurants ? (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              ) : null}
            </button>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {statsConfig.map((stat, i) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-5"
                >
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="font-bold text-2xl">{stats ? stat.format(stats[stat.key as keyof Stats] as number) : "—"}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Recent Orders</h2>
              <span className="text-sm text-primary cursor-pointer hover:underline">View All</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["Order #", "Customer", "Restaurant", "Total", "Status", "Time"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders?.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-primary">#{order.orderNumber}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{order.user?.name || "—"}</td>
                      <td className="px-5 py-3.5">{order.restaurant?.name || "Pickup"}</td>
                      <td className="px-5 py-3.5 font-semibold">₾{order.total.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
