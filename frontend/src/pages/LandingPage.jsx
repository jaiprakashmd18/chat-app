import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  MessageCircle, Users, Shield, Zap, Globe, Bot,
  Star, ChevronDown, Menu, X, Check, ArrowRight,
  Video, Mic, Bell, Search, Hash, Volume2, Sparkles
} from 'lucide-react';

const features = [
  { icon: MessageCircle, title: 'Real-Time Messaging', desc: 'Instant messages with read receipts, typing indicators, and reactions.' },
  { icon: Video, title: 'HD Video Calls', desc: 'Crystal-clear video calls with screen sharing and group support.' },
  { icon: Users, title: 'Groups & Communities', desc: 'Create communities with channels, roles, and permission systems.' },
  { icon: Bot, title: 'MeAI Assistant', desc: 'Built-in AI for smart replies, translation, and summarization.' },
  { icon: Shield, title: 'End-to-End Security', desc: 'Your conversations stay private with enterprise-grade security.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed with WebSocket technology for zero-lag messaging.' },
  { icon: Globe, title: 'Cross-Platform', desc: 'Works seamlessly on web, mobile, and desktop.' },
  { icon: Search, title: 'Powerful Search', desc: 'Find messages, files, users, and groups instantly.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Product Manager', avatar: 'SC', text: 'MeCHAT transformed how our team communicates. The AI assistant saves us hours every week.' },
  { name: 'Marcus Rodriguez', role: 'Software Engineer', avatar: 'MR', text: 'Finally a chat app that has everything. The video calls quality is outstanding.' },
  { name: 'Aisha Patel', role: 'Designer', avatar: 'AP', text: 'The UI is gorgeous and the dark mode is perfect. I use it for both work and personal chats.' },
];

const pricingPlans = [
  { name: 'Free', price: '$0', period: 'forever', features: ['Up to 10 friends', 'Basic messaging', '1GB storage', 'Standard quality calls', 'Community access'], popular: false },
  { name: 'Pro', price: '$9', period: '/month', features: ['Unlimited friends', 'Priority messaging', '50GB storage', 'HD video calls', 'AI Assistant', 'Custom themes', 'Priority support'], popular: true },
  { name: 'Team', price: '$29', period: '/month', features: ['Everything in Pro', 'Team workspace', '500GB storage', 'Advanced analytics', 'Admin dashboard', 'API access', 'Dedicated support'], popular: false },
];

const faqs = [
  { q: 'Is MeCHAT free to use?', a: 'Yes! MeCHAT offers a generous free tier with all essential features. Premium plans unlock advanced AI, more storage, and HD calls.' },
  { q: 'How many people can join a group?', a: 'Free groups support up to 200 members. Pro groups support unlimited members with advanced moderation tools.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard encryption, JWT authentication, and never sell your data to third parties.' },
  { q: 'Can I use MeCHAT on mobile?', a: 'MeCHAT is fully responsive and works perfectly on all mobile browsers. Native apps are coming soon.' },
  { q: 'What is MeAI?', a: 'MeAI is our built-in AI assistant that can answer questions, suggest replies, translate messages, and summarize conversations.' },
];

function FloatingParticle({ delay, duration, x, y }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-primary-500/30"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ y: [-20, 20, -20], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    delay: Math.random() * 3, duration: 3 + Math.random() * 4,
  }));

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl transform -translate-x-1/2" />
        {particles.map(p => <FloatingParticle key={p.id} {...p} />)}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-glow-sm">
                <MessageCircle size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">MeCHAT</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'FAQ', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-white/60 hover:text-white transition-colors text-sm font-medium">
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth/login" className="btn-ghost text-sm px-4 py-2">Login</Link>
              <Link to="/auth/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </div>

            <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-white/10 px-4 py-4 flex flex-col gap-4"
          >
            {['Features', 'Pricing', 'FAQ', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-white/70 hover:text-white" onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/auth/login" className="btn-secondary flex-1 text-center text-sm">Login</Link>
              <Link to="/auth/register" className="btn-primary flex-1 text-center text-sm">Get Started</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div style={{ opacity, y }} className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-primary-400 text-sm font-medium mb-8">
              <Sparkles size={14} />
              <span>Introducing MeAI - Your Smart Chat Companion</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            <span className="text-white">Connect.</span>{' '}
            <span className="gradient-text">Chat.</span>{' '}
            <span className="text-white">Create.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            The modern messaging platform that brings Discord's communities, WhatsApp's simplicity,
            Telegram's speed, and Slack's productivity together in one beautiful app.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/auth/register" className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2 shadow-glow">
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link to="/auth/login" className="btn-secondary px-8 py-4 text-lg flex items-center justify-center gap-2">
              Sign In
            </Link>
          </motion.div>

          {/* App preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-3xl"
          >
            <div className="glass-card overflow-hidden shadow-2xl">
              <div className="bg-dark-800/80 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                  {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
                  ))}
                </div>
                <span className="text-white/40 text-xs ml-2">MeCHAT</span>
              </div>
              <div className="flex h-72">
                <div className="w-16 bg-dark-800/60 flex flex-col items-center py-4 gap-4 border-r border-white/5">
                  {[Hash, Volume2, Users, Bell].map((Icon, i) => (
                    <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-primary-600 text-white' : 'bg-white/5 text-white/40'}`}>
                      <Icon size={18} />
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
                    {[
                      { sent: false, msg: 'Hey! Welcome to MeCHAT 👋', name: 'Sarah' },
                      { sent: true, msg: 'Thanks! This looks amazing 🔥' },
                      { sent: false, msg: 'Wait till you try the AI assistant and video calls!', name: 'Sarah' },
                    ].map((item, i) => (
                      <div key={i} className={`flex ${item.sent ? 'justify-end' : 'justify-start'} gap-2`}>
                        {!item.sent && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">S</div>}
                        <div className={item.sent ? 'message-bubble-sent text-sm' : 'message-bubble-received text-sm'}>
                          {item.msg}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-white/30 text-sm">
                      <span>Type a message...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-600/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-600/20 rounded-full blur-xl" />
          </motion.div>
        </motion.div>

        <motion.a
          href="#features"
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/30 hover:text-white transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={28} />
        </motion.a>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              MeCHAT combines the best features from your favorite apps into one powerful platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
                  <feature.icon className="text-primary-400" size={24} />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50+', label: 'Active Users' },
              { value: '10K+', label: 'Messages/Day' },
              { value: '99.9%', label: 'Uptime' },
              { value: '<50ms', label: 'Latency' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-white/50 text-lg">Start free, upgrade when you need more</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 relative ${plan.popular ? 'glow-border ring-1 ring-primary-500/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black gradient-text">{plan.price}</span>
                    <span className="text-white/40">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-primary-400 flex-shrink-0" />
                      <span className="text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth/register"
                  className={plan.popular ? 'btn-primary w-full text-center block' : 'btn-secondary w-full text-center block'}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Loved by users</h2>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-white/50 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    className="px-5 pb-5 text-white/60 text-sm leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-white/50">Have questions? We'd love to hear from you.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="your@email.com"
                    value={contactForm.email}
                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Message</label>
                <textarea
                  className="input h-32 resize-none"
                  placeholder="How can we help?"
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                />
              </div>
              <button className="btn-primary w-full py-3">Send Message</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                <MessageCircle size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">MeCHAT</span>
            </Link>
            <p className="text-white/30 text-sm">Connect. Chat. Create. — © 2026 MeCHAT. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Support'].map(l => (
                <a key={l} href="#" className="text-white/40 hover:text-white text-sm transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
