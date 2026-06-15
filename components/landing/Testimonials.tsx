"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Nino Beridze",
    role: "Computer Science Student, TSU",
    content: "StudentExpress is a lifesaver! I order lunch between classes and it's always on time. The tracking feature is amazing!",
    rating: 5,
    avatar: "NB",
    color: "bg-blue-500",
  },
  {
    name: "Giorgi Kvaratskhelia",
    role: "Medical Student, TSMU",
    content: "The personal pickup feature is brilliant. I send them a screenshot of what I want from any restaurant and they handle the rest!",
    rating: 5,
    avatar: "GK",
    color: "bg-green-500",
  },
  {
    name: "Mariam Tabidze",
    role: "Law Student, IU",
    content: "Grocery delivery saves me so much time. The student discount and reward points make it super affordable.",
    rating: 5,
    avatar: "MT",
    color: "bg-purple-500",
  },
  {
    name: "David Tkemaladze",
    role: "Business Student, FU",
    content: "Fast delivery, great prices, and the parcel service works perfectly for sending things home to my parents.",
    rating: 5,
    avatar: "DT",
    color: "bg-orange-500",
  },
  {
    name: "Ana Jikia",
    role: "Architecture Student, GTU",
    content: "The app is so clean and easy to use. Scheduling orders for specific times is exactly what I needed!",
    rating: 5,
    avatar: "AJ",
    color: "bg-pink-500",
  },
  {
    name: "Luka Mamardashvili",
    role: "Engineering Student, GTU",
    content: "Referred 5 friends and earned enough credit for a week of free deliveries. The referral program is awesome!",
    rating: 5,
    avatar: "LM",
    color: "bg-indigo-500",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background overflow-hidden" id="testimonials">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Student Stories
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Loved by Students
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands of students who trust StudentExpress Georgia for their daily deliveries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
                "{t.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
