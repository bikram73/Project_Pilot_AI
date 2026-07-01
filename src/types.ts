export interface Task {
  id: string;
  name: string;
  owner: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  category: string;
  status: "Pending" | "Todo" | "In Progress" | "Backlog";
  sourceEvidence?: string;      // Snippet from the text where this task was found
  confidence?: number;          // AI Confidence level (e.g. 98)
  dependencies?: string[];      // Other tasks/conditions it depends on
  missingInfo?: string;         // Identified missing info (e.g. "Missing owner")
  suggestedAction?: string;     // Suggested immediate action to resolve missing info
}

export interface Risk {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  solution: string;
  confidence?: number;          // AI Risk identification confidence
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: string; // e.g. "speed", "group_add", "schedule", "task_alt", "build", "priority_high"
  confidence?: number;          // AI Advisory confidence
}

export interface MissingInfoAlert {
  id: string;
  targetType: "task" | "risk" | "project";
  targetName: string;
  severity: "Warning" | "Info";
  description: string;
  suggestedAction: string;
}

export interface ProjectData {
  projectTitle: string;
  projectSummary: string;
  estimatedCompletion: string;  // Overall target date estimated by AI
  aiConfidenceOverall: number;  // Overall operational confidence percentage
  blockedTasksCount: number;    // Number of tasks with blockers
  dependenciesCount: number;    // Number of total dependencies identified
  objectives: string[];
  keyDeliverables: string[];
  tasks: Task[];
  risks: Risk[];
  recommendations: Recommendation[];
  missingInfoAlerts?: MissingInfoAlert[]; // General list of missing info warnings
  _analysisMode?: "lemma" | "gemini";     // Tracks whether Lemma or Gemini produced this data
  _lemmaError?: string;                    // If Gemini fallback, records the original Lemma error
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
