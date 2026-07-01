import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AnalysisWorkspace from "./components/AnalysisWorkspace";
import ProcessingScreen from "./components/ProcessingScreen";
import Dashboard from "./components/Dashboard";
import AboutPage from "./components/AboutPage";
import { sampleProject } from "./sampleData";
import { ProjectData } from "./types";
import { AlertCircle, X, Sparkles, RefreshCw } from "lucide-react";
import { runAnalysis } from "./api/projectAnalysis";
import { parseTextLocally } from "./api/localParser";

// Debug environment on app load
console.log('🔍 ProjectPilot Environment Debug:', {
  hostname: window.location.hostname,
  pathname: window.location.pathname,
  href: window.location.href,
  isLemmaDomain: window.location.hostname.includes('lemma.work'),
  isLemmaApp: window.location.hostname.includes('.apps.lemma.work'),
  hasViteVars: !!((window as any).VITE_LEMMA_API_URL),
  viteApiUrl: (window as any).VITE_LEMMA_API_URL,
  vitePodId: (window as any).VITE_LEMMA_POD_ID,
  viteFromImportMeta: import.meta.env ? {
    apiUrl: import.meta.env.VITE_LEMMA_API_URL,
    podId: import.meta.env.VITE_LEMMA_POD_ID
  } : 'import.meta.env not available',
  hasLemmaAuth: !!((window as any).lemmaAuth),
  hasLemmaToken: !!((window as any).LEMMA_TOKEN),
  hasLemmaGlobal: !!((window as any).lemma),
  windowKeys: Object.keys(window).filter(key => key.toLowerCase().includes('lemma')),
  cookies: document.cookie
});

function ensureUniqueIds(data: ProjectData): ProjectData {
  if (!data) return data;
  
  const tasks = (data.tasks || []).map((task, idx) => {
    if (!task.id) {
      return { ...task, id: `task-${Date.now()}-${idx}` };
    }
    return task;
  });

  const risks = (data.risks || []).map((risk, idx) => {
    if (!risk.id) {
      return { ...risk, id: `risk-${Date.now()}-${idx}` };
    }
    return risk;
  });

  const recommendations = (data.recommendations || []).map((rec, idx) => {
    if (!rec.id) {
      return { ...rec, id: `rec-${Date.now()}-${idx}` };
    }
    return rec;
  });

  const missingInfoAlerts = (data.missingInfoAlerts || []).map((alert, idx) => {
    if (!alert.id) {
      return { ...alert, id: `alert-${Date.now()}-${idx}` };
    }
    return alert;
  });

  return {
    ...data,
    tasks,
    risks,
    recommendations,
    missingInfoAlerts
  };
}

export default function App() {
  // Screen States: "home" | "analyze" | "processing" | "dashboard" | "about"
  const [screen, setScreen] = useState<string>(() => {
    return localStorage.getItem("pp_screen") || "home";
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("pp_theme");
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  });

  const [projectData, setProjectData] = useState<ProjectData>(() => {
    const saved = localStorage.getItem("pp_project_data");
    if (saved) {
      try {
        return ensureUniqueIds(JSON.parse(saved));
      } catch (e) {
        // Fallback
      }
    }
    return ensureUniqueIds(sampleProject);
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [apiMissingKeyPrompt, setApiMissingKeyPrompt] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    text: string;
    file: { name: string; base64: string; mimeType: string } | null;
  } | null>(null);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("pp_screen", screen);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem("pp_theme", theme);
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
      body.classList.add("bg-[#0c0d12]", "dark:bg-[#0c0d12]");
      body.classList.remove("bg-slate-50");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      body.classList.add("bg-slate-50");
      body.classList.remove("bg-[#0c0d12]", "dark:bg-[#0c0d12]");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pp_project_data", JSON.stringify(projectData));
  }, [projectData]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Analyze API request orchestrator
  const handleAnalyze = async (payload: {
    text: string;
    file: { name: string; base64: string; mimeType: string } | null;
  }) => {
    console.log("🚀 Starting analysis with payload:", payload);
    setError(null);
    setApiMissingKeyPrompt(false);
    setPendingPayload(payload);
    setIsAnalyzing(true);
    setScreen("processing");
    setProgress(2);

    let currentProgress = 2;
    let stepInterval: NodeJS.Timeout | null = null;

    const startStepIncrement = (startVal: number, maxVal: number, rate: number) => {
      if (stepInterval) clearInterval(stepInterval);
      currentProgress = startVal;
      setProgress(startVal);
      stepInterval = setInterval(() => {
        if (currentProgress < maxVal) {
          currentProgress += rate;
          setProgress(Math.min(currentProgress, maxVal));
        }
      }, 150);
    };

    try {
      const analyzedProject = await runAnalysis(
        payload,
        (status) => {
          console.log("📊 Status update:", status);
          if (status === "Creating Workflow") {
            startStepIncrement(2, 20, 1.5);
          } else if (status === "Submitting Notes") {
            startStepIncrement(21, 40, 1.5);
          } else if (status === "Running Agent") {
            startStepIncrement(41, 70, 0.4);
          } else if (status === "Saving Results") {
            startStepIncrement(71, 90, 1);
          } else if (status === "Loading Dashboard") {
            startStepIncrement(91, 98, 1);
          }
        }
        // Removed AbortController signal completely
      );

      console.log("✅ Analysis completed successfully:", analyzedProject);
      console.log("✅ Number of tasks:", analyzedProject.tasks?.length || 0);
      console.log("✅ Number of risks:", analyzedProject.risks?.length || 0);

      // clearTimeout(timeoutId); // Removed timeout for testing
      if (stepInterval) clearInterval(stepInterval);

      console.log("🎯 Setting progress to 100% and switching to dashboard...");
      // Complete the progress animation smoothly
      setProgress(100);
      setTimeout(() => {
        console.log("🚀 Actually switching to dashboard now...");
        setProjectData(ensureUniqueIds(analyzedProject));
        setScreen("dashboard");
        setIsAnalyzing(false);
      }, 500);

    } catch (err: any) {
      // clearTimeout(timeoutId); // Removed timeout for testing
      if (stepInterval) clearInterval(stepInterval);
      
      console.error("❌ Analysis failed with error:", err);
      console.error("❌ Error type:", typeof err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      
      const rawErrorDetails = err instanceof Error ? err.message : String(err);
      
      console.warn("⚠️  Analysis request failed, but let's check if results are available anyway...");
      
      // Try to get the latest results before falling back
      try {
        console.log("🔍 Checking for latest results via /api/analyze/latest...");
        const latestResponse = await fetch("/api/analyze/latest");
        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          console.log("📊 Found latest data:", latestData);
          
          if (latestData._analysisMode === "lemma" && 
              (latestData.tasks?.length > 0 || latestData.risks?.length > 0)) {
            console.log("✅ Using latest Lemma results instead of fallback!");
            
            // Complete the progress animation smoothly
            setProgress(100);
            setTimeout(() => {
              console.log("🚀 Setting project data from latest results");
              setProjectData(ensureUniqueIds(latestData));
              setScreen("dashboard");
              setIsAnalyzing(false);
            }, 500);
            return;
          }
        }
      } catch (latestError) {
        console.log("Could not fetch latest results:", latestError);
      }
      
      console.warn("Lemma API analysis failed, falling back to local semantic parser:", rawErrorDetails);
      
      try {
        const localAnalyzed = parseTextLocally(payload);
        
        // Complete the progress animation smoothly
        setProgress(100);
        setTimeout(() => {
          setProjectData(ensureUniqueIds(localAnalyzed));
          setScreen("dashboard");
          setIsAnalyzing(false);
          // Show a helpful banner notifying the user that they are in local mode and showing the actual Lemma error
          setError(`Notice: Project analyzed using offline fallback. Live Lemma analysis failed with: "${rawErrorDetails}".`);
          setApiMissingKeyPrompt(true);
        }, 500);
      } catch (localErr: any) {
        setIsAnalyzing(false);
        setScreen("analyze");
        setError(`Failed to parse project. Live Error: "${rawErrorDetails}". Local Parser Error: "${localErr?.message || localErr}"`);
      }
    }
  };

  // Support simulated demo processing as a fast client-side fallback
  const handleSimulatedFallback = () => {
    setError(null);
    setApiMissingKeyPrompt(false);
    setIsAnalyzing(true);
    setScreen("processing");
    setProgress(1);

    const simulationTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(simulationTimer);
          
          const payload = pendingPayload || { text: "", file: null };
          const localAnalyzed = parseTextLocally(payload);

          setProjectData(ensureUniqueIds(localAnalyzed));
          setScreen("dashboard");
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 3;
      });
    }, 100);
  };

  // Handle updates to tasks from Dashboard
  const handleUpdateProjectData = (updatedData: ProjectData) => {
    setProjectData(ensureUniqueIds(updatedData));
  };

  return (
    <div className={`${theme} min-h-screen bg-slate-50 dark:bg-[#0c0d12] flex flex-col font-sans transition-colors duration-300`}>
      
      {/* Global Navbar */}
      <Navbar
        currentScreen={screen}
        setScreen={setScreen}
        theme={theme}
        toggleTheme={toggleTheme}
        onAnalyzeClick={() => setScreen("analyze")}
      />

      {/* Floating API Key Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto mt-6 px-6 w-full animate-fadeIn">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl flex items-start gap-3 relative shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-grow">
              <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Analysis Halted</h4>
              <p className="text-xs text-red-700 dark:text-red-400 leading-normal mt-0.5">
                {error}
              </p>

              {apiMissingKeyPrompt && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <button
                    onClick={handleSimulatedFallback}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    Proceed with Demo Mode
                  </button>
                  <button
                    onClick={() => setScreen("about")}
                    className="bg-transparent text-red-700 dark:text-red-300 hover:underline font-bold text-xs py-1.5 cursor-pointer"
                  >
                    View Setup Instructions
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded-lg absolute top-3 right-3 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Screen Router */}
      <div className="flex-grow flex flex-col">
        {screen === "home" && (
          <LandingPage
            onStartAnalysis={() => setScreen("analyze")}
            onWatchDemo={() => {
              // Set to preloaded "Horizon Phase 2" project data
              setProjectData(ensureUniqueIds(sampleProject));
              setScreen("dashboard");
            }}
          />
        )}

        {screen === "analyze" && (
          <AnalysisWorkspace
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        {screen === "processing" && (
          <ProcessingScreen progress={Math.round(progress)} />
        )}

        {screen === "dashboard" && (
          <Dashboard
            data={projectData}
            onUpdateData={handleUpdateProjectData}
            onReset={() => setScreen("analyze")}
          />
        )}

        {screen === "about" && (
          <AboutPage onBackToHome={() => setScreen("home")} />
        )}
      </div>

    </div>
  );
}
