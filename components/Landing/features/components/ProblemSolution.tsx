import { X, Check, FileSpreadsheet, Mail, Edit3, AlertCircle, Zap, Upload, Wand2, Share2 } from 'lucide-react';

export default function ProblemSolution() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6">
            The <span className="text-accent italic">Difference </span> in Workflow
          </h2>
          <p className="text-zinc-500 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Stop juggling spreadsheets and manual emails. We've built a unified environment 
            where data becomes professional credentials in one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* The Manual Way - Chaotic Visual */}
          <div className="relative">
            <div className="p-10 rounded-[40px] bg-white/5 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 dark:border-white/5">
              <div className="w-14 h-14 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center mb-8 border border-zinc-500/20">
                <X size={28} className="text-zinc-500" strokeWidth={2.5} />
              </div>
              <div className="inline-flex items-center gap-2 text-zinc-500 text-[12px] font-bold font-sans mb-6">
                <span>The Manual Way is Broken</span>
              </div>
              <p className="text-xl md:text-2xl font-sans font-medium text-white leading-tight text-balance text-capitalize mb-4">
                Editing 100 Canva Files, Manual BCC Emails, And Fixing Name Typos Via Support Tickets Is A<span className="text-gray-600"> Nightmare</span> 
              </p>
              <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-8">
                Manual workflows are slow, error-prone, and impossible to scale as your community grows.
              </p>

              {/* Visual Mockup - Chaotic Workflow */}
              <div className="relative h-80 bg-zinc-100/10 dark:bg-zinc-950/30 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 p-4">
                  {/* Spreadsheet Window */}
                  <div className="absolute top-6 left-6 w-52 bg-white dark:bg-zinc-900 transform rotate-[-3deg]">
                    <div className="bg-zinc-800 dark:bg-zinc-700 text-white px-3 py-1.5 text-[12px] flex items-center gap-2">
                      <FileSpreadsheet size={10} />
                      <span>Names_final_v2.xlsx</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                      <div className="flex items-center gap-2 mt-2">
                        <AlertCircle size={10} className="text-zinc-500" />
                        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>

                  {/* Email Window */}
                  <div className="absolute top-8 right-8 w-48 bg-white dark:bg-zinc-900 transform rotate-[4deg]">
                    <div className="bg-zinc-800 dark:bg-zinc-700 text-white px-3 py-1.5 text-[12px] flex items-center gap-2">
                      <Mail size={10} />
                      <span>Inbox (1,240)</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3"></div>
                    </div>
                  </div>

                  {/* Support Ticket - Filling the space */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-44 bg-white dark:bg-zinc-900 transform rotate-[-2deg] z-10">
                    <div className="bg-zinc-800 dark:bg-zinc-700 text-white px-3 py-1.5 text-[12px] flex items-center gap-2">
                      <AlertCircle size={10} />
                      <span>Support #8812</span>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-zinc-500 leading-tight">"Missing certificate for John Doe..."</p>
                      <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                    </div>
                  </div>

                  {/* Design Tool Window */}
                  <div className="absolute bottom-10 left-10 w-48 bg-white dark:bg-zinc-900 transform rotate-[1deg]">
                    <div className="bg-zinc-800 dark:bg-zinc-700 text-white px-3 py-1.5 text-[12px] flex items-center gap-2">
                      <Edit3 size={10} />
                      <span>Canva-copy-final</span>
                    </div>
                    <div className="p-3">
                      <div className="h-16 bg-zinc-50 dark:bg-zinc-800 rounded flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-400 animate-spin"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-8 bg-zinc-800 dark:bg-zinc-700 text-white px-4 py-2 rounded-full text-[12px]">
                    <AlertCircle size={10} className="inline mr-1" />
                    BCC list limit reached
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The CertifyFlow Way - Clean Visual */}
          <div className="relative">
            <div className="p-10 rounded-[40px] bg-zinc-900/60 border border-white/10 dark:border-white/5 flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-lavender-200 border border-accent/20 flex items-center justify-center mb-8">
                <Check size={28} className="text-lavender-600" strokeWidth={2.5} />
              </div>
              <div className="inline-flex items-center gap-2 text-accent text-[12px] font-bold font-sans mb-6">
                <span>The CertifyFlow Way</span>
              </div>
              <p className="text-xl md:text-2xl font-sans font-medium text-balance text-capitalize text-accent leading-tight mb-4">
                One Dashboard. One Campaign. Complete Automation. From Data Upload To LinkedIn Sharing, We Handle The <span className="text-gray-600">Workflow.</span>
              </p>
              <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-8">
                Professional efficiency that lets your team focus on high-level growth instead of manual processing.
              </p>

              {/* Visual Mockup - Clean Dashboard */}
              <div className="relative h-80 overflow-hidden rounded-2xl bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md">
                <div className="absolute inset-0 p-3">
                  {/* Dashboard header */}
                  <div className="bg-accent/10 rounded-lg flex justify-between h-12 p-3 mb-3">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-medium text-accent">Campaign Dashboard</span>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[12px] font-medium text-accent">Live</span>
                      </div>
                    </div>
                  </div>

                  {/* Workflow steps */}
                  <div className="space-y-3">
                    <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Upload size={14} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded w-20 mb-1.5"></div>
                        <div className="h-1 bg-zinc-100 dark:bg-zinc-900 rounded w-32"></div>
                      </div>
                      <Check size={16} className="text-accent" strokeWidth={3} />
                    </div>

                    <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Wand2 size={14} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded w-24 mb-1.5"></div>
                        <div className="h-1 bg-zinc-100 dark:bg-zinc-900 rounded w-28"></div>
                      </div>
                      <Check size={16} className="text-accent" strokeWidth={3} />
                    </div>

                    <div className="bg-accent/10 dark:bg-accent/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <Share2 size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 bg-accent/20 rounded w-16 mb-1.5"></div>
                        <div className="h-1 bg-accent/10 rounded w-24"></div>
                      </div>
                      <Zap size={16} className="text-accent animate-pulse" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}