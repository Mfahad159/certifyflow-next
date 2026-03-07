import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
       question: "Can I use my own fonts and logos?",
       answer: "Yes, our builder is fully customizable. You can upload your brand assets and fonts to match your corporate identity with our high-end design studio."
    },
    {
       question: "What happens when a certificate expires?",
       answer: "The public verification link will show an 'Expired' status, and you can trigger a renewal email automatically through your simple dashboard."
    },
    {
       question: "Can I send certificates in different languages?",
       answer: "Absolutely, our templates support UTF-8 characters so you can issue credentials in any language globally."
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 relative z-10 overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-white mb-6">
            Curated <span className="text-accent italic">Knowledge </span> Base
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about scaling your certification program with precision and security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, index }: { question: string, answer: string, index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div className={`group rounded-[32px] transition-all duration-500 border ${isOpen ? 'bg-zinc-900/60 border-accent/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-zinc-400 group-hover:text-white'}`}>
            <HelpCircle size={20} />
          </div>
          <span className={`text-lg font-sans font-bold transition-colors ${isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
            {question}
          </span>
        </div>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-accent rotate-180 bg-accent text-accent-foreground' : 'border-white/10 text-zinc-500'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <div className={`
        overflow-hidden transition-all duration-500 ease-in-out
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-8 pb-8 pl-22">
          <p className="text-zinc-500 text-sm leading-relaxed font-sans border-t border-white/5 pt-6">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
