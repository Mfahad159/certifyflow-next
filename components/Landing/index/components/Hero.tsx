import { useRouter } from 'next/navigation';
const BACKGROUND_IMG = "https://4kwallpapers.com/images/wallpapers/rays-violet-background-bars-3d-background-glowing-black-3840x2160-2290.jpg";
import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase';

import { Loader } from '@/components/ui/loader';

interface HeroProps {
  badgeText?: string;
  indicatorText?: string;
  title: ReactNode;
  description: string;
  primaryCTA?: {
    text: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    onClick?: () => void;
  };
  footerText?: string;
  className?: string;
  children?: ReactNode;
  hideDefaultButtons?: boolean;
  childrenAboveButtons?: boolean;
}

export default function Hero({
  badgeText = "V2.0 Live",
  indicatorText = "Trusted by 2,000+ teams just like yours",
  title,
  description,
  primaryCTA,
  secondaryCTA,
  footerText = "Trusted by 2,000+ Training Centers & HR Departments.",
  className = "",
  children,
  hideDefaultButtons = false,
  childrenAboveButtons = false
}: HeroProps) {
  const navigate = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const handleDefaultPrimaryClick = async () => {
    if (user) {
      navigate.push('/dashboard');
    } else {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <section className={`relative min-h-screen py-32 w-full flex items-center justify-center overflow-hidden bg-background ${className}`}>
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: `url(${BACKGROUND_IMG})` }}
      >
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 cinematic-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader size={100} color="#6b55fd" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* New Minimalist Indicator */}
            <div className="inline-flex items-center gap-2 mb-10 group cursor-default">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/5 backdrop-blur-2xl border border-accent/10">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[12px] font-bold text-accent">{badgeText}</span>
              </div>
              <div className="h-px w-8 bg-border" />
              <span className="text-[12px] font-bold text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">{indicatorText}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif mb-8 leading-[1.05] text-balance text-white max-w-4xl mx-auto">
              {title}
            </h1>
            
            <p className="text-base md:text-lg text-zinc-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              {description}
            </p>

            {childrenAboveButtons && children && (
              <div className="mb-12 w-full max-w-2xl mx-auto">
                {children}
              </div>
            )}
     
            {!hideDefaultButtons && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <button 
                  onClick={primaryCTA?.onClick || handleDefaultPrimaryClick}
                  className="w-full sm:w-auto bg-accent text-accent-foreground pl-6 pr-3 py-3 rounded-full font-bold text-sm hover:bg-lavender-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  {primaryCTA?.text || (user ? 'Go to your dashboard' : 'Start for free')}
                  <div className="flex items-center gap-2 bg-black rounded-full p-2 text-white transition-transform group-hover:translate-x-1"> 
                    <ArrowRight size={18} />
                  </div>
                </button>
                {secondaryCTA && (
                  <button 
                    onClick={secondaryCTA.onClick}
                    className="w-full sm:w-auto px-8 py-[21px] text-sm font-bold border border-white/10 bg-white/5 rounded-full text-foreground hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {secondaryCTA.text}
                  </button>
                )}
              </div>
            )}

            {!childrenAboveButtons && children && (
              <div className="mt-12 w-full max-w-2xl mx-auto">
                {children}
              </div>
            )}

            <p className="mt-12 text-[12px] font-bold text-muted-foreground/30">
              {footerText}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
