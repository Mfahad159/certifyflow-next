import { useRouter } from 'next/navigation';
import { ArrowRight, Rocket, Database, Layout, ShieldCheck } from 'lucide-react';


export default function Workflow() {
  const navigate = useRouter();
  const steps = [
    {
      number: "01",
      icon: <Rocket size={24} className="text-lavender-600" />,
      title: "Define Campaign",
      description: "Set up your campaign details and certificate rules."
    },
    {
      number: "02",
      icon: <Database size={24} className="text-lavender-600" />,
      title: "Data Integration",
      description: "Securely upload your dataset and map smart fields to individual certificate design layers."
    },
    {
      number: "03",
      icon: <Layout size={24} className="text-lavender-600" />,
      title: "Studio Selection",
      description: "Choose from our high-end professional designs or create a custom look for your brand."
    },
    {
      number: "04",
      icon: <ShieldCheck size={24} className="text-lavender-600" />,
      title: "Live Tracking",
      description: "Monitor progress in real-time and handle certificate revisions or renewals with ease."
    }
  ];

  return (
    <section id="workflow" className="py-24 px-4 sm:px-6 relative z-20 overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6">
            The <span className="text-accent italic">Professional</span> Process
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Professional-grade automation that handles the complexity of 
            digital certification so you don't have to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-14 right-14 h-px bg-white/5 -z-0" />
          
          {steps.map((step, index) => (
            <div key={index} className="group relative flex flex-col items-start transition-all duration-500">
              <div className="flex justify-between items-start w-full mb-8">
                <div className="w-14 h-14 rounded-xl bg-lavender-200 border border-accent/20 flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-lg shadow-accent/5">
                  {step.icon}
                </div>
                <span className="text-4xl font-serif italic font-bold text-accent/5 transition-colors group-hover:text-accent/10 select-none">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-sans font-bold text-white mb-4 group-hover:text-accent transition-colors">{step.title}</h3>
              <p className="text-sm font-sans text-zinc-500 leading-relaxed max-w-[280px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 flex justify-center">
          <button 
            onClick={() => navigate.push('/workflow')}
            className="w-full sm:w-auto bg-accent text-accent-foreground text-sm px-4 py-2 rounded-full font-medium cursor-pointer transition-all hover:bg-lavender-600 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-accent/20 group"
          >
            Explore Full Roadmap
            <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1"> 
              <ArrowRight size={18} />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
