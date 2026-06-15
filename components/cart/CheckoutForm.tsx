"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, CreditCard, Banknote, Building2, Loader2, Plus, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/useToast";

const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered" },
  { id: "CARD", label: "Card Payment", icon: CreditCard, desc: "Visa / Mastercard" },
  { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "TBC / BOG / Liberty" },
];

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  isDefault: boolean;
}

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, subtotal, deliveryFee, tax, total, discount, couponCode, restaurantId } = useCart();
  const { clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.addresses) {
          setAddresses(d.data.addresses);
          const def = d.data.addresses.find((a: Address) => a.isDefault);
          if (def) setSelectedAddress(def.id);
          else if (d.data.addresses[0]) setSelectedAddress(d.data.addresses[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAddresses(false));
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({ title: "Please select a delivery address", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          addressId: selectedAddress,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, customization: i.customization })),
          paymentMethod,
          couponCode,
          notes,
          type: "FOOD",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      clearCart();
      toast({ title: "Order placed! 🎉", description: `#${data.orderNumber}` });
      router.push(`/orders/${data.orderNumber}`);
    } catch (err: unknown) {
      toast({ title: "Order failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
          {/* Delivery Address */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Delivery Address
            </h2>
            {loadingAddresses ? (
              <div className="h-20 bg-muted rounded-xl animate-pulse" />
            ) : addresses.length === 0 ? (
              <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Plus className="w-4 h-4" /> Add Delivery Address
              </button>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddress === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                  }`}>
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="font-medium text-sm">{addr.label}</p>
                      <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}</p>
                    </div>
                    {addr.isDefault && (
                      <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </label>
                ))}
                <button className="flex items-center gap-2 text-sm text-primary hover:underline mt-2">
                  <Plus className="w-3.5 h-3.5" /> Add new address
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment Method
            </h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label key={method.id} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-primary"
                  />
                  <method.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Order Notes (optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions for restaurant or delivery..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                  <span className="flex-shrink-0">₾{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₾{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span><span>₾{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span><span>₾{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount</span><span>-₾{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
                <span>Total</span><span className="text-primary">₾{total.toFixed(2)}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Placing Order..." : `Place Order · ₾${total.toFixed(2)}`}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
