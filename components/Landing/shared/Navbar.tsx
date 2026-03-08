import Image from "next/image";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { supabase, signInWithGoogle, signOut } from '@/lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const navigate = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force dark mode for landing page
    document.documentElement.classList.add('dark');

    // Supabase Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-8 px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto relative flex items-center justify-between gap-4">

        {/* Left - Logo */}
        <div
          className="pointer-events-auto flex items-center gap-3 bg-secondary/50 dark:bg-background/10 backdrop-blur-2xl px-3 py-2.5 rounded-[32px] border border-border cursor-pointer transition-all hover:bg-background/20"
          onClick={() => navigate.push('/')}
        >
          <Image src="/assest/logo.svg" alt="logo" className="h-7 w-7" width={40} height={40} />
          <span className="text-xl font-serif font-bold text-foreground">CertifyFlow</span>
        </div>

        {/* Center - Navigation Links Pill (Absolutely Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[32px] bg-secondary/50 dark:bg-background/10 backdrop-blur-2xl border border-border pointer-events-auto">
            <button
              onClick={() => navigate.push('/')}
              className={`text-[12px] font-bold transition-all px-3 py-2 rounded-full cursor-pointer ${pathname === '/'
                ? 'text-white bg-accent'
                : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-foreground/5'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate.push('/features')}
              className={`text-[12px] font-bold transition-all px-3 py-2 rounded-full cursor-pointer ${pathname === '/features'
                ? 'text-white bg-accent'
                : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-foreground/5'
                }`}
            >
              Features
            </button>
            <button
              onClick={() => navigate.push('/templates')}
              className={`text-[12px] font-bold transition-all px-3 py-2 rounded-full cursor-pointer ${pathname === '/templates'
                ? 'text-white bg-accent'
                : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-foreground/5'
                }`}
            >
              Templates
            </button>
            <button
              onClick={() => navigate.push('/pricing')}
              className={`text-[12px] font-bold transition-all px-3 py-2 rounded-full cursor-pointer ${pathname === '/pricing'
                ? 'text-white bg-accent'
                : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-foreground/5'
                }`}
            >
              Pricing
            </button>
            <button
              onClick={() => navigate.push('/verify')}
              className={`text-[12px] font-bold transition-all px-3 py-2 rounded-full cursor-pointer ${pathname.startsWith('/verify')
                ? 'text-white bg-accent'
                : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-foreground/5'
                }`}
            >
              Verify
            </button>
          </div>
        </div>

        {/* Right - Profile & Actions */}
        <div className="pointer-events-auto flex items-center gap-2 bg-secondary/50 dark:bg-background/10 backdrop-blur-2xl px-4 py-2.5 rounded-full border border-border">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border hover:bg-foreground/10 transition-all cursor-pointer"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-5 h-5 rounded-full border border-border" />
                  ) : (
                    <div className="w-5 h-5 rounded-[6px] bg-lavender-200 border border-accent/20 flex items-center justify-center">
                      <User size={12} className="text-lavender-600" />
                    </div>
                  )}
                  <span className="text-[12px] font-bold text-foreground hidden sm:block truncate max-w-20">
                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-background border border-border py-2 px-2 rounded-[20px] overflow-hidden z-[100] backdrop-blur-3xl bg-background/95 animate-in fade-in slide-in-from-top-2 duration-200 shadow-none">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-bold text-foreground truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-[12px] text-muted-foreground truncate mt-0.5 font-medium">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          navigate.push('/dashboard/profile');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full rounded-xl px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-lavender-200 border border-accent/20 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-accent/20">
                          <User size={18} className="text-lavender-600 group-hover:text-accent transition-all" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">Profile</p>
                          <p className="text-[12px] text-muted-foreground font-medium">View and edit your profile</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          navigate.push('/dashboard/settings');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full rounded-xl px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-lavender-200 border border-accent/20 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-accent/20">
                          <Settings size={18} className="text-lavender-600 group-hover:text-accent transition-all" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">Settings</p>
                          <p className="text-[12px] text-muted-foreground font-medium">Manage your preferences</p>
                        </div>
                      </button>
                    </div>

                    <div className="h-px bg-border mx-2" />

                    {/* Logout */}
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-destructive/10 transition-colors flex items-start gap-3 group rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                          <LogOut size={18} className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-destructive">Logout</p>
                          <p className="text-[12px] text-muted-foreground font-medium">Sign out of your account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate.push('/dashboard')}
                className="bg-accent text-white px-6 py-2.5 rounded-full text-[12px] font-bold hover:bg-lavender-600 transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                Dashboard
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogin}
                className="text-[12px] font-bold text-muted-foreground hover:text-foreground dark:hover:text-white px-4 py-2 transition-all cursor-pointer rounded-full hover:bg-foreground/5"
              >
                Log In
              </button>
              <button
                onClick={handleLogin}
                className="bg-accent text-white px-6 py-2.5 rounded-full text-[12px] font-bold hover:bg-lavender-600 transition-all duration-300 active:scale-95 cursor-pointer shadow-xl shadow-accent/10"
              >
                Start Free Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
