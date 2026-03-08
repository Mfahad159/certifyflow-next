"use client";
import React, { useState, useEffect } from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Check, X, Mail, User, FileText, LogOut, Download } from 'lucide-react'
import { supabase, signOut } from '@/lib/supabaseClient'
import { campaignService } from '@/lib/campaignService.client'
import ThemeToggle from '../../ui/theme-toggle'
import { Input } from '../../ui/input'
import { Loader } from '../../ui/loader'

export default function CampaignManage() {
  const navigate = useRouter()
  const pathname = usePathname()
  const { campaignId } = useParams()
  const [campaignData, setCampaignData] = useState(null)

  const [user, setUser] = useState(null)
  const [recipients, setRecipients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, sent, pending
  const [isLoading, setIsLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Theme Initialisation
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Load campaign from database if campaignId is provided
  useEffect(() => {
    const loadCampaign = async () => {
      // Minimum loading time for smooth UX (prevents flash)
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 3000))

      if (campaignId && !campaignData) {
        setIsLoading(true)
        try {
          const [{ data, error }] = await Promise.all([
            supabase
              .from('campaigns')
              .select('*')
              .eq('id', campaignId)
              .single(),
            minLoadTime
          ])

          if (error) throw error

          if (data && data.csv_data) {
            setCampaignData(data)
            const { headers, data: csvRows } = data.csv_data
            const recipientsList = csvRows.map((row, idx) => ({
              id: idx,
              data: row,
              status: data.recipients_status?.[idx] || 'pending'
            }))
            setRecipients(recipientsList)
          }
        } catch (error) {
          console.error('Error loading campaign:', error)
          toast.error('Failed to load campaign')
        } finally {
          setIsLoading(false)
        }
      } else {
        // Still apply minimum load time for consistent UX
        await minLoadTime
        setIsLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId])

  useEffect(() => {
    if (campaignData && campaignData.csv_data) {
      const { headers, data } = campaignData.csv_data
      const recipientsList = data.map((row, idx) => ({
        id: idx,
        data: row,
        status: campaignData.recipients_status?.[idx] || 'pending'
      }))
      setRecipients(recipientsList)
    }
  }, [campaignData])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    await signOut()
    navigate.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    )
  }

  const toggleRecipientStatus = async (id) => {
    const newRecipients = recipients.map(r =>
      r.id === id ? { ...r, status: r.status === 'sent' ? 'pending' : 'sent' } : r
    )
    setRecipients(newRecipients)

    // Update campaign in Supabase
    if (campaignData && campaignData.id) {
      const statusMap = {}
      newRecipients.forEach(r => {
        statusMap[r.id] = r.status
      })
      const sentCount = newRecipients.filter(r => r.status === 'sent').length

      try {
        await campaignService.updateCampaign(campaignData.id, {
          recipients_status: statusMap,
          emails_sent: sentCount,
          status: sentCount === newRecipients.length ? 'completed' : 'processing'
        })
      } catch (error) {
        console.error('Error updating campaign:', error)
      }
    }
  }

  const markAllAs = async (status) => {
    const newRecipients = recipients.map(r => ({ ...r, status }))
    setRecipients(newRecipients)

    // Update campaign in Supabase
    if (campaignData && campaignData.id) {
      const statusMap = {}
      newRecipients.forEach(r => {
        statusMap[r.id] = r.status
      })
      const sentCount = status === 'sent' ? newRecipients.length : 0

      try {
        await campaignService.updateCampaign(campaignData.id, {
          recipients_status: statusMap,
          emails_sent: sentCount,
          status: status === 'sent' ? 'completed' : 'processing'
        })
      } catch (error) {
        console.error('Error updating campaign:', error)
      }
    }
  }

  const filteredRecipients = recipients.filter(r => {
    const matchesSearch = searchQuery === '' ||
      Object.values(r.data).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const sentCount = recipients.filter(r => r.status === 'sent').length
  const totalCount = recipients.length
  const progressPercent = totalCount > 0 ? (sentCount / totalCount) * 100 : 0

  if (!campaignData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">No Campaign Data</h2>
          <button
            onClick={() => navigate.push('/dashboard')}
            className="bg-accent text-white px-6 py-3 rounded-full font-bold hover:bg-[#A098FF]/90 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const headers = campaignData.csv_data?.headers || []

  return (
    <div className="min-h-screen bg-background no-scrollbar selection:bg-[#A098FF] selection:text-white">
      {/* Dashboard Navbar */}
      <DashboardNavbar
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        scrolled={scrolled}
        currentPage="campaigns"
        showBackButton={true}
        backButtonPath="/dashboard/campaigns"
      />

      <main className="ml-[var(--sidebar-width,256px)] min-h-screen transition-all duration-500">
        {/* Dashboard Header */}
        <section className="relative pt-40 pb-16 w-full overflow-hidden bg-background">


          <div className="relative z-10 max-w-[1400px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">


                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-foreground dark:text-white">
                  See how <span className="text-accent italic">{campaignData.name}</span> <br />is going
                </h1>

                <p className="text-sm md:text-base text-muted-foreground dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
                  Keep an eye on your progress as certificates reach their targets. Easily manage your recipients and make sure everything is running smoothly.
                </p>
              </div>

              <div className="flex items-center gap-8 animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="text-center">
                  <p className="text-[12px] font-bold text-muted-foreground mb-1">Total Recipients</p>
                  <p className="text-2xl font-serif font-bold text-foreground">{totalCount}</p>
                </div>
                <div className="h-10 w-px bg-border/50" />
                <div className="text-center">
                  <p className="text-[12px] font-bold text-muted-foreground mb-1">Delivered</p>
                  <p className="text-2xl font-serif font-bold text-accent">{sentCount}</p>
                </div>
                <div className="h-10 w-px bg-border/50" />
                <div className="text-center">
                  <p className="text-[12px] font-bold text-muted-foreground mb-1">Efficiency</p>
                  <p className="text-2xl font-serif font-bold text-foreground">{Math.round(progressPercent)}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
          {/* Progress Bar Section */}
          <div className="mb-5">
            <div className="w-full h-1 bg-secondary dark:bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(107,85,253,0.3)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Actions Bar */}
          <div className="mb-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group/search flex-1 w-full">
              <Input
                type="text"
                placeholder="Filter recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-6 rounded-full bg-background/50 backdrop-blur-xl border-border focus:border-accent/40"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-accent transition-colors">
                <User size={18} />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary/20 dark:bg-zinc-900/40 p-1.5 rounded-full border border-border backdrop-blur-md">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-6 py-2.5 rounded-full text-[12px] font-bold transition-all ${filterStatus === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('sent')}
                className={`px-6 py-2.5 rounded-full text-[12px] font-bold transition-all ${filterStatus === 'sent'
                  ? 'bg-background text-accent shadow-sm'
                  : 'text-muted-foreground hover:text-accent'
                  }`}
              >
                Sent
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-6 py-2.5 rounded-full text-[12px] font-bold transition-all ${filterStatus === 'pending'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Pending
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => markAllAs('sent')}
                className="px-6 py-3.5 rounded-full text-[12px] font-bold bg-accent text-white hover:bg-lavender-600 transition-all active:scale-95"
              >
                Mark All Sent
              </button>
              <button
                onClick={() => markAllAs('pending')}
                className="px-6 py-3.5 rounded-full text-[12px] font-bold bg-background border border-border text-foreground hover:bg-secondary transition-all"
              >
                Reset State
              </button>
            </div>
          </div>

          {/* Recipients Table */}
          <div className="bg-background/50 backdrop-blur-3xl rounded-[48px] border border-border overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-8 px-10 text-[12px] font-bold text-foreground w-12">#</th>
                    {headers.map(header => (
                      <th key={header} className="py-8 px-6 text-[12px] font-bold text-foreground">
                        {header}
                      </th>
                    ))}
                    <th className="py-8 px-6 text-[12px] font-bold text-foreground text-center w-32">Status</th>
                    <th className="py-8 px-10 text-[12px] font-bold text-foreground text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredRecipients.map((recipient, idx) => (
                    <tr
                      key={recipient.id}
                      className="group hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="py-6 px-10 text-[12px] font-bold text-muted-foreground/60">
                        {idx + 1}
                      </td>
                      {headers.map(header => (
                        <td key={header} className="py-6 px-6 text-sm font-medium text-foreground">
                          {recipient.data[header]}
                        </td>
                      ))}
                      <td className="py-6 px-6 text-center">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[8px] font-bold backdrop-blur-md ${recipient.status === 'sent'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                          }`}>
                          {recipient.status === 'sent' ? (
                            <>
                              <Check size={10} className="mr-1.5" />
                              Success
                            </>
                          ) : (
                            'Ready'
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-10 text-right">
                        <button
                          onClick={() => toggleRecipientStatus(recipient.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ml-auto ${recipient.status === 'sent'
                            ? 'bg-background border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500'
                            : 'bg-accent border border-accent text-white hover:bg-lavender-600'
                            }`}
                          title={recipient.status === 'sent' ? 'Reset to Ready' : 'Manually Send'}
                        >
                          {recipient.status === 'sent' ? <X size={14} /> : <Check size={14} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRecipients.length === 0 && (
                <div className="py-24 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-[20px] bg-secondary/20 border border-border flex items-center justify-center mb-6">
                    <User size={32} className="text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-serif">No matches found</h3>
                  <p className="text-[12px] text-muted-foreground/60 font-bold mt-2">Adjust your filtering parameters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
