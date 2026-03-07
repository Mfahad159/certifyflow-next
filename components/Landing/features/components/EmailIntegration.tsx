import { Mail, Shield, Zap, DollarSign } from 'lucide-react';

export default function EmailIntegration() {
  const providers = [
    { name: 'Resend', logo: '📧', popular: true },
    { name: 'SendGrid', logo: '📨', popular: false },
    { name: 'AWS SES', logo: '☁️', popular: false },
    { name: 'Mailgun', logo: '🔫', popular: false },
    { name: 'Postmark', logo: '📮', popular: false },
    { name: 'SMTP', logo: '⚙️', popular: false },
  ];

  const benefits = [
    {
      icon: <DollarSign className="text-lavender-600" size={24} strokeWidth={2.5} />,
      title: 'Zero Platform Tax',
      description: 'We charge only for certificate generation. Pay your email provider directly for sending and save thousands.'
    },
    {
      icon: <Shield className="text-lavender-600" size={24} strokeWidth={2.5} />,
      title: 'Branded Deliverability',
      description: 'Send from your own verified domain. Build your own sender reputation and ensure maximum inbox reach.'
    },
    {
      icon: <Zap className="text-lavender-600" size={24} strokeWidth={2.5} />,
      title: 'Unlimited Free Sends',
      description: 'No email limits from our side. Leverage free tiers from providers like Resend to send thousands for free.'
    },
    {
      icon: <Mail className="text-lavender-600" size={24} strokeWidth={2.5} />,
      title: 'Infrastructure Control',
      description: 'Full control over your email stack. Use your existing credits, logs, and security configurations.'
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-white mb-6">
            Own Your <span className="text-accent italic">Infrastructure</span>
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Stop paying a premium for emails. Connect your own provider and 
            send unlimited certificates with total domain authority.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-24">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-accent/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-lavender-200 flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Integration Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h3 className="text-3xl font-serif text-white">Seamless Connectivity</h3>
            <p className="text-zinc-500 font-sans leading-relaxed">
              We've built native integrations for the world's most reliable email 
              delivery services. Configuration takes less than 2 minutes.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {providers.map((provider, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-2xl border flex items-center gap-4 transition-all hover:border-accent/50 ${
                    provider.popular 
                      ? 'bg-accent/5 border-accent/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className="text-2xl">{provider.logo}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{provider.name}</div>
                    {provider.popular && <span className="text-[12px] text-accent font-black">Native</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <div className="text-[12px] font-bold text-accent px-3 py-1 bg-accent/10 rounded-full">Pricing Reference</div>
             </div>
             
             <h4 className="text-xl font-bold text-white mb-8">Provider Free Tiers</h4>
             <div className="space-y-6">
                <ProviderPriceItem 
                  name="Resend" 
                  free="3,000 emails / month" 
                  next="$20 for 50k" 
                />
                <ProviderPriceItem 
                  name="AWS SES" 
                  free="62,000 emails / month" 
                  next="$0.10 / 1k" 
                />
                <ProviderPriceItem 
                  name="SendGrid" 
                  free="100 emails / day" 
                  next="$15 for 40k" 
                />
             </div>
             
             <div className="mt-10 p-6 rounded-2xl bg-accent/5 border border-accent/20">
                <p className="text-xs text-zinc-400 italic leading-relaxed">
                  "By allowing you to connect your own provider, we enable you to scale to hundreds of thousands of certificates without the typical SaaS markup on email delivery."
                </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProviderPriceItem({ name, free, next }: { name: string; free: string; next: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent" />
        <span className="text-sm font-bold text-white">{name}</span>
      </div>
      <div className="text-right">
        <div className="text-xs text-accent font-bold">{free} free</div>
        <div className="text-[12px] text-zinc-600 mt-1 font-medium">{next}</div>
      </div>
    </div>
  );
}
