import { useRouter } from 'next/navigation';
import { Zap, LayoutGrid, TrendingUp, Clock, BookOpen, ArrowRight } from 'lucide-react';


export default function CoreFeatures() {
  const navigate = useRouter();
  return (
    <section className="py-24 px-4 sm:px-6 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6">
           <span className='text-accent italic'>Features </span> That Actually Matter
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Say goodbye to the clunky interface. BulkCerts brings premium
            features that make managing your certificates a breeze.
          </p>
           {/* View All Features CTA */}
        <div className="mt-20 flex justify-center">
          <button 
            onClick={() => navigate.push('/features')}
            className="w-full sm:w-auto bg-accent text-accent-foreground pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            Explore All Features
            <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1"> 
              <ArrowRight size={18} />
            </div>
          </button>
        </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* AI Assistant - Large Feature (2x2) */}
          <div className="md:col-span-2 md:row-span-2 p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8 relative z-10">
              <Zap size={28} className="text-lavender-600" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight text-balance mb-4">
              Bulk Certificate Generation
            </h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-6">
              Generate thousands of personalized certificates in seconds. Upload your data via Excel or CSV, customize your template, and let our powerful engine do the heavy lifting. Auto-map columns, preview results, and export in multiple formats.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="text-[12px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400 font-bold">
                Excel Support
              </span>
              <span className="text-[12px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400 font-bold">
                CSV Import
              </span>
              <span className="text-[12px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400 font-bold">
                PDF Export
              </span>
              <span className="text-[12px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400 font-bold">
                Live Preview
              </span>
            </div>
          </div>

          {/* Feature 1 - Modern Dashboard */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8">
              <LayoutGrid size={28} className="text-lavender-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight text-balance mb-4">Modern Dashboard</h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed">
              Stunning glassmorphic UI with smooth animations, dark mode, and a
              layout that doesn't make your eyes bleed.
            </p>
          </div>

          {/* Feature 2 - Smart Analytics */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8">
              <TrendingUp size={28} className="text-lavender-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight text-balance mb-4">Smart Analytics</h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed">
              Track certificate generation, email delivery rates, and recipient engagement with interactive charts and insights.
            </p>
          </div>

          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8">
              <Clock size={28} className="text-lavender-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight text-balance mb-4">
              Real-Time Tracking
            </h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed">
              Monitor certificate status with color-coded indicators and never
              miss an important deadline again.
            </p>
          </div>

          {/* Feature 3 - Template Library */}
          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5">
            <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8">
              <BookOpen size={28} className="text-lavender-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl md:text-2xl font-sans font-bold text-white leading-tight text-balance mb-4">Template Library</h3>
            <p className="text-sm font-sans text-zinc-500 leading-relaxed">
              Choose from professionally designed templates or create your own custom certificates with our intuitive drag-and-drop editor.
            </p>
          </div>
        </div>

       
      </div>
    </section>
  );
}
