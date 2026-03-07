import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { templateService, PublicTemplate } from '../../../../lib/templateService';
import { ArrowRight } from 'lucide-react';


export default function TemplateShowcase() {
  const navigate = useRouter();
  const [publicTemplates, setPublicTemplates] = useState<PublicTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const templates = await templateService.getPublicTemplates();
        setPublicTemplates(templates);
      } catch (err) {
        console.error('Failed to load public templates:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const isJsonTemplate = (template: any) => {
    return template.template_data && 
           template.template_data.textFields && 
           template.template_data.textFields.length > 0;
  };

  const getPreviewHtml = (template: any) => {
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
      `;
    }
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; overflow: hidden; }
          ${template.css_content || ''}
        </style>
      </head>
      <body>
        ${template.html_content}
      </body>
      </html>
    `;
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-serif font-medium text-white mb-6">
            Beautifully Crafted <span className="text-accent italic">Templates</span>
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Choose from our pre-made designs or create your own with 
            our high-end professional designs.
          </p>
          <div className="mt-10 flex justify-center">
            <button 
              onClick={() => navigate.push('/templates')}
              className="w-full sm:w-auto bg-accent text-accent-foreground pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              Explore All Templates
              <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1"> 
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-10 rounded-[40px] bg-white/5 border border-white/10 animate-pulse h-[400px]">
                <div className="aspect-[1.4/1] bg-white/5 rounded-3xl mb-6"></div>
                <div className="h-4 bg-white/5 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicTemplates.slice(0, 6).map((tpl) => (
              <div key={tpl.id} className="group relative bg-zinc-900/60 border border-white/10 rounded-[40px] overflow-hidden  transition-all duration-500 flex flex-col">
                <div className="aspect-[1.4/1] bg-black/20 relative overflow-hidden m-4 rounded-[30px] border border-white/5">
                  {isJsonTemplate(tpl) ? (
                    <div className="absolute inset-0 w-full h-full pointer-events-none select-none bg-zinc-950 overflow-hidden isolate">
                      <iframe
                        srcDoc={getPreviewHtml(tpl)}
                        className="w-full h-full border-0 border-none transition-transform duration-700"
                        title={tpl.name}
                        scrolling="no"
                      />
                    </div>
                  ) : (
                    <img 
                      src={tpl.thumbnail_url || 'https://via.placeholder.com/400x280/667eea/ffffff?text=Template'} 
                      alt={tpl.name} 
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
                  )}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[9px] bg-accent text-white px-3 py-1 rounded-full font-bold border border-white/20 backdrop-blur-md">
                      OFFICIAL
                    </span>
                  </div>
                </div>
                
                <div className="p-10 pt-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-sans font-bold text-white truncate">
                      {tpl.name}
                    </h3>
                  </div>
                  <p className="text-sm font-sans text-zinc-500 leading-relaxed line-clamp-2 mb-8">
                    {tpl.description}
                  </p>
                  <button className="w-full bg-white/5 border border-white/10 hover:bg-accent hover:text-white pl-6 pr-3 py-3 rounded-full font-bold text-[12px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 group">
                    Preview Template <div className="transition-transform group-hover:translate-x-1"><ArrowRight size={14} strokeWidth={3} /></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

       
      </div>
    </section>
  );
}
