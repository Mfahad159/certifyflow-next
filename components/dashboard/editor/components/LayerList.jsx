import React from 'react';
import { 
  QrCode, 
  Image as ImageIcon, 
  Move, 
  Fingerprint, 
  Square, 
  Circle as CircleIcon, 
  Triangle as TriangleIcon, 
  Type, 
  ChevronUp, 
  ChevronDown, 
  Trash2 
} from 'lucide-react';

const LayerList = ({
  textFields,
  selectedFieldId,
  setSelectedFieldId,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  moveLayer,
  removeTextField
}) => {
  return (
    <div className="pt-4 border-t border-border/30">
      <div className="flex flex-row items-center mb-5">
        <h3 className="text-[12px] font-bold text-foreground/90 leading-tight">
          Layers
        </h3>
        <span className="text-[12px] bg-accent rounded-full text-black px-2 ml-2 font-bold">{textFields.length}</span>
      </div>

      <div className="space-y-2">
        {[...textFields].map((field, idx) => {
          // We render them in reverse order so that TOP of list = FRONT of canvas
          const reversedIdx = textFields.length - 1 - idx;
          const f = textFields[reversedIdx];
          
          if (!f) return null;

          return (
            <div 
              key={f.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, reversedIdx)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, reversedIdx)}
              onClick={() => setSelectedFieldId(f.id)}
              className={`p-2.5 rounded-xl cursor-grab transition-all group ${
                selectedFieldId === f.id 
                  ? 'bg-accent/20 border-2 border-accent' 
                  : 'bg-background/50 hover:bg-background border border-border/50 hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-[12px] font-bold shrink-0">{reversedIdx + 1}</span>
                {f.type === 'qrcode' ? (
                  <QrCode size={14} className="text-muted-foreground shrink-0" />
                ) : f.type === 'image' ? (
                  <ImageIcon size={14} className="text-muted-foreground shrink-0" />
                 ) : f.type === 'staticText' ? (
                   <Move size={14} className="text-muted-foreground shrink-0" />
                 ) : f.type === 'uuid' ? (
                   <Fingerprint size={14} className="text-muted-foreground shrink-0" />
                 ) : f.type === 'rect' ? (
                   <Square size={14} className="text-muted-foreground shrink-0" />
                 ) : f.type === 'circle' ? (
                   <CircleIcon size={14} className="text-muted-foreground shrink-0" />
                 ) : f.type === 'triangle' ? (
                   <TriangleIcon size={14} className="text-muted-foreground shrink-0" />
                 ) : (
                   <Type size={14} className="text-muted-foreground shrink-0" />
                 )}
                <span className="text-xs font-bold flex-1 truncate">
                  {f.type === 'qrcode' ? 'QR Code' : 
                   f.type === 'image' ? 'Logo/Image' : 
                   f.type === 'uuid' ? 'Verification ID' : 
                   f.type === 'staticText' ? (f.text || 'Custom Text') : 
                   f.type === 'rect' ? (f.width === f.height ? 'Square' : 'Rectangle') :
                   f.type === 'circle' ? 'Circle' :
                   f.type === 'triangle' ? 'Triangle' :
                   (f.column || 'Text')}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveLayer(f.id, 'up') }}
                    disabled={reversedIdx === textFields.length - 1}
                    className="p-1 hover:bg-accent/20 rounded disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveLayer(f.id, 'down') }}
                    disabled={reversedIdx === 0}
                    className="p-1 hover:bg-accent/20 rounded disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); removeTextField(f.id) }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(LayerList);
