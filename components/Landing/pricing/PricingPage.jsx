import { useRouter } from 'next/navigation';

import { Loader } from '../../ui/loader'
import { ArrowRight, Sparkles } from 'lucide-react'
import Hero from '../index/components/Hero'

export default function PricingPage() {
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
      

      {/* Hero Section */}
      <Hero 
        badgeText="Pricing 2026"
        indicatorText="Transparent and simple"
        title={<>Simple <span className="text-accent italic">Economics</span> for <br />Modern Organizations</>}
        description="Professional-grade pricing that evolves with your certification program. Connect your own email infrastructure and send unlimited emails at zero extra cost."
        secondaryCTA={{
          text: "View Tiers",
          onClick: () => {
            const element = document.getElementById('pricing');
            element?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      <Pricing />
      
      <div className="space-y-24 py-24">
        <CompetitorComparison />
        <FAQ />
      </div>

      <FooterCTA />
      <Footer />
    </div>
  )
}

