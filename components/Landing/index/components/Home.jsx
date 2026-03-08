import Image from "next/image";
import { useRouter } from 'next/navigation';

import { 
  LogOut, 
  User, 
  FileOutput, 
  Send, 
  LayoutDashboard, 
  History, 
  Settings, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
  X,
  Search
} from 'lucide-react'

export default function Home() {
  const navigate = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate.push('/')
  }

  // Mock data for UI
  const stats = [
    { title: 'Certificates Generated', value: '1,248', icon: <CheckCircle2 size={16} className="text-[#A098FF]" /> },
    { title: 'Emails Sent', value: '892', icon: <Send size={16} className="text-blue-400" /> },
    { title: 'Success Rate', value: '99.8%', icon: <LayoutDashboard size={16} className="text-purple-400" /> },
  ]

  const recentActivity = [
    { id: 1, name: 'Webinar Batch #4', date: '2 mins ago', status: 'Processing', total: 50, sent: 23 },
    { id: 2, name: 'Q1 Compliance', date: '2 hours ago', status: 'Completed', total: 120, sent: 120 },
    { id: 3, name: 'Workshop Attendees', date: 'Yesterday', status: 'Draft', total: 15, sent: 0 },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <Image src="/assest/logo.svg" alt="logo" className="h-7 w-7" width={40} height={40} />
            <span className="text-lg font-serif font-black">CertifyFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Overview" onClick={() => setActiveTab('dashboard')} />
          <NavItem active={activeTab === 'history'} icon={<History size={20} />} label="History" onClick={() => setActiveTab('history')} />
          <NavItem active={activeTab === 'templates'} icon={<FileOutput size={20} />} label="Templates" onClick={() => setActiveTab('templates')} />
          <NavItem active={activeTab === 'billing'} icon={<CreditCard size={20} />} label="Billing" onClick={() => setActiveTab('billing')} />
          <NavItem active={activeTab === 'settings'} icon={<Settings size={20} />} label="Settings" onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          {user && (
            <div className="flex items-center gap-3 mb-4">
               {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <User size={16} className="text-black" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user.user_metadata?.full_name}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{user.email}</p>
                </div>
            </div>
          )}
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-background sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-muted-foreground cursor-pointer">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
             <div className="hidden md:flex items-center bg-secondary/50 rounded-full px-4 py-1.5 border border-border transition-all focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent/40">
                <Search size={14} className="text-muted-foreground mr-2" />
                <Input type="text" placeholder="Search campaigns..." className="bg-transparent border-none text-sm w-48 focus-visible:ring-0 focus-visible:ring-offset-0" />
             </div>
             <div className="h-6 w-px bg-border mx-2" />
             <ThemeToggle />
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="card-gradient">
                <CardContent className="p-6 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-serif font-black">{stat.value}</h3>
                  </div>
                  <div className="p-2 bg-background/50 rounded-lg border border-border">
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Actions */}
          <div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div 
                onClick={() => navigate.push('/generate-only')}
                className="group relative overflow-hidden rounded-3xl bg-secondary/20 border border-border p-8 hover:border-accent/50 transition-all cursor-pointer"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileOutput size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 text-black">
                      <FileOutput size={24} />
                    </div>
                    <h3 className="text-2xl font-serif font-black mb-2">Generate Only</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mb-6">Create certificates and download them as ZIP or PDF. Perfect for manual distribution.</p>
                    <span className="text-xs font-bold text-accent group-hover:underline">Start Generating →</span>
                  </div>
               </div>

               <div 
                onClick={() => navigate.push('/generate-send')}
                className="group relative overflow-hidden rounded-3xl bg-secondary/20 border border-border p-8 hover:border-accent/50 transition-all cursor-pointer"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Send size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 text-black">
                      <Send size={24} />
                    </div>
                    <h3 className="text-2xl font-serif font-black mb-2">Generate & Send</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mb-6">Automated workflow. Import CSV, map fields, and email certificates instantly.</p>
                    <span className="text-xs font-bold text-accent group-hover:underline">Create Campaign →</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Active Job Progress */}
          <Card className="border-accent/20 bg-accent/5">
             <CardHeader className="pb-3 border-b border-accent/10">
                <CardTitle className="text-base flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Live Progress: Webinar Batch #4
                   </div>
                   <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded text-muted-foreground">00:12:45 elapsed</span>
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
                <div className="flex justify-between text-sm mb-2 font-medium">
                   <span>Sending emails...</span>
                   <span>23 / 50</span>
                </div>
                <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                   <div className="h-full bg-accent w-[46%] transition-all duration-1000" />
                </div>
                <div className="mt-4 flex gap-8 text-xs text-muted-foreground">
                   <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> 23 Sent</div>
                   <div className="flex items-center gap-2"><Clock size={12} className="text-orange-400" /> 27 Pending</div>
                   <div className="flex items-center gap-2"><AlertCircle size={12} className="text-red-500" /> 0 Failed</div>
                </div>
             </CardContent>
          </Card>

          {/* Recent Activity Table */}
          <div>
            <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-[12px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Campaign Name</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Certificates</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentActivity.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            item.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                 <div 
                                  className="h-full bg-foreground" 
                                  style={{ width: `${(item.sent / item.total) * 100}%` }} 
                                 />
                              </div>
                              <span className="text-xs text-muted-foreground">{item.sent}/{item.total}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs font-bold hover:text-accent transition-colors cursor-pointer">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}

function NavItem({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
        ${active ? 'bg-accent text-[#0A0A0A]' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
      `}
    >
      {icon}
      {label}
    </button>
  )
}
