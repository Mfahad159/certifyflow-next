import { Check, X, AlertCircle } from 'lucide-react';

export default function CompetitorComparison() {
  const features = [
    { name: 'Free Forever Plan', us: true, comp1: false, comp2: false },
    { name: 'Bring Your Own Email (BYOE)', us: true, comp1: false, comp2: false },
    { name: 'Unlimited Email Sending', us: true, comp1: false, comp2: false },
    { name: 'Pay Only for Generation', us: true, comp1: false, comp2: false },
    { name: 'QR Code Verification', us: true, comp1: true, comp2: true },
    { name: 'Custom Templates & Editor', us: true, comp1: true, comp2: true },
    { name: 'Email Automation', us: true, comp1: true, comp2: true },
    { name: 'Real-time Analytics', us: true, comp1: true, comp2: false },
    { name: 'API Access (Pro Plan)', us: true, comp1: true, comp2: false },
    { name: 'White Label Option', us: true, comp1: false, comp2: true },
    { name: 'Dedicated Account Manager', us: true, comp1: false, comp2: false },
    { name: 'Custom Domain', us: true, comp1: false, comp2: true },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-white mb-6">
            Why Choose <span className="text-accent italic">BulkCerts?</span>
          </h2>
          <p className="text-zinc-500 font-sans text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We've redesigned the economics of certification. Compare our features and 
            see how we provide more utility at a fraction of the cost.
          </p>
        </div>

        {/* Feature Comparison Card */}
        <div className="p-1 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-8 px-8 font-sans text-xs font-bold text-zinc-500">Platform Capability</th>
                  <th className="text-center py-8 px-8">
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-white mb-1">BulkCerts</span>
                      <span className="text-[12px] text-accent font-black px-2 py-0.5 bg-accent/10 rounded">Better</span>
                    </div>
                  </th>
                  <th className="text-center py-8 px-8 font-sans text-sm font-bold text-zinc-400">Mainstream Alternative</th>
                  <th className="text-center py-8 px-8 font-sans text-sm font-medium text-zinc-500">Traditional Agency</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0"
                  >
                    <td className="py-5 px-8 text-sm font-medium text-zinc-300">
                      {feature.name}
                    </td>
                    <td className="py-5 px-8 text-center">
                      {feature.us ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent">
                          <Check size={18} strokeWidth={3} />
                        </div>
                      ) : (
                        <X className="inline-block text-white/5" size={18} strokeWidth={2} />
                      )}
                    </td>
                    <td className="py-5 px-8 text-center">
                      {feature.comp1 ? (
                        <Check className="inline-block text-zinc-600" size={18} strokeWidth={2} />
                      ) : (
                        <X className="inline-block text-zinc-800" size={18} strokeWidth={2} />
                      )}
                    </td>
                    <td className="py-5 px-8 text-center">
                      {feature.comp2 ? (
                        <Check className="inline-block text-zinc-600" size={18} strokeWidth={2} />
                      ) : (
                        <X className="inline-block text-zinc-800" size={18} strokeWidth={2} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <AlertCircle size={14} className="text-zinc-600" />
          <p className="text-[12px] text-zinc-600 font-bold">
            Analysis based on public pricing as of Feb 2026. Features may vary by provider.
          </p>
        </div>
      </div>
    </section>
  );
}
