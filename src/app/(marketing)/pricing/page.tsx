"use client";

import { CheckCircle2, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex-grow flex flex-col items-center pt-24 pb-32 px-6 relative w-full overflow-hidden">
      {/* Ambient Glow Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[120%] rounded-full bg-primary-container/5 blur-[120px]"></div>
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[100%] rounded-full bg-secondary-container/10 blur-[100px]"></div>
      </div>
      
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 -z-10 opacity-60 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(138, 43, 226, 0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px'
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
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-end">
        
        {/* Tier 1: Scholar */}
        <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col h-[520px] transition-all duration-300 hover:bg-surface-container-low shadow-[0_40px_100px_-20px_rgba(27,27,27,0.03)] border border-outline-variant/30">
          <div className="mb-8">
            <h3 className="font-headline font-semibold text-2xl text-on-surface mb-2">Scholar</h3>
            <p className="font-body text-on-surface-variant mb-6">For independent study and basic research.</p>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-bold text-4xl text-on-surface">Free</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Access to public case law database</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Basic text search</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Save up to 50 citations</span>
            </li>
          </ul>
          <button className="w-full py-3 rounded-md font-label text-sm font-medium text-primary border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
            Start Free
          </button>
        </div>

        {/* Tier 2: Counsel (Highlighted) */}
        <div className="bg-surface-container-lowest rounded-xl p-10 flex flex-col h-[560px] relative shadow-[0_40px_100px_-20px_rgba(27,27,27,0.06)] border border-primary-container/20 ring-1 ring-primary-container/10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-container font-label text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-8 mt-2">
            <h3 className="font-headline font-bold text-3xl text-on-surface mb-2 flex items-center gap-2">
              Counsel
              <Sparkles className="text-primary-container w-6 h-6 fill-primary-container" />
            </h3>
            <p className="font-body text-on-surface-variant mb-6">Advanced intelligence for active practitioners.</p>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-bold text-5xl text-on-surface">$49</span>
              <span className="font-body text-on-surface-variant">/month</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Full database access</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface font-semibold text-primary">AI Summarization tool</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Unlimited saved citations</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Priority email support</span>
            </li>
          </ul>
          <button className="w-full py-3.5 rounded-md font-label text-sm font-medium text-on-primary bg-gradient-to-br from-primary to-primary-container hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(138,43,226,0.25)]">
            Subscribe to Counsel
          </button>
        </div>

        {/* Tier 3: Barrister */}
        <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col h-[520px] transition-all duration-300 hover:bg-surface-container-low shadow-[0_40px_100px_-20px_rgba(27,27,27,0.03)] border border-outline-variant/30">
          <div className="mb-8">
            <h3 className="font-headline font-semibold text-2xl text-on-surface mb-2">Barrister</h3>
            <p className="font-body text-on-surface-variant mb-6">Enterprise scale curation and analysis.</p>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-bold text-4xl text-on-surface">$499</span>
              <span className="font-body text-on-surface-variant">/year</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Everything in Counsel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Firm-wide collaborative workspaces</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-primary-container w-[20px] h-[20px] mt-0.5 shrink-0" />
              <span className="font-body text-on-surface">Dedicated account manager</span>
            </li>
          </ul>
          <button className="w-full py-3 rounded-md font-label text-sm font-medium text-on-surface border border-outline-variant/50 hover:bg-surface-container-low transition-colors">
            Contact Sales
          </button>
        </div>

      </div>
    </div>
  );
}
