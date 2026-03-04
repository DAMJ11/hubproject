import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PlatformSection from "@/components/PlatformSection";
import WhyManufySection from "@/components/WhyManufySection";
import QualitySection from "@/components/QualitySection";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <PlatformSection />
      <WhyManufySection />
      <QualitySection />
      <CTASection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
