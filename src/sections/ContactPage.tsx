'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2, Building2, MessageCircle, Calendar } from 'lucide-react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'hello@sidcloud.com',
    desc: 'General inquiries & partnerships',
    href: 'mailto:hello@sidcloud.com',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+91 80 4567 8900',
    desc: 'Mon–Fri, 9am–7pm IST',
    href: 'tel:+918045678900',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'Koramangala, Bangalore',
    desc: '560034, Karnataka, India',
    href: 'https://maps.google.com',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
];

const reasons = [
  'Request a cloud assessment',
  'Get enterprise pricing',
  'Schedule a product demo',
  'Partnership inquiry',
  'Technical pre-sales question',
  'Career opportunities',
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '', reason: '', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/4 w-125 h-125 rounded-full bg-linear-to-br from-accent/8 to-purple-600/5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-8">
              <MessageCircle className="w-4 h-4 text-accent" /> Contact Us
            </motion.div>
            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6">
              Let&apos;s talk about your <span className="text-gradient-accent">cloud strategy</span>
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-xl text-white/85 leading-relaxed">
              Whether you&apos;re exploring managed cloud for the first time or looking to optimize an existing setup — our experts are ready to help.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.title}
                href={method.href}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] group ${method.bg}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 ${method.color}`}>
                  <method.icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-white/75 uppercase tracking-wider mb-1">{method.title}</p>
                <p className={`font-display font-semibold text-lg ${method.color} mb-1`}>{method.value}</p>
                <p className="text-sm text-white/85">{method.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {submitted ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="font-display font-semibold text-3xl text-white mb-3">Message received!</h2>
                    <p className="text-white/55 max-w-sm mx-auto leading-relaxed">
                      Our team will get back to you within 1 business day. For urgent matters, call us directly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="font-display font-semibold text-3xl text-white mb-2">Send us a message</h2>
                    <p className="text-white/80 text-sm">We&apos;ll respond within 1 business day</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">Full Name *</label>
                      <input
                        type="text" required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Rajesh Kumar"
                        className="input-field rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">Work Email *</label>
                      <input
                        type="email" required value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@company.com"
                        className="input-field rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">Company</label>
                      <input
                        type="text" value={form.company}
                        onChange={e => setForm({ ...form, company: e.target.value })}
                        placeholder="Acme Corp"
                        className="input-field rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">Phone</label>
                      <input
                        type="tel" value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="input-field rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">Reason for contacting</label>
                    <select
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      className="input-field rounded-xl appearance-none"
                    >
                      <option value="" className="bg-bg-elevated">Select a reason</option>
                      {reasons.map(r => <option key={r} value={r} className="bg-bg-elevated">{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-2">Message *</label>
                    <textarea
                      required rows={5} value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your cloud environment and what you're looking to achieve..."
                      className="input-field rounded-xl resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-8px_rgba(168,85,247,0.6)] transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <>Send Message <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Right Column */}
            <div className="space-y-8">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0.5}
                className="p-8 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/20"
              >
                <Calendar className="w-8 h-8 text-accent mb-4" />
                <h3 className="font-display font-semibold text-xl text-white mb-2">Book a 30-min consultation</h3>
                <p className="text-sm text-white/85 leading-relaxed mb-5">
                  Speak directly with a cloud architect. We&apos;ll review your current infrastructure and share recommendations — no commitment required.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent/15 border border-accent/30 text-accent text-sm font-semibold hover:bg-accent/20 transition-all"
                >
                  Schedule Free Call <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0.7}
                className="p-8 rounded-3xl bg-white/4 border border-white/10"
              >
                <Building2 className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="font-display font-semibold text-xl text-white mb-2">Enterprise Inquiries</h3>
                <p className="text-sm text-white/85 leading-relaxed mb-4">
                  For organizations with 500+ employees, complex multi-cloud environments, or compliance requirements — our enterprise team specializes in large-scale engagements.
                </p>
                <p className="text-sm text-white/85">
                  Email: <a href="mailto:enterprise@sidcloud.com" className="text-accent hover:text-accent-glow transition-colors">enterprise@sidcloud.com</a>
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0.9}
                className="p-6 rounded-2xl bg-white/3 border border-white/8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-white/70" />
                  <h3 className="font-semibold text-sm text-white">Office Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/85">Monday – Friday</span>
                    <span className="text-white font-medium">9:00 AM – 7:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/85">Saturday</span>
                    <span className="text-white font-medium">10:00 AM – 2:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/85">Emergency P1 Support</span>
                    <span className="text-accent font-medium">24/7 (Assure & Elite)</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
