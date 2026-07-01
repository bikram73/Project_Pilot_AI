import React from "react";
import { motion } from "motion/react";
import {
  FileSearch,
  CheckSquare,
  AlertTriangle,
  FileText,
  Sparkles,
  BarChart2,
  ArrowRight,
  Play,
} from "lucide-react";

interface LandingPageProps {
  onStartAnalysis: () => void;
  onWatchDemo: () => void;
}

export default function LandingPage({ onStartAnalysis, onWatchDemo }: LandingPageProps) {
  const features = [
    {
      title: "AI Document Analysis",
      description: "Deep semantic parsing of PDFs, Word docs, and meeting transcripts to understand complex project context.",
      icon: <FileSearch className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Task Extraction",
      description: "Automatically identify action items and owners from unstructured text with high accuracy.",
      icon: <CheckSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Risk Detection",
      description: "Proactively flag potential bottlenecks, resource blockers, and missed deadlines before they derail your team.",
      icon: <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />,
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Project Summary",
      description: "Get concise, high-level executive summaries that capture the essence of every sprint planning or retrospective.",
      icon: <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Action Recommendations",
      description: "AI-suggested next steps based on urgency, dependencies, and identified blocker conditions.",
      icon: <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      title: "Analytics Dashboard",
      description: "Real-time visualization of task loads, priority distribution, risk levels, and project health indicators.",
      icon: <BarChart2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />,
      bg: "bg-slate-50 dark:bg-slate-900/20",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden py-20 lg:py-28 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Powered by Lemma Workflows
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Turn Meeting Notes into Actionable Project Plans with AI
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
              Upload meeting transcripts, project specifications, or sprint planning notes. ProjectPilot AI instantly translates unstructured conversations into comprehensive tasks, risks, and next steps.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onStartAnalysis}
                className="bg-[#004ac6] dark:bg-[#2563eb] text-white font-medium px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-200 active:scale-95 flex items-center gap-2 group cursor-pointer"
              >
                Analyze Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onWatchDemo}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium px-6 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all flex items-center gap-2 group cursor-pointer"
              >
                Watch Demo Action
                <Play className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group flex justify-center"
          >
            <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition-all duration-700"></div>
            <div className="relative glass-card p-4 rounded-2xl shadow-2xl overflow-hidden border border-white/50 dark:border-gray-800 max-w-lg">
              <img
                className="w-full h-auto rounded-xl object-cover shadow-inner hover:scale-[1.01] transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWVisWxlPZg9FwQpCwcKRYHBKrQfWhdZ2mbic9tAuXwNjDOMEQTAn99lQNqjo9pvTJWuJK-u8iy5eTt-fCQt9nrPyebuzA-YPuajrBakSQpGby70GMifwoEAreF3xDKMYSNuYv16zVU8AASQdvrloirYbpTk3QU6dUYC3TGJ1Wrp891QH1znswsYOqY5o5y7umIPGWtsnmmXkm-6nSKtUUn3cwTix3PuHMapa99gEpF0Gslj1HY__FZS8xty4J8WQgppA0PcQf0xsp"
                alt="ProjectPilot AI Document Scan Concept Illustration"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Features Section */}
      <section className="py-24 bg-white dark:bg-[#12131a] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              AI-Powered Project Intelligence
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Eliminate manual operational administrative data-entry. ProjectPilot AI automates the transition from unstructured conversation to concrete execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-2xl border border-gray-100 dark:border-gray-800/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-5 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed How It Works Section */}
      <section className="py-20 bg-gray-50/50 dark:bg-[#161720] border-t border-b border-gray-100 dark:border-gray-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#004ac6] dark:text-[#2563eb]">
              The Operational Pipeline
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              How ProjectPilot AI Streamlines Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Upload raw text or files, and watch our dual-engine extraction system design an interactive, filterable project management room in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800/60 p-6.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="text-4xl font-black text-blue-200 dark:text-blue-900/40">01</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unstructured Input</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Provide meeting notes, raw chat recordings, transcripts, or PDF project briefs directly. There is no pre-formatting required.
                </p>
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-6 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                Supports .txt, .pdf, and raw text
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/60 p-6.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="text-4xl font-black text-purple-200 dark:text-purple-900/40">02</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Workflow-Driven Analysis</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  The application is fully integrated with a custom **Lemma Workflow Run** as its primary engine. In case of browser connectivity limits, an optional emergency backup fallback processes requests.
                </p>
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-6 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                Lemma Flow (With Emergency Fallback)
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/60 p-6.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="text-4xl font-black text-emerald-200 dark:text-emerald-900/40">03</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Structured Board</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Raw data transitions into structured deliverables, deadlines, confidence indices, priority matrices, and comprehensive owner assignments ready for tracking.
                </p>
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-6 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                Filterable Gantt & Kanban Views
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/60 p-6.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="text-4xl font-black text-amber-200 dark:text-amber-900/40">04</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Interactive Copilot</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Ask the sidebar chat assistant anything about your project. Modify lists in real-time, dismiss risks, and apply suggested improvements to optimize tasks instantly.
                </p>
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-6 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                Live Sidebar Chat & Command Controls
              </div>
            </div>
          </div>

          {/* Architecture Card */}
          <div className="mt-12 bg-white dark:bg-[#1c1d29] border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Resilience Engineering & Fallback Processing
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                ProjectPilot is designed with high availability in mind for hackathon and preview environments. Since browser-based SDKs can occasionally experience CORS limitations or credential blocks, our platform includes a resilient fallback architecture. If needed, it routes requests gracefully through a best-effort fallback system to keep you moving forward!
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/30">
                Resilience Engine V1.1
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gray-50 dark:bg-[#191b23] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-900 dark:bg-[#0c0d12] rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl border border-gray-800">
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-[120px]"></div>
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Ready to pilot your next project?
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Join startups, founders, and agile development groups automating their project operations with instant AI distillation.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onStartAnalysis}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-semibold px-8 py-4 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Start Analysis
                </button>
                <button
                  onClick={onWatchDemo}
                  className="bg-white/10 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-md hover:bg-white/20 transition-all border border-white/20 cursor-pointer"
                >
                  Try Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
