import React from "react";
import { Moon, Sun, Github, BarChart2, FileSearch, Home, Info } from "lucide-react";

interface NavbarProps {
  currentScreen: string;
  setScreen: (screen: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onAnalyzeClick: () => void;
}

export default function Navbar({
  currentScreen,
  setScreen,
  theme,
  toggleTheme,
  onAnalyzeClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#191b23]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-300">
      <nav className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setScreen("home")}
            className="flex items-center gap-2 group font-sans text-xl font-bold tracking-tight text-[#004ac6] dark:text-[#b4c5ff]"
          >
            <span className="bg-[#004ac6] dark:bg-[#2563eb] text-white p-1.5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <BarChart2 className="w-5 h-5" />
            </span>
            ProjectPilot AI
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setScreen("home")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentScreen === "home"
                  ? "text-[#004ac6] dark:text-[#b4c5ff] bg-gray-100 dark:bg-gray-800/60"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:bg-gray-50 dark:hover:bg-gray-800/30"
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setScreen("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentScreen === "dashboard"
                  ? "text-[#004ac6] dark:text-[#b4c5ff] bg-gray-100 dark:bg-gray-800/60"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:bg-gray-50 dark:hover:bg-gray-800/30"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setScreen("analyze")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentScreen === "analyze"
                  ? "text-[#004ac6] dark:text-[#b4c5ff] bg-gray-100 dark:bg-gray-800/60"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:bg-gray-50 dark:hover:bg-gray-800/30"
              }`}
            >
              <FileSearch className="w-4 h-4" />
              Analyze Workspace
            </button>
            <button
              onClick={() => setScreen("about")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentScreen === "about"
                  ? "text-[#004ac6] dark:text-[#b4c5ff] bg-gray-100 dark:bg-gray-800/60"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:bg-gray-50 dark:hover:bg-gray-800/30"
              }`}
            >
              <Info className="w-4 h-4" />
              About
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/bikram73/Project_Pilot_AI"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-[#004ac6] dark:hover:text-[#b4c5ff] text-sm font-medium transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <button
            onClick={onAnalyzeClick}
            className="bg-[#004ac6] dark:bg-[#2563eb] text-white hover:bg-[#003ea8] dark:hover:bg-[#1d4ed8] px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md active:scale-95"
          >
            Analyze Project
          </button>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </nav>
    </header>
  );
}
