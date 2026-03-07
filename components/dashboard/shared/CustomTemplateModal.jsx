import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Code, Eye, Save, X } from 'lucide-react'
import { templateService } from '@/lib/templateService'
import { Tabs } from '../../ui/tabs'

export default function CustomTemplateModal({ isOpen, onClose, userId, templateId = null, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [htmlContent, setHtmlContent] = useState(getDefaultHtmlTemplate())
  const [cssContent, setCssContent] = useState(getDefaultCssTemplate())
  const [activeTab, setActiveTab] = useState('html')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Load existing template if editing
  useEffect(() => {
    if (templateId && isOpen) {
      loadTemplate()
    } else if (!templateId && isOpen) {
      // Reset for new template
      setName('')
      setDescription('')
      setHtmlContent(getDefaultHtmlTemplate())
      setCssContent(getDefaultCssTemplate())
    }
  }, [templateId, isOpen])

  const loadTemplate = async () => {
    try {
      setIsLoading(true)
      const template = await templateService.getTemplate(templateId)
      setName(template.name)
      setDescription(template.description || '')
      setHtmlContent(template.html_content)
      setCssContent(template.css_content || '')
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

    try {
      let template
      if (templateId) {
        // Update existing template
        template = await templateService.updateTemplate(templateId, {
          name,
          description: description || null,
          html_content: htmlContent,
          css_content: cssContent || null
        })
      } else {
        // Create new template
        const thumbnail = await templateService.generateThumbnail(htmlContent, cssContent)
        template = await templateService.createTemplate({
          user_id: userId,
          name,
          description: description || null,
          html_content: htmlContent,
          css_content: cssContent || null,
          thumbnail
        })
      }

      if (onSave) {
        onSave(template)
      }

      handleClose()
    } catch (err) {
      console.error('Error saving template:', err)
      setError(err.message || 'Failed to save template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setDescription('')
      setHtmlContent(getDefaultHtmlTemplate())
      setCssContent(getDefaultCssTemplate())
      setError('')
      setShowPreview(false)
      onClose()
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] w-[900px] max-h-[90vh] p-0 flex flex-col">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold">
              {templateId ? 'Edit Custom Template' : 'Create Custom Template'}
            </DialogTitle>
            <DialogDescription className="text-[12px] font-bold uppercase text-muted-foreground opacity-60">
              Design your certificate using HTML and CSS
            </DialogDescription>
          </DialogHeader>

          {/* Template Name and Description */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold uppercase text-muted-foreground block mb-2">
                  Template Name
                </label>
                <Input
                  placeholder="e.g., Corporate Certificate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase text-muted-foreground block mb-2">
                  Description (Optional)
                </label>
                <Input
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Editor Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-6 pt-4 border-b">
            <Button
              variant={activeTab === 'html' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('html')}
              className="text-xs"
            >
              <Code size={14} className="mr-1.5" />
              HTML
            </Button>
            <Button
              variant={activeTab === 'css' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('css')}
              className="text-xs"
            >
              <Code size={14} className="mr-1.5" />
              CSS
            </Button>
            <Button
              variant={showPreview ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs ml-auto"
            >
              <Eye size={14} className="mr-1.5" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Editor Panel */}
            <div className={showPreview ? 'w-1/2 border-r' : 'w-full'}>
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

            {/* Preview Panel */}
            {showPreview && (
              <div className="w-1/2 overflow-auto p-4 bg-muted/20">
                <div className="bg-white rounded-lg shadow-lg">
                  <iframe
                    srcDoc={getPreviewHtml()}
                    className="w-full h-[600px] border-0 rounded-lg"
                    title="Template Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Use <code className="bg-blue-100 px-1 rounded">{'{{name}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{email}}'}</code>, or any CSV column name with double curly braces for dynamic data.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-6 rounded-2xl font-bold text-xs uppercase cursor-pointer"
          >
            <X size={14} className="mr-1.5" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-accent hover:bg-lavender-600 text-white py-6 rounded-2xl font-bold text-xs uppercase cursor-pointer"
          >
            <Save size={14} className="mr-1.5" />
            {isLoading ? 'Saving...' : templateId ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
