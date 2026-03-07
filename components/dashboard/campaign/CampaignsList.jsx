import { useRouter } from 'next/navigation';

import { supabase, signOut } from '@/lib/supabase'
import { campaignService } from '@/lib/campaignService'
import DashboardNavbar from '../shared/DashboardNavbar'
import { Loader } from '../../ui/loader'
import { 
  FileText, 
  Search,
  Filter,
  LayoutDashboard,
  ChevronDown,
  Trash2,
  Edit,
  Settings,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Zap,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog'

const ITEMS_PER_PAGE = 10
const BACKGROUND_IMG = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop";

export default function CampaignsList() {
  const navigate = useRouter()
  const [user, setUser] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scrolled, setScrolled] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, campaign: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })
  const observerTarget = useRef(null)

  useEffect(() => {
    initializeUser()

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
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

  useEffect(() => {
    if (user) {
      loadCampaigns(true)
    }
  }, [user, searchQuery, statusFilter])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, isLoadingMore, page])

  const initializeUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        navigate.push('/')
        return
      }
      setUser(session.user)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadCampaigns = async (reset = false) => {
    if (!user) return

    try {
      if (reset) {
        setIsLoading(true)
        setPage(0)
        setCampaigns([])
      }

      const offset = reset ? 0 : page * ITEMS_PER_PAGE
      
      const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1)

      if (error) throw error

      const filteredData = filterCampaigns(data || [])

      if (reset) {
        setCampaigns(filteredData)
      } else {
        setCampaigns(prev => [...prev, ...filteredData])
      }

      setHasMore(data && data.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = async () => {
    if (!user || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = page + 1

    try {
      const offset = nextPage * ITEMS_PER_PAGE
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      if (error) throw error

      const filteredData = filterCampaigns(data || [])
      setCampaigns(prev => [...prev, ...filteredData])
      setHasMore(data && data.length === ITEMS_PER_PAGE)
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more campaigns:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const filterCampaigns = (data) => {
    let filtered = data
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }

  const handleOpenCampaign = (campaign) => {
    navigate.push(`/dashboard/edit/${campaign.id}`, { state: { campaign } })
  }

  const handleManageCampaign = (campaign) => {
    navigate.push(`/dashboard/manage/${campaign.id}`, { state: { campaign } })
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    await signOut()
    navigate.push('/')
  }

  const handleNewCampaign = () => {
    navigate.push('/dashboard')
  }

  const handleDeleteClick = (campaign) => {
    setDeleteDialog({ open: true, campaign })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.campaign) return

    setIsDeleting(true)
    try {
      await campaignService.deleteCampaign(deleteDialog.campaign.id)
      setCampaigns(prev => prev.filter(c => c.id !== deleteDialog.campaign.id))
      setDeleteDialog({ open: false, campaign: null })
    } catch (error) {
      console.error('Error deleting campaign:', error)
    } finally {
      setIsDeleting(false)
    }
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
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressCount = (campaign) => {
    if (campaign.type === 'generate_send') {
      return campaign.emails_sent || 0
    }
    return campaign.certificates_generated || 0
  }

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#A098FF] selection:text-white">
      <DashboardNavbar 
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        handleNewCampaign={handleNewCampaign}
        scrolled={scrolled}
        currentPage="campaigns"
        showBackButton={true}
        backButtonPath="/dashboard"
      />

      <main className="ml-[var(--sidebar-width,256px)] min-h-screen transition-all duration-500">

        {/* Dashboard Header */}
        <section className="relative pt-24 pb-16 w-full overflow-hidden bg-background">


        <div className="relative z-10 max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">

              
              <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-foreground dark:text-white">
                Keep track of all your <br /><span className="text-accent italic">creative</span> projects
              </h1>
              
              <p className="text-sm md:text-base text-muted-foreground dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
                From drafts to finished work—here's everything you've been working on. A simple way to manage, organize, and revisit your campaigns anytime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative group/search flex-1 w-full lg:min-w-[300px]">
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-full py-4 pl-14 pr-8 text-sm font-bold text-foreground dark:text-white focus:outline-none focus:border-accent/40 transition-all placeholder:text-muted-foreground backdrop-blur-xl"
                />
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-accent transition-colors pointer-events-none" />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full sm:w-auto h-full px-6 py-4 rounded-full bg-background/50 dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground hover:text-foreground dark:hover:text-white transition-all flex items-center justify-center gap-3 font-bold text-[12px] cursor-pointer backdrop-blur-xl">
                    <Filter size={16} />
                    {statusFilter === 'all' ? 'All Projects' : statusFilter}
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-2xl p-2 w-48 backdrop-blur-3xl">
                  {['all', 'draft', 'active', 'processing', 'completed', 'failed'].map(status => (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => setStatusFilter(status)}
                      className="rounded-xl focus:bg-accent focus:text-white capitalize text-xs font-bold py-2 px-4 cursor-pointer text-foreground dark:text-white"
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
        <div className="bg-background/50 backdrop-blur-3xl rounded-[48px] border border-border overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="p-24 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[20px] bg-accent/10 border border-accent/20 flex items-center justify-center mb-8">
                <FileText className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-serif text-foreground dark:text-white mb-4">No projects yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-12 leading-relaxed">No campaigns found in your archive. Start by creating a project on the dashboard.</p>
              <button 
                onClick={() => navigate.push('/dashboard')}
                className="bg-accent text-white pl-8 pr-4 py-4 rounded-full font-bold text-xs hover:bg-lavender-600 transition-all flex items-center gap-4"
              >
                Start New Project
                <div className="bg-black/20 rounded-full p-2">
                   <ArrowRight size={18} />
                </div>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {campaigns.map((campaign) => (
                    <CampaignRow 
                      key={campaign.id}
                      campaign={campaign}
                      onEdit={handleOpenCampaign}
                      onManage={handleManageCampaign}
                      onDelete={handleDeleteClick}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                      getProgressCount={getProgressCount}
                    />
                  ))}
                </tbody>
              </table>
              
              {/* Loading more indicator */}
              <div ref={observerTarget} className="flex justify-center py-12">
                {isLoadingMore && <Loader size={40} color="#6b55fd" />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ open, campaign: null })}>
        <AlertDialogContent className="bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-[32px] p-8 max-w-sm mx-auto shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-serif text-foreground dark:text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 py-2 text-xs">
              Are you sure you want to remove "{deleteDialog.campaign?.name}"? All project data and logs will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="flex-1 rounded-full border-border bg-foreground/5 text-[12px] font-bold py-6 hover:bg-foreground/10 cursor-pointer text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 rounded-full bg-red-500 text-white text-[12px] font-bold py-6 hover:bg-red-600 cursor-pointer"
            >
              {isDeleting ? 'Removing...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </main>
      </div>
    )
  }

function CampaignRow({ campaign, onEdit, onManage, onDelete, formatDate, getStatusColor, getProgressCount }) {
  const progressPercent = campaign.total_certificates > 0 
    ? Math.round((getProgressCount(campaign) / campaign.total_certificates) * 100) 
    : 0

  return (
    <tr className="group hover:bg-foreground/[0.02] transition-colors">
      {/* Campaign Identity */}
      <td className="py-7 px-10">
        <div className="flex items-center gap-5">
           <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center p-0.5 group-hover:bg-accent/20 transition-colors">
              <FileCheck size={18} className="text-accent" />
           </div>
           <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate leading-tight mb-1">{campaign.name}</h3>
              <p className="text-[12px] font-medium text-muted-foreground/60">
                {getProgressCount(campaign)} / {campaign.total_certificates} completed
              </p>
           </div>
        </div>
      </td>

      {/* Type Pill */}
      <td className="py-7 px-6 text-center">
        <div className="inline-flex px-3 py-1.5 rounded-full border border-border bg-background text-[9px] font-bold text-foreground">
          {campaign.type === 'generate_only' ? 'Static Design' : 'Generate & Send'}
        </div>
      </td>

      {/* Date */}
      <td className="py-7 px-6 text-center">
        <span className="text-[12px] font-bold text-muted-foreground">{formatDate(campaign.created_at)}</span>
      </td>

      {/* Progress */}
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

      {/* Status */}
      <td className="py-7 px-6 text-center">
        <div className={`inline-flex px-2.5 py-1 rounded-full border ${getStatusColor(campaign.status)} text-[8px] font-bold backdrop-blur-md`}>
          {campaign.status}
        </div>
      </td>

      {/* Actions */}
      <td className="py-7 px-10">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 flex-shrink-0 aspect-square rounded-full bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-background rounded-[20px] p-2 backdrop-blur-3xl shadow-xl">
              <DropdownMenuItem 
                onClick={() => onEdit(campaign)}
                className="rounded-xl text-[11px] font-bold py-3 px-3 cursor-pointer flex items-center gap-3 group focus:bg-accent focus:text-white hover:bg-accent hover:text-white"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-focus:bg-white/20 group-hover:bg-white/20 transition-colors">
                  <Edit size={14} className="text-accent group-focus:text-white group-hover:text-white" />
                </div>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onManage(campaign)}
                className="rounded-xl text-[11px] font-bold py-3 px-3 cursor-pointer flex items-center gap-3 group focus:bg-accent focus:text-white hover:bg-accent hover:text-white"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-focus:bg-white/20 group-hover:bg-white/20 transition-colors">
                  <Settings size={14} className="text-accent group-focus:text-white group-hover:text-white" />
                </div>
                Manage
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(campaign)}
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
}
