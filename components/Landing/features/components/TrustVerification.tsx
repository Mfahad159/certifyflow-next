import { ShieldCheck, ScanLine, Lock, Check } from 'lucide-react';

export default function TrustVerification() {
  return (
    <section id="verification" className="py-24 px-4 sm:px-6 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6">
            Verification that <span className="text-accent italic">actually </span> builds trust
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Give your people the recognition they deserve. Our easy checking system 
            makes sure everyone knows your certificates are the real deal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Instant Verification Portal */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8 relative z-10">
              <ShieldCheck size={28} className="text-lavender-600" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight mb-4">
              Instant Online Checking
            </h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-8">
              A private, beautiful page for every single certificate. Anyone can check if it's real with just one click.
            </p>
            
            {/* Visual Mockup inside card */}
            <div className="mt-auto pt-6 border-t border-white/5">
               <div className="p-6 rounded-2xl bg-zinc-950/40 border border-white/5 relative overflow-hidden flex flex-col items-center text-center backdrop-blur-md">
                  <div className="w-12 h-12 bg-accent/5 rounded-xl flex items-center justify-center mb-3 border border-accent/10">
                     <ShieldCheck size={20} className="text-accent" />
                  </div>
                  <div className="text-sm font-sans font-bold text-white">MARCUS ROLAND</div>
                  <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[12px] font-bold text-emerald-500">Verified</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Card 2 - Dynamic QR Codes */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8 relative z-10">
              <ScanLine size={28} className="text-lavender-600" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight mb-4">
              One-Scan Verification
            </h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-8">
              Every certificate gets its own unique QR code. Just scan it with any phone to see the truth instantly.
            </p>
            <div className="mt-auto">
                <div className="aspect-square w-full max-w-[160px] mx-auto bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--accent)_0%,_transparent_70%)]"></div>
                    <ScanLine size={64} className="text-zinc-600 opacity-40" />
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-accent/50 animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
            </div>
          </div>
          
          {/* Card 3 - Anti-Fraud Engine */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8 relative z-10">
              <Lock size={28} className="text-lavender-600" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight mb-4">
              Tamper-Proof Tech
            </h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-8">
              Our system makes it impossible to change anything on the certificate once it's issued. Your brand stays safe.
            </p>
            <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
                {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-purple-500/30"></div>
                        <div className="h-1 flex-1 bg-zinc-800 rounded"></div>
                        <Check size={12} className="text-zinc-600" />
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
