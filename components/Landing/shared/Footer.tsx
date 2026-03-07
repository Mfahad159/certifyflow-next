import { useRouter } from 'next/navigation';


export default function Footer() {
  const navigate = useRouter();

  return (
    <footer className="py-16 px-4 sm:px-6 relative z-20 overflow-hidden bg-background">
      {/* Large Gradient Text Background */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden pb-4">
        <h1 className="text-[6rem] sm:text-[10rem] md:text-[15rem] lg:text-[20rem] font-black bg-gradient-to-b from-white/5 to-transparent bg-clip-text text-transparent select-none whitespace-nowrap leading-none">
          CERTIFYFLOW
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-12">
          {/* Logo Section */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-2 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <img
                  src="/assest/logo.svg"
                  alt="CertifyFlow"
                  className="h-10 w-10 relative z-10 filter invert dark:invert-0"
                />
              </div>
              <h2 className="text-xl font-serif font-black tracking-tight text-white">CertifyFlow</h2>
            </div>
            <p className="text-zinc-500 text-xs font-medium max-w-xs leading-relaxed">
              pov: you're tired of certification portals being mid 🗿 (we gotchu fam) 💯
            </p>
          </div>

          {/* Essential Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h4 className="font-bold mb-4 text-[12px] text-zinc-600">Product</h4>
              <ul className="space-y-3 text-xs text-zinc-400 font-medium">
                <li onClick={() => navigate.push('/features')} className="hover:text-accent transition-colors cursor-pointer text-nowrap">Features</li>
                <li onClick={() => navigate.push('/templates')} className="hover:text-accent transition-colors cursor-pointer text-nowrap">Templates</li>
                <li onClick={() => navigate.push('/pricing')} className="hover:text-accent transition-colors cursor-pointer text-nowrap">Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[12px] text-zinc-600">Company</h4>
              <ul className="space-y-3 text-xs text-zinc-400 font-medium">
                <li className="hover:text-accent transition-colors cursor-pointer text-nowrap">About</li>
                <li className="hover:text-accent transition-colors cursor-pointer text-nowrap">Contact</li>
                <li className="hover:text-accent transition-colors cursor-pointer text-nowrap">Privacy</li>
              </ul>
            </div>
            <div className="hidden sm:block">
              <h4 className="font-bold mb-4 text-[12px] text-zinc-600">Resources</h4>
              <ul className="space-y-3 text-xs text-zinc-400 font-medium">
                <li className="hover:text-accent transition-colors cursor-pointer text-nowrap">Help Center</li>
                <li className="hover:text-accent transition-colors cursor-pointer text-nowrap">API Docs</li>
                <li className="hover:text-accent transition-colors cursor-pointer text-nowrap">Status</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section Only */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-white/5 w-full gap-4">
          <div className="text-center sm:text-left">
            <p className="text-zinc-600 text-[12px] font-medium">
              © 2024 CertifyFlow — Built for the winners.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-zinc-700 text-[12px]">
              coded with ☕ & 🎧 by <a href="https://github.com/theajmalrazaq" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-accent transition-colors">ajmal</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
