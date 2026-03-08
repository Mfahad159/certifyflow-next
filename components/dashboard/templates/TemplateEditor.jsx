import { useRouter, useParams } from 'next/navigation';

import { ArrowLeft, Code, Eye, Save, FileText, User, LogOut } from 'lucide-react'
import { supabase, signOut } from '@/lib/supabaseClient'
import { templateService } from '@/lib/templateService'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Loader } from '../../ui/loader'
import ThemeToggle from '../../ui/theme-toggle'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../ui/dropdown-menu'

export default function TemplateEditor() {
  const navigate = useRouter()
  const { templateId } = useParams()
  const [user, setUser] = useState(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [htmlContent, setHtmlContent] = useState(getDefaultHtmlTemplate())
  const [cssContent, setCssContent] = useState(getDefaultCssTemplate())
  const [activeTab, setActiveTab] = useState('html')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (!session) {
        navigate.push('/')
      }
    })
  }, [navigate])

  // Load existing template if editing
  useEffect(() => {
    if (templateId && user) {
      loadTemplate()
    }
  }, [templateId, user])

  const loadTemplate = async () => {
    try {
      setIsLoading(true)
      const template = await templateService.getPrivateTemplate(templateId)
      setName(template.name)
      setDescription(template.description || '')
      
      // Load from template_data if available (JSON-first), fallback to columns
      if (template.template_data && (template.template_data.html_content || template.template_data.css_content)) {
        setHtmlContent(template.template_data.html_content || '')
        setCssContent(template.template_data.css_content || '')
      } else {
        setHtmlContent(template.html_content || '')
        setCssContent(template.css_content || '')
      }
    } catch (err) {
      setError('Failed to load template')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a template name')
      return
    }

    if (!htmlContent.trim()) {
      setError('Please enter HTML content')
      return
    }

    setIsLoading(true)
    setError('')
    setSaveSuccess(false)

    try {
      if (templateId) {
        // Update existing template
        await templateService.updateTemplate(templateId, {
          name,
          description: description || null,
          html_content: htmlContent, // For preview/legacy
          css_content: cssContent || null,
          template_data: { 
            html_content: htmlContent,
            css_content: cssContent || null,
            type: 'html' // Marker to distinguish from Canvas JSON
          }
        })
      } else {
        // Create new template
        const thumbnail_url = await templateService.generateThumbnail(htmlContent, cssContent)
        await templateService.createTemplate({
          user_id: user.id,
          name,
          description: description || null,
          html_content: htmlContent,
          css_content: cssContent || null,
          template_data: { 
            html_content: htmlContent,
            css_content: cssContent || null,
            type: 'html'
          },
          thumbnail_url
        })
      }

      setSaveSuccess(true)
      setTimeout(() => {
        navigate.push('/dashboard/templates')
      }, 1000)
    } catch (err) {
      console.error('Error saving template:', err)
      setError(err.message || 'Failed to save template')
    } finally {
      setIsLoading(false)
    }
  }


  const handleLogout = async () => {
    await signOut()
    navigate.push('/')
  }

  const getPreviewHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          ${cssContent}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background text-foreground no-scrollbar">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 pt-8 px-6 flex justify-center pointer-events-none">
        <div className="
          transition-all duration-700 pointer-events-auto
          flex items-center justify-between gap-8
          bg-background/80 backdrop-blur-2xl
          px-8 py-3 rounded-[32px]
          border border-border
        ">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate.push('/dashboard/templates')} 
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-foreground cursor-pointer"
              title="Back to Templates"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3 pr-6 border-r border-border">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText size={20} className="text-accent" />
              </div>
              <div>
                <h1 className="text-base font-serif font-bold leading-none">
                  {templateId ? 'Edit Template' : 'New Template'}
                </h1>
                <p className="text-[12px] font-bold text-muted-foreground mt-1">
                  {name || 'Template Editor'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full cursor-pointer">
                  <User size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut size={14} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-accent text-white hover:bg-accent/90 cursor-pointer ml-2"
              size="sm"
            >
              <Save size={14} className="mr-1.5" />
              {isLoading ? 'Saving...' : templateId ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-32 pb-6">
        {/* Template Info */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-2">
                Template Name *
              </label>
              <Input
                placeholder="e.g., Corporate Certificate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-2">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>
          </div>
        </div>

        {/* Editor Section */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-2 px-6 pt-4 pb-3 border-b bg-muted/20">
            {!showPreview && (
              <>
                <Button
                  variant={activeTab === 'html' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('html')}
                  className={`text-xs cursor-pointer ${activeTab === 'html' ? 'bg-accent text-white hover:bg-accent/90' : ''}`}
                >
                  <Code size={14} className="mr-1.5" />
                  HTML
                </Button>
                <Button
                  variant={activeTab === 'css' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('css')}
                  className={`text-xs cursor-pointer ${activeTab === 'css' ? 'bg-accent text-white hover:bg-accent/90' : ''}`}
                >
                  <Code size={14} className="mr-1.5" />
                  CSS
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className={`text-xs cursor-pointer ${!showPreview ? 'ml-auto' : ''} ${showPreview ? 'bg-accent text-white hover:bg-accent/90' : ''}`}
            >
              <Eye size={14} className="mr-1.5" />
              {showPreview ? 'Show Code' : 'Show Preview'}
            </Button>
          </div>

          <div className="flex" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
            {/* Editor Panel */}
            {!showPreview && (
              <div className="w-full">
                {activeTab === 'html' ? (
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-secondary/20"
                    placeholder="Enter your HTML code here..."
                    disabled={isLoading}
                  />
                ) : (
                  <textarea
                    value={cssContent}
                    onChange={(e) => setCssContent(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-secondary/20"
                    placeholder="Enter your CSS code here..."
                    disabled={isLoading}
                  />
                )}
              </div>
            )}

            {/* Preview Panel */}
            {showPreview && (
              <div className="w-full overflow-auto p-4 bg-muted/20">
                <div className="bg-white rounded-lg border border-border mx-auto" style={{ maxWidth: '900px' }}>
                  <iframe
                    srcDoc={getPreviewHtml()}
                    className="w-full border-0 rounded-lg"
                    style={{ height: '600px' }}
                    title="Template Preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Helper Text */}
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-950/20 border-t border-blue-100 dark:border-blue-900">
            <p className="text-xs text-blue-800 dark:text-blue-400">
              <strong>Tip:</strong> Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{name}}'}</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{'{{email}}'}</code>, or any CSV column name with double curly braces for dynamic data.
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="mx-6 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Template saved successfully! Redirecting...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getDefaultHtmlTemplate() {
  return `<div style="width: 800px; height: 600px; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
  <h1 style="font-size: 48px; margin: 0 0 20px 0; font-weight: bold;">CERTIFICATE</h1>
  <p style="font-size: 18px; margin: 0 0 40px 0; opacity: 0.9;">OF ACHIEVEMENT</p>
  
  <div style="background: rgba(255,255,255,0.1); padding: 30px 60px; border-radius: 10px; backdrop-filter: blur(10px);">
    <p style="font-size: 14px; margin: 0 0 10px 0; opacity: 0.8;">THIS CERTIFICATE IS PRESENTED TO</p>
    <h2 style="font-size: 36px; margin: 0 0 20px 0; font-weight: bold;">{{name}}</h2>
    <p style="font-size: 16px; margin: 0; opacity: 0.9;">For successfully completing the program</p>
  </div>
  
  <div style="margin-top: 40px; display: flex; gap: 60px;">
    <div style="text-align: center;">
      <div style="border-top: 2px solid white; width: 150px; margin-bottom: 8px;"></div>
      <p style="font-size: 12px; margin: 0; opacity: 0.8;">Instructor Signature</p>
    </div>
    <div style="text-align: center;">
      <div style="border-top: 2px solid white; width: 150px; margin-bottom: 8px;"></div>
      <p style="font-size: 12px; margin: 0; opacity: 0.8;">Date</p>
    </div>
  </div>
</div>`
}

function getDefaultCssTemplate() {
  return `/* Add your custom CSS styles here */
* {
  box-sizing: border-box;
}

.certificate-container {
  width: 800px;
  height: 600px;
  position: relative;
}

/* Add more styles as needed */`
}
