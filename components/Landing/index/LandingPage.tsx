import { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import Hero from './components/Hero';
import ProblemSolution from '../features/components/ProblemSolution';
import CoreFeatures from '../features/components/CoreFeatures';
import TrustVerification from '../features/components/TrustVerification';
import Workflow from '../workflow/components/Workflow';
import TemplateShowcase from './components/TemplateShowcase';
import EmailTemplateShowcase from './components/EmailTemplateShowcase';
import Pricing from '../pricing/components/Pricing';
import FAQ from '../shared/FAQ';
import FooterCTA from '../shared/FooterCTA';
import Footer from '../shared/Footer';
import { Loader } from '../../ui/loader';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 3 second loader for smooth UX
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#A098FF] selection:text-white">
      <Navbar />
      <Hero 
        title={<>Send and track thousands of certificates, <span className="text-accent italic font-bold">without</span> the headache.</>}
        description="Tired of messy spreadsheets? We help you run smooth certification campaigns, send professional emails automatically, and fix recipient typos in one click. It’s like having an extra pair of hands."
        secondaryCTA={{
          text: "Watch 1-Min Demo",
          onClick: () => console.log('Demo clicked')
        }}
      />
      <ProblemSolution />
      <CoreFeatures />
      <TrustVerification />
      <TemplateShowcase />
      <EmailTemplateShowcase />
      <Workflow />
      <Pricing />
      <FAQ />
      <FooterCTA />

      <Footer />
    </div>
  );
}
