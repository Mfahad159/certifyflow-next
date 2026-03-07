import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Rocket, Gem, Building2, Check, X, ArrowRight, ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const proPricing = {
  1000: { price: 19, emails: 1000 },
  5000: { price: 49, emails: 5000 },
  10000: { price: 89, emails: 10000 },
  25000: { price: 199, emails: 25000 },
  50000: { price: 349, emails: 50000 }
};

export default function Pricing() {
  const navigate = useRouter();
  const [selectedProVolume, setSelectedProVolume] = useState(1000);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 relative z-10 overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6">
            Simple <span className="text-accent italic">Pricing</span> for Everyone
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your project. No confusing fees—just straightforward 
            options that grow when you do.
          </p>
                   <div className="mt-20 flex justify-center">
          <button 
            onClick={() => navigate.push('/features')}
            className="w-full sm:w-auto bg-accent text-accent-foreground pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            Explore Benefits
            <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1"> 
              <ArrowRight size={18} />
            </div>
          </button>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col group hover:border-accent/20 transition-all duration-500">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 border border-accent/20 flex items-center justify-center mb-8">
              <Rocket size={28} className="text-lavender-600" strokeWidth={2.5} />
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-sans font-bold text-white mb-2">Getting Started</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Perfect for small groups or trying us out</p>
            </div>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-serif font-bold text-white">$0</span>
              <span className="text-zinc-600 font-bold text-sm">/forever</span>
            </div>
            
            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="1 Active Campaign" />
              <FeatureItem text="Design anything you want" />
              <FeatureItem text="Use your own email service" />
              <FeatureItem text="Send up to 500 emails monthly" />
              <FeatureItem text="Simple To-Do list" />
              <FeatureItem text="5 Email templates" />
              <FeatureItem text="Download as PNG" />
              <FeatureItem disabled text="QR Code Verification" />
              <FeatureItem disabled text="PDF Export & Hard Copies" />
              <FeatureItem disabled text="Custom Templates" />
            </div>

            <button 
              onClick={() => navigate.push('/dashboard')}
              className="w-full bg-white/5 text-white border border-white/10 px-8 py-[21px] rounded-full font-bold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              Get Started Free
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
          </div>

          {/* Pro Plan */}
          <div className="p-10 rounded-[40px] bg-zinc-900/60 border border-accent/30 flex flex-col relative scale-[1.05] z-10 shadow-2xl shadow-accent/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[12px] font-black px-4 py-1.5 rounded-full">
              RECOMMENDED
            </div>
            <div className="w-14 h-14 rounded-xl bg-lavender-200 border border-accent/20 flex items-center justify-center mb-8">
              <Gem size={28} className="text-lavender-600" strokeWidth={2.5} />
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-sans font-bold text-white mb-2">Growing Big</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">For teams and businesses sending a lot</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-serif font-bold text-white">
                  ${proPricing[selectedProVolume as keyof typeof proPricing].price}
                </span>
                <span className="text-zinc-600 font-bold text-sm">/month</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-accent block">Select Capacity</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-accent/50 transition-colors cursor-pointer group/trigger">
                      <span>{selectedProVolume.toLocaleString()} Certificates</span>
                      <ChevronDown size={14} className="text-zinc-500 group-hover/trigger:text-accent transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] bg-zinc-900 border-white/10">
                    {Object.keys(proPricing).map((volume) => (
                      <DropdownMenuItem 
                        key={volume}
                        onClick={() => setSelectedProVolume(Number(volume))}
                        className="text-white focus:bg-accent focus:text-white cursor-pointer"
                      >
                        {Number(volume).toLocaleString()} Certificates
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="Up to 10 Campaigns at once" />
              <FeatureItem text={`${proPricing[selectedProVolume as keyof typeof proPricing].emails.toLocaleString()} Direct Emails`} />
              <FeatureItem text="Design your own templates" />
              <FeatureItem text="Your own brand and logos" />
              <FeatureItem text="Detailed results and stats" />
              <FeatureItem text="QR codes for everyone" />
              <FeatureItem text="Direct verification system" />
              <FeatureItem text="Ready for PDF & printing" />
              <FeatureItem text="Help from our team" />
            </div>

             <button 
                        onClick={() => navigate.push('/features')}
                        className="w-fit bg-accent text-accent-foreground pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center gap-3 group"
                      >
                        Scale With Pro
                        <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1"> 
                          <ArrowRight size={18} />
                        </div>
                      </button>
          </div>

          {/* Enterprise Plan */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col group hover:border-accent/20 transition-all duration-500">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 border border-accent/20 flex items-center justify-center mb-8">
              <Building2 size={28} className="text-lavender-600" strokeWidth={2.5} />
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-sans font-bold text-white mb-2">Custom Fit</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Everything a large organization needs</p>
            </div>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight text-nowrap">Let's Talk</span>
            </div>
            
            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="As many campaigns as you want" />
              <FeatureItem text="Customized email looks" />
              <FeatureItem text="We help you with designs" />
              <FeatureItem text="Your own verification portal" />
              <FeatureItem text="Whatever else you need" />
            </div>

            <button 
              onClick={() => window.location.href = 'mailto:sales@bulkcerts.com'}
              className="w-full bg-white/5 text-white border border-white/10 px-8 py-[21px] rounded-full font-bold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              Contact Solutions
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text, disabled }: { text: string; disabled?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${disabled ? 'opacity-30' : ''}`}>
      {disabled ? (
        <X size={16} className="text-zinc-600 mt-1 flex-shrink-0" strokeWidth={3} />
      ) : (
        <Check size={16} className="text-accent mt-1 flex-shrink-0" strokeWidth={3} />
      )}
      <span className={`text-sm font-sans leading-tight ${disabled ? 'text-zinc-600 line-through underline-offset-4 decoration-2' : 'text-zinc-300'}`}>
        {text}
      </span>
    </div>
  );
}


