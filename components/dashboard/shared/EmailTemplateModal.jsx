import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, ArrowRight, X, Image as ImageIcon, Upload, Palette, Type } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { emailTemplates } from '@/lib/emailTemplates';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';

export default function EmailTemplateModal({ isOpen, onClose, onSend, campaignName }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]); // Default to certificate delivery
  const [logoUrl, setLogoUrl] = useState('https://i.ibb.co/3yhthnMj/Frame-1-6.png');
  const [brandName, setBrandName] = useState('BulkCerts');
  const [accentColor, setAccentColor] = useState('#6b55fd');
  const [isSending, setIsSending] = useState(false);
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleStartSend = async () => {
    setIsSending(true);
    try {
      await onSend({
        templateId: selectedTemplate.id,
        logoUrl,
        brandName,
        accentColor
      });
      onClose();
    } catch (err) {
      toast.error('Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border dark:border-white/10 [&>button:last-child]:bg-secondary/50 [&>button:last-child]:border [&>button:last-child]:border-border [&>button:last-child]:rounded-full [&>button:last-child]:w-7 [&>button:last-child]:h-7 [&>button:last-child]:right-6 [&>button:last-child]:top-6 [&>button:last-child]:transition-all [&>button:last-child]:hover:bg-secondary [&>button:last-child]:flex [&>button:last-child]:items-center [&>button:last-child]:justify-center">
        <DialogHeader className="px-6 py-6 border-b bg-secondary/20 dark:bg-white/5">
          <div className="flex items-center justify-between mb-1">
            <DialogTitle className="text-xl font-bold font-serif">Email Settings</DialogTitle>
            <div className="flex gap-1.5 mr-8">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === i ? 'w-6 bg-accent' : 'w-2 bg-secondary'
                  }`} 
                />
              ))}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/80">
            {step === 1 ? 'Select a template' : step === 2 ? 'Branding details' : 'Final review'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2 overflow-y-auto max-h-[45vh] no-scrollbar">
          {step === 1 && (
            <div className="grid grid-cols-1 gap-3 py-2">
              {emailTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedTemplate.id === tpl.id 
                    ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                    : 'bg-background hover:bg-secondary/50 border-border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedTemplate.id === tpl.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                      {selectedTemplate.id === tpl.id ? <CheckCircle size={18} /> : <Mail size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{tpl.name}</h4>
                      <p className="text-muted-foreground text-xs">{tpl.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 py-2">
              <div className="flex items-center gap-6 p-4 rounded-2xl border bg-secondary/20">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2 border border-border overflow-hidden shrink-0">
                  <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1">
                  <input type="file" id="logo-upload" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  <label htmlFor="logo-upload" className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1.5">
                    <Upload size={14} /> Change Brand Logo
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Brand Name</label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Company Name" className="rounded-xl focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border-none p-0 overflow-hidden cursor-pointer" />
                  <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="font-mono rounded-xl focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 py-2">
              <div className="p-5 rounded-2xl border bg-secondary/10 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Campaign</span>
                  <span className="font-bold">{campaignName}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-border/50">
                  <span className="text-muted-foreground font-medium">Template</span>
                  <span className="font-bold">{selectedTemplate.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-border/50">
                  <span className="text-muted-foreground font-medium">Brand</span>
                  <span className="font-bold">{brandName}</span>
                </div>
              </div>

              <div className="rounded-2xl border overflow-hidden">
                <div className="px-4 py-2 border-b bg-secondary/30 text-[12px] font-bold text-muted-foreground flex justify-between">
                  <span>Preview</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  </div>
                </div>
                <div className="p-6 bg-white flex flex-col items-center text-center gap-3">
                  <img src={logoUrl} className="h-6 w-auto object-contain" alt="Logo" />
                  <div>
                    <h5 className="font-serif italic text-lg text-zinc-900 leading-none">Certificate Processed</h5>
                    <p className="text-[12px] text-zinc-500 mt-1">Hello participant, your certificate is ready.</p>
                  </div>
                  <div className="px-6 py-2 rounded-full text-white text-[12px] font-bold" style={{ backgroundColor: accentColor }}>
                    View Certificate
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t flex flex-row items-center sm:justify-between">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="rounded-xl">
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="rounded-xl px-8 bg-accent text-white hover:bg-accent/90">
              Next Step
            </Button>
          ) : (
            <Button onClick={handleStartSend} disabled={isSending} className="rounded-xl px-8 bg-accent text-white hover:bg-accent/90">
              {isSending ? 'Sending...' : 'Send Certificates'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
