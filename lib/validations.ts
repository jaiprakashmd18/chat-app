import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number"),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const orderSchema = z.object({
  restaurantId: z.string().optional(),
  addressId: z.string(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().min(1),
      customization: z.string().optional(),
    })
  ),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "WALLET"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["FOOD", "PICKUP", "GROCERY", "PARCEL"]).default("FOOD"),
});

export const pickupOrderSchema = z.object({
  restaurantName: z.string().min(2),
  restaurantAddress: z.string().min(5),
  foodDescription: z.string().min(10),
  deliveryAddress: z.string().min(5),
  phone: z.string().min(9),
  notes: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

export const parcelSchema = z.object({
  pickupAddress: z.string().min(5),
  dropAddress: z.string().min(5),
  description: z.string().min(5),
  weight: z.number().optional(),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(9),
  notes: z.string().optional(),
});

export const restaurantSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(20),
  cuisine: z.array(z.string()).min(1),
  phone: z.string().min(9),
  email: z.string().email().optional(),
  address: z.string().min(10),
  city: z.string().min(2),
  deliveryFee: z.number().min(0),
  minOrderAmount: z.number().min(0),
  estimatedTime: z.number().min(5),
  openingTime: z.string(),
  closingTime: z.string(),
});

export const menuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(0),
  categoryId: z.string().optional(),
  isVeg: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

export const reviewSchema = z.object({
  restaurantId: z.string(),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20),
  description: z.string(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
});

export const addressSchema = z.object({
  label: z.string().min(2),
  street: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isDefault: z.boolean().default(false),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(5),
  description: z.string().min(20),
  category: z.enum(["ORDER", "PAYMENT", "DELIVERY", "ACCOUNT", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type PickupOrderInput = z.infer<typeof pickupOrderSchema>;
export type ParcelInput = z.infer<typeof parcelSchema>;
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
