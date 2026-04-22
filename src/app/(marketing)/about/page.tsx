"use client";

import React, { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function AboutPage() {
  return (
    <div className="pb-24">
      <HeroSection />
      <MissionSection />
      <TeamSection />
      <ContactSection />
    </div>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Lady Justice carrying the scales of law"
          className="w-full h-full object-cover grayscale mix-blend-multiply"
          src="/lady-justice.png"
        />
      </div>
      <motion.section
        className="max-w-4xl mx-auto px-6 md:px-12 mb-28 pt-32 pb-10 text-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.h1
          variants={fadeUp}
          className="font-headline font-extrabold text-4xl sm:text-5xl md:text-7xl leading-tight mb-8 text-foreground tracking-tight"
        >
          Democratizing <br />
          <span className="gradient-text">Legal Intelligence.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="font-serif text-lg md:text-2xl text-muted leading-relaxed max-w-3xl mx-auto">
          We believe that the law should not be a walled garden. Legal Mouse is built to dismantle the complexity of legal research, bringing unparalleled clarity to every citation.
        </motion.p>
      </motion.section>
    </div>
  );
}

/* ─── Mission ─── */
function MissionSection() {
  return (
    <section className="bg-surface py-20 md:py-24 mb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-headline font-bold text-3xl md:text-4xl text-foreground mb-6">
              Precision in every citation.
            </motion.h2>
            <div className="space-y-5 font-serif text-base md:text-lg text-muted leading-loose">
              <motion.p variants={fadeUp}>
                The foundation of jurisprudence is precedent. Yet, accessing and interpreting that precedent has historically been gatekept by antiquated systems and prohibitive costs.
              </motion.p>
              <motion.p variants={fadeUp}>
                Legal Mouse was born from a singular, uncompromising vision: to build a legal research tool that thinks like a jurist but operates with the speed and precision of modern computation.
              </motion.p>
              <motion.p variants={fadeUp}>
                By utilizing advanced contextual mapping and a minimalist, editorial interface, we strip away the noise. What remains is pure signal — the exact case law, statute, or analysis you need, exactly when you need it.
              </motion.p>
            </div>
          </motion.div>

          <div className="relative h-80 md:h-[500px] rounded-lg overflow-hidden bg-surface-dim">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Courthouse architecture with geometric lines"
              className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply dark:mix-blend-normal dark:opacity-40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTji2eGx4QBpXRjgtxDSfk0F67Wj4hiR5dfM3bKEZb_Y39hWrssVWlEL0X7IPLfrf2XGGK7SpKG4wmehlzZDCO0Aw-cGXL3wY_7m0DEUQHQHi0yiCcffMkDiHcqJl2oTbEPmIq6A7gkezg09kLOK1wcw6tqaOcQCdmDjolvrM77mTkza_pxJeFNOHaryYQkOdCkNiL6yQ8pQqF5y9IwwPpmUaF_rjouYas_FQXBtepypzbGG2TWIwk35O2CVqS49MxfihlM04EWFU"
            />
            <div className="absolute bottom-6 left-6 right-6 glass-panel p-5 rounded-lg shadow-lg border border-outline-variant/20">
              <p className="font-serif italic text-foreground mb-2">
                &ldquo;The life of the law has not been logic: it has been experience.&rdquo;
              </p>
              <p className="font-sans text-xs text-muted uppercase tracking-widest">
                — Oliver Wendell Holmes Jr.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Team ─── */
function TeamSection() {
  const team = [
    {
      name: "Eleanor Vance",
      title: "Chief Jurisprudence Officer",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQPGHHwWfibaBvCJSTP5bLiirsxHz1i-y9fw-fHsmuxe5jlcZDilncrttyf4J75G8HGeD72GvR8qpoNaRUgFRpQrWgl6RbXpPWu0RA0UD3i_3eLDdbzSlzb-0MdrxF9GmwaC92kCEcqob_-CaLl3RHVDOMSOp9r1bMUt0TGxNPEXv09WNG_iXv8nqJCIae69FiPSc_ksJUErRE7p2fhBhMRrKgyGtxbHr95WYtwCDj2LrRW7EdA18-OKvv6Y4dzqPIGrjqe51OvQA",
    },
    {
      name: "Marcus Thorne",
      title: "Head of Engineering",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-vRbOGfg7FKIb4MZUfL7f_0BI6NwEOcXnqhcigonoE8ySRi9Ji1cGhXxtG9y1Dih318gXozbquQBl2ttOtkTHAUwyn2jFZnAhl_FrDj6zV6iGiasUJ9-EVpYaXnyZiOT09lqe693jSy92YqFdRILYOq50fkP1uTwNuZUvelH_ZvZCeSA7C1YwBME1vn8nAe4c4nFLCJXHFKSvyF2GVg-Avd5OCrcwid1XwcAX-Ro7iZ2kx8MiHvcMw7Rms-PEvOLniiIuT0dbI2A",
    },
    {
      name: "Sarah Lin",
      title: "Director of Product",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcr0NzZL5d4qbMZqKwoOixIKeIHEZ5KqBhjb1V8ADUi_4v3RAxGK76QmV33LSyhcPRX8EVDEYplxX3eg1suzY2aeUy9h7ZikmfHDLmHtbyIHngzg1tSL8Uw7eeQZrCz0jXI-YoMJVG5xp-6yDW7U_S9iCrE3GPFpBSFoTIClXmFQmHy-WrMmCEdQlN3q1-G2J53YfVFjktNE7tLUuLIyNUAa2Nm5ElrVM1pylxxM_Hgjj-lMkk0lGhDHK5OOMqBz6v2_JN6w0fe_o",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28">
      <div className="text-center mb-14">
        <h2 className="font-headline font-bold text-3xl md:text-4xl text-foreground mb-4">The Architects</h2>
        <p className="font-serif text-lg text-muted">A convergence of legal scholars and technologists.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {team.map(({ name, title, img }) => (
          <motion.div key={name} className="group" whileHover={{ y: -4 }}>
            <div className="aspect-[3/4] bg-surface-dim rounded-lg mb-5 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                src={img}
              />
            </div>
            <h3 className="font-headline font-bold text-xl text-foreground mb-1">{name}</h3>
            <p className="font-sans text-sm text-primary font-medium tracking-wide">{title}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Contact Form ─── */
function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="max-w-3xl mx-auto px-6 md:px-12 text-center">
      <h2 className="font-headline font-bold text-3xl md:text-4xl text-foreground mb-6">Initiate Inquiry</h2>
      <p className="font-serif text-lg text-muted mb-10">
        Whether you represent an academic institution, a major firm, or are an independent researcher, we are ready to discuss how Legal Mouse can elevate your practice.
      </p>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary/10 border border-primary/20 rounded-xl p-10 text-center"
        >
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-headline text-xl font-bold text-foreground mb-2">Inquiry Received</h3>
          <p className="font-serif text-muted">Our team will respond within 48 hours.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 font-sans text-sm text-primary font-semibold hover:underline"
          >
            Send another inquiry
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-7 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div>
              <label htmlFor="name" className="block font-sans text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. John Doe"
                className="w-full bg-surface-dim border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 font-serif text-lg px-1 py-3 transition-colors text-foreground placeholder:text-muted/50"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-sans text-sm font-medium text-foreground mb-2">
                Institutional Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. j.doe@firm.com"
                className="w-full bg-surface-dim border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 font-serif text-lg px-1 py-3 transition-colors text-foreground placeholder:text-muted/50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block font-sans text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              placeholder="How can we assist you?"
              className="w-full bg-surface-dim border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 font-serif text-lg px-1 py-3 transition-colors resize-none text-foreground placeholder:text-muted/50"
            />
          </div>
          <div className="text-center pt-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-sans font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider text-sm disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Inquiry
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
