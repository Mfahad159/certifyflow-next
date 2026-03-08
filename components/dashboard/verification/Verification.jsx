"use client";
import { useRouter, useParams } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Loader } from '../../ui/loader'
import Navbar from '../../Landing/shared/Navbar'
import {
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Mail,
  Award,
  ArrowLeft,
  Shield,
  QrCode,
  Search,
  Lock,
  Globe,
  Fingerprint,
  Zap,
  HelpCircle,
  ArrowRight
} from 'lucide-react'
import Footer from '../../Landing/shared/Footer'
import FooterCTA from '../../Landing/shared/FooterCTA'
import Hero from '../../Landing/index/components/Hero'

export default function Verification() {
  const { uuid } = useParams()
  const navigate = useRouter()
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState(null)
  const [campaign, setCampaign] = useState(null)
  const [error, setError] = useState(null)
  const [inputUuid, setInputUuid] = useState('')

  useEffect(() => {
    if (uuid) {
      loadCertificate(uuid)
    } else {
      // Fake loader to simulate initializing secure environment
      setLoading(true)
      const timer = setTimeout(() => {
        setLoading(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [uuid])

  async function loadCertificate(certificateUuid) {
    try {
      setLoading(true)
      setError(null)

      // Minimum loading time for smooth UX
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 3000))

      const fetchCertificate = supabase
        .from('certificates')
        .select('*')
        .eq('certificate_uuid', certificateUuid)
        .single()

      // Wait for minimum time and certificate fetch
      const [_, { data: cert, error: certError }] = await Promise.all([
        minLoadTime,
        fetchCertificate
      ])

      if (certError) {
        setError('Certificate not found')
        return
      }

      setCertificate(cert)

      // Fetch campaign details
      const { data: camp, error: campError } = await supabase
        .from('campaigns')
        .select('name, created_at')
        .eq('id', cert.campaign_id)
        .single()

      if (!campError) {
        setCampaign(camp)
      }

      // Update viewed_at if not already viewed
      if (!cert.viewed_at) {
        await supabase
          .from('certificates')
          .update({
            viewed_at: new Date().toISOString(),
            status: 'viewed'
          })
          .eq('certificate_uuid', cert.certificate_uuid)
      }

    } catch (err) {
      console.error('Error loading certificate:', err)
      setError('Failed to verify certificate')
    } finally {
      setLoading(false)
    }
  }

  function handleVerify(e) {
    e.preventDefault()
    if (inputUuid.trim()) {
      navigate.push(`/verify/${inputUuid.trim()}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    )
  }

  // Show input form if no UUID in URL
  if (!uuid) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#A098FF] selection:text-white relative overflow-hidden">
        <Navbar />

        <Hero
          badgeText="Verification Portal"
          indicatorText="Official BulkCerts Database"
          title={<>Verify Your Certificate</>}
          description="Instant validation of digital assets. Enter the secure identification code below to verify the integrity and origin of this certificate."
          primaryCTA={{
            text: "Start Verification",
            onClick: () => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }
          }}
          childrenAboveButtons={true}
        >
          <div className="max-w-xl mx-auto w-full mt-8">
            <form onSubmit={handleVerify} className="relative group/search w-full">
              <input
                type="text"
                placeholder="Enter identification code..."
                value={inputUuid}
                onChange={(e) => setInputUuid(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-8 text-sm font-bold text-white focus:outline-none focus:border-accent/40 transition-all placeholder:text-zinc-600 backdrop-blur-xl"
                required
              />
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/search:text-accent transition-colors pointer-events-none" />
            </form>
          </div>
        </Hero>

        <section className="py-24 px-6 relative z-10">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
                Built for <span className="text-accent italic">Total</span> Integrity
              </h2>
              <p className="text-zinc-500 font-sans text-base max-w-2xl mx-auto leading-relaxed">
                Enterprise-grade security infrastructure ensuring every document remains
                authentic from the moment it was sent.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-lavender-200 flex items-center justify-center mb-8 shrink-0">
                  <Lock className="text-lavender-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Unique Identity</h3>
                <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                  Every asset is anchored to a unique cryptographic hash, ensuring
                  tamper-proof records across the entire lifecycle.
                </p>
              </div>
              <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-lavender-200 flex items-center justify-center mb-8 shrink-0">
                  <Globe className="text-lavender-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Public Registry</h3>
                <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                  Open and accessible worldwide, providing instant validation
                  for employers and global institutions.
                </p>
              </div>
              <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.08] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-lavender-200 flex items-center justify-center mb-8 shrink-0">
                  <Zap className="text-lavender-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Instant Verification</h3>
                <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                  Optimized database indexing for confirmation in under 200ms,
                  perfect for large-scale projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FooterCTA />
        <Footer />
      </div>
    )
  }


  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-[40px] border border-border bg-secondary/10 dark:bg-zinc-900/40 backdrop-blur-xl shadow-none">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">Verification Failed</h2>
            <p className="text-sm text-muted-foreground mb-10">
              {error || 'This certificate could not be verified. Please check the identification code.'}
            </p>
            <Button
              onClick={() => navigate.push('/')}
              className="w-full bg-accent text-white hover:bg-lavender-600 font-bold h-12 rounded-full"
            >
              <ArrowLeft size={16} />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const recipientData = certificate.recipient_data || {}
  const issuedDate = new Date(certificate.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#A098FF] selection:text-white relative overflow-hidden">
      <Navbar />

      <Hero
        badgeText="Verified Authentic"
        indicatorText="Official BulkCerts Database"
        title={<>Validation Successful</>}
        description="The record has been authenticated. The integrity and origin of this asset are officially confirmed."
        hideDefaultButtons={true}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-8">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-full sm:w-auto bg-accent text-accent-foreground pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Certificate Details
                <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-2xl lg:max-w-3xl p-0 border border-white/10 shadow-none max-h-[90vh] flex flex-col no-scrollbar bg-zinc-950 rounded-[32px] overflow-hidden">
              <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                <DialogHeader className="space-y-1 text-center sm:text-left">
                  <DialogTitle className="text-xl font-serif font-bold text-white">
                    Certificate Details
                  </DialogTitle>
                  <div className="text-muted-foreground text-[12px] uppercase font-bold opacity-60">
                    OFFICIAL VERIFIED RECORD
                  </div>
                </DialogHeader>

                <div className="space-y-4 max-w-3xl mx-auto">
                  {/* Primary Identity Row */}
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left transition-colors hover:bg-white/[0.07]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Authenticated
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3 break-words leading-tight">{certificate.recipient_name}</h2>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 font-mono text-[12px]">
                        <span className="text-zinc-700 select-none">UUID:</span>
                        <span className="break-all">{certificate.certificate_uuid}</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-lavender-200 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={28} className="text-lavender-600" />
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-2 overflow-hidden">
                    <div className="divide-y divide-white/5">
                      {/* Campaign */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                        <span className="text-[12px] font-bold uppercase text-zinc-500 flex items-center gap-3">
                          <Award size={14} className="text-accent" />
                          Project
                        </span>
                        <span className="text-base font-serif text-white text-right">{campaign?.name || 'Bulk Distribution'}</span>
                      </div>

                      {/* Issued Date */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                        <span className="text-[12px] font-bold uppercase text-zinc-500 flex items-center gap-3">
                          <Calendar size={14} className="text-accent" />
                          Date Issued
                        </span>
                        <span className="text-base font-serif text-white text-right">{issuedDate}</span>
                      </div>

                      {/* Email */}
                      {certificate.recipient_email && (
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                          <span className="text-[12px] font-bold uppercase text-zinc-500 flex items-center gap-3">
                            <Mail size={14} className="text-accent" />
                            Email Address
                          </span>
                          <span className="text-base font-serif text-white text-right">{certificate.recipient_email}</span>
                        </div>
                      )}

                      {/* Metadata Loop */}
                      {Object.entries(recipientData).map(([key, value]) => (
                        <div key={key} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                          <span className="text-[12px] font-bold uppercase text-zinc-500 flex items-center gap-3">
                            <Fingerprint size={14} className="text-accent" />
                            {key}
                          </span>
                          <span className="text-base font-serif text-white text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Footer - Compact */}
                  <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 flex items-center justify-center gap-3 text-center transition-colors hover:bg-accent/10 mt-4">
                    <Shield size={16} className="text-accent" />
                    <p className="text-zinc-500 text-xs font-medium">Immutable verification handled by BulkCerts Secure Registry</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={() => window.location.href = 'mailto:support@bulkcerts.com?subject=Report%20Issue%20with%20Certificate'}
            className="w-full sm:w-auto px-10 py-4 text-[12px] font-bold border border-white/10 rounded-full text-white uppercase hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Report an Issue
          </button>
        </div>
      </Hero>


      <FooterCTA />
      <Footer />
    </div>
  )
}
