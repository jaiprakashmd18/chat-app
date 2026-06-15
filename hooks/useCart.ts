"use client";

import { useCartStore } from "@/store/cart";
import { calculateDeliveryFee, calculateTax } from "@/lib/utils";

export function useCart() {
  const store = useCartStore();
  const subtotal = store.subtotal();
  const deliveryFee = subtotal > 0 ? calculateDeliveryFee(3) : 0;
  const tax = calculateTax(subtotal);
  const total = subtotal + deliveryFee + tax - store.discount;

  return {
    ...store,
    subtotal,
    deliveryFee,
    tax,
    total: Math.max(0, total),
    isEmpty: store.items.length === 0,
  };
}
