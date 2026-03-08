import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  FileText,
  X,
  FileOutput,
  Send,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

import { templates } from '@/lib/templates';
import { templateService } from '@/lib/templateService';
import { campaignService } from '@/lib/campaignService.client';
import TemplateThumbnail from '../shared/TemplateThumbnail';

export default function CampaignModal({ isOpen, onClose, campaignType, userId }) {
  const navigate = useRouter()
  const [step, setStep] = useState(1) // 1 = name & mode, 2 = CSV upload
  const [campaignName, setCampaignName] = useState('')
  const [selectedMode, setSelectedMode] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [publicTemplates, setPublicTemplates] = useState([])
  const [privateTemplates, setPrivateTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState({ id: null, type: null })
  const [error, setError] = useState('')
  const [showCancelAlert, setShowCancelAlert] = useState(false)
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [showValidationAlert, setShowValidationAlert] = useState(false)
  const [validationWarning, setValidationWarning] = useState('')
  const [pendingCsvData, setPendingCsvData] = useState(null)
  const carouselRef = React.useRef(null)

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, userId])

  const loadTemplates = async () => {
    try {
      const [pubTemplates, privTemplates] = await Promise.all([
        templateService.getPublicTemplates(),
        userId ? templateService.getUserTemplates(userId) : Promise.resolve([])
      ])
      setPublicTemplates(pubTemplates)
      setPrivateTemplates(privTemplates)

      // Default selection
      if (pubTemplates.length > 0) {
        setSelectedTemplate({ id: pubTemplates[0].id, type: 'public' })
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
    }
  }

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please upload a valid CSV file')
        return
      }
      setCsvFile(file)
      setError('')
    }
  }

  const handleRemoveFile = () => {
    setCsvFile(null)
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return null

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || ''
        return obj
      }, {})
    })

    return { headers, data }
  }

  const validateCSVColumns = (csvData) => {
    const headers = csvData.headers
    const hasName = headers.some(h => h.toLowerCase() === 'name')
    const hasEmail = headers.some(h => h.toLowerCase() === 'email')

    const missingColumns = []
    if (!hasName) missingColumns.push('name')
    if (!hasEmail) missingColumns.push('email')

    return {
      isValid: missingColumns.length === 0,
      missingColumns
    }
  }

  const handleSubmit = async (forceSubmit = false) => {
    if (!csvFile) {
      toast.error('Please upload a CSV file')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Read and parse CSV
      const text = await csvFile.text()
      const csvData = parseCSV(text)

      if (!csvData) {
        toast.error('Invalid CSV format')
        setIsLoading(false)
        return
      }

      // Validate required columns if not forced
      if (!forceSubmit) {
        const validation = validateCSVColumns(csvData)
        if (!validation.isValid) {
          setPendingCsvData(csvData)
          setValidationWarning(
            `Your CSV is missing required columns: ${validation.missingColumns.join(', ')}. ` +
            `This may cause issues during certificate generation or sending.`
          )
          setShowValidationAlert(true)
          setIsLoading(false)
          return
        }
      }

      // Create campaign in Supabase
      const campaignData = {
        user_id: userId,
        name: campaignName,
        type: selectedMode,
        status: 'draft',
        total_certificates: csvData.data.length,
        csv_data: csvData,
      }

      if (selectedTemplate.type === 'public') {
        campaignData.public_template_id = selectedTemplate.id
      } else if (selectedTemplate.type === 'private') {
        campaignData.private_template_id = selectedTemplate.id
      }

      const campaign = await campaignService.createCampaign(campaignData)

      // Navigate to generate page with campaign data
      navigate.push(`/dashboard/edit/${campaign.id}`)

      // Reset and close
      handleClose()
    } catch (err) {
      console.error('Error creating campaign:', err)
      toast.error(err.message || 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidationContinue = async () => {
    setShowValidationAlert(false)
    setShowCreateAlert(false)
    await handleSubmit(true)
  }

  const handleNext = () => {
    if (!campaignName.trim()) {
      toast.error('Please enter a campaign name')
      return
    }
    if (!selectedMode) {
      toast.error('Please select a campaign mode')
      return
    }
    if (!selectedTemplate.id && selectedTemplate.type !== 'custom') {
      toast.error('Please select a template')
      return
    }
    setError('')
    setStep(2)
  }

  const handleClose = () => {
    if (!isLoading) {
      setStep(1)
      setCampaignName('')
      setSelectedMode(null)
      setCsvFile(null)
      setError('')
      onClose()
    }
  }


  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border dark:border-white/10 [&>button:last-child]:bg-secondary/50 [&>button:last-child]:border [&>button:last-child]:border-border [&>button:last-child]:rounded-full [&>button:last-child]:w-7 [&>button:last-child]:h-7 [&>button:last-child]:right-6 [&>button:last-child]:top-6 [&>button:last-child]:transition-all [&>button:last-child]:hover:bg-secondary [&>button:last-child]:flex [&>button:last-child]:items-center [&>button:last-child]:justify-center">
          <DialogHeader className="px-6 py-6 border-b bg-secondary/20 dark:bg-white/5 text-left">
            <div className="flex items-center justify-between mb-1">
              <DialogTitle className="text-xl font-bold font-serif">Create Campaign</DialogTitle>
              <div className="flex gap-1.5 mr-8">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-accent' : 'w-2 bg-secondary'
                      }`}
                  />
                ))}
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground/80">
              {step === 1 ? 'Configure details and design' : 'Upload recipient data'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-2 overflow-y-auto max-h-[45vh] no-scrollbar">
            <div className="space-y-6 py-2">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Campaign Name</label>
                    <Input
                      placeholder="e.g., Summer Workshop 2026"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="rounded-xl h-11 focus-visible:ring-accent selection:bg-accent/30 selection:text-foreground"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground">Campaign Mode</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedMode('generate_only')}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${selectedMode === 'generate_only'
                            ? 'bg-accent/10 border-accent ring-1 ring-accent'
                            : 'bg-background hover:bg-secondary/50 border-border'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedMode === 'generate_only' ? 'bg-accent text-white' : 'bg-secondary text-muted-foreground'}`}>
                          <FileOutput size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Generate</h4>
                          <p className="text-muted-foreground text-[12px]">ZIP/PDF Export</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedMode('generate_send')}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${selectedMode === 'generate_send'
                            ? 'bg-accent/10 border-accent ring-1 ring-accent'
                            : 'bg-background hover:bg-secondary/50 border-border'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedMode === 'generate_send' ? 'bg-accent text-white' : 'bg-secondary text-muted-foreground'}`}>
                          <Send size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Gen & Send</h4>
                          <p className="text-muted-foreground text-[12px]">Email Automation</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground">Design Template</label>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => scrollCarousel('left')} className="h-6 w-6 rounded-full border border-border">
                          <ChevronLeft size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => scrollCarousel('right')} className="h-6 w-6 rounded-full border border-border">
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    </div>

                    <div
                      ref={carouselRef}
                      className="flex overflow-x-auto gap-4 py-2 no-scrollbar snap-x snap-mandatory"
                    >
                      {/* Public Templates */}
                      {publicTemplates.map((tpl) => (
                        <button
                          key={`pub-${tpl.id}`}
                          onClick={() => setSelectedTemplate({ id: tpl.id, type: 'public' })}
                          className="shrink-0 w-40 snap-start rounded-2xl overflow-hidden border border-border transition-all hover:border-accent/30"
                        >
                          <div className="aspect-[1.4/1] relative bg-zinc-900 border-b border-border overflow-hidden pointer-events-none select-none">
                            <TemplateThumbnail template={tpl} />
                            {selectedTemplate.id === tpl.id && selectedTemplate.type === 'public' && (
                              <div className="absolute top-2.5 right-2.5 z-10">
                                <div className="bg-accent text-white rounded-full p-1.5 shadow-xl ring-2 ring-white dark:ring-zinc-950">
                                  <Check size={10} strokeWidth={4} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-background text-left">
                            <p className="text-[11px] font-bold truncate text-foreground leading-tight">
                              {tpl.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Official Design</p>
                          </div>
                        </button>
                      ))}

                      {/* Private Templates */}
                      {privateTemplates.map((tpl) => (
                        <button
                          key={`priv-${tpl.id}`}
                          onClick={() => setSelectedTemplate({ id: tpl.id, type: 'private' })}
                          className="shrink-0 w-40 snap-start rounded-2xl overflow-hidden border border-border transition-all hover:border-accent/30"
                        >
                          <div className="aspect-[1.4/1] relative bg-zinc-900 border-b border-border overflow-hidden pointer-events-none select-none">
                            <TemplateThumbnail template={tpl} />
                            {selectedTemplate.id === tpl.id && selectedTemplate.type === 'private' && (
                              <div className="absolute top-2.5 right-2.5 z-10">
                                <div className="bg-accent text-white rounded-full p-1.5 shadow-xl ring-2 ring-white dark:ring-zinc-950">
                                  <Check size={10} strokeWidth={4} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-background text-left">
                            <p className="text-[11px] font-bold truncate text-foreground leading-tight">
                              {tpl.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Saved Design</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-10 border-2 border-dashed border-border rounded-[32px] bg-secondary/5 text-center group transition-colors hover:bg-secondary/10">
                    {!csvFile ? (
                      <label className="cursor-pointer space-y-3">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                          <Upload className="text-primary" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-base text-foreground">Click to upload Recipient CSV</p>
                          <p className="text-xs text-muted-foreground mt-1">Upload a file containing names and email addresses</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".csv"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                      </label>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                          <FileText className="text-green-500" size={24} />
                        </div>
                        <h4 className="font-bold text-foreground text-base truncate max-w-xs">{csvFile.name}</h4>
                        <p className="text-xs text-muted-foreground mb-6">{(csvFile.size / 1024).toFixed(2)} KB</p>
                        <Button variant="outline" size="sm" onClick={handleRemoveFile} className="rounded-full text-red-500 hover:bg-red-500 hover:text-white border-red-500/20">
                          Remove and replace
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border flex flex-row items-center sm:justify-between">
            <Button variant="ghost" onClick={() => step === 2 ? setStep(1) : setShowCancelAlert(true)} disabled={isLoading} className="rounded-xl">
              {step === 2 ? 'Back' : 'Cancel'}
            </Button>
            {step === 1 ? (
              <Button onClick={handleNext} disabled={isLoading} className="rounded-xl px-10 bg-accent text-white hover:bg-accent/90">
                Next Stage <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={() => setShowCreateAlert(true)} disabled={isLoading || !csvFile} className="rounded-xl px-10 bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20">
                {isLoading ? 'Processing...' : 'Launch Campaign'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Separate Alert Dialogs for flow stability */}
      <AlertDialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
        <AlertDialogContent className="rounded-[40px] border-border bg-background/95 backdrop-blur-xl p-10 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[24px] bg-accent/10 flex items-center justify-center mx-auto sm:mx-0">
              <Send className="text-accent" size={32} />
            </div>
            <div className="text-center sm:text-left">
              <AlertDialogTitle className="text-2xl font-serif font-bold">Launch Campaign?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm mt-2 text-muted-foreground">
                You are about to initialize "{campaignName}". This will process your recipients and prepare certificates.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-2">
            <AlertDialogCancel className="rounded-full px-8 py-6 text-xs font-bold border-border">Review</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCreateAlert(false);
                handleSubmit();
              }}
              className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 py-6 text-xs font-bold"
            >
              Launch Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent className="rounded-[40px] border-border bg-background/95 backdrop-blur-xl p-10 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[24px] bg-red-500/10 flex items-center justify-center mx-auto sm:mx-0">
              <X className="text-red-500" size={32} />
            </div>
            <div className="text-center sm:text-left">
              <AlertDialogTitle className="text-2xl font-serif font-bold">Discard Changes?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm mt-2 text-muted-foreground">
                Are you sure you want to stop? All progress in this configuration will be permanently lost.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-2">
            <AlertDialogCancel className="rounded-full px-8 py-6 text-xs font-bold border-border">Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelAlert(false);
                handleClose();
              }}
              className="bg-red-500 text-white hover:bg-red-600 rounded-full px-8 py-6 text-xs font-bold"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent className="rounded-[40px] border-border bg-background/95 backdrop-blur-xl p-10 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center mx-auto sm:mx-0">
              <FileText className="text-amber-500" size={32} />
            </div>
            <div className="text-center sm:text-left">
              <AlertDialogTitle className="text-2xl font-serif font-bold">Data Warning</AlertDialogTitle>
              <AlertDialogDescription className="text-sm mt-2 text-muted-foreground">
                {validationWarning}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowValidationAlert(false);
                setPendingCsvData(null);
              }}
              className="rounded-full px-8 py-6 text-xs font-bold uppercase tracking-widest border-border"
            >
              Fix File
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidationContinue}
              className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 py-6 text-xs font-bold uppercase tracking-widest"
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
