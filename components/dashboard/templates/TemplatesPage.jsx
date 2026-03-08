import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import DashboardNavbar from '../shared/DashboardNavbar'
import { templateService } from '@/lib/templateService'
import { supabase } from '@/lib/supabaseClient'
import { logout as signOut } from '@/lib/auth'
import { Loader } from '@/components/ui/loader'
import TemplateThumbnail, { getTemplatePreviewHtml } from '../shared/TemplateThumbnail'
import {
  Plus,
  Search,
  LayoutGrid,
  Eye,
  Copy,
  Sparkles,
  Edit,
  Trash2,
  X
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const BACKGROUND_IMG = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop";

export default function TemplatesPage() {
  const navigate = useRouter()
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })
  const [publicTemplates, setPublicTemplates] = useState([])
  const [privateTemplates, setPrivateTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleteTemplateId, setDeleteTemplateId] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    checkUser()
    loadTemplates()

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

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate.push('/')
      return
    }
    setUser(user)
  }

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      const [pubTemplates, privTemplates] = await Promise.all([
        templateService.getPublicTemplates(),
        user ? templateService.getUserTemplates(user.id) : Promise.resolve([])
      ])

      setPublicTemplates(pubTemplates)
      setPrivateTemplates(privTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    await signOut()
    navigate.push('/')
  }

  const handleCreateTemplate = () => {
    navigate.push('/dashboard/templates/new')
  }

  const handleEditTemplate = (templateId) => {
    navigate.push(`/dashboard/templates/edit/${templateId}`)
  }

  const handleDeleteTemplate = (templateId) => {
    setDeleteTemplateId(templateId)
    setShowDeleteAlert(true)
  }

  const confirmDelete = async () => {
    try {
      await templateService.deleteTemplate(deleteTemplateId)
      await loadTemplates()
      setShowDeleteAlert(false)
      setDeleteTemplateId(null)
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template)
    setShowPreviewModal(true)
  }

  const handleDuplicateTemplate = async (template) => {
    try {
      await templateService.createTemplate({
        user_id: user.id,
        name: `${template.name} (Copy)`,
        description: template.description,
        template_data: template.template_data || {},
        thumbnail_url: template.thumbnail_url || template.thumbnail
      })
      await loadTemplates()
    } catch (error) {
      console.error('Error duplicating template:', error)
    }
  }


  const filteredPublic = publicTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPrivate = privateTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading && publicTemplates.length === 0) {
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
        currentPage="templates"
        scrolled={scrolled}
      />

      <main className="ml-[var(--sidebar-width,256px)] min-h-screen transition-all duration-500">

        {/* Dashboard Header */}
        <section className="relative pt-24 pb-16 w-full overflow-hidden bg-background">


          <div className="relative z-10 max-w-[1400px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">


                <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-foreground dark:text-white">
                  Pick the perfect <br /><span className="text-accent italic">starting point</span>
                </h1>

                <p className="text-sm md:text-base text-muted-foreground dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
                  Browse through our collection of beautifully designed certificates. Start with a template you love and easily customize it to match your brand.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="relative group/search flex-1 w-full lg:min-w-[300px]">
                  <input
                    type="text"
                    placeholder="Search designs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-full py-4 pl-14 pr-8 text-sm font-bold text-foreground dark:text-white focus:outline-none focus:border-accent/40 transition-all placeholder:text-muted-foreground backdrop-blur-xl"
                  />
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-accent transition-colors pointer-events-none" />
                </div>

                <button
                  onClick={handleCreateTemplate}
                  className="w-full sm:w-auto bg-accent text-white pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-accent/20"
                >
                  Create New Template
                  <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1">
                    <Plus size={18} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid Content */}
        <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
          <div className="space-y-24">

            <>
              <>
                {/* Private Templates Section */}
                {(filteredPrivate.length > 0) && (
                  <div className="space-y-12">
                    <div className="flex items-center justify-between border-b border-border dark:border-white/5 pb-8">
                      <div>
                        <p className="text-[12px] font-bold text-muted-foreground mb-1">My Workspace</p>
                        <h2 className="text-2xl font-serif font-bold text-foreground dark:text-white">Saved Templates</h2>
                      </div>
                      <span className="text-[12px] bg-accent/10 text-accent px-4 py-1.5 rounded-full font-bold border border-accent/20 backdrop-blur-md">
                        {filteredPrivate.length} Saved
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredPrivate.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isPrivate={true}
                          onPreview={handlePreviewTemplate}
                          onEdit={handleEditTemplate}
                          onDuplicate={handleDuplicateTemplate}
                          onDelete={handleDeleteTemplate}
                          navigate={navigate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Public Templates Section */}
                <div className="space-y-12">
                  <div className="flex items-center justify-between border-b border-border dark:border-white/5 pb-8">
                    <div>
                      <p className="text-[12px] font-bold text-muted-foreground mb-1">Curated Library</p>
                      <h2 className="text-2xl font-serif font-bold text-foreground dark:text-white">Official Designs</h2>
                    </div>
                    <span className="text-[12px] bg-secondary/50 dark:bg-zinc-900/60 text-muted-foreground px-4 py-1.5 rounded-full font-bold border border-border dark:border-white/5 backdrop-blur-md">
                      {filteredPublic.length} Official
                    </span>
                  </div>

                  {filteredPublic.length === 0 ? (
                    <div className="text-center py-20 bg-secondary/10 dark:bg-zinc-900/40 rounded-[40px] border border-dashed border-border dark:border-white/10">
                      <p className="text-muted-foreground text-sm font-sans">No matching templates found in the curated library</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredPublic.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isPrivate={false}
                          onPreview={handlePreviewTemplate}
                          onDuplicate={handleDuplicateTemplate}
                          navigate={navigate}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {privateTemplates.length === 0 && !searchQuery && (
                  <div className="group relative bg-secondary/10 dark:bg-zinc-900/60 border border-border dark:border-white/10 rounded-[40px] p-20 flex flex-col items-center text-center transition-all hover:border-accent/40 backdrop-blur-md">
                    <div className="w-16 h-16 rounded-[20px] bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="text-accent" size={32} />
                    </div>
                    <h3 className="text-xl font-serif text-foreground dark:text-white mb-4">Start your journey here</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mb-10 leading-relaxed">Your custom workspace is currently empty. Build your first certificate design or duplicate an official one.</p>
                    <button
                      onClick={handleCreateTemplate}
                      className="bg-accent text-white pl-8 pr-4 py-4 rounded-full font-bold text-xs hover:bg-lavender-600 transition-all flex items-center gap-4"
                    >
                      Create From Scratch
                      <div className="bg-black/20 rounded-full p-2">
                        <Plus size={18} />
                      </div>
                    </button>
                  </div>
                )}
              </>
            </>
          </div>
        </div>

        {/* Delete Alert */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent className="bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-[32px] p-8 max-w-sm mx-auto shadow-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-serif text-foreground dark:text-white">Delete design?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-500 py-2 text-xs">
                This will permanently remove this template from your workspace. This action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-4">
              <AlertDialogCancel className="flex-1 rounded-full border-border bg-foreground/5 text-[12px] font-bold py-6 hover:bg-foreground/10 text-foreground cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-red-500 text-white text-[12px] font-bold py-6 hover:bg-red-600 cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Modal */}
        {showPreviewModal && previewTemplate && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowPreviewModal(false)}>
            <div className="bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-[40px] max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-none" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-border dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-foreground dark:text-white">{previewTemplate.name}</h3>
                  <p className="text-[12px] text-muted-foreground font-bold mt-1">{previewTemplate.category || 'Design Studio'}</p>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="p-3 bg-foreground/5 border border-border dark:border-white/10 rounded-full text-muted-foreground hover:bg-foreground hover:text-background transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 p-8 overflow-hidden bg-background dark:bg-zinc-950/50">
                <iframe
                  srcDoc={getTemplatePreviewHtml(previewTemplate)}
                  className="w-full h-full border-0 rounded-[20px] bg-white"
                  title="Template Preview"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function TemplateCard({ template, isPrivate, onPreview, onEdit, onDuplicate, onDelete, navigate }) {

  return (
    <div className="group relative bg-secondary/10 dark:bg-zinc-900/60 border border-border dark:border-white/10 rounded-[40px] overflow-hidden hover:border-accent/40 transition-all duration-500 flex flex-col p-4 backdrop-blur-md">
      <div className="aspect-[1.4/1] bg-black/20 relative overflow-hidden rounded-[30px] border border-border dark:border-white/5 m-2 mb-6 isolate">
        <TemplateThumbnail
          template={template}
          className="transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute top-4 left-4 z-10">
          <span className={`text-[9px] px-3 py-1 rounded-full font-bold border border-white/10 backdrop-blur-md ${isPrivate ? 'bg-zinc-950 text-accent' : 'bg-accent text-white'}`}>
            {isPrivate ? 'Custom' : 'Official'}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 z-20">
          <button
            onClick={() => onPreview(template)}
            className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
            title="Preview"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={() => onDuplicate(template)}
            className="p-3 bg-accent text-white rounded-full hover:scale-110 transition-transform"
            title="Duplicate"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-foreground dark:text-white truncate">{template.name}</h3>
          <div className="flex items-center gap-2">
            {isPrivate && (
              <>
                <button
                  onClick={() => onEdit(template.id)}
                  className="p-2 rounded-lg bg-background dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground hover:bg-accent hover:text-white transition-all"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => onDelete(template.id)}
                  className="p-2 rounded-lg bg-background dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            {!isPrivate && (
              <div className="p-2 rounded-lg bg-background dark:bg-white/5 border border-border dark:border-white/5">
                <LayoutGrid size={14} className="text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-sans leading-relaxed line-clamp-2 h-8 mb-6">
          {template.description || "Professional design created for premium experiences."}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-border dark:border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-accent" />
            <span className="text-[9px] font-bold text-muted-foreground">
              {isPrivate ? `Updated ${new Date(template.updated_at).toLocaleDateString()}` : `${template.usage_count || 0} Uses`}
            </span>
          </div>
          <span className="text-[9px] font-bold text-muted-foreground/60">{template.category || "Design"}</span>
        </div>
      </div>
    </div>
  )
}
