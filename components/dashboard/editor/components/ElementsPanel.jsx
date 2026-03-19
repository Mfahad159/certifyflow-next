import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  QrCode, 
  Calendar, 
  Fingerprint 
} from 'lucide-react';
import { toast } from 'sonner';
import TemplateThumbnail from '../../shared/TemplateThumbnail';

const ElementsPanel = ({ 
  CANVAS_PRESETS, 
  dbTemplates = [],
  isFetchingTemplates,
  setTextFields, 
  addToHistory,
  addStaticText, 
  addTextField,
  handleLogoUpload, 
  addQRCode, 
  addDate, 
  addUUIDField, 
  addShape,
  setUploadedImage
}) => {
  const allLibraryTemplates = [
    ...(Array.isArray(CANVAS_PRESETS) ? CANVAS_PRESETS.map(p => ({ ...p, isPreset: true })) : []),
    ...(Array.isArray(dbTemplates) ? dbTemplates : [])
  ]

  const handleApplyTemplate = (template) => {
    if (confirm(`Apply "${template.name}"? This will overwrite your current layers.`)) {
      let fields = []
      
      if (template.isPreset) {
        // Presets from lib/templates.ts use `layers`, not `textFields`
        const sourceFields = Array.isArray(template.layers) 
          ? template.layers 
          : Array.isArray(template.textFields) 
            ? template.textFields 
            : []
        fields = sourceFields.map(f => ({
          ...f,
          id: `preset_${Date.now()}_${Math.random()}`
        }))

        if (sourceFields.length === 0) {
          console.warn('[ElementsPanel] Preset template has no layers/textFields:', template)
        }
      } else {
        // DB templates store data in template_data
        const dbFields = Array.isArray(template.template_data?.layers)
          ? template.template_data.layers
          : Array.isArray(template.template_data?.textFields)
            ? template.template_data.textFields
            : []
        fields = dbFields.map(f => ({
          ...f,
          id: `db_${Date.now()}_${Math.random()}`
        }))
      }

      if (fields.length > 0) {
        setTextFields(fields)
        addToHistory(fields)
        
        // If template has a background image/color, we could apply it too
        if (!template.isPreset && template.thumbnail_url) {
           // setUploadedImage(template.thumbnail_url) // Optional: logic depends on if we want to load bg
        }

        toast.success(`Applied ${template.name}`)
      } else {
        toast.error('Template has no fields to apply')
      }
    }
  }

  return (
    <>
      {/* Templates Section */}
      <div className="mb-10">
        <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Design Library</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
          {isFetchingTemplates && (
            <div className="flex-shrink-0 w-32 h-24 rounded-2xl bg-secondary/20 animate-pulse flex items-center justify-center">
              <span className="text-[8px] font-bold opacity-40">Loading...</span>
            </div>
          )}

          {allLibraryTemplates.map((template, i) => (
            <button 
              key={template.id || i} 
              onClick={() => handleApplyTemplate(template)}
              className="flex-shrink-0 w-32 group"
            >
              <div className="aspect-[4/3] rounded-2xl bg-secondary/40 border border-border/50 overflow-hidden mb-2 group-hover:border-accent/50 transition-all relative isolate text-white">
                <TemplateThumbnail 
                  template={template} 
                  className="group-hover:scale-110 transition-transform duration-500" 
                />
                {!template.isPreset && (
                   <div className="absolute top-1.5 right-1.5">
                     <span className={`text-[6px] px-1.5 py-0.5 rounded-full font-bold border border-white/10 backdrop-blur-md ${template.source === 'private' ? 'bg-zinc-950 text-accent' : 'bg-accent text-white'}`}>
                       {template.source === 'private' ? 'Mine' : 'Public'}
                     </span>
                   </div>
                )}
              </div>
              <span className="text-[12px] font-medium text-foreground/70 group-hover:text-foreground line-clamp-1 text-left">{template.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Add Elements</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={addStaticText}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 text-foreground hover:text-accent transition-all cursor-pointer group"
            title="Add Custom Text"
          >
            <Type size={18} className="opacity-70 group-hover:opacity-100" />
            <span className="text-[9px] font-bold">Text</span>
          </button>

          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
            />
            <button className="w-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 text-foreground hover:text-accent transition-all cursor-pointer group">
              <ImageIcon size={18} className="opacity-70 group-hover:opacity-100" />
              <span className="text-[9px] font-bold">Logo</span>
            </button>
          </div>

          <button
            onClick={addQRCode}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 text-foreground hover:text-accent transition-all cursor-pointer group"
            title="Add QR Code"
          >
            <QrCode size={18} className="opacity-70 group-hover:opacity-100" />
            <span className="text-[9px] font-bold">QR Code</span>
          </button>

          <button
            onClick={addDate}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 text-foreground hover:text-accent transition-all cursor-pointer group"
            title="Insert Date"
          >
            <Calendar size={18} className="opacity-70 group-hover:opacity-100" />
            <span className="text-[9px] font-bold">Date</span>
          </button>

          <button
            onClick={addUUIDField}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 text-foreground hover:text-accent transition-all cursor-pointer group"
            title="Verification UUID"
          >
            <Fingerprint size={18} className="opacity-70 group-hover:opacity-100" />
            <span className="text-[9px] font-bold">UUID</span>
          </button>
        </div>
      </div>

      {/* Shapes Section */}
      <div className="mb-8 pt-4 border-t border-border/30">
        <h3 className="text-[12px] font-bold text-muted-foreground mb-4">Shapes</h3>
        <div className="grid grid-cols-4 gap-2">
           <button onClick={() => addShape('rect')} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 transition-all group">
            <div className="w-5 h-5 border-2 border-foreground/70 group-hover:border-accent rounded-sm" />
            <span className="text-[9px] font-bold uppercase mt-1">Square</span>
          </button>
          <button onClick={() => addShape('rect', 200, 100)} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 transition-all group">
            <div className="w-8 h-5 border-2 border-foreground/70 group-hover:border-accent rounded-sm" />
            <span className="text-[9px] font-bold uppercase mt-1">Rect</span>
          </button>
          <button onClick={() => addShape('circle')} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 transition-all group">
            <div className="w-5 h-5 border-2 border-foreground/70 group-hover:border-accent rounded-full" />
            <span className="text-[9px] font-bold uppercase mt-1">Circle</span>
          </button>
          <button onClick={() => addShape('triangle')} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-secondary/80 hover:bg-accent/20 transition-all group">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-foreground/70 group-hover:border-b-accent" />
            <span className="text-[9px] font-bold uppercase mt-1">Tri</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(ElementsPanel);
