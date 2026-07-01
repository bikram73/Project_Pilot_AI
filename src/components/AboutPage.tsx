import React from "react";
import { motion } from "motion/react";
import { Info, Sparkles, Key, FileText, CheckCircle2, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";

interface AboutPageProps {
  onBackToHome: () => void;
}

export default function AboutPage({ onBackToHome }: AboutPageProps) {
  return (
    <div className="flex-grow p-6 md:p-12 max-w-4xl mx-auto space-y-10">
      
      {/* Intro Block */}
      <div className="space-y-4 text-center">
        <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-blue-600 dark:text-blue-400">
          <Info className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          About ProjectPilot AI
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
          ProjectPilot AI is an advanced operations companion designed to automatically translate unstructured human communications into concrete, prioritized project plans.
        </p>
      </div>

      {/* How It Works Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white dark:bg-[#191b23] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lemma SDK Configuration</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
            ProjectPilot AI securely accesses the Lemma Workflow Engine using the <strong className="font-semibold text-gray-800 dark:text-gray-200">VITE_LEMMA_POD_ID</strong> and <strong className="font-semibold text-gray-800 dark:text-gray-200">VITE_LEMMA_WORKFLOW</strong> environment variables. Configure these to run your project analysis agent.
          </p>
        </div>

        <div className="bg-white dark:bg-[#191b23] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Document Ingestion</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
            We handle three primary formats: plain text copies, standard PDF documents (processed directly using multimodal vision models), and MS Word documents (DOCX), which are parsed server-side using pure JS structures.
          </p>
        </div>
      </div>

      {/* Structured Guidelines Checklist */}
      <div className="bg-white dark:bg-[#191b23] rounded-2xl border border-gray-100 dark:border-gray-800/80 p-6 lg:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Operational Security & Sandbox Privacy
        </h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">No DB Persistence</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal mt-0.5">
                Every file parsed or text analyzed operates inside your immediate session memory. Once you close your browser or hit Refresh, the memory is cleared.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Secure Client-to-Agent Authorization</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal mt-0.5">
                All project runs are managed by the Lemma Client directly in the sandbox, authorizing your requests securely using your VITE_LEMMA_POD_ID.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Full Local Operations Control</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal mt-0.5">
                The parsed ledger isn't read-only. Add manual tasks, prioritize deliverables, mitigate threats, and cross-reference objectives in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onBackToHome}
          className="bg-[#004ac6] dark:bg-[#2563eb] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-lg"
        >
          Go Back Home
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
