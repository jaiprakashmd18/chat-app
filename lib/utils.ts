import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "GEL") {
  return new Intl.NumberFormat("ka-GE", {
    style: "currency",
    currency: currency === "GEL" ? "GEL" : "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateOrderNumber() {
  const prefix = "SE";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function generateOTP(length = 6) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

export function calculateDeliveryFee(distance: number): number {
  const baseFee = 3;
  const perKmFee = 0.5;
  return Math.max(baseFee, baseFee + (distance - 2) * perKmFee);
}

export function calculateEstimatedTime(distance: number): number {
  const baseTime = 15;
  const perKmTime = 3;
  return baseTime + Math.floor(distance * perKmTime);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function isRestaurantOpen(openingTime: string, closingTime: string): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = openingTime.split(":").map(Number);
  const [closeHour, closeMin] = closingTime.split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  return currentTime >= openMinutes && currentTime <= closeMinutes;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "text-yellow-500 bg-yellow-50",
    ACCEPTED: "text-blue-500 bg-blue-50",
    PREPARING: "text-orange-500 bg-orange-50",
    PICKED_UP: "text-purple-500 bg-purple-50",
    OUT_FOR_DELIVERY: "text-indigo-500 bg-indigo-50",
    DELIVERED: "text-green-500 bg-green-50",
    CANCELLED: "text-red-500 bg-red-50",
    REFUNDED: "text-gray-500 bg-gray-50",
  };
  return colors[status] || "text-gray-500 bg-gray-50";
}

export function calculateTax(subtotal: number, taxRate = 0.18): number {
  return subtotal * taxRate;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
