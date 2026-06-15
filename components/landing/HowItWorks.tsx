"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, ShoppingCart, Truck } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up with your email or Google account in under 30 seconds.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    step: "02",
    icon: Search,
    title: "Browse & Select",
    description: "Explore restaurants, browse menus, and pick your favorite items.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: "03",
    icon: ShoppingCart,
    title: "Place Order",
    description: "Add to cart, choose delivery address, and pay securely.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    step: "04",
    icon: Truck,
    title: "Track & Enjoy",
    description: "Track your order live and get it delivered right to your door.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/30" id="how-it-works">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Order your favorite food in 4 simple steps. It's that easy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step Number */}
              <div className="relative mb-6">
                <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center shadow-sm border border-border`}>
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-display font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
