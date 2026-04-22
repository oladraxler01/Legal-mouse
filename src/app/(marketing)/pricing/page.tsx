"use client";

import { CheckCircle2, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex-grow flex flex-col items-center pt-24 pb-32 px-6 relative w-full overflow-hidden">
      {/* Top half background (Light Purple) */}
      <div className="absolute top-0 left-0 w-full h-[65%] bg-primary/5 -z-20"></div>
      
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 -z-10 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Hero Header */}
      <header className="max-w-3xl text-center mb-20">
        <h1 className="font-headline font-bold text-5xl md:text-6xl text-on-surface mb-6 tracking-tight">
          Clarity at every scale.
        </h1>
        <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
          Whether you are an independent researcher or a major firm, choose the level of curation that fits your practice.
        </p>
      </header>

      {/* Pricing Cards Section */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-stretch">
        
        {/* Tier 1: Scholar */}
        <div className="bg-surface-container-lowest rounded-xl p-10 flex flex-col transition-all duration-300 shadow-sm border border-outline-variant/20">
          <div className="mb-8">
            <h3 className="font-headline text-2xl text-on-surface mb-2">Scholar</h3>
            <p className="font-body text-on-surface-variant mb-6 text-base">For independent study and basic research.</p>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-semibold text-5xl text-on-surface">Free</span>
            </div>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Access to public case law database</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Basic text search</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Save up to 50 citations</span>
            </li>
          </ul>
          <button className="w-full py-3.5 rounded-md font-label text-sm font-semibold text-primary border border-outline-variant/30 hover:bg-primary/5 transition-colors">
            Start Free
          </button>
        </div>

        {/* Tier 2: Counsel (Highlighted) */}
        <div className="bg-surface-container-lowest rounded-xl p-10 flex flex-col relative shadow-md border border-primary/20">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d7b4fc] text-[#551a8b] font-label text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-8 mt-2">
            <h3 className="font-headline font-semibold text-3xl text-on-surface mb-2 flex items-center gap-2">
              Counsel
              <Sparkles className="text-primary w-5 h-5 fill-primary" />
            </h3>
            <p className="font-body text-on-surface-variant mb-6 text-base">Advanced intelligence for active practitioners.</p>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-semibold text-5xl text-on-surface">$49</span>
              <span className="font-body text-on-surface-variant text-base">/month</span>
            </div>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Full database access</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-primary font-bold text-[15px]">AI Summarization tool</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Unlimited saved citations</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Priority email support</span>
            </li>
          </ul>
          <button className="w-full py-3.5 rounded-md font-label text-sm font-semibold text-white bg-[#7f22ce] hover:bg-[#6b21a8] transition-colors shadow">
            Subscribe to Counsel
          </button>
        </div>

        {/* Tier 3: Barrister */}
        <div className="bg-surface-container-lowest rounded-xl p-10 flex flex-col transition-all duration-300 shadow-sm border border-outline-variant/20">
          <div className="mb-8">
            <h3 className="font-headline text-2xl text-on-surface mb-2">Barrister</h3>
            <p className="font-body text-on-surface-variant mb-6 text-base">Enterprise scale curation and analysis.</p>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-semibold text-5xl text-on-surface">$499</span>
              <span className="font-body text-on-surface-variant text-base">/year</span>
            </div>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Everything in Counsel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Firm-wide collaborative workspaces</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary fill-primary text-white w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-body text-on-surface text-[15px]">Dedicated account manager</span>
            </li>
          </ul>
          <button className="w-full py-3.5 rounded-md font-label text-sm font-semibold text-on-surface border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
            Contact Sales
          </button>
        </div>

      </div>

      {/* Frequently Asked Questions */}
      <div className="w-full max-w-4xl mx-auto mt-16 px-6">
        <h2 className="font-headline font-bold text-3xl text-center text-on-surface mb-10 tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/20">
            <h4 className="font-headline font-semibold text-xl text-on-surface mb-3">Can I switch plans later?</h4>
            <p className="font-body text-on-surface-variant text-[15px] leading-relaxed">
              Absolutely. You can upgrade or downgrade your plan at any time from your account settings. Changes will be pro-rated for the remainder of your billing cycle.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/20">
            <h4 className="font-headline font-semibold text-xl text-on-surface mb-3">What does 'Advanced AI case summaries' include?</h4>
            <p className="font-body text-on-surface-variant text-[15px] leading-relaxed">
              Our AI models are trained specifically on legal corpus. They provide concise summaries of facts, procedural history, issues, holdings, and reasoning, highlighting key precedents automatically.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/20">
            <h4 className="font-headline font-semibold text-xl text-on-surface mb-3">Is there a discount for non-profits or academic institutions?</h4>
            <p className="font-body text-on-surface-variant text-[15px] leading-relaxed">
              Yes, we offer specialized pricing for accredited academic institutions and registered 501(c)(3) organizations. Please contact our sales team for more information.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
