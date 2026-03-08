import Image from "next/image";
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';


export default function FooterCTA() {
  const navigate = useRouter();

  return (
    <section className="py-24 px-4 sm:px-6 relative z-10 overflow-hidden bg-background">
      
      <div className="max-w-7xl mx-auto">
        <div className="relative p-12 md:p-24 flex flex-col items-center text-center">
          {/* Decorative icons in background */}
          <div className="absolute top-12 left-12 opacity-5 rotate-[-15deg] pointer-events-none">
             <Image src="/assest/logo.svg" alt="" className="w-48 h-48" width={40} height={40} />
          </div>
          <div className="absolute bottom-12 right-12 opacity-5 rotate-[15deg] pointer-events-none">
             <Image src="/assest/logo.svg" alt="" className="w-48 h-48" width={40} height={40} />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto">
            
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-white mb-8 leading-[1.1] text-nowrap">
              Ready to make your <span className="text-accent italic">life easier?</span>
            </h2>
            
            <p className="text-zinc-500 font-sans text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
              Join over 2,000 teams who have stopped fighting with PDFs and started 
              running smart certificate campaigns.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate.push('/dashboard')}
                className="w-full sm:w-auto bg-accent text-accent-foreground pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600  active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Let's get started
                <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1"> 
                  <ArrowRight size={18} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
