import { Zap, Mail, Shield, BarChart3, Palette, QrCode, CheckCircle2 } from 'lucide-react';

export default function DetailedFeatures() {
  const features = [
    {
      icon: <Zap size={28} className="text-lavender-600" strokeWidth={2.5} />,
      title: 'Instant Massive Generation',
      description: 'Need a thousand certificates? No problem. Just drop in your file and we\'ll handle the rest in seconds.',
      benefits: [
        'Excel & CSV batch processing',
        'Auto-mapping of custom fields',
        'High-resolution PDF & PNG exports',
        'Live rendering preview'
      ],
      color: 'from-blue-500/20 to-lavender-500/20'
    },
    {
      icon: <Mail size={28} className="text-lavender-600" strokeWidth={2.5} />,
      title: 'Use Your Own Email',
      description: 'Connect your favorite email service and talk to your people using your own brand. It\'s totally free to send!',
      benefits: [
        'Native API integrations',
        'Custom SMTP support',
        'Unlimited free email sending',
        'Better sender reputation'
      ],
      color: 'from-lavender-500/20 to-purple-500/20'
    },
    {
      icon: <QrCode size={28} className="text-lavender-600" strokeWidth={2.5} />,
      title: 'Easy Online Checking',
      description: 'Every certificate gets its own QR code. Anyone can scan it to see it\'s real—no login or extra apps required.',
      benefits: [
        'Instant QR scanning',
        'Public verification portal',
        'Tamper-proof security',
        'Scan attempt tracking'
      ],
      color: 'from-teal-500/20 to-blue-500/20'
    },
    {
      icon: <Palette size={28} className="text-lavender-600" strokeWidth={2.5} />,
      title: 'Simple Design Tools',
      description: 'Design beautiful certificates exactly how you want them. Drag things around and pick your favorite fonts until they look perfect.',
      benefits: [
        'Custom font & color support',
        'Dynamic field placeholders',
        'Branded background uploads',
        'Squircle & modern UI shapes'
      ],
      color: 'from-orange-500/20 to-red-500/20'
    },
    {
      icon: <BarChart3 size={28} className="text-lavender-600" strokeWidth={2.5} />,
      title: 'See How You’re Doing',
      description: 'Know exactly when people open their emails and see who’s checking their certificates in real-time.',
      benefits: [
        'Email open & click tracking',
        'Verification hit maps',
        'Conversion rate insights',
        'PDF download statistics'
      ],
      color: 'from-pink-500/20 to-rose-500/20'
    },
    {
      icon: <Shield size={28} className="text-lavender-600" strokeWidth={2.5} />,
      title: 'Safe and Sound',
      description: 'We take security seriously. Your data is locked up tight and follows all the privacy rules you and your users care about.',
      benefits: [
        'End-to-end data encryption',
        'GDPR & Privacy compliance',
        'Secure file handling',
        'Role-based access control'
      ],
      color: 'from-cyan-500/20 to-blue-500/20'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-lavender-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6">
            Everything you need to <span className="text-accent italic">succeed</span>
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you're sending your first certificate or your millionth, we've got 
            the tools to help you do it better and faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-lavender-200 flex items-center justify-center mb-8 relative z-10">
                {feature.icon}
              </div>
              
              <h3 className="text-xl md:text-2xl font-sans font-bold text-white mb-4 leading-tight">
                {feature.title}
              </h3>
              
              <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-8 flex-grow">
                {feature.description}
              </p>

              <div className="space-y-3">
                {feature.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-accent/60" />
                    <span className="text-[11px] font-bold text-zinc-400">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
