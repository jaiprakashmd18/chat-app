"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, Trash2, Tag, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/useToast";

export function CartView() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, subtotal, deliveryFee, tax, total, discount, isEmpty, couponCode } = useCart();
  const { updateQuantity, removeItem, applyCoupon, removeCoupon, restaurantName } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }
      applyCoupon(data.data.code, data.data.discount);
      toast({ title: `Coupon applied! Saved ₾${data.data.discount.toFixed(2)}` });
      setCouponInput("");
    } catch {
      toast({ title: "Failed to validate coupon", variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    router.push("/checkout");
  };

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 max-w-2xl py-20 text-center">
        <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
        <h2 className="font-display text-2xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Add items from a restaurant to get started</p>
        <Link href="/restaurants" className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold mb-6">
        Your Cart
        {restaurantName && <span className="text-primary text-lg font-normal ml-2">· {restaurantName}</span>}
      </h1>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Cart Items */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  🍔
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  {item.customization && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.customization}</p>
                  )}
                  <p className="text-primary font-bold mt-1">₾{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-primary text-white hover:bg-primary-600 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm">₾{(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 mt-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coupon */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Apply Coupon
            </p>
            {couponCode ? (
              <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-xl px-4 py-2.5">
                <span className="text-sm font-medium text-accent">{couponCode} applied!</span>
                <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-foreground">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                />
                <button
                  onClick={handleCoupon}
                  disabled={couponLoading || !couponInput}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-60"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₾{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₾{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (18%)</span>
                <span>₾{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount</span>
                  <span>-₾{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2.5 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">₾{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link href="/restaurants" className="block text-center text-sm text-muted-foreground mt-3 hover:text-primary transition-colors">
              + Add more items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
