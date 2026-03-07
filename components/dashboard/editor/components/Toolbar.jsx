import React from 'react';
import { 
  ArrowLeft, 
  FileText, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen, 
  ZoomOut, 
  ZoomIn, 
  Save, 
  Loader2, 
  Minimize2, 
  Maximize2, 
  User, 
  LogOut,
  Cloud
} from 'lucide-react';
import { Button } from '../../../ui/button';
import ThemeToggle from '../../../ui/theme-toggle';

const Toolbar = ({
  campaignName,
  hasUnsavedChanges,
  isSavingWork,
  isAutoSaving,
  lastSavedTime,
  isFullscreen,
  setIsFullscreen,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
  zoomLevel,
  setZoomLevel,
  user,
  handleSaveWork,
  handleLogout,
  setShowUnsavedDialog,
  navigate,
  isTemplateMode
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-8 px-6 flex justify-center pointer-events-none">
      <div className="
        transition-all duration-700 pointer-events-auto
        flex items-center justify-between gap-8
        bg-background/80 backdrop-blur-2xl
        px-8 py-3 rounded-[32px]
        py-2.5 border border-border
      ">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (hasUnsavedChanges) {
                setShowUnsavedDialog(true);
              } else {
                navigate('/dashboard');
              }
            }} 
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-foreground cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3 pr-6 border-r border-border">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileText size={20} className="text-accent" />
            </div>
            <div>
               <h1 className="text-base font-serif font-bold leading-none">
                 {campaignName || 'Certificate Editor'}
               </h1>
               <p className="text-[12px] font-bold text-muted-foreground mt-1">
                 {isTemplateMode ? 'Template Builder' : (campaignName ? 'Editing Campaign' : 'Design Studio')}
               </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View & Zoom Controls Group */}
          <div className="flex items-center gap-1 px-2 border-r border-border">
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} title="Toggle left sidebar">
              {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setRightSidebarOpen(!rightSidebarOpen)} title="Toggle right sidebar">
              {rightSidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </Button>
          </div>

          <div className="flex items-center gap-1 px-2 border-r border-border">
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setZoomLevel(prev => Math.max(0.25, prev - 0.25))} disabled={zoomLevel <= 0.25} title="Zoom out">
              <ZoomOut size={16} />
            </Button>
            <span className="text-xs font-mono px-2 min-w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))} disabled={zoomLevel >= 3} title="Zoom in">
              <ZoomIn size={16} />
            </Button>
          </div>

          <ThemeToggle />
          
          {/* Auto-save indicator */}
          {(isAutoSaving || isSavingWork || (lastSavedTime && !hasUnsavedChanges)) && (
            <div className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
              {(isAutoSaving || isSavingWork) ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Cloud size={14} />
                  <span>Saved</span>
                </>
              )}
            </div>
          )}
          
          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && !isAutoSaving && !isSavingWork && (
            <div className="flex items-center gap-1.5 px-2 text-xs text-orange-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span>Unsaved</span>
            </div>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>

          {user && !isFullscreen && (
            <>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-7 h-7 rounded-full border border-border" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                      <User size={14} className="text-black" />
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="h-8 w-8 cursor-pointer">
                  <LogOut size={14} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Toolbar);
