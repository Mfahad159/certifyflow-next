import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { TrendingUp, Pause, Play, CheckCircle2, Clock, XCircle } from 'lucide-react'

export default function EmailBatchModal({ 
  isOpen, 
  onClose, 
  progress, 
  currentIdx, 
  total, 
  isPaused, 
  onTogglePause, 
  isCompleted 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={isCompleted ? onClose : undefined}>
      <DialogContent className="sm:max-w-md p-0 border border-border dark:border-white/10 bg-background overflow-hidden rounded-[32px]">
        <div className="p-8">
          <DialogHeader className="space-y-1 mb-8">
            <DialogTitle className="text-2xl font-serif font-bold">
              {isCompleted ? "Batch Completed" : "Sending Certificates"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-[12px] font-bold opacity-60">
              {isCompleted ? "Your certificates have been sent successfully" : "We're currently sending your certificates"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-10">
            <div className="relative pt-1">
              <div className="flex mb-4 items-center justify-between">
                <div>
                  <span className={`text-[9px] font-bold inline-block py-1 px-3 rounded-full ${
                    isPaused ? "bg-amber-500/10 text-amber-500" : (isCompleted ? "bg-green-500/10 text-green-500" : "bg-accent/10 text-accent")
                  }`}>
                    {isPaused ? "Sending Paused" : (isCompleted ? "Process Finished" : "Currently Sending")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-foreground">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-secondary/40 border border-border/10 p-1">
                <div 
                  style={{ width: `${progress}%` }} 
                  className={`flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full transition-all duration-700 ease-in-out ${
                    isPaused ? "bg-zinc-400" : (isCompleted ? "bg-green-500" : "bg-gradient-to-r from-accent to-[#4482ff]")
                  }`}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground px-1">
                <span>{currentIdx} Sent</span>
                <span>{total - currentIdx} Remaining</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 rounded-3xl bg-secondary/10 border border-border/50 flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${isCompleted ? "bg-green-500/10 text-green-500" : "bg-accent/10 text-accent"}`}>
                     {isCompleted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground mb-1">Current Status</p>
                  <p className="text-sm font-bold">{isCompleted ? "Success" : (isPaused ? "Paused" : "Sending")}</p>
               </div>
               <div className="p-5 rounded-3xl bg-secondary/10 border border-border/50 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                     <TrendingUp size={14} className="text-blue-500" />
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground mb-1">Estimated Speed</p>
                  <p className="text-sm font-bold">~1.2s per email</p>
               </div>
            </div>

            <div className="flex gap-4">
              {!isCompleted ? (
                <Button 
                  onClick={onTogglePause}
                  variant="outline"
                  className="h-14 rounded-full flex-1 border-border font-bold text-[12px] flex items-center justify-center gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play size={14} className="fill-current" />
                      Resume Sending
                    </>
                  ) : (
                    <>
                      <Pause size={14} className="fill-current" />
                      Pause Sending
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={onClose}
                  className="h-14 rounded-full flex-1 bg-accent text-white font-bold text-[12px]"
                >
                  Return to Editor
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
