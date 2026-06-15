"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, MapPin, Heart, Wallet, Bell, Gift, Star,
  Users, Package, Clock, TrendingUp, ChevronRight, Plus
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  restaurant?: { name: string; logo?: string };
  items: Array<{ name: string; quantity: number }>;
}

interface UserData {
  name: string;
  points: number;
  referralCode: string;
  wallet?: { balance: number };
  _count?: { orders: number };
}

export function CustomerDashboard() {
  const { data: session } = useSession();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, userRes] = await Promise.all([
          fetch("/api/orders?limit=5"),
          fetch("/api/users/me"),
        ]);
        const ordersData = await ordersRes.json();
        const userData = await userRes.json();

        if (ordersData.data) {
          setActiveOrders(ordersData.data.filter((o: Order) =>
            ["PENDING", "ACCEPTED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status)
          ));
          setRecentOrders(ordersData.data);
        }
        if (userData.data) setUserData(userData.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "wallet", label: "Wallet" },
    { id: "rewards", label: "Rewards" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-600 text-white">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Welcome back 👋</p>
              <h1 className="font-display text-2xl font-bold">
                {session?.user?.name?.split(" ")[0] || "Student"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/customer?tab=notifications" className="relative p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" />
              </Link>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Total Orders", value: userData?._count?.orders || 0, icon: ShoppingBag },
              { label: "Wallet", value: `₾${userData?.wallet?.balance?.toFixed(2) || "0.00"}`, icon: Wallet },
              { label: "Points", value: userData?.points || 0, icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-orange-200" />
                <p className="font-bold text-lg leading-tight">{stat.value}</p>
                <p className="text-orange-100 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex gap-1 overflow-x-auto pb-0 pt-2 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-xl whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-foreground"
                    : "text-orange-100 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Active Orders
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">#{order.orderNumber}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.restaurant?.name || "Personal Pickup"} • {order.items.slice(0, 2).map(i => i.name).join(", ")}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary">₾{order.total.toFixed(2)}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="font-display font-semibold text-lg mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "🍔", label: "Order Food", href: "/restaurants", bg: "bg-orange-50 dark:bg-orange-950/30" },
                  { icon: "📸", label: "Personal Pickup", href: "/pickup", bg: "bg-blue-50 dark:bg-blue-950/30" },
                  { icon: "🛒", label: "Grocery", href: "/grocery", bg: "bg-green-50 dark:bg-green-950/30" },
                  { icon: "📦", label: "Parcel", href: "/parcel", bg: "bg-purple-50 dark:bg-purple-950/30" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <div className={`${action.bg} rounded-2xl p-4 text-center hover:shadow-md transition-all hover:-translate-y-0.5 border border-border`}>
                      <span className="text-3xl">{action.icon}</span>
                      <p className="text-sm font-medium mt-2">{action.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
                <button onClick={() => setActiveTab("orders")} className="text-sm text-primary hover:underline">
                  View All
                </button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">No orders yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Place your first order today!</p>
                  <Link href="/restaurants" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                    Browse Restaurants
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order, i) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all flex items-center gap-4"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          🍔
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate">{order.restaurant?.name || "Personal Pickup"}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor(order.status)}`}>
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {order.items.slice(0, 2).map(i => i.name).join(", ")}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                            <span className="font-bold text-sm text-primary">₾{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Referral Card */}
            <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6" />
                <h3 className="font-display font-bold text-lg">Refer & Earn</h3>
              </div>
              <p className="text-orange-100 text-sm mb-4">Share your code and earn ₾10 for every friend who joins!</p>
              <div className="bg-white/20 rounded-xl p-3 flex items-center justify-between">
                <span className="font-bold text-lg tracking-widest">
                  {userData?.referralCode || "Loading..."}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(userData?.referralCode || "")}
                  className="bg-white text-primary text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="font-display font-semibold text-xl mb-4">Order History</h2>
            {recentOrders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium text-lg mb-2">No orders yet</p>
                <Link href="/restaurants" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                  Start Ordering
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order, i) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.restaurant?.name || "Personal Pickup"}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {order.items.slice(0, 3).map(i => `${i.name} x${i.quantity}`).join(", ")}
                        {order.items.length > 3 && ` +${order.items.length - 3} more`}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                        <span className="font-bold text-primary">₾{order.total.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-6 text-white">
              <p className="text-orange-100 text-sm mb-1">Wallet Balance</p>
              <p className="font-display text-4xl font-bold">₾{userData?.wallet?.balance?.toFixed(2) || "0.00"}</p>
              <div className="flex gap-3 mt-4">
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  Add Money
                </button>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  Withdraw
                </button>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4">Transaction History</h3>
              <p className="text-muted-foreground text-sm text-center py-8">No transactions yet</p>
            </div>
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 fill-white" />
                <p className="font-bold text-xl">Reward Points</p>
              </div>
              <p className="font-display text-5xl font-bold">{userData?.points || 0}</p>
              <p className="text-yellow-100 text-sm mt-1">= ₾{((userData?.points || 0) * 0.01).toFixed(2)} discount</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Points Earned", value: userData?.points || 0, icon: TrendingUp },
                { label: "Orders Made", value: userData?._count?.orders || 0, icon: ShoppingBag },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-2xl border border-border p-4 text-center">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-bold text-2xl">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" /> How to Earn Points
              </h3>
              <div className="space-y-3">
                {[
                  { action: "Place an order", points: "+10 pts" },
                  { action: "Rate your delivery", points: "+5 pts" },
                  { action: "Refer a friend", points: "+50 pts" },
                  { action: "Birthday bonus", points: "+100 pts" },
                ].map((item) => (
                  <div key={item.action} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{item.action}</span>
                    <span className="text-sm font-bold text-accent">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
