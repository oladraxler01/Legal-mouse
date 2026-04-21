import HeroSection from "@/components/landing/HeroSection";
import AIResearchFeature from "@/components/landing/AIResearchFeature";
import SmartNotesFeature from "@/components/landing/SmartNotesFeature";
import CuratorExperience from "@/components/landing/CuratorExperience";
import IntegrationFeature from "@/components/landing/IntegrationFeature";
import CommunitySection from "@/components/landing/CommunitySection";
import StatsSection from "@/components/landing/StatsSection";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <main className="pt-32 pb-20">
      <HeroSection />
      <AIResearchFeature />
      <SmartNotesFeature />
      <CuratorExperience />
      <IntegrationFeature />
      <CommunitySection />
      <StatsSection />
      <FinalCTA />
    </main>
  );
}
