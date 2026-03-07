import React from 'react';
import { 
  Undo, 
  Redo, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Keyboard 
} from 'lucide-react';

const HistoryBar = ({
  undo,
  redo,
  historyStep,
  history,
  csvData,
  previewRowIndex,
  setPreviewRowIndex,
  selectedFieldId,
  setSelectedFieldId,
  textFields,
  setTextFields,
  addToHistory,
  setShowShortcuts
}) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center pointer-events-none">
       <div className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-2xl rounded-full border border-border  pointer-events-auto">
          <div className="flex items-center gap-1 border-r border-border pr-3">
            <button onClick={undo} disabled={historyStep <= 0} className="p-2 rounded-full hover:bg-foreground/5 text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" title="Undo (Ctrl+Z)">
              <Undo size={18} />
            </button>
            <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 rounded-full hover:bg-foreground/5 text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer" title="Redo (Ctrl+Y)">
              <Redo size={18} />
            </button>
          </div>
          
          {/* Data Stepper */}
          {csvData.length > 0 && (
            <div className="flex items-center gap-3 px-3 border-r border-border">
              <button 
                 onClick={() => setPreviewRowIndex(i => Math.max(0, i - 1))}
                 disabled={previewRowIndex === 0}
                 className="p-1.5 rounded-full hover:bg-foreground/5 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex flex-col items-center min-w-[90px]">
                <span className="text-xs font-mono font-bold leading-none">
                  {previewRowIndex + 1} <span className="text-muted-foreground/50">/</span> {csvData.length}
                </span>
              </div>
              <button 
                 onClick={() => setPreviewRowIndex(i => Math.min(csvData.length - 1, i + 1))}
                 disabled={previewRowIndex === csvData.length - 1}
                 className="p-1.5 rounded-full hover:bg-foreground/5 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              if(selectedFieldId) {
                 const newFields = textFields.filter(f => f.id !== selectedFieldId)
                 setTextFields(newFields)
                 addToHistory(newFields)
                 setSelectedFieldId(null)
              }
            }}
            disabled={!selectedFieldId}
            className="p-2 rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-colors cursor-pointer"
            title="Delete Layer"
          >
            <Trash2 size={18} />
          </button>

          <div className="flex items-center gap-1 border-l border-border pl-3 ml-1">
            <button 
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-full hover:bg-accent/10 text-accent transition-colors cursor-pointer" 
              title="Keyboard Shortcuts"
            >
              <Keyboard size={18} />
            </button>
          </div>
       </div>
    </div>
  );
};

export default React.memo(HistoryBar);
