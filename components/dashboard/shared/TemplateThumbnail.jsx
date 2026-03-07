import React from 'react'

export const getTemplatePreviewHtml = (template, isThumbnail = false) => {
  const isJson = template.template_data && 
                 template.template_data.textFields && 
                 template.template_data.textFields.length > 0

  if (isJson) {
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
            object-fit: contain;
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
  
  // High-fidelity fallback if HTML/CSS provided in JSON
  const html = template.template_data?.html_content || template.html_content || ''
  const css = template.template_data?.css_content || template.css_content || ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 100vh; } 
        .preview-container { transform-origin: center; width: 800px; height: 600px; position: relative; }
        ${css}
      </style>
    </head>
    <body style="background: white;">
      <div class="preview-container">${html}</div>
    </body>
    </html>
  `
}

export default function TemplateThumbnail({ template, className = "" }) {
  const isJson = template.template_data && 
                 template.template_data.textFields && 
                 template.template_data.textFields.length > 0
  
  const hasThumbnail = template.thumbnail_url || template.thumbnail

  if (hasThumbnail && !isJson) {
    return (
      <img
        src={template.thumbnail_url || template.thumbnail}
        alt={template.name}
        className={`w-full h-full object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none select-none bg-zinc-950 overflow-hidden isolate ${className}`}>
      <iframe
        srcDoc={getTemplatePreviewHtml(template, true)}
        className="w-full h-full border-0 border-none pointer-events-none"
        title={template.name}
        scrolling="no"
      />
    </div>
  )
}
