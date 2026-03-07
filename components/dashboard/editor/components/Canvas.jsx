import React, { useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const Canvas = ({
  uploadedImage,
  canvasPan,
  zoomLevel,
  isUiPanning,
  isSpacePressed,
  handleWorkspaceWheel,
  bind,
  canvasRef
}) => {
  const workspaceRef = useRef(null);

  // Attach wheel event with passive: false to allow preventDefault
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    workspace.addEventListener('wheel', handleWorkspaceWheel, { passive: false });

    return () => {
      workspace.removeEventListener('wheel', handleWorkspaceWheel);
    };
  }, [handleWorkspaceWheel]);

  return (
    <div 
      ref={workspaceRef}
      {...(bind ? bind() : {})}
      id="editor-workspace"
      className={`absolute inset-0 z-0 outline-none ${isUiPanning ? 'cursor-grabbing' : (isSpacePressed ? 'cursor-grab' : 'cursor-default')}`}
      style={{ touchAction: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {uploadedImage ? (
        <div 
          className="border border-white/5 pointer-events-auto" 
          style={{ 
            position: 'absolute',
            left: '50%',
            top: '50%',
            // CSS Scale prevents clipping at high zoom levels
            transform: `translate(calc(-50% + ${canvasPan.x}px), calc(-50% + ${canvasPan.y}px)) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            width: uploadedImage.width,
            height: uploadedImage.height
          }}
        >
          <canvas ref={canvasRef} />
        </div>
      ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground max-w-lg opacity-40">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ImageIcon className="opacity-60 text-accent" size={48} />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-3">Design Studio</h3>
              <p className="text-sm mb-8 leading-relaxed">Upload a template image to begin designing</p>
            </div>
          </div>
      )}
    </div>
  );
};

export default React.memo(Canvas);
