import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, Info, Sparkles, Clipboard, ChevronDown } from "lucide-react";

interface AnalysisWorkspaceProps {
  onAnalyze: (payload: { text: string; file: { name: string; base64: string; mimeType: string } | null }) => void;
  isAnalyzing: boolean;
}

const SAMPLE_MEETING_NOTES = `Project Meeting Notes - Q4 Sprint Planning

"We need to complete the login module before Friday.
Rahul will develop the backend API.
Ananya will design the dashboard.
Payment integration depends on receiving Stripe API keys.
Testing begins next Monday."`;

const SAMPLE_STANDUP_NOTES = `Daily Standup - Sprint 12

Sarah: Completed user authentication, working on password reset
Mike: Database migration running, will finish today  
Lisa: Frontend components 80% done, blocked on API specs
Alex: Testing environment setup, found 3 critical bugs

Blockers: API documentation missing, staging server down
Next: Deploy to production Friday`;

const SAMPLE_REQUIREMENTS = `Product Requirements Document v2.1

Feature: Social Media Integration
Priority: High
Owner: Development Team

User Stories:
- As a user, I want to share content on Twitter
- As a user, I want to login with Google/Facebook
- As an admin, I want to moderate shared content

Technical Requirements:
- OAuth 2.0 integration
- Rate limiting: 100 requests/hour
- Content moderation API

Risks: API rate limits, security compliance
Timeline: 3 sprints (6 weeks)`;

const SAMPLE_EMAIL_THREAD = `Email Thread: Project Phoenix Update

From: Sarah Manager
To: Development Team
Subject: Urgent: Project Phoenix Deadlines

Team,

We have 3 critical deliverables due this week:
1. John - Complete API integration by Wednesday
2. Mary - Frontend components ready for testing by Thursday  
3. Alex - Database migrations deployed by Friday

Risks identified:
- Third-party API instability
- Testing environment not ready
- Client approval pending on UI designs

Please update your status in tomorrow's standup.

Best,
Sarah`;

const SAMPLE_CHAT_LOG = `Team Chat - #project-alpha

[09:15] john_dev: API endpoints are ready for testing
[09:16] mary_ui: Great! Can you share the documentation?
[09:17] alex_qa: I found 5 bugs in the login flow
[09:18] sarah_pm: @alex_qa Please log them in Jira with High priority
[09:20] john_dev: @mary_ui Docs are in the wiki, link: /wiki/api-docs
[09:22] mary_ui: Thanks! I'll integrate them today
[09:25] alex_qa: @sarah_pm Done. Most critical is password validation
[09:30] sarah_pm: Team meeting at 2pm to discuss deployment blockers`;

const SAMPLE_RETROSPECTIVE = `Sprint Retrospective - Sprint 11

What went well:
- Team delivered all user stories on time
- Code quality improved with peer reviews
- Client feedback was very positive

What didn't go well:  
- Testing environment was unstable
- API documentation was incomplete
- Deployment took longer than expected

Action items:
- Set up dedicated staging server (Owner: DevOps, Due: Next week)
- Create API documentation template (Owner: John, Due: Friday)
- Automate deployment process (Owner: Mary, Due: End of month)

Risks for next sprint:
- Database migration complexity
- New team member onboarding
- Holiday schedule impacts`;

const SAMPLE_DATA_OPTIONS = [
  { name: "Meeting Notes", content: SAMPLE_MEETING_NOTES },
  { name: "Daily Standup", content: SAMPLE_STANDUP_NOTES },
  { name: "Requirements Doc", content: SAMPLE_REQUIREMENTS },
  { name: "Email Thread", content: SAMPLE_EMAIL_THREAD },
  { name: "Team Chat Log", content: SAMPLE_CHAT_LOG },
  { name: "Retrospective", content: SAMPLE_RETROSPECTIVE }
];

export default function AnalysisWorkspace({ onAnalyze, isAnalyzing }: AnalysisWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    base64: string;
    mimeType: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = [".pdf", ".docx", ".txt"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setErrorMessage("Unsupported file format. Please upload PDF, DOCX, or TXT.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File exceeds the 25MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const base64Data = result.split(",")[1];
        setSelectedFile({
          name: file.name,
          size: formatBytes(file.size),
          base64: base64Data,
          mimeType: file.type || "application/octet-stream",
        });
      } catch (err) {
        setErrorMessage("Failed to process file. Please try again.");
      }
    };
    reader.onerror = () => {
      setErrorMessage("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const loadSampleData = (sampleContent: string) => {
    setPastedText(sampleContent);
    setActiveTab("paste");
    setShowSampleDropdown(false);
  };

  const triggerAnalyze = () => {
    setErrorMessage(null);
    if (activeTab === "upload") {
      if (!selectedFile) {
        setErrorMessage("Please select or drop a file to analyze.");
        return;
      }
      onAnalyze({ text: "", file: selectedFile });
    } else {
      if (!pastedText.trim()) {
        setErrorMessage("Please paste project notes to analyze.");
        return;
      }
      onAnalyze({ text: pastedText, file: null });
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Workspace Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Deep Analysis Workspace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-sans text-base max-w-2xl mx-auto">
            Upload your project documentation, meeting summaries, or raw requirements. Our AI engine parses files natively, mapping deliverables, owners, deadlines, and mitigation recommendations.
          </p>
        </div>

        {/* Large Analysis Card */}
        <div className="bg-white dark:bg-[#191b23] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden flex flex-col min-h-[500px]">
          {/* Workspace Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 px-6 gap-2">
            <button
              onClick={() => {
                setActiveTab("upload");
                setErrorMessage(null);
              }}
              className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "upload"
                  ? "text-[#004ac6] dark:text-[#b4c5ff] border-b-2 border-[#004ac6] dark:border-[#b4c5ff]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => {
                setActiveTab("paste");
                setErrorMessage(null);
              }}
              className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "paste"
                  ? "text-[#004ac6] dark:text-[#b4c5ff] border-b-2 border-[#004ac6] dark:border-[#b4c5ff]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Paste Text
            </button>
            <div className="ml-auto flex items-center pr-2 relative">
              <button
                onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#004ac6] dark:text-[#b4c5ff] hover:bg-blue-100 dark:hover:bg-blue-950/40 rounded-lg text-xs font-semibold transition-colors border border-blue-100/50 dark:border-blue-900/30 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                Load Sample Data
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {showSampleDropdown && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {SAMPLE_DATA_OPTIONS.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => loadSampleData(sample.content)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "upload" ? (
            <div className="p-8 flex-grow flex flex-col space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-grow border-2 border-dashed rounded-2xl bg-gray-50/50 dark:bg-[#12131a]/40 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center p-8 group ${
                  dragOver
                    ? "border-[#004ac6] bg-blue-50/30 dark:bg-blue-950/10 scale-[0.99]"
                    : "border-gray-200 dark:border-gray-800 hover:border-[#004ac6]/50 hover:bg-gray-50 dark:hover:bg-gray-800/10"
                }`}
              >
                <input
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  type="file"
                />

                {!selectedFile ? (
                  <>
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-[#004ac6] dark:text-[#b4c5ff] rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Drop your files here
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
                      Support for PDF, DOCX, and TXT files up to 25MB. You can also click to browse folders.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
                        PDF
                      </span>
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
                        DOCX
                      </span>
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
                        TXT
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 px-4 truncate max-w-md">
                      {selectedFile.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      File Size: {selectedFile.size}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab Content: Paste Text */
            <div className="p-8 flex-grow flex flex-col">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Project Notes, Requirements or Transcript
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="flex-grow w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#12131a]/30 focus:border-[#004ac6] dark:focus:border-[#b4c5ff] focus:ring-2 focus:ring-[#004ac6]/10 outline-none resize-none min-h-[280px] text-gray-800 dark:text-gray-200 font-sans transition-all"
                placeholder="Paste your unstructured meeting transcripts, raw specifications, or team chat messages here..."
              ></textarea>
            </div>
          )}

          {/* Bottom Feedback / Action Bar */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#151720]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
              <Info className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium leading-normal">
                Privacy Guaranteed: Document items are parsed entirely in-memory within the active session.
              </p>
            </div>

            {errorMessage && (
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 mr-auto sm:mr-0">
                {errorMessage}
              </div>
            )}

            <button
              onClick={triggerAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto bg-[#004ac6] dark:bg-[#2563eb] hover:bg-[#003ea8] dark:hover:bg-[#1d4ed8] text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              Analyze Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
