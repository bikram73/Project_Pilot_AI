import React, { useState, useRef, useEffect } from "react";
import { ProjectData, Task, Risk, Recommendation, ChatMessage, MissingInfoAlert } from "../types";
import {
  Zap,
  UserPlus,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Sparkles,
  Layers,
  CheckSquare,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  RefreshCw,
  FolderOpen,
  Briefcase,
  AlertCircle,
  HeartHandshake,
  MessageSquare,
  Send,
  Calendar,
  GitBranch,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  UserX,
  HelpCircle
} from "lucide-react";
import { sendAgentMessage, checkChatAvailability, getChatMode } from "../api/lemma";

interface DashboardProps {
  data: ProjectData;
  onUpdateData: (newData: ProjectData) => void;
  onReset: () => void;
}

export default function Dashboard({ data, onUpdateData, onReset }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<"all" | "timeline" | "tasks" | "risks" | "recommendations" | "objectives">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Editing state for Project Summary
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(data.projectSummary);

  // New task form state
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskOwner, setNewTaskOwner] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskSourceEvidence, setNewTaskSourceEvidence] = useState("");
  const [newTaskDependencies, setNewTaskDependencies] = useState("");

  // New risk form state
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [newRiskName, setNewRiskName] = useState("");
  const [newRiskSeverity, setNewRiskSeverity] = useState<"Critical" | "High" | "Medium" | "Low">("High");
  const [newRiskDescription, setNewRiskDescription] = useState("");
  const [newRiskSolution, setNewRiskSolution] = useState("");

  // Mitigated risk tracker (locally active during session)
  const [mitigatedRiskIds, setMitigatedRiskIds] = useState<string[]>([]);
  // Applied recommendation tracker
  const [appliedRecIds, setAppliedRecIds] = useState<string[]>([]);
  // Achieved objectives tracker
  const [achievedObjectiveIndices, setAchievedObjectiveIndices] = useState<number[]>([]);

  // Interactive AI Chat Sidebar State
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatAvailable, setIsChatAvailable] = useState<boolean | null>(null);
  const [chatMode, setChatMode] = useState<"lemma" | "gemini" | "offline" | "loading">("loading");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "welcome",
        sender: "ai",
        text: `Hello! I am your **ProjectPilot AI** operational assistant. 
        
I've completed an in-depth semantic scan of your project parameters:
- **Timeline targets** mapped to **${data.estimatedCompletion || "TBD"}**
- **${data.tasks.length} core tasks** extracted with evidence-anchors
- **Overall Operational Confidence** sitting at **${data.aiConfidenceOverall || 95}%**

Ask me anything about standup workloads, active blockers, or timeline diagnostics.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check chat agent availability on component mount
  useEffect(() => {
    getChatMode()
      .then((mode) => {
        setChatMode(mode);
        setIsChatAvailable(mode !== "offline");
        
        if (mode === "offline") {
          setChatMessages([
            {
              id: "welcome-unavailable",
              sender: "ai",
              text: "⚠️ **Chat Assistant is unavailable**: The Lemma conversation session or Chat Agent is not reachable. You can still use the rest of the project dashboard as expected!",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);
        } else if (mode === "gemini") {
          setChatMessages([
            {
              id: "welcome-gemini",
              sender: "ai",
              text: "ℹ️ **Lemma Chat is temporarily unavailable. Continuing with the AI fallback assistant.**\n\nAsk me anything! Since we are operating in **Gemini Fallback Mode**, I will compile insights directly using your workspace parameters and the Gemini API.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);
        }
      })
      .catch(() => {
        setChatMode("offline");
        setIsChatAvailable(false);
        setChatMessages([
          {
            id: "welcome-unavailable",
            sender: "ai",
            text: "⚠️ **Chat Assistant is unavailable**: The Lemma conversation session or Chat Agent is not reachable. You can still use the rest of the project dashboard as expected!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      });
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSaveSummary = () => {
    onUpdateData({
      ...data,
      projectSummary: editedSummary,
    });
    setIsEditingSummary(false);
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = data.tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    onUpdateData({ ...data, tasks: updatedTasks });
  };

  const handlePriorityChange = (taskId: string, newPriority: Task["priority"]) => {
    const updatedTasks = data.tasks.map((task) =>
      task.id === taskId ? { ...task, priority: newPriority } : task
    );
    onUpdateData({ ...data, tasks: updatedTasks });
  };

  const handleTaskDelete = (taskId: string) => {
    const updatedTasks = data.tasks.filter((task) => task.id !== taskId);
    onUpdateData({ ...data, tasks: updatedTasks });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const parsedDeps = newTaskDependencies
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      owner: newTaskOwner.trim() || "Unassigned",
      deadline: newTaskDeadline.trim() || "TBD",
      priority: newTaskPriority,
      category: newTaskCategory.trim() || "General",
      status: "Todo",
      sourceEvidence: newTaskSourceEvidence.trim() || "Manually logged by operational lead.",
      confidence: 100,
      dependencies: parsedDeps
    };

    onUpdateData({
      ...data,
      tasks: [newTask, ...data.tasks],
    });

    // Reset Form
    setNewTaskName("");
    setNewTaskOwner("");
    setNewTaskDeadline("");
    setNewTaskPriority("Medium");
    setNewTaskCategory("General");
    setNewTaskSourceEvidence("");
    setNewTaskDependencies("");
    setShowAddTask(false);
  };

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiskName.trim() || !newRiskDescription.trim()) return;

    const newRisk: Risk = {
      id: `risk-${Date.now()}`,
      name: newRiskName,
      severity: newRiskSeverity,
      description: newRiskDescription,
      solution: newRiskSolution.trim() || "Monitor closely.",
      confidence: 100
    };

    onUpdateData({
      ...data,
      risks: [newRisk, ...data.risks],
    });

    setNewRiskName("");
    setNewRiskSeverity("High");
    setNewRiskDescription("");
    setNewRiskSolution("");
    setShowAddRisk(false);
  };

  const toggleMitigateRisk = (riskId: string) => {
    if (mitigatedRiskIds.includes(riskId)) {
      setMitigatedRiskIds(mitigatedRiskIds.filter((id) => id !== riskId));
    } else {
      setMitigatedRiskIds([...mitigatedRiskIds, riskId]);
    }
  };

  const toggleApplyRec = (recId: string) => {
    if (appliedRecIds.includes(recId)) {
      setAppliedRecIds(appliedRecIds.filter((id) => id !== recId));
    } else {
      setAppliedRecIds([...appliedRecIds, recId]);
    }
  };

  const toggleObjective = (index: number) => {
    if (achievedObjectiveIndices.includes(index)) {
      setAchievedObjectiveIndices(achievedObjectiveIndices.filter((idx) => idx !== index));
    } else {
      setAchievedObjectiveIndices([...achievedObjectiveIndices, index]);
    }
  };

  // AI Chat Assistant message handler
  const handleSendMessage = async (customMessage?: string) => {
    const text = (customMessage || chatInput).trim();
    if (!text) return;

    if (isChatAvailable === false) {
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const { reply: replyText, mode } = await sendAgentMessage(text, data, chatMessages);
      
      // Update chat mode based on which service actually responded
      setChatMode(mode === "gemini" ? "gemini" : "lemma");
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      const errorDetails = typeof e === "object" && e !== null ? JSON.stringify(e, null, 2) : "";
      
      // Check if this is a structured error response with failed services info
      let formattedErrorText: string;
      
      if (e.details && e.failedServices) {
        // Both services failed - show specific information
        if (e.failedServices.includes("lemma") && e.failedServices.includes("gemini")) {
          formattedErrorText = `⚠️ **Both Chat Services Unavailable**\n\n**Lemma Chat:** ${e.details.lemmaError}\n**Gemini Fallback:** ${e.details.geminiError}\n\nPlease check your API keys and network connection.`;
        } else if (e.failedServices.includes("gemini")) {
          formattedErrorText = `⚠️ **Gemini Fallback Error**: ${e.details.geminiError}\n\n*Note: Lemma chat was unavailable, attempted Gemini fallback.*`;
        } else {
          formattedErrorText = `⚠️ **Lemma Chat Error**: ${e.details.lemmaError}`;
        }
      } else {
        // Legacy error handling
        const isUnauthenticated = errorMessage.includes("Please log into your Lemma workspace.") || errorDetails.includes("Please log into your Lemma workspace.");
        formattedErrorText = isUnauthenticated
          ? `⚠️ **Please log into your Lemma workspace.**`
          : `⚠️ **Chat Service Error**: ${errorMessage}\n\n${errorDetails ? `**Details:**\n\`\`\`json\n${errorDetails}\n\`\`\`` : ""}`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          sender: "ai",
          text: formattedErrorText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Inline markdown rendering utility
  const renderMarkdownText = (text: string) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, index) => {
      let content = line;
      // Bold tags
      content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Inline code
      content = content.replace(/`(.*?)`/g, "<code class='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-xs text-blue-600 dark:text-blue-400'>$1</code>");

      // Headers
      if (content.startsWith("### ")) {
        return (
          <h4 key={index} className="text-sm font-bold text-gray-950 dark:text-white mt-3 mb-1 font-sans" dangerouslySetInnerHTML={{ __html: content.substring(4) }} />
        );
      }
      if (content.startsWith("## ")) {
        return (
          <h3 key={index} className="text-sm font-extrabold text-gray-950 dark:text-white mt-4 mb-1.5 font-sans" dangerouslySetInnerHTML={{ __html: content.substring(3) }} />
        );
      }
      if (content.startsWith("# ")) {
        return (
          <h2 key={index} className="text-base font-black text-gray-950 dark:text-white mt-4 mb-2 font-sans" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
        );
      }

      // Bullet items
      if (content.trim().startsWith("- ") || content.trim().startsWith("* ")) {
        const bulletText = content.trim().substring(2);
        return (
          <li key={index} className="list-disc ml-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: bulletText }} />
        );
      }

      if (!content.trim()) {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed my-1 font-sans" dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  // Metric Computations with AI safety backups
  const totalTasksCount = data.tasks.length;
  
  // 1. AI Confidence
  const aiConfidenceVal = data.aiConfidenceOverall || 96;
  
  // 2. Blocked Tasks
  const blockedTasksCount = data.tasks.filter((t) => (t.dependencies && t.dependencies.length > 0) || t.status === "Pending").length;
  
  // 3. Active Dependencies
  const dependenciesCount = data.tasks.reduce((acc, t) => acc + (t.dependencies ? t.dependencies.length : 0), 0) || data.dependenciesCount || 0;
  
  // 4. Estimated Completion
  const estimatedCompletionDate = data.estimatedCompletion || "Nov 15, 2026";

  // Filter tasks based on query, priority, and status
  const filteredTasks = data.tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Mapped recommendation icons
  const getRecIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "speed":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "group_add":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "schedule":
        return <Clock className="w-5 h-5 text-purple-500" />;
      case "task_alt":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "build":
        return <Wrench className="w-5 h-5 text-slate-500" />;
      case "priority_high":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  // Grouping tasks chronologically for Timeline
  const getTimelineMilestones = () => {
    const groups: { [key: string]: Task[] } = {};
    data.tasks.forEach((task) => {
      const deadline = task.deadline || "Pending/TBD";
      if (!groups[deadline]) {
        groups[deadline] = [];
      }
      groups[deadline].push(task);
    });

    // Simple priority list to order deadlines logically if possible
    const sortedDeadlines = Object.keys(groups).sort((a, b) => {
      if (a.toLowerCase() === "tbd" || a.toLowerCase() === "pending") return 1;
      if (b.toLowerCase() === "tbd" || b.toLowerCase() === "pending") return -1;
      return a.localeCompare(b);
    });

    return sortedDeadlines.map((deadline) => ({
      deadline,
      tasks: groups[deadline]
    }));
  };

  // Solve a missing info alert inline helper
  const handleSolveAlertInline = (taskName: string, fieldType: "owner" | "deadline", value: string) => {
    const updatedTasks = data.tasks.map((t) => {
      if (t.name === taskName) {
        if (fieldType === "owner") {
          return { ...t, owner: value, missingInfo: undefined, suggestedAction: undefined };
        } else {
          return { ...t, deadline: value, missingInfo: undefined, suggestedAction: undefined };
        }
      }
      return t;
    });

    // Clear alert from alerts list too
    const updatedAlerts = data.missingInfoAlerts?.filter(
      (a) => !(a.targetName === taskName && a.targetType === "task")
    );

    onUpdateData({
      ...data,
      tasks: updatedTasks,
      missingInfoAlerts: updatedAlerts,
      blockedTasksCount: Math.max(0, blockedTasksCount - 1)
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] w-full bg-gray-50/50 dark:bg-[#12131a] transition-all duration-300 relative">
      
      {/* 1. Sidebar Nav Panel */}
      <aside className="w-full lg:w-64 bg-white dark:bg-[#191b23] border-r border-gray-100 dark:border-gray-800/80 p-6 flex flex-col gap-6 flex-shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[#004ac6] dark:text-[#b4c5ff] flex items-center justify-center font-extrabold text-sm shadow-inner">
            PP
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">ProjectPilot AI</h4>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
              AI Standup Analyst
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-grow">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-2">
            Workspace Nav
          </p>
          <button
            onClick={() => setActiveSection("all")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeSection === "all"
                ? "bg-blue-50/70 dark:bg-blue-950/20 text-[#004ac6] dark:text-[#b4c5ff]"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Project Overview
          </button>
          
          {/* Timeline Tab */}
          <button
            onClick={() => setActiveSection("timeline")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeSection === "timeline"
                ? "bg-blue-50/70 dark:bg-blue-950/20 text-[#004ac6] dark:text-[#b4c5ff]"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Project Timeline
          </button>

          <button
            onClick={() => setActiveSection("tasks")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeSection === "tasks"
                ? "bg-blue-50/70 dark:bg-blue-950/20 text-[#004ac6] dark:text-[#b4c5ff]"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Active Tasks ({totalTasksCount})
          </button>
          <button
            onClick={() => setActiveSection("risks")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeSection === "risks"
                ? "bg-blue-50/70 dark:bg-blue-950/20 text-[#004ac6] dark:text-[#b4c5ff]"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Critical Risks ({data.risks.filter((r) => !mitigatedRiskIds.includes(r.id)).length})
          </button>
          <button
            onClick={() => setActiveSection("recommendations")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeSection === "recommendations"
                ? "bg-blue-50/70 dark:bg-blue-950/20 text-[#004ac6] dark:text-[#b4c5ff]"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Suggestions
          </button>
          <button
            onClick={() => setActiveSection("objectives")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeSection === "objectives"
                ? "bg-blue-50/70 dark:bg-blue-950/20 text-[#004ac6] dark:text-[#b4c5ff]"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            }`}
          >
            <Layers className="w-4 h-4" />
            Key Objectives
          </button>

          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 px-3 mt-6 mb-2">
            Interactive Assistant
          </p>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
              isChatOpen
                ? "bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              Ask AI Co-Pilot
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </button>
        </div>

        {/* New analysis button at bottom */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onReset}
            className="w-full bg-[#004ac6]/10 dark:bg-[#2563eb]/10 text-[#004ac6] dark:text-[#b4c5ff] hover:bg-[#004ac6]/20 dark:hover:bg-[#2563eb]/20 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </aside>

      {/* 2. Main Content Stage */}
      <main className="flex-grow p-6 lg:p-10 max-w-7xl mx-auto space-y-8 w-full overflow-y-auto min-w-0">
        
        {/* Analysis Mode Status Banners */}
        {data._analysisMode === "lemma" && (
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4.5 rounded-2xl flex items-start gap-3.5 shadow-sm animate-fadeIn">
            <div className="w-5.5 h-5.5 bg-emerald-600 dark:bg-emerald-400 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex-grow">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                🚀 Powered by Lemma (High Priority)
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full font-mono">PREMIUM MODE</span>
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                Advanced AI workflow analysis completed successfully! Using enterprise-grade Lemma intelligence for maximum accuracy and detailed project insights.
              </p>
            </div>
          </div>
        )}

        {data._analysisMode === "gemini" && (
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-4.5 rounded-2xl flex items-start gap-3.5 shadow-sm animate-fadeIn">
            <Sparkles className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="flex-grow">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-800 dark:text-amber-300 flex items-center gap-2">
                ⚠️ Powered by Gemini (Low Priority Fallback)
                <span className="text-[9px] bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full font-mono">BACKUP MODE</span>
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                Lemma Analysis Workflow temporarily unavailable <span className="font-mono text-[10px] bg-amber-100/50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">({data._lemmaError || "connection issue"})</span>. 
                Using reliable Gemini AI fallback for project analysis.
              </p>
            </div>
          </div>
        )}

        {data._analysisMode !== "lemma" && data._analysisMode !== "gemini" && (
          <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 p-4.5 rounded-2xl flex items-start gap-3.5 shadow-sm animate-fadeIn">
            <Sparkles className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-grow">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-800 dark:text-blue-300">
                Running in Demo Mode (Offline Fallback)
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                Using our localized offline parsing sample. Add your <span className="font-semibold font-mono text-[10px] bg-blue-100/50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">GEMINI_API_KEY</span> in the **Settings** gear menu ⚙️ to activate full live AI analytical mapping.
              </p>
            </div>
          </div>
        )}

        {/* Stage Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md">
              Operations Control Panel
            </span>
            <h1 className="text-2xl lg:text-3.5xl font-extrabold text-gray-900 dark:text-white mt-1.5 tracking-tight">
              {data.projectTitle || "Project Operation Summary"}
            </h1>
          </div>
          <button
            onClick={onReset}
            className="bg-[#004ac6] dark:bg-[#2563eb] hover:bg-[#003ea8] dark:hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Parse Another Document
          </button>
        </div>

        {/* 3. Improved Dashboard Metrics (AI Confidence, Blocked Tasks, Dependencies, Est Completion) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          
          <div className="bg-white dark:bg-[#191b23] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                AI Confidence
              </span>
              <span className="text-2xl font-black text-gray-900 dark:text-white font-mono leading-none">
                {aiConfidenceVal}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#191b23] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                Blocked Tasks
              </span>
              <span className="text-2xl font-black text-gray-900 dark:text-white font-mono leading-none">
                {blockedTasksCount < 10 ? `0${blockedTasksCount}` : blockedTasksCount}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#191b23] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                Dependencies
              </span>
              <span className="text-2xl font-black text-gray-900 dark:text-white font-mono leading-none">
                {dependenciesCount < 10 ? `0${dependenciesCount}` : dependenciesCount}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#191b23] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block">
                Est. Completion
              </span>
              <span className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                {estimatedCompletionDate}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Missing Information Diagnostics Banner (Heads Up Operational Alerts) */}
        {activeSection === "all" && data.missingInfoAlerts && data.missingInfoAlerts.length > 0 && (
          <div className="bg-amber-50/40 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-bounce" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                ⚠️ Operational Diagnostics: Missing Project Information
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
              Our semantic AI parser highlighted unassigned ownership or incomplete deadlines inside your project notes. Assign values below to resolve immediately:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.missingInfoAlerts.map((alert) => (
                <div key={alert.id} className="bg-white dark:bg-[#191b23] border border-gray-100 dark:border-gray-800/80 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl flex-shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-grow space-y-1">
                    <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {alert.targetType}: {alert.targetName}
                    </span>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight mt-1">
                      {alert.description}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mb-2">
                      <strong className="text-blue-600 dark:text-blue-400">Suggested Fix:</strong> {alert.suggestedAction}
                    </p>

                    {/* Quick Inline solving actions */}
                    {alert.targetType === "task" && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-50 dark:border-gray-850">
                        <button
                          onClick={() => handleSolveAlertInline(alert.targetName, "owner", "Sarah D.")}
                          className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Assign Sarah D.
                        </button>
                        <button
                          onClick={() => handleSolveAlertInline(alert.targetName, "owner", "Rahul")}
                          className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Assign Rahul
                        </button>
                        <button
                          onClick={() => handleSolveAlertInline(alert.targetName, "deadline", "Nov 12")}
                          className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Due Nov 12
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Project Summary Card */}
        {(activeSection === "all" || activeSection === "objectives") && (
          <div className="bg-white dark:bg-[#191b23] rounded-2xl border border-gray-100 dark:border-gray-800/80 p-6 lg:p-8 shadow-sm space-y-5 relative overflow-hidden transition-all duration-300">
            {/* Spark background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Executive Project Summary
                </h2>
              </div>
              {!isEditingSummary ? (
                <button
                  onClick={() => setIsEditingSummary(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Wrench className="w-3 h-3" />
                  Edit AI Synthesis
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSummary}
                    className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedSummary(data.projectSummary);
                      setIsEditingSummary(false);
                    }}
                    className="px-2.5 py-1 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingSummary ? (
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[140px] text-gray-800 dark:text-gray-200 text-sm leading-relaxed"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {data.projectSummary}
              </p>
            )}

            {/* List of high-level objectives */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Identified Objectives
                </h4>
                <div className="space-y-2">
                  {data.objectives?.map((obj, idx) => {
                    const isDone = achievedObjectiveIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleObjective(idx)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                          isDone
                            ? "bg-green-50/20 dark:bg-green-950/10 border-green-100/40 dark:border-green-900/20 text-gray-500 dark:text-gray-400 line-through"
                            : "bg-gray-50/40 dark:bg-gray-850 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700"
                        }`}
                      >
                        <div className={`mt-0.5 rounded-full flex-shrink-0 w-4 h-4 flex items-center justify-center border ${
                          isDone ? "bg-green-600 border-green-600 text-white" : "border-gray-300 dark:border-gray-600"
                        }`}>
                          {isDone && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs leading-normal">{obj}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Key Deliverables Matrix
                </h4>
                <div className="space-y-2">
                  {data.keyDeliverables?.map((del, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl border bg-gray-50/40 dark:bg-gray-850 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs leading-normal font-medium">{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Visual Timeline View Section (Friday -> Monday -> Pending) */}
        {activeSection === "timeline" && (
          <div className="bg-white dark:bg-[#191b23] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm p-6 space-y-6 transition-all duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Chronological Project Timeline
              </h2>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
              Below, tasks are chronologically sequenced based on their parsed deadlines, with automatic markers highlighting AI Extraction Confidence, dependencies, and owners.
            </p>

            <div className="relative border-l-2 border-dashed border-gray-100 dark:border-gray-800 ml-4 pl-8 space-y-8 py-2">
              {getTimelineMilestones().map((milestone, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Timeline point indicator */}
                  <span className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border-4 border-white dark:border-[#191b23] text-blue-600 dark:text-blue-300 text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </span>

                  {/* Milestone Heading */}
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold text-xs uppercase px-2.5 py-1 rounded-lg tracking-wider font-mono shadow-sm">
                      Target: {milestone.deadline}
                    </span>
                    <span className="h-0.5 bg-gray-100 dark:bg-gray-850 flex-grow"></span>
                  </div>

                  {/* Tasks nested inside this milestone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {milestone.tasks.map((task) => (
                      <div key={task.id} className="bg-gray-50/50 dark:bg-[#1d202e] border border-gray-100 dark:border-gray-800/80 p-4 rounded-xl space-y-3 shadow-inner hover:shadow-md transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">
                            {task.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                            task.status === "In Progress"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700"
                              : task.status === "Todo"
                              ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700"
                              : task.status === "Pending"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700"
                              : "bg-gray-200 dark:bg-gray-800 text-gray-600"
                          }`}>
                            {task.status}
                          </span>
                        </div>

                        <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black flex items-center justify-center">
                              {task.owner[0]?.toUpperCase()}
                            </span>
                            Owner: <strong>{task.owner}</strong>
                          </span>
                          <span className="text-xs bg-indigo-500/10 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                            {task.category}
                          </span>
                        </div>

                        {/* Dependency warnings */}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/15 text-[10px] space-y-1">
                            <strong className="text-amber-700 dark:text-amber-400 uppercase tracking-widest block text-[9px]">Prerequisites:</strong>
                            <div className="flex flex-wrap gap-1">
                              {task.dependencies.map((dep, dIdx) => (
                                <span key={dIdx} className="bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none">
                                  🔗 {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Source Evidence */}
                        {task.sourceEvidence && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-850 text-[10px] text-gray-400 italic">
                            "{task.sourceEvidence}"
                          </div>
                        )}

                        {/* Individual Confidence Display */}
                        {task.confidence && (
                          <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 pt-1">
                            <span>Extraction Confidence</span>
                            <span className="font-bold text-green-500">{task.confidence}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Active Tasks Matrix Section */}
        {(activeSection === "all" || activeSection === "tasks") && (
          <div className="bg-white dark:bg-[#191b23] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm p-6 space-y-6 transition-all duration-300">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Active Task Ledger
                </h2>
              </div>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-[#004ac6] dark:text-[#b4c5ff] border border-blue-100 dark:border-blue-900/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddTask ? "Cancel Task" : "Add Manual Task"}
              </button>
            </div>

            {/* Task Addition Form */}
            {showAddTask && (
              <form onSubmit={handleAddTask} className="bg-gray-50 dark:bg-gray-850 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4 flex flex-col sm:grid sm:grid-cols-4 items-end animate-fadeIn">
                <div className="sm:col-span-2 space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Task Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="e.g. Set up OAuth secrets callback URL"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 text-sm"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    placeholder="Sarah, Rahul, etc."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 text-sm"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="Friday or Nov 02"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 text-sm"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    placeholder="Core Backend, QA, etc."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 text-sm"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 text-sm"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Blockers / Dependencies (comma separated list)
                  </label>
                  <input
                    type="text"
                    value={newTaskDependencies}
                    onChange={(e) => setNewTaskDependencies(e.target.value)}
                    placeholder="e.g. Receive Stripe Production Keys, Finalize Schema"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 text-sm"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#004ac6] dark:bg-[#2563eb] hover:bg-[#003ea8] dark:hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Add Task to Ledger
                  </button>
                </div>
              </form>
            )}

            {/* Task Filters */}
            <div className="flex flex-wrap gap-3 bg-gray-50/50 dark:bg-gray-850 p-3.5 rounded-xl border border-gray-100/60 dark:border-gray-800 items-center justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter tasks by name, category, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-medium outline-none border-none text-gray-700 dark:text-gray-200 w-48 sm:w-64"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority:</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Backlog">Backlog</option>
                  </select>
                </div>

                {(priorityFilter !== "All" || statusFilter !== "All" || searchQuery.trim() !== "") && (
                  <button
                    onClick={() => {
                      setPriorityFilter("All");
                      setStatusFilter("All");
                      setSearchQuery("");
                    }}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-gray-200 dark:border-gray-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Task list / table */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-100 dark:border-gray-850 rounded-2xl">
                <FolderOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">No tasks match your filter parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      <th className="py-3 px-3">Task Name / AI Evidence Context</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Owner</th>
                      <th className="py-3 px-3 text-center">Priority</th>
                      <th className="py-3 px-3 text-center">Deadline</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/70 dark:divide-gray-800/60">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-850/30 group transition-all text-xs text-gray-700 dark:text-gray-300">
                        
                        {/* Task Name & Embedded Source Evidence / Confidence */}
                        <td className="py-4 px-3 max-w-sm">
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-950 dark:text-white block leading-snug">
                              {task.name}
                            </span>
                            
                            {/* Missing info flags */}
                            {task.missingInfo && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                                ⚠ {task.missingInfo}
                              </span>
                            )}

                            {/* Dependencies display */}
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center py-1">
                                <span className="text-[9px] uppercase font-black text-amber-600">Depends On:</span>
                                {task.dependencies.map((dep, dIdx) => (
                                  <span key={dIdx} className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/20 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none">
                                    🔗 {dep}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Embedded Quote / Source Evidence */}
                            {task.sourceEvidence && (
                              <div className="bg-blue-50/30 dark:bg-blue-950/10 border-l-2 border-blue-400 dark:border-blue-500 p-2 rounded-r-lg text-[10px] text-gray-500 dark:text-gray-400 max-w-sm mt-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block mb-0.5">
                                  AI Evidence Anchor
                                </span>
                                <p className="italic">"{task.sourceEvidence}"</p>
                                {task.confidence && (
                                  <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-blue-100/30 dark:border-blue-900/10 text-[9px] text-gray-400 dark:text-gray-500">
                                    <span>Extraction Confidence:</span>
                                    <span className="font-extrabold text-green-500">{task.confidence}%</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-3 font-medium text-gray-500 dark:text-gray-400">
                          {task.category}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5">
                            {task.owner.toLowerCase() === "unassigned" ? (
                              <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center justify-center">
                                <UserX className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[10px] text-blue-700 dark:text-blue-300 font-extrabold flex items-center justify-center">
                                {task.owner[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                            <span className={`font-semibold truncate max-w-[120px] ${task.owner.toLowerCase() === "unassigned" && "text-red-600 dark:text-red-400 font-bold"}`}>
                              {task.owner}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <select
                            value={task.priority}
                            onChange={(e) => handlePriorityChange(task.id, e.target.value as any)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold select-badge cursor-pointer border focus:outline-none ${
                              task.priority === "High"
                                ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30"
                                : task.priority === "Medium"
                                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30"
                                : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                            }`}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </td>
                        <td className={`py-4 px-3 text-center font-mono font-medium ${task.deadline.toLowerCase() === "tbd" ? "text-amber-600 font-bold" : "text-gray-600 dark:text-gray-400"}`}>
                          {task.deadline}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold focus:outline-none border cursor-pointer ${
                              task.status === "In Progress"
                                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                                : task.status === "Todo"
                                ? "bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20 dark:text-[#b4c5ff] dark:bg-blue-950/20"
                                : task.status === "Backlog"
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200"
                                : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Backlog">Backlog</option>
                          </select>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => handleTaskDelete(task.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 8. Critical Risks Section */}
        {(activeSection === "all" || activeSection === "risks") && (
          <div className="bg-white dark:bg-[#191b23] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm p-6 space-y-6 transition-all duration-300">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Active Risk Radar
                </h2>
              </div>
              <button
                onClick={() => setShowAddRisk(!showAddRisk)}
                className="bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddRisk ? "Cancel" : "Log New Risk"}
              </button>
            </div>

            {/* Risk Logger Form */}
            {showAddRisk && (
              <form onSubmit={handleAddRisk} className="bg-gray-50 dark:bg-gray-850 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4 flex flex-col sm:grid sm:grid-cols-3 items-end animate-fadeIn">
                <div className="sm:col-span-2 space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Risk Name / Core Issue
                  </label>
                  <input
                    required
                    type="text"
                    value={newRiskName}
                    onChange={(e) => setNewRiskName(e.target.value)}
                    placeholder="e.g. Auth-Service SUNSET deprecation"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Severity
                  </label>
                  <select
                    value={newRiskSeverity}
                    onChange={(e) => setNewRiskSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="sm:col-span-3 space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Description & Delayed Impacts
                  </label>
                  <textarea
                    required
                    value={newRiskDescription}
                    onChange={(e) => setNewRiskDescription(e.target.value)}
                    placeholder="Explain why this threat impacts timelines, resources or deliverables."
                    className="w-full p-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200 h-20"
                  />
                </div>
                <div className="sm:col-span-3 space-y-2 w-full">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-gray-500">
                    Mitigation Plan / Suggested Solution
                  </label>
                  <input
                    type="text"
                    value={newRiskSolution}
                    onChange={(e) => setNewRiskSolution(e.target.value)}
                    placeholder="e.g. Schedule immediate migration sync"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Log Threat
                  </button>
                </div>
              </form>
            )}

            {/* List of threats */}
            {data.risks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-100 dark:border-gray-850 rounded-2xl">
                <HeartHandshake className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Excellent! No severe threats are currently logged.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.risks.map((risk) => {
                  const isMitigated = mitigatedRiskIds.includes(risk.id);
                  return (
                    <div
                      key={risk.id}
                      className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                        isMitigated
                          ? "bg-green-50/10 border-green-100/30 dark:border-green-950/20 opacity-55"
                          : risk.severity === "Critical"
                          ? "bg-red-50/20 dark:bg-red-950/10 border-red-100 dark:border-red-900/30"
                          : risk.severity === "High"
                          ? "bg-amber-50/20 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30"
                          : "bg-blue-50/20 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30"
                      }`}
                    >
                      <div>
                        {/* Severity Badge */}
                        <div className="flex justify-between items-center mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            isMitigated
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : risk.severity === "Critical"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : risk.severity === "High"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          }`}>
                            {isMitigated ? "Mitigated" : `${risk.severity} Severity`}
                          </span>

                          <button
                            onClick={() => toggleMitigateRisk(risk.id)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                              isMitigated
                                ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                            title={isMitigated ? "Re-open Risk" : "Mark as Mitigated"}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h3 className={`text-sm font-extrabold text-gray-900 dark:text-white mb-2 ${isMitigated && "line-through text-gray-400 dark:text-gray-500"}`}>
                          {risk.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-4">
                          {risk.description}
                        </p>
                      </div>

                      {/* Display individual Risk Identification Confidence if available */}
                      {risk.confidence && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 my-2">
                          AI Identification Confidence: <span className="font-bold text-indigo-500">{risk.confidence}%</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 dark:border-gray-850">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">
                          Mitigation Advice
                        </span>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-normal">
                          {risk.solution}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 9. AI Recommendations */}
        {(activeSection === "all" || activeSection === "recommendations") && (
          <div className="bg-white dark:bg-[#191b23] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm p-6 space-y-6 transition-all duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
              <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Advisory Recommendations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.recommendations?.map((rec) => {
                const isApplied = appliedRecIds.includes(rec.id);
                return (
                  <div
                    key={rec.id}
                    onClick={() => toggleApplyRec(rec.id)}
                    className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                      isApplied
                        ? "bg-green-50/10 border-green-100/30 dark:border-green-950/15 opacity-55"
                        : "bg-gray-50/50 dark:bg-[#1d202e] border-gray-100 dark:border-gray-800/60 hover:shadow-lg hover:-translate-y-1"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white dark:bg-[#12131a] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
                          {getRecIcon(rec.icon)}
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isApplied ? "bg-green-600 border-green-600 text-white" : "border-gray-300 dark:border-gray-600 group-hover:border-blue-500"
                        }`}>
                          {isApplied && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <h3 className={`text-sm font-extrabold text-gray-900 dark:text-white mb-2 ${isApplied && "line-through text-gray-400 dark:text-gray-500"}`}>
                        {rec.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-4">
                        {rec.description}
                      </p>
                    </div>

                    {/* Show advisory confidence rating */}
                    {rec.confidence && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 font-medium">
                        Advisory Confidence Score: <span className="font-bold text-[#004ac6] dark:text-[#b4c5ff]">{rec.confidence}%</span>
                      </div>
                    )}

                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline mt-2">
                      {isApplied ? "Recommendation Applied" : "Mark as Applied"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* 10. Sliding / Collapsible Right-Hand AI Chat Panel */}
      <aside className={`border-l border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#191b23] flex flex-col transition-all duration-300 flex-shrink-0 z-30 relative ${
        isChatOpen ? "w-full lg:w-96 border-l" : "w-0 overflow-hidden border-l-0"
      }`}>
        
        {/* Chat Panel Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-850/50">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 dark:text-white">
                ProjectPilot AI Assistant
              </h3>
            </div>
            {chatMode === "gemini" && (
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                ● Powered by Gemini (Fallback)
              </span>
            )}
            {chatMode === "lemma" && (
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ● Lemma Mode Active
              </span>
            )}
            {chatMode === "offline" && (
              <span className="text-[9px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                ● Offline Mode
              </span>
            )}
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
            title="Collapse AI Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Thread */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-210px)] min-h-[300px]">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold mb-1 px-1">
                {msg.sender === "user" ? "You" : "ProjectPilot AI"} • {msg.timestamp}
              </span>
              <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed font-sans ${
                msg.sender === "user"
                  ? "bg-[#004ac6] text-white rounded-tr-none"
                  : "bg-gray-100 dark:bg-[#20222f] text-gray-800 dark:text-gray-200 border border-gray-200/40 dark:border-gray-800/40 rounded-tl-none"
              }`}>
                {msg.sender === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-1.5 prose-xs prose prose-slate dark:prose-invert">
                    {renderMarkdownText(msg.text)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing bubble indicator */}
          {isTyping && (
            <div className="flex flex-col mr-auto items-start max-w-[85%]">
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold mb-1 px-1">
                ProjectPilot AI is compiling insights...
              </span>
              <div className="p-3 bg-gray-100 dark:bg-[#20222f] text-gray-500 rounded-2xl rounded-tl-none flex items-center gap-1.5 border border-gray-100 dark:border-gray-800">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {isChatAvailable !== false && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-850/10 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block">
              Suggested standup queries
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                disabled={isChatAvailable === null}
                onClick={() => handleSendMessage("What should I work on first?")}
                className="text-[10px] font-semibold bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-100/40 dark:border-blue-900/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                💡 What to work on first?
              </button>
              <button
                disabled={isChatAvailable === null}
                onClick={() => handleSendMessage("Which tasks are blocked?")}
                className="text-[10px] font-semibold bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-100/40 dark:border-amber-900/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                ⚠️ Which tasks are blocked?
              </button>
              <button
                disabled={isChatAvailable === null}
                onClick={() => handleSendMessage("Summarize project risk items.")}
                className="text-[10px] font-semibold bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-lg border border-red-100/40 dark:border-red-900/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                🔥 Critical risks summary
              </button>
              <button
                disabled={isChatAvailable === null}
                onClick={() => handleSendMessage("Who has the highest workload?")}
                className="text-[10px] font-semibold bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-100/40 dark:border-purple-900/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                📊 Who has highest workload?
              </button>
            </div>
          </div>
        )}

        {/* Input box */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#191b23]">
          <div className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
            isChatAvailable === false
              ? "bg-gray-100 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800/60 opacity-60 cursor-not-allowed"
              : "bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-800"
          }`}>
            <input
              type="text"
              disabled={isChatAvailable !== true}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                isChatAvailable === false
                  ? "Chat Assistant is offline..."
                  : isChatAvailable === null
                  ? "Connecting to Chat Assistant..."
                  : "Ask ProjectPilot AI..."
              }
              className="bg-transparent text-xs outline-none border-none text-gray-700 dark:text-gray-300 flex-grow px-2 py-1 disabled:cursor-not-allowed"
            />
            <button
              disabled={isChatAvailable !== true}
              onClick={() => handleSendMessage()}
              className="bg-[#004ac6] dark:bg-[#2563eb] text-white p-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* Floating trigger button when Chat Panel is collapsed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-[#004ac6] dark:bg-[#2563eb] hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer flex items-center justify-center gap-2"
          title="Open AI Assistant Chat"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold pr-1">Ask AI Assistant</span>
        </button>
      )}

    </div>
  );
}
