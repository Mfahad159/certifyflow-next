"use client"

import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../shared/Navbar'
import FooterCTA from '../shared/FooterCTA'
import Footer from '../shared/Footer'
import { useRouter } from 'next/navigation'
import { Loader } from '../../ui/loader'
import { ArrowRight, Search, LayoutGrid, Eye, Copy, Sparkles } from 'lucide-react'
import { templateService } from '@/lib/templateService'
import Hero from '../index/components/Hero'

export default function TemplatesPage() {
  const navigate = useRouter()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState([])
  const [displayTemplates, setDisplayTemplates] = useState([])
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const observerTarget = useRef(null)
  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && displayTemplates.length < templates.length) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loading, displayTemplates, templates])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await templateService.getPublicTemplates()
      setTemplates(data)
      setDisplayTemplates(data.slice(0, ITEMS_PER_PAGE))
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    const nextBatch = templates.slice(0, (page + 1) * ITEMS_PER_PAGE)
    setDisplayTemplates(nextBatch)
    setPage(page + 1)
  }

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = templates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query)
    )
    setDisplayTemplates(filtered.slice(0, ITEMS_PER_PAGE))
    setPage(1)
  }

  const isJsonTemplate = (template) => {
    return template.template_data &&
      template.template_data.textFields &&
      template.template_data.textFields.length > 0
  }

  const getPreviewHtml = (template, isThumbnail = false) => {
    if (isJsonTemplate(template)) {
      const bgColor = template.template_data.background_color || '#FFFFFF';
      const canvasWidth = template.template_data.canvas_width || 800;
      const canvasHeight = template.template_data.canvas_height || 600;

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;600&display=swap');
            body { 
              margin: 0; 
              padding: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              overflow: hidden;
              background: ${bgColor};
            }
            #preview-canvas {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          </style>
        </head>
        <body>
          <canvas id="preview-canvas" width="${canvasWidth}" height="${canvasHeight}"></canvas>
          <script>
            const canvas = document.getElementById('preview-canvas')
            const ctx = canvas.getContext('2d')
            
            ctx.fillStyle = '${bgColor}'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            const fields = ${JSON.stringify(template.template_data.textFields)}
            
            fields.forEach(field => {
              if (field.type === 'rect') {
                ctx.fillStyle = field.color || '#000000'
                ctx.globalAlpha = field.opacity ?? 1
                ctx.fillRect(field.x, field.y, field.width, field.height)
                ctx.globalAlpha = 1
              } else if (field.type === 'circle') {
                ctx.fillStyle = field.color || '#000000'
                ctx.globalAlpha = field.opacity ?? 1
                ctx.beginPath()
                ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2)
                ctx.fill()
                ctx.globalAlpha = 1
              } else if (field.type === 'triangle') {
                ctx.fillStyle = field.color || '#000000'
                ctx.globalAlpha = field.opacity ?? 1
                ctx.beginPath()
                ctx.moveTo(field.x, field.y + field.height)
                ctx.lineTo(field.x + field.width / 2, field.y)
                ctx.lineTo(field.x + field.width, field.y + field.height)
                ctx.closePath()
                ctx.fill()
                ctx.globalAlpha = 1
              } else if (field.type === 'staticText' || field.type === 'text' || field.type === 'uuid') {
                ctx.fillStyle = field.color || '#000000'
                ctx.font = \`\${field.bold ? 'bold ' : ''}\${field.italic ? 'italic ' : ''}\${field.fontSize || 14}px \${field.fontFamily || 'Arial'}\`
                ctx.textAlign = field.textAlign || 'left'
                
                let displayText = field.text || \`{\${field.column || 'Field'}}\`
                if (field.type === 'uuid') displayText = 'ID: XXXXXXXX'
                
                ctx.fillText(displayText, field.x, field.y)
              } else if (field.type === 'qrcode') {
                ctx.strokeStyle = '#000000'
                ctx.strokeRect(field.x, field.y, field.size, field.size)
                ctx.font = '10px Arial'
                ctx.textAlign = 'center'
                ctx.fillText('QR', field.x + field.size/2, field.y + field.size/2)
              }
            })
          </script>
        </body>
        </html>
      `
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>body { margin: 0; padding: 20px; overflow: hidden; } ${template.css_content || ''}</style>
      </head>
      <body>${template.html_content}</body>
      </html>
    `
  }

  if (loading && templates.length === 0) {
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
        badgeText="Library 2026"
        indicatorText="Professional designs"
        title={<>The <span className="text-accent italic">Professional</span> <br />Design Library</>}
        description="Professionally crafted, high-fidelity certificate designs. Choose a starting point or build your own project from scratch."
        primaryCTA={{
          text: "Start Designing Now",
          onClick: () => navigate('/dashboard')
        }}
        childrenAboveButtons={true}
      >
        <div className="relative group/search w-full max-w-xl mx-auto">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/search:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-white/5 border border-white/10 rounded-full py-[21px] pl-14 pr-8 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all placeholder:text-zinc-600 selection:bg-accent/30 selection:text-white"
          />
        </div>
      </Hero>

      {/* Templates Grid */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTemplates.map((template) => (
              <div key={template.id} className="group relative bg-zinc-900/60 border border-white/10 rounded-[40px] overflow-hidden hover:border-accent/40 transition-all duration-500 flex flex-col p-4">
                <div className="aspect-[1.4/1] bg-black/20 relative overflow-hidden rounded-[30px] border border-white/5 m-2 mb-6">
                  {isJsonTemplate(template) ? (
                    <div className="absolute inset-0 w-full h-full pointer-events-none select-none bg-zinc-950 overflow-hidden isolate">
                      <iframe
                        srcDoc={getPreviewHtml(template, true)}
                        className="w-full h-full border-0 border-none transition-transform duration-700 group-hover:scale-110"
                        title={template.name}
                        scrolling="no"
                      />
                    </div>
                  ) : (
                    <img
                      src={template.thumbnail_url || 'https://via.placeholder.com/400x280/667eea/ffffff?text=Template'}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[12px] bg-accent text-white px-4 py-1.5 rounded-full font-black border border-white/20 backdrop-blur-md">
                      Official
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                      title="Quick Use"
                    >
                      <Copy size={20} />
                    </button>
                    <button
                      className="p-3 bg-accent text-white rounded-full hover:scale-110 transition-transform"
                      title="Full Preview"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-2xl text-white truncate">{template.name}</h3>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <LayoutGrid size={16} className="text-zinc-500" />
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 font-sans leading-relaxed line-clamp-2 h-10 mb-6">
                    {template.description || "Professional design created for premium certification experiences at scale."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-accent" />
                      <span className="text-[12px] font-black text-zinc-400">{template.usage_count || 0} Uses</span>
                    </div>
                    <span className="text-[12px] font-black text-zinc-600">{template.category || "Design"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Target */}
          <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-12">
            {displayTemplates.length < templates.length && (
              <div className="flex flex-col items-center gap-4">
                <Loader size={40} color="#6b55fd" />
              </div>
            )}
          </div>
        </div>
      </section>

      <FooterCTA />
      <Footer />
    </div>
  )
}
