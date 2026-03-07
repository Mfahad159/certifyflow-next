import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from "react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { toast } from "sonner";
import { 
  Loader, 
  Send, 
  Heart, 
  Mail, 
  ArrowRight, 
  Upload, 
  X, 
  FileText, 
  ChevronLeft,
  Settings,
  Pause,
  Play,
  CheckCircle2,
  Clock
} from "lucide-react";
import { render } from "@react-email/render";
import AnnouncementEmail from "../../../emails/AnnouncementEmail";
import { supabase, signOut } from "@/lib/supabase";
import DashboardNavbar from "./DashboardNavbar";
import { campaignService } from "@/lib/campaignService";

export default function SendEmailComponent() {
  const navigate = useRouter();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  });

  const [step, setStep] = useState(1); // 1 = Config, 2 = Recipients, 3 = Sending Progress
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalRecipients, setTotalRecipients] = useState(0);
  
  const [formData, setFormData] = useState({
    subject: "Announcement from MLSA CFD",
    message: "",
  });

  const [recipients, setRecipients] = useState([]); // List of emails
  const [csvFile, setCsvFile] = useState(null);
  const [individualEmail, setIndividualEmail] = useState("");

  const [emailConfig, setEmailConfig] = useState({
    provider: "",
    apiKey: "",
    fromEmail: "",
    fromName: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate.push('/');
      }
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const provider = localStorage.getItem('emailProvider');
    const apiKey = localStorage.getItem('emailApiKey');
    const fromEmail = localStorage.getItem('fromEmail');
    const fromName = localStorage.getItem('fromName');
    
    setEmailConfig({ provider, apiKey, fromEmail, fromName });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await signOut();
    navigate.push('/');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please upload a valid CSV file');
        return;
      }
      setCsvFile(file);
      const text = await file.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      const emails = rows.slice(1).map(row => {
        const columns = row.split(',');
        // Strategy: find the column that looks like an email
        return columns.find(col => col.includes('@'))?.trim();
      }).filter(email => email);
      
      setRecipients(emails);
      toast.success(`Loaded ${emails.length} recipients from CSV`);
    }
  };

  const handleAddIndividual = () => {
    if (individualEmail && !recipients.includes(individualEmail)) {
      setRecipients([...recipients, individualEmail]);
      setIndividualEmail("");
    }
  };

  const handleSend = async () => {
    if (!emailConfig.apiKey || !emailConfig.fromEmail) {
      toast.error('Email provider not configured. Please go to Settings.');
      return;
    }

    if (recipients.length === 0) {
      toast.error('Please add at least one recipient.');
      return;
    }

    setStep(3);
    setLoading(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setTotalRecipients(recipients.length);
    setProgress(0);
    setCurrentIdx(0);

    let successCount = 0;

    for (let i = 0; i < recipients.length; i++) {
      // Check for pause
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCurrentIdx(i + 1);
      const recipient = recipients[i];

      try {
        const emailHTML = await render(
          <AnnouncementEmail
            title={formData.subject}
            message={formData.message}
            brandName={emailConfig.fromName || "MLSA CFD"}
          />
        );

        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            subject: formData.subject,
            html: emailHTML,
            provider: emailConfig.provider,
            apiKey: emailConfig.apiKey,
            fromEmail: emailConfig.fromEmail,
            fromName: emailConfig.fromName,
          }),
        });

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error("Error sending to:", recipient, error);
      }

      const newProgress = Math.round(((i + 1) / recipients.length) * 100);
      setProgress(newProgress);
      
      // Update global stats if possible (though this is not a traditional "Campaign")
      // In this component, we'll just update the local UI.
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
    }

    setLoading(false);
    toast.success(`Successfully sent ${successCount} out of ${recipients.length} emails!`);
  };

  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    isPausedRef.current = newState;
    toast.info(newState ? "Sending paused" : "Resuming sending...");
  };

  return (
    <div className="min-h-screen bg-background text-foreground no-scrollbar selection:bg-[#A098FF] selection:text-white transition-colors duration-300">
      <DashboardNavbar 
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        currentPage="send-email"
      />
      
      <main className="ml-[var(--sidebar-width,256px)] min-h-screen transition-all duration-500">
      <div className="max-w-[1400px] w-full mx-auto px-4 pt-40 pb-20 flex flex-col items-center">
        {/* Header Section */}
        <div className="relative w-full flex flex-col items-center mb-12">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full filter blur-3xl opacity-20 pointer-events-none bg-gradient-to-r from-[#2A43F8] to-[#4482ff]"
          />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-center mb-4 text-foreground dark:text-white">
            Send <span className="text-accent italic">Announcements</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-xl text-lg font-medium">
            Send premium HTML notifications to your entire list with real-time tracking and control.
          </p>
        </div>

        {/* Main Interface (Designed like CampaignModal) */}
        <div className="w-full max-w-2xl bg-background/50 backdrop-blur-3xl border border-border rounded-[48px] overflow-hidden shadow-2xl shadow-accent/5">
          {/* Tabs/Steps Indicator */}
          <div className="flex border-b border-border/50">
            {[
              { id: 1, label: "Configure", icon: Settings },
              { id: 2, label: "Recipients", icon: User },
              { id: 3, label: "Progress", icon: TrendingUp }
            ].map((s) => (
              <div 
                key={s.id}
                className={`flex-1 flex items-center justify-center gap-2 py-5 text-[12px] font-bold border-b-2 transition-all ${
                  step === s.id ? "border-accent text-accent bg-accent/5" : "border-transparent text-muted-foreground opacity-50"
                }`}
              >
                <s.icon size={14} />
                {s.label}
              </div>
            ))}
          </div>

          <div className="p-10">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold text-muted-foreground pl-1">Email Subject</Label>
                  <Input 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-14 rounded-2xl bg-secondary/20 border-border/50 text-lg px-6 font-medium focus:ring-accent"
                    placeholder="Enter subject line..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold text-muted-foreground pl-1">Message Body</Label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[200px] rounded-[32px] bg-secondary/20 border-border/50 p-6 text-base leading-relaxed resize-none focus:ring-accent"
                    placeholder="Write your announcement or general update here..."
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => setStep(2)}
                    className="w-full h-14 rounded-full bg-accent text-white font-bold text-[11px] hover:bg-lavender-600 transition-all group"
                  >
                    Select Recipients
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="p-8 rounded-[32px] border-2 border-dashed border-border bg-secondary/10 flex flex-col items-center justify-center text-center relative hover:border-accent/50 transition-colors group">
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-accent" />
                    </div>
                    <p className="font-bold text-sm mb-1">Upload CSV List</p>
                    <p className="text-[12px] text-muted-foreground">Drag and drop or click to browse</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-10" />
                    <span className="bg-background px-4 text-[12px] font-bold text-muted-foreground flex w-fit mx-auto backdrop-blur-3xl">Or</span>
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter individual email..."
                      value={individualEmail}
                      onChange={(e) => setIndividualEmail(e.target.value)}
                      className="h-14 rounded-full bg-secondary/20 border-border/50 px-6 flex-1"
                    />
                    <Button 
                      onClick={handleAddIndividual}
                      className="h-14 w-14 rounded-full bg-background border border-border text-foreground hover:bg-secondary flex items-center justify-center p-0"
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                </div>

                {recipients.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <p className="text-[12px] font-bold text-muted-foreground">Recipients ({recipients.length})</p>
                       <button onClick={() => setRecipients([])} className="text-[12px] font-bold text-red-500 hover:opacity-70">Clear All</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-2 no-scrollbar space-y-2">
                      {recipients.map((email, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/50 group/item">
                          <div className="flex items-center gap-3">
                            <Mail size={14} className="text-muted-foreground" />
                            <span className="text-sm font-medium">{email}</span>
                          </div>
                          <button 
                            onClick={() => setRecipients(recipients.filter((_, i) => i !== idx))}
                            className="p-1 opacity-0 group-hover/item:opacity-100 hover:text-red-500 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-14 rounded-full flex-1 font-bold text-[11px] border-border"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSend}
                    disabled={recipients.length === 0}
                    className="h-14 rounded-full flex-[2] bg-accent text-white font-bold text-[11px] hover:bg-lavender-600 shadow-xl shadow-accent/20"
                  >
                    Confirm & Send ({recipients.length})
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-serif font-bold">Email Sending Progress</h3>
                  <p className="text-xs text-muted-foreground font-medium">Processing your email list via our secure service</p>
                </div>

                <div className="space-y-6">
                  {/* Circular/Linear Progress Combined Design */}
                  <div className="relative pt-1">
                    <div className="flex mb-4 items-center justify-between">
                      <div>
                        <span className="text-[12px] font-bold inline-block py-1 px-3 rounded-full bg-accent/20 text-accent">
                          {isPaused ? "Sending Paused" : "Sending Emails"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-serif font-bold text-foreground">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-secondary/40 border border-border/50 p-1">
                      <div 
                        style={{ width: `${progress}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full transition-all duration-500 ease-out ${
                          isPaused ? "bg-zinc-400" : "bg-gradient-to-r from-accent to-[#4482ff]"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[12px] font-bold text-muted-foreground px-1">
                      <span>{currentIdx} Sent</span>
                      <span>{totalRecipients - currentIdx} Remaining</span>
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 rounded-[32px] bg-secondary/10 border border-border flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                           <Clock size={14} className="text-accent" />
                        </div>
                        <p className="text-[12px] font-bold text-muted-foreground mb-1">Queue Status</p>
                        <p className="text-sm font-bold">{loading ? "Sending" : "Completed"}</p>
                     </div>
                     <div className="p-6 rounded-[32px] bg-secondary/10 border border-border flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                           <CheckCircle2 size={14} className="text-green-500" />
                        </div>
                        <p className="text-[12px] font-bold text-muted-foreground mb-1">Successful</p>
                        <p className="text-sm font-bold">{progress === 100 ? totalRecipients : currentIdx}</p>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {loading && (
                    <Button 
                      onClick={togglePause}
                      variant="outline"
                      className="h-16 rounded-full flex-1 border-border font-bold text-[11px] flex items-center justify-center gap-3"
                    >
                      {isPaused ? (
                        <>
                          <Play size={18} className="fill-current" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause size={18} className="fill-current" />
                          Pause
                        </>
                      )}
                    </Button>
                  )}
                  {!loading && (
                    <Button 
                      onClick={() => setStep(1)}
                      className="h-16 rounded-full flex-1 bg-accent text-white font-bold text-[11px] hover:bg-lavender-600"
                    >
                      Send New Batch
                    </Button>
                  )}
                  {!loading && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate.push('/dashboard')}
                      className="h-16 rounded-full flex-1 border-border font-bold text-[11px]"
                    >
                      Dashboard
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Credit */}
        <div className="w-full mt-16 text-center">
          <div className="flex items-center justify-center text-[12px] font-bold text-muted-foreground font-serif italic">
            built with
            <Heart className="mx-3 w-4 h-4 fill-accent text-accent animate-pulse" />
            by
            <a
              href="https://theajmalrazaq.github.io"
              target="_blank"
              className="text-foreground hover:text-accent transition-colors ml-3 not-italic font-sans"
              rel="noreferrer"
            >
              Ajmal Razaq Bhatti
            </a>
          </div>
        </div>
      </div>
+      </main>
    </div>
  );
}
