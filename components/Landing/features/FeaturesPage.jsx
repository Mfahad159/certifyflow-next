"use client"

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Loader } from '../../ui/loader'
import { ArrowRight, Sparkles } from 'lucide-react'

import Hero from '../index/components/Hero'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import FooterCTA from '../shared/FooterCTA'
import DetailedFeatures from './components/DetailedFeatures'
import TrustVerification from './components/TrustVerification'

export default function FeaturesPage() {
  const navigate = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#A098FF] selection:text-white">
      <Navbar />

      <Hero
        badgeText="Toolkit 2026"
        indicatorText="Everything you need in one place"
        title={<>Everything you need for <br /><span className="text-accent italic">stress-free</span> certificates</>}
        description="We're more than just a PDF generator. BulkCerts is your complete partner for designing, sending, and tracking every certificate you'll ever need."
        secondaryCTA={{
          text: "Compare Plans",
          onClick: () => navigate.push('/pricing')
        }}
      />

      {/* Core Sections */}
      <DetailedFeatures />

      <TrustVerification />

      {/* Footer / CTA */}
      <FooterCTA />

      {/* Footer - Minimal matching LandingPage */}
      <Footer />
    </div>
  )
}
/*tesing....*/