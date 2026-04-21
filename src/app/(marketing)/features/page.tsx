"use client";

import FeaturesHero from "@/components/features/FeaturesHero";
import AILegalIntelligence from "@/components/features/AILegalIntelligence";
import StructuredLearning from "@/components/features/StructuredLearning";

export default function FeaturesPage() {
  return (
    <main className="pb-24">
      <FeaturesHero />
      <AILegalIntelligence />
      <StructuredLearning />
    </main>
  );
}
