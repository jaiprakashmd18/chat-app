import type { User, Restaurant, MenuItem, Order, DeliveryPartner } from "@prisma/client";

export type { User, Restaurant, MenuItem, Order, DeliveryPartner };

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: string;
}

export interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: CartItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export interface OrderWithDetails extends Order {
  restaurant?: Restaurant | null;
  deliveryPartner?: (DeliveryPartner & { user?: User | null }) | null;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    image?: string | null;
  }>;
  address?: {
    street: string;
    city: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
}

export interface RestaurantWithDetails extends Restaurant {
  categories?: Array<{ id: string; name: string }>;
  _count?: { orders: number; reviews: number };
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  totalUsers?: number;
  totalRestaurants?: number;
  totalDeliveryPartners?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ThemeMode = "light" | "dark" | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "PAYMENT" | "PROMO" | "SYSTEM";
  isRead: boolean;
  createdAt: Date;
}

export interface TrackingUpdate {
  status: string;
  timestamp: string;
  message: string;
  location?: string;
}
