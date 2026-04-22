"use client";

import { useState } from "react";
import { Gavel, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const tabs = {
  FACTS:
    "Company advertised a reward for anyone contracting influenza after using their product as directed.",
  ISSUES: "Was the advertisement a binding offer or a mere puff?",
  RULE: "An offer can be made to the world at large and accepted through performance.",
};

export default function CuratorExperience() {
  const [activeTab, setActiveTab] =
    useState<keyof typeof tabs>("FACTS");

  return (
    <section className="py-24">
      <motion.div 
        className="max-w-7xl mx-auto px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="font-headline text-sm font-bold tracking-widest uppercase text-primary mb-4">
            The Curator Experience
          </h2>
          <h3 className="font-headline text-3xl md:text-4xl font-bold max-w-2xl mx-auto text-on-surface">
            Deconstruct Complexity.
          </h3>
          <p className="font-body text-xl text-on-surface-variant max-w-3xl mx-auto mt-6">
            Experience a meticulously designed interface that breaks down dense
            rulings into manageable, interconnected nodes.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="w-full bg-surface-container-low rounded-2xl p-4 md:p-8 border border-outline-variant/20 shadow-ambient">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-outline-variant/10 p-6 bg-surface-container-lowest">
              <div className="flex items-center gap-2 mb-6">
                <Gavel className="h-5 w-5 text-primary" />
                <h4 className="font-headline font-bold text-on-surface text-sm">
                  Carlill v Carbolic Smoke Ball Co
                </h4>
              </div>
              <div className="space-y-4">
                {(Object.keys(tabs) as Array<keyof typeof tabs>).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left p-3 rounded-lg transition-colors border-l-4 ${
                      activeTab === tab
                        ? "bg-primary/5 border-primary"
                        : "border-transparent hover:bg-surface-container-low cursor-pointer"
                    }`}
                  >
                    <span
                      className={`font-label text-xs font-bold block mb-1 ${
                        activeTab === tab
                          ? "text-primary"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {tab}
                    </span>
                    <p className="font-body text-sm text-on-surface-variant">
                      {tabs[tab]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 p-8 bg-white dark:bg-surface-container-lowest">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="font-headline text-2xl font-bold mb-2 text-on-surface">
                    Analysis: The Nature of the Offer
                  </h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-surface-container text-on-surface rounded text-xs font-label">
                      Contract Law
                    </span>
                    <span className="px-2 py-1 bg-surface-container text-on-surface rounded text-xs font-label">
                      Unilateral Contracts
                    </span>
                  </div>
                </div>
                <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>
              <div className="font-body text-lg leading-relaxed text-on-surface-variant space-y-4">
                <p>
                  The court established that the advertisement was not a mere
                  &apos;puff&apos; because of the specific claim that £1000 had
                  been deposited with Alliance Bank, showing sincerity in the
                  promise.
                </p>
                <p>
                  Furthermore, in unilateral contracts, notification of
                  acceptance is not required prior to performance; performance of
                  the condition is sufficient acceptance of the offer.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
