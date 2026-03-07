import { Mail, CheckCircle, Sparkles, Image as ImageIcon, Shield } from 'lucide-react';
import { emailTemplates, type EmailTemplate } from '@/lib/emailTemplates';



export default function EmailTemplateShowcase() {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <div className="flex-1">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-[12px] font-bold text-brand">Email Automation</span>
              </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-8 leading-tight">
              Deliver Experience, <br />
              <span className="text-brand italic">Not Just</span> a File.
            </h2>
            <p className="text-zinc-500 font-sans text-lg max-w-xl leading-relaxed mb-10">
              BulkCerts doesn't just generate PDFs. We provide a full communication suite to deliver your certificates in high-fidelity, designer-grade emails that match your brand perfectly.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Mail size={20} />, title: "Custom Templates", desc: "Choose from professional designs." },
                { icon: <ImageIcon size={20} />, title: "Brand Identity", desc: "Upload logos & set accent colors." },
                { icon: <Shield size={20} />, title: "Secure Delivery", desc: "Encrypted verification links." },
                { icon: <CheckCircle size={20} />, title: "Auto-Send", desc: "Batch delivery in one click." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl">
            <div className="relative group">
              {/* Mockup of Email Window */}
              <div className="bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-700">
                <div className="bg-zinc-800/50 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                  </div>
                  <div className="text-[12px] text-zinc-500 font-mono">New Message</div>
                  <div className="w-6" />
                </div>
                
                <div className="p-8 bg-white">
                  {/* Email Content Preview - Mini versions */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-8">
                       <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold text-[12px]">LOGO</div>
                       <div className="text-[8px] text-zinc-400 font-bold">Certificate Delivery</div>
                    </div>
                    
                    <div className="space-y-4 text-center">
                       <h3 className="font-serif text-2xl text-zinc-900 italic">Certificate Awarded</h3>
                       <p className="text-xs text-zinc-500 leading-relaxed px-12">Congratulations on your achievement! You've successfully completed the program.</p>
                       
                       <div className="aspect-[1.5/1] bg-zinc-50 rounded-2xl border border-zinc-100 p-2 relative overflow-hidden group/cert">
                          <img 
                            src="https://4kwallpapers.com/images/wallpapers/rays-violet-background-bars-3d-background-glowing-black-3840x2160-2290.jpg" 
                            className="w-full h-full object-cover rounded-lg mix-blend-multiply opacity-20"
                            alt="Certificate"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <div className="w-20 h-0.5 bg-zinc-400/20 mb-2" />
                             <div className="text-[12px] font-serif italic text-zinc-800">Your Name Here</div>
                             <div className="w-20 h-0.5 bg-zinc-400/20 mt-2" />
                          </div>
                       </div>
                       
                       <div className="pt-4">
                         <div className="inline-block px-6 py-2.5 rounded-full bg-[#6b55fd] text-white text-[12px] font-bold">Verify Authenticity</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Template cards */}
              <div className="absolute -left-12 bottom-12 p-6 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl space-y-4 max-w-[200px] hidden md:block animate-bounce-slow">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center text-brand"><Sparkles size={14} /></div>
                   <div className="text-[12px] font-bold text-white">Presets</div>
                 </div>
                 <div className="space-y-2">
                    <div className="h-6 rounded bg-white/5 border border-white/10 flex items-center px-2 text-[8px] text-zinc-500">Professional Minimal</div>
                    <div className="h-6 rounded bg-brand/20 border border-brand/50 flex items-center px-2 text-[8px] text-brand font-bold">Modern Professional</div>
                    <div className="h-6 rounded bg-white/5 border border-white/10 flex items-center px-2 text-[8px] text-zinc-500">Academic Standard</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {emailTemplates.map((template: EmailTemplate) => (
            <div key={template.id} className="group relative p-1 rounded-[40px] bg-white/5 border border-white/10 hover:border-brand/40 transition-all duration-500 overflow-hidden">
              <div className="p-8 bg-zinc-900/40 rounded-[38px] flex flex-col sm:flex-row gap-8 items-center">
                 <div className="w-full sm:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden bg-white">
                    <img src={template.previewImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={template.name} />
                 </div>
                 <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-sans font-bold text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed mb-6">{template.description}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                       <span className="text-[12px] font-black text-zinc-600">Theme: Corporate</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                       <span className="text-[12px] font-black text-zinc-600">Reactive Rendering</span>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
