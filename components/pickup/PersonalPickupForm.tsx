"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Camera, Phone, FileText, Loader2, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function PersonalPickupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    restaurantName: "", restaurantAddress: "", foodDescription: "",
    deliveryAddress: "", phone: "", notes: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setUploaded(data.url);
        toast({ title: "Screenshot uploaded!" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PICKUP",
          paymentMethod: "CASH",
          addressId: "temp",
          items: [],
          pickupDetails: { ...form, screenshotUrl: uploaded },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Pickup requested! 🎉", description: `Order #${data.orderNumber} placed.` });
      router.push(`/orders/${data.orderNumber}`);
    } catch (err: unknown) {
      toast({ title: "Failed to submit", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Personal Pickup</h1>
        <p className="text-muted-foreground">
          Want food from a restaurant not on our list? Tell us where to go and we'll pick it up for you!
        </p>
      </motion.div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { step: "1", text: "Submit your order details" },
          { step: "2", text: "We calculate fee & confirm" },
          { step: "3", text: "Partner picks up & delivers" },
        ].map((item) => (
          <div key={item.step} className="text-center p-3 bg-card rounded-xl border border-border">
            <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
              {item.step}
            </div>
            <p className="text-xs text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >
        <div>
          <label className="text-sm font-medium mb-1.5 block">Restaurant Name *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" required value={form.restaurantName}
              onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
              placeholder="e.g. Shemomechama Restaurant"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Restaurant Address *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <textarea
              required value={form.restaurantAddress}
              onChange={(e) => setForm({ ...form, restaurantAddress: e.target.value })}
              placeholder="Full address of the restaurant"
              rows={2}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">What do you want to order? *</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <textarea
              required value={form.foodDescription}
              onChange={(e) => setForm({ ...form, foodDescription: e.target.value })}
              placeholder="Describe your order in detail (items, quantities, customizations)"
              rows={4}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Upload Order Screenshot (optional)</label>
          <label className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            uploaded ? "border-accent bg-accent/5" : "border-border hover:border-primary hover:bg-primary/5"
          }`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : uploaded ? (
              <>
                <CheckCircle className="w-8 h-8 text-accent mb-2" />
                <p className="text-sm text-accent font-medium">Screenshot uploaded!</p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </>
            )}
          </label>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Your Delivery Address *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <textarea
              required value={form.deliveryAddress}
              onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
              placeholder="Where should we deliver?"
              rows={2}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+995 599 000 000"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any special instructions?"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        <div className="bg-muted/50 rounded-xl p-4 text-sm">
          <p className="font-medium mb-1">💡 How pricing works</p>
          <p className="text-muted-foreground">
            Delivery fee is calculated based on distance. You'll receive a confirmation with the exact fee before we proceed.
            Typical fee: ₾3 - ₾15
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Submitting..." : "Submit Pickup Request"}
        </button>
      </motion.form>
    </div>
  );
}
