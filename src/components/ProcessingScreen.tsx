import React from "react";
import { motion } from "motion/react";
import {
  FileText,
  Layers,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  Layout,
  Brain,
  Bolt,
  CheckCircle2,
} from "lucide-react";

interface ProcessingScreenProps {
  progress: number;
}

export default function ProcessingScreen({ progress }: ProcessingScreenProps) {
  const steps = [
    { id: 1, text: "Creating Workflow", icon: <Layers className="w-5 h-5" />, activeRange: [0, 20] },
    { id: 2, text: "Submitting Notes", icon: <FileText className="w-5 h-5" />, activeRange: [21, 40] },
    { id: 3, text: "Running Agent", icon: <Brain className="w-5 h-5" />, activeRange: [41, 70] },
    { id: 4, text: "Saving Results", icon: <CheckSquare className="w-5 h-5" />, activeRange: [71, 90] },
    { id: 5, text: "Loading Dashboard", icon: <Layout className="w-5 h-5" />, activeRange: [91, 100] },
  ];

  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full px-6 py-12 relative overflow-hidden transition-all duration-500">
      {/* Atmosphere Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Animated Mind Illustration */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            {/* Spinning Outer Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-blue-500/20 dark:border-blue-400/20 rounded-full"
            ></motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute inset-4 border border-dashed border-purple-500/30 dark:border-purple-400/30 rounded-full"
            ></motion.div>

            {/* Glowing Center Node */}
            <div className="w-24 h-24 bg-white dark:bg-[#191b23] rounded-full shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center float-slow">
              <Brain className="w-12 h-12 text-[#004ac6] dark:text-[#b4c5ff] pulse-slow" />
            </div>

            {/* Sparks */}
            <Sparkles className="absolute top-2 right-2 text-amber-500 dark:text-amber-400 animate-bounce" />
            <Bolt className="absolute bottom-4 left-0 text-purple-500 dark:text-purple-400 animate-pulse" />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Running Lemma Workflow
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-md text-center leading-relaxed">
            The project analysis agent is orchestrating your tasks, objectives, and mitigation recommendations inside Lemma.
          </p>
        </div>

        {/* Step Bento Grid Checklist */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-10">
          {steps.map((step) => {
            const isCompleted = progress > step.activeRange[1];
            const isActive = progress >= step.activeRange[0] && progress <= step.activeRange[1];
            const isPending = progress < step.activeRange[0];

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 text-center ${
                  isCompleted
                    ? "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 opacity-100"
                    : isActive
                    ? "bg-white dark:bg-[#1d202e] border-[#004ac6] dark:border-[#b4c5ff] shadow-md scale-[1.02] opacity-100"
                    : "bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800/40 opacity-40 scale-95"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border transition-colors ${
                    isCompleted
                      ? "bg-blue-100/50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-[#004ac6] dark:text-[#b4c5ff]"
                      : isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border-[#004ac6] dark:border-[#b4c5ff] text-[#004ac6] dark:text-[#b4c5ff]"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {step.text}
                </span>

                <div className="mt-3 flex items-center gap-1">
                  {isCompleted ? (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Done
                    </span>
                  ) : isActive ? (
                    <span className="text-[10px] text-[#004ac6] dark:text-[#b4c5ff] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#004ac6] dark:bg-[#b4c5ff] rounded-full animate-ping"></span>
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-gray-600 italic">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-2xl bg-white dark:bg-[#191b23] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#004ac6] dark:text-[#b4c5ff] tracking-tight">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {progress}%
            </span>
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </motion.div>
          </div>
        </div>

        {/* Preparing Workspace Hint */}
        <div className="mt-12 flex flex-col items-center opacity-45">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Preparing workspace
          </p>
          <div className="w-64 h-24 bg-gray-100 dark:bg-gray-800/40 rounded-t-xl border-x border-t border-gray-200 dark:border-gray-800/60 p-3 flex gap-2 overflow-hidden translate-y-3">
            <div className="w-12 h-full bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              <div className="flex gap-2 flex-1">
                <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
