"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How do I place a food order?",
    a: "Browse restaurants, add items to your cart, choose your delivery address, select a payment method, and confirm your order. You'll receive a confirmation and can track it live.",
  },
  {
    q: "What is the Personal Pickup service?",
    a: "Can't find your favorite restaurant on our platform? No problem! Submit the restaurant name, address, and your order (with a screenshot), and our delivery partner will pick it up for you.",
  },
  {
    q: "How long does delivery take?",
    a: "Average delivery time is 25-40 minutes depending on the restaurant's preparation time and your distance. You can track your order in real-time.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery, Card Payments (Visa/Mastercard), Bank Transfer, and in-app Wallet balance. You can also use student loyalty points for discounts.",
  },
  {
    q: "How do I become a delivery partner?",
    a: "Register as a Delivery Partner, submit your documents (ID, vehicle registration, license), and after verification you can start accepting deliveries and earning money.",
  },
  {
    q: "Can I schedule an order in advance?",
    a: "Yes! During checkout, select 'Schedule for Later' and pick your preferred delivery date and time. We'll prepare your order to arrive right on schedule.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your unique referral code with friends. When they place their first order, you both earn ₾10 credit. There's no limit on how many friends you can refer!",
  },
  {
    q: "What happens if my order is wrong or missing items?",
    a: "Contact us immediately through the app's support chat or raise a ticket. We guarantee a refund or free replacement for any incorrect orders within 1 hour of delivery.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm md:text-base pr-4">{q}</span>
        <ChevronDown className={cn("w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 bg-muted/30" id="faq">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            FAQs
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about StudentExpress Georgia.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
