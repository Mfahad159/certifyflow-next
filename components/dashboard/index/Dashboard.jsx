"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner'
import {
  LogOut,
  User,
  FileOutput,
  Send,
  LayoutDashboard,
  CheckCircle2,
  Plus,
  TrendingUp,
  FileText,
  ArrowRight,
  BarChart3,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  Trash2,
  Edit,
  MoreVertical,
  Zap,
  FileCheck,
  Search
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { campaignService } from '@/lib/campaignService.client'
import { Loader } from "@/components/ui/loader"
import { logout as signOut } from '@/lib/auth'

// Import UI components that might be missing (assuming they exist in the project)
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import DashboardNavbar from "../shared/DashboardNavbar"
import CampaignModal from "../shared/CampaignModal"

export default function Dashboard({ initialUser, initialCampaigns, initialStats }) {
  const navigate = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(initialUser || null)
  const [stats, setStats] = useState(initialStats || null)
  const [recentCampaigns, setRecentCampaigns] = useState(initialCampaigns || [])
  const [isLoading, setIsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState('Last 30 days')
  const [scrolled, setScrolled] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate.push('/')
  }

  const handleOpenCampaign = (campaign) => {
    navigate.push(`/dashboard/edit/${campaign.id}`, { state: { campaign } })
  }

  const handleManageCampaign = (campaign) => {
    navigate.push(`/dashboard/manage/${campaign.id}`, { state: { campaign } })
  }

  const handleNewCampaign = () => {
    setModalOpen(true)
  }

  const handleDeleteClick = (campaign) => {
    setDeleteDialog({ open: true, campaign })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.campaign) return

    setIsDeleting(true)
    try {
      await campaignService.deleteCampaign(deleteDialog.campaign.id)

      // Remove from local state
      setRecentCampaigns(prev => prev.filter(c => c.id !== deleteDialog.campaign.id))
      toast.success('Campaign deleted successfully')

      setDeleteDialog({ open: false, campaign: null })
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'active':
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    )
  }

  // Helper function to count progress
  const getProgressCount = (campaign) => {
    if (campaign.type === 'generate_send') {
      return campaign.emails_sent || 0
    }
    return campaign.certificates_generated || 0
  }

  const statsData = [
    {
      title: 'Total Campaigns',
      value: stats?.total_campaigns || 0,
      icon: LayoutDashboard,
      color: 'text-blue-500'
    },
    {
      title: 'Certificates Generated',
      value: stats?.total_certificates_generated || 0,
      icon: FileText,
      color: 'text-purple-500'
    },
    {
      title: 'Emails Sent',
      value: stats?.total_emails_sent || 0,
      icon: Send,
      color: 'text-green-500'
    },
    {
      title: 'Success Rate',
      value: `${stats?.success_rate || 0}%`,
      icon: CheckCircle2,
      color: 'text-amber-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background no-scrollbar">
      <DashboardNavbar
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        handleNewCampaign={handleNewCampaign}
        scrolled={scrolled}
        currentPage="dashboard"
      />

      <main className="ml-[var(--sidebar-width,256px)] min-h-screen transition-all duration-500">

        {/* Dashboard Header */}
        <section className="relative pt-24 pb-16 w-full overflow-hidden bg-background">


          <div className="relative z-10 max-w-[1400px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">


                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-foreground dark:text-white">
                  Happy to see you again! <br />Ready to create some <span className="text-accent italic">magic?</span>
                </h1>

                <p className="text-sm md:text-base text-muted-foreground dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
                  Check in on your latest projects, see how your campaigns are doing, and send out beautiful certificates to your community in just a few clicks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-1000">
                <button
                  onClick={handleNewCampaign}
                  className="w-full sm:w-auto bg-accent text-white pl-6 pr-3 py-3 rounded-full font-bold text-xs hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-accent/20"
                >
                  Start New Campaign
                  <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1">
                    <Plus size={18} />
                  </div>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full sm:w-auto px-8 py-4 text-xs font-bold border border-border bg-background/50 backdrop-blur-xl rounded-full text-foreground hover:bg-secondary active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                      {timeFilter}
                      <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-2xl p-2 w-48 backdrop-blur-3xl">
                    {['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'].map(filter => (
                      <DropdownMenuItem
                        key={filter}
                        onClick={() => setTimeFilter(filter)}
                        className="rounded-xl focus:bg-accent focus:text-white capitalize text-xs font-bold py-2 px-4 cursor-pointer text-foreground dark:text-white"
                      >
                        {filter}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="p-8 rounded-[32px] bg-secondary/10 dark:bg-zinc-900/40 backdrop-blur-md border border-border hover:border-accent/40 transition-all group">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3 rounded-xl bg-background border border-border ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-serif font-bold text-foreground">{stat.value}</h3>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Campaigns Section */}
          <div>
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold text-muted-foreground mb-1">Recent Activity</p>
                  <h2 className="text-2xl font-serif font-bold">Active Campaigns</h2>
                </div>
                <button
                  onClick={() => navigate.push('/dashboard/campaigns')}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {recentCampaigns.length === 0 ? (
              <div className="p-20 rounded-[40px] bg-secondary/10 dark:bg-zinc-900/40 border border-border text-center backdrop-blur-md">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileOutput size={32} className="text-accent" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">Start Your First Campaign</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                  Create beautiful certificates and send them to your recipients in minutes.
                </p>
                <button
                  onClick={handleNewCampaign}
                  className="bg-accent text-white text-xs px-8 py-3.5 rounded-full font-bold transition-all hover:bg-[#A098FF]/90 flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus size={16} />
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="bg-background/50 backdrop-blur-3xl rounded-[48px] border border-border overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-8 px-10 text-[12px] font-bold text-foreground">Campaign</th>
                        <th className="py-8 px-6 text-[12px] font-bold text-foreground text-center">Type</th>
                        <th className="py-8 px-6 text-[12px] font-bold text-foreground text-center">Date</th>
                        <th className="py-8 px-6 text-[12px] font-bold text-foreground text-center">Progress</th>
                        <th className="py-8 px-6 text-[12px] font-bold text-foreground text-center">Status</th>
                        <th className="py-8 px-10 text-[12px] font-bold text-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {recentCampaigns.map((campaign, index) => {
                        const progressPercent = campaign.total_certificates > 0 ? Math.round((getProgressCount(campaign) / campaign.total_certificates) * 100) : 0;
                        return (
                          <tr
                            key={index}
                            className="group hover:bg-foreground/[0.02] transition-colors"
                          >
                            <td className="py-7 px-10">
                              <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                  <FileText size={18} className="text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-foreground truncate leading-tight mb-1">{campaign.name}</p>
                                  <p className="text-[12px] font-medium text-muted-foreground/60">
                                    {getProgressCount(campaign)} / {campaign.total_certificates} completed
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-7 px-6 text-center">
                              <span className="inline-flex px-3 py-1.5 rounded-full border border-border bg-background text-[9px] font-bold text-foreground">
                                {campaign.type === 'generate_only' ? 'Static Design' : 'Generate & Send'}
                              </span>
                            </td>
                            <td className="py-7 px-6 text-center">
                              <span className="text-[12px] font-bold text-muted-foreground">{formatDate(campaign.created_at)}</span>
                            </td>
                            <td className="py-7 px-6">
                              <div className="flex flex-col items-center gap-2 max-w-[80px] mx-auto">
                                <div className="w-full h-0.5 bg-border dark:bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent transition-all duration-1000 group-hover:bg-[#A098FF]"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-[9px] font-bold text-foreground">{progressPercent}%</span>
                              </div>
                            </td>
                            <td className="py-7 px-6 text-center">
                              <div className={`inline-flex px-2.5 py-1 rounded-full border ${getStatusColor(campaign.status)} text-[8px] font-bold backdrop-blur-md`}>
                                {campaign.status}
                              </div>
                            </td>
                            <td className="py-7 px-10 text-right">
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="w-9 h-9 flex-shrink-0 aspect-square rounded-full bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center">
                                      <MoreVertical size={16} />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40 bg-background rounded-[20px] p-2 backdrop-blur-3xl shadow-xl">
                                    <DropdownMenuItem
                                      onClick={() => handleOpenCampaign(recentCampaigns[index])}
                                      className="rounded-xl text-[11px] font-bold py-3 px-3 cursor-pointer flex items-center gap-3 group focus:bg-accent focus:text-white hover:bg-accent hover:text-white"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-focus:bg-white/20 group-hover:bg-white/20 transition-colors">
                                        <Edit size={14} className="text-accent group-focus:text-white group-hover:text-white" />
                                      </div>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleManageCampaign(recentCampaigns[index])}
                                      className="rounded-xl text-[11px] font-bold py-3 px-3 cursor-pointer flex items-center gap-3 group focus:bg-accent focus:text-white hover:bg-accent hover:text-white"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-focus:bg-white/20 group-hover:bg-white/20 transition-colors">
                                        <Settings size={14} className="text-accent group-focus:text-white group-hover:text-white" />
                                      </div>
                                      Manage
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(recentCampaigns[index])}
                                      className="rounded-xl text-[11px] font-bold py-3 px-3 cursor-pointer text-red-500 focus:bg-red-500 focus:text-white hover:bg-red-500 hover:text-white flex items-center gap-3 group"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-focus:bg-white/20 group-hover:bg-white/20 transition-colors">
                                        <Trash2 size={14} className="text-red-500 group-focus:text-white group-hover:text-white" />
                                      </div>
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Modal */}
        <CampaignModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={user?.id}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ open, campaign: null })}>
          <AlertDialogContent className="bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-[32px] p-8 max-w-sm mx-auto shadow-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-serif">Delete Campaign?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-500 py-2 text-xs">
                Are you sure you want to delete "{deleteDialog.campaign?.name}"? This action cannot be undone and will permanently delete all campaign data including certificates.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel disabled={isDeleting} className="flex-1 rounded-full border-border bg-foreground/5 text-[12px] font-bold py-6 hover:bg-foreground/10 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-red-500 text-white text-[12px] font-bold py-6 hover:bg-red-600 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
