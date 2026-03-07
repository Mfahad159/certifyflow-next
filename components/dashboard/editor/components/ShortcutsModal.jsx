import React from 'react';
import { Keyboard, X } from 'lucide-react';

const ShortcutsModal = ({ setShowShortcuts }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-[32px] w-full max-w-md overflow-hidden  animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Keyboard size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold">Design Shortcuts</h2>
              <p className="text-[12px] font-bold uppercase text-muted-foreground">Master the Studio</p>
            </div>
          </div>
          <button 
            onClick={() => setShowShortcuts(false)}
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-muted-foreground cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Undo Action', keys: ['Ctrl', 'Z'] },
              { label: 'Redo Action', keys: ['Ctrl', 'Y'] },
              { label: 'Duplicate Layer', keys: ['Ctrl', 'D'] },
              { label: 'Delete Selected', keys: ['Delete'] },
              { label: 'Move (1px)', keys: ['Arrows'] },
              { label: 'Move (10px)', keys: ['Shift', 'Arrows'] },
              { label: 'Save Project', keys: ['Ctrl', 'S'] },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                <div className="flex gap-1.5">
                  {item.keys.map((key, ki) => (
                    <kbd key={ki} className="px-2 py-1 rounded-md bg-secondary text-[12px] font-mono font-bold border border-border  min-w-[32px] text-center">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-8 py-5 bg-secondary/10 text-center border-t border-border">
          <button 
            onClick={() => setShowShortcuts(false)}
            className="w-full py-3 bg-accent text-white rounded-2xl font-bold text-xs uppercase hover:bg-accent/90 transition-all  cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
