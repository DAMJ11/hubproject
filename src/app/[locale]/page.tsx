import Header from "@/components/layout/Header";
import Hero from "@/components/Hero";
import PlatformSection from "@/components/PlatformSection";
import WhyManufySection from "@/components/WhyManufySection";
import QualitySection from "@/components/QualitySection";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StrategyCallSection from "@/components/StrategyCallSection";
import PricingSection from "@/components/PricingSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      <Header />
      <Hero />
      <PlatformSection />
      <WhyManufySection />
      <QualitySection />
      <CTASection />
      <TestimonialsSection />
      <StrategyCallSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
