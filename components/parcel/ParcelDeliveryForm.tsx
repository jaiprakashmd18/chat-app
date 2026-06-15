"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Package, MapPin, User, Phone, FileText, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function ParcelDeliveryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pickupAddress: "", dropAddress: "", description: "",
    weight: "", receiverName: "", receiverPhone: "", notes: "",
  });

  const estimatedFee = form.pickupAddress && form.dropAddress ? "₾5 - ₾15" : "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PARCEL",
          paymentMethod: "CASH",
          addressId: "temp",
          items: [],
          parcelDetails: { ...form, weight: parseFloat(form.weight) || 0 },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Parcel delivery requested! 📦", description: `Order #${data.orderNumber}` });
      router.push(`/orders/${data.orderNumber}`);
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="container mx-auto px-4 max-w-2xl py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-purple-500" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Parcel Delivery</h1>
        <p className="text-muted-foreground">Send anything, anywhere in the city. Fast and reliable door-to-door service.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block text-green-600 dark:text-green-400">📍 Pickup Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-green-500" />
              <textarea required value={form.pickupAddress} onChange={(e) => update("pickupAddress", e.target.value)}
                placeholder="Full pickup address"
                rows={2}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-4 bg-border" />
              <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              <div className="w-px h-4 bg-border" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block text-red-600 dark:text-red-400">🎯 Drop Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-red-500" />
              <textarea required value={form.dropAddress} onChange={(e) => update("dropAddress", e.target.value)}
                placeholder="Full delivery address"
                rows={2}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Parcel Description *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea required value={form.description} onChange={(e) => update("description", e.target.value)}
                placeholder="What's in the parcel?"
                rows={3}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Weight (kg, optional)</label>
            <input type="number" min="0" step="0.1" value={form.weight} onChange={(e) => update("weight", e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Receiver Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" required value={form.receiverName} onChange={(e) => update("receiverName", e.target.value)}
                placeholder="Full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Receiver Phone *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="tel" required value={form.receiverPhone} onChange={(e) => update("receiverPhone", e.target.value)}
                placeholder="+995 599 000 000"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Additional Notes</label>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)}
            placeholder="Any special handling instructions?"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Estimated Delivery Fee</p>
            <p className="text-xs text-muted-foreground mt-0.5">Final price calculated based on distance</p>
          </div>
          <p className="font-bold text-lg text-purple-700 dark:text-purple-300">{estimatedFee}</p>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Submitting..." : "Request Parcel Delivery"}
        </button>
      </motion.form>
    </div>
  );
}
