"use client";

import { motion } from "framer-motion";
import { GraduationCap, Percent, Gift, Users, CreditCard, Zap } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: GraduationCap,
    title: "Student Membership",
    description: "Verify your student ID and unlock exclusive discounts on every order.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Percent,
    title: "Up to 30% Discount",
    description: "Student members get exclusive discounts at partner restaurants daily.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Gift,
    title: "Reward Points",
    description: "Earn points on every order. Redeem for free deliveries and discounts.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Referral Bonus",
    description: "Refer a friend and earn ₾10 credit when they place their first order.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Cash, card, bank transfer, or your wallet — pay however you prefer.",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  {
    icon: Zap,
    title: "Priority Support",
    description: "Students get priority customer support with live chat assistance.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
];

export function StudentBenefits() {
  return (
    <section className="py-24 bg-muted/30" id="student-benefits">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              Student Exclusive
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Built For Students,{" "}
              <span className="text-gradient-orange">By Students</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              We understand the student life. That's why StudentExpress Georgia offers
              exclusive benefits, discounts, and features designed specifically for
              students living and studying in Georgia.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary/25"
              >
                Get Student Benefits
              </Link>
              <Link
                href="#"
                className="border border-border px-6 py-3 rounded-xl font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Right Grid */}
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-card rounded-2xl border border-border hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${b.bg} flex items-center justify-center mb-3`}>
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
