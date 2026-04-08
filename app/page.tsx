import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProblemSolution from "./components/ProblemSolution";
import HowItWorksSection from "./components/HowItWorksSection";
import FeaturesSection from "./components/FeaturesSection";
import Pathways from "./components/PathwaysSection";
import AudienceSection from "./components/AudienceSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      <HeroSection />
      <ProblemSolution />
      <HowItWorksSection />
      <FeaturesSection />
      <Pathways />
      <AudienceSection />
      <CTASection />
      <Footer />
    </main>
  );
}