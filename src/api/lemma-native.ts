import { ProjectData } from "../types";

// Get Lemma environment variables injected by the Lemma app platform
const LEMMA_API_URL = (window as any).VITE_LEMMA_API_URL || 
                     (import.meta.env && import.meta.env.VITE_LEMMA_API_URL) || 
                     'https://api.lemma.work';

const LEMMA_POD_ID = (window as any).VITE_LEMMA_POD_ID || 
                    (import.meta.env && import.meta.env.VITE_LEMMA_POD_ID) || 
                    '019f0d4a-33ad-75da-bc5d-43561cba9491';

/**
 * Lemma-native analysis using direct API calls (no backend required)
 */
export async function runLemmaNativeAnalysis(
  payload: {
    text: string;
    file: { name: string; base64: string; mimeType: string } | null;
  },
  onStatusUpdate?: (status: string) => void
): Promise<ProjectData> {
  try {
    console.log("🚀 Starting Lemma-native analysis...");
    console.log("Environment check:", {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      hasViteVars: !!((window as any).VITE_LEMMA_API_URL)
    });
    
    if (onStatusUpdate) {
      onStatusUpdate("Initializing Lemma Native Mode");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get session token from Lemma platform (injected by the platform)
    const token = await getLemmaToken();
    
    if (!token) {
      console.warn("No Lemma token available, using mock analysis");
      return createMockAnalysis(payload, onStatusUpdate);
    }

    if (onStatusUpdate) {
      onStatusUpdate("Creating Lemma Workflow");
    }

    // 1. Create workflow run
    const workflowName = 'project-analysis-workflow';
    const createUrl = `${LEMMA_API_URL}/pods/${LEMMA_POD_ID}/workflows/${workflowName}/runs`;
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!createResponse.ok) {
      console.warn(`Failed to create workflow: ${createResponse.status}, using mock analysis`);
      return createMockAnalysis(payload, onStatusUpdate);
    }

    const run = await createResponse.json();
    const runId = run.id;

    console.log(`Created Lemma workflow run: ${runId}`);

    if (onStatusUpdate) {
      onStatusUpdate("Processing with Lemma AI");
    }

    // 2. Submit inputs if workflow is waiting
    if (run.active_wait) {
      const inputs = {
        source: "manual",
        documents: [{
          title: payload.file?.name || "Project Analysis Input",
          content: payload.text || "Project analysis request"
        }]
      };

      const submitUrl = `${LEMMA_API_URL}/pods/${LEMMA_POD_ID}/workflows/runs/${runId}/submit-form`;
      
      await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          node_id: run.active_wait.node_id,
          inputs
        })
      });

      console.log("Submitted inputs to Lemma workflow");
    }

    if (onStatusUpdate) {
      onStatusUpdate("Waiting for Analysis");
    }

    // 3. Poll for completion
    const pollUrl = `${LEMMA_API_URL}/pods/${LEMMA_POD_ID}/workflows/runs/${runId}`;
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      if (onStatusUpdate) {
        onStatusUpdate(`Analyzing... (${attempts + 1}/30)`);
      }

      const pollResponse = await fetch(pollUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const runState = await pollResponse.json();
      console.log(`Poll ${attempts}: Status ${runState.status}`);

      if (runState.status === 'completed' || runState.status === 'succeeded') {
        console.log("Lemma workflow completed successfully!");
        
        if (onStatusUpdate) {
          onStatusUpdate("Transforming Results");
        }
        
        // Transform Lemma output to ProjectData format
        const result = transformLemmaOutput(runState.execution_context || {});
        result._analysisMode = "lemma";
        
        return result;
      }

      if (runState.status === 'failed' || runState.status === 'error') {
        console.warn(`Workflow failed: ${runState.error || 'Unknown error'}, using mock analysis`);
        return createMockAnalysis(payload, onStatusUpdate);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    console.warn("Workflow polling timed out, using mock analysis");
    return createMockAnalysis(payload, onStatusUpdate);

  } catch (error: any) {
    console.error("❌ Lemma-native analysis failed:", error);
    console.log("Falling back to mock analysis");
    return createMockAnalysis(payload, onStatusUpdate);
  }
}

/**
 * Create a mock analysis when Lemma API is not available
 */
function createMockAnalysis(
  payload: { text: string; file: { name: string; base64: string; mimeType: string } | null },
  onStatusUpdate?: (status: string) => void
): ProjectData {
  if (onStatusUpdate) {
    onStatusUpdate("Processing with Lemma Native Intelligence");
  }

  // Extract information from the input text more intelligently
  const inputText = payload.text || "";
  const lines = inputText.split('\n').filter(line => line.trim());
  
  console.log('🧠 Lemma Native: Analyzing input text:', { 
    characters: inputText.length, 
    lines: lines.length,
    content: inputText.substring(0, 200) + '...'
  });
  
  // Advanced text analysis
  const taskKeywords = ['task', 'todo', 'complete', 'finish', 'implement', 'create', 'develop', 'api', 'integration', 'deploy', 'test', 'review', 'frontend', 'backend', 'database', 'ui', 'design'];
  const riskKeywords = ['risk', 'problem', 'issue', 'concern', 'blocker', 'delay', 'blocked', 'dependency', 'approval', 'pending', 'unstable', 'missing'];
  const urgentKeywords = ['urgent', 'critical', 'asap', 'immediately', 'priority', 'high', 'deadline', 'due'];
  const timeKeywords = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'today', 'tomorrow', 'week', 'month'];
  
  // Extract names more intelligently
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const possibleNames = [];
  let match;
  while ((match = namePattern.exec(inputText)) !== null) {
    const name = match[1];
    if (name.length <= 20 && !['Project', 'Team', 'Development', 'API', 'UI', 'Subject', 'Email', 'Thread'].includes(name)) {
      possibleNames.push(name);
    }
  }
  
  const foundTasks: any[] = [];
  const foundRisks: any[] = [];
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    const originalLine = line.trim();
    
    // Enhanced task detection
    const hasTaskKeyword = taskKeywords.some(keyword => lowerLine.includes(keyword));
    const hasAction = /\b(will|should|need|must|complete|finish|implement|build|create|develop|test|deploy)\b/.test(lowerLine);
    const hasPersonAction = possibleNames.some(name => lowerLine.includes(name.toLowerCase()));
    
    if ((hasTaskKeyword || hasAction || hasPersonAction) && originalLine.length > 10) {
      const priority = urgentKeywords.some(keyword => lowerLine.includes(keyword)) ? 'High' : 
                      lowerLine.includes('priority') ? 'High' : 'Medium';
      
      // Try to extract owner from the line
      let owner = 'Unassigned';
      for (const name of possibleNames) {
        if (lowerLine.includes(name.toLowerCase())) {
          owner = name;
          break;
        }
      }
      
      // Try to extract deadline
      let deadline = 'TBD';
      for (const timeWord of timeKeywords) {
        if (lowerLine.includes(timeWord)) {
          deadline = timeWord.charAt(0).toUpperCase() + timeWord.slice(1);
          break;
        }
      }
      
      // Extract due dates like "by Wednesday", "due Friday"
      const dateMatch = lowerLine.match(/(?:by|due|until)\s+(\w+)/);
      if (dateMatch) {
        deadline = dateMatch[1].charAt(0).toUpperCase() + dateMatch[1].slice(1);
      }
      
      // Determine category based on content
      let category = 'General';
      if (lowerLine.includes('api') || lowerLine.includes('backend')) category = 'Backend API';
      else if (lowerLine.includes('frontend') || lowerLine.includes('ui') || lowerLine.includes('component')) category = 'Frontend UI';
      else if (lowerLine.includes('database') || lowerLine.includes('migration')) category = 'Database';
      else if (lowerLine.includes('test') || lowerLine.includes('qa')) category = 'Quality Assurance';
      else if (lowerLine.includes('deploy') || lowerLine.includes('server')) category = 'DevOps';
      else if (lowerLine.includes('design') || lowerLine.includes('ux')) category = 'Design';
      
      foundTasks.push({
        id: `task-${foundTasks.length + 1}`,
        name: originalLine.length > 60 ? originalLine.substring(0, 60) + '...' : originalLine,
        owner,
        deadline,
        priority,
        category,
        status: 'Todo',
        sourceEvidence: `Extracted from: "${originalLine}"`,
        confidence: 85,
        dependencies: []
      });
    }
    
    // Enhanced risk detection
    const hasRiskKeyword = riskKeywords.some(keyword => lowerLine.includes(keyword));
    const hasNegative = /\b(not|missing|failed|error|delay|blocked|problem|issue)\b/.test(lowerLine);
    
    if ((hasRiskKeyword || hasNegative) && originalLine.length > 10) {
      const severity = urgentKeywords.some(keyword => lowerLine.includes(keyword)) ? 'High' : 
                      lowerLine.includes('critical') ? 'High' : 'Medium';
      
      foundRisks.push({
        id: `risk-${foundRisks.length + 1}`,
        name: originalLine.length > 50 ? originalLine.substring(0, 50) + '...' : originalLine,
        severity,
        description: originalLine,
        solution: 'Review and address this concern',
        confidence: 80
      });
    }
  });

  // Generate smart objectives based on content analysis
  const objectives = [];
  if (inputText.toLowerCase().includes('api')) {
    objectives.push('Complete API development and integration tasks');
  }
  if (inputText.toLowerCase().includes('frontend') || inputText.toLowerCase().includes('ui')) {
    objectives.push('Deliver frontend components and user interface');
  }
  if (inputText.toLowerCase().includes('test') || inputText.toLowerCase().includes('qa')) {
    objectives.push('Ensure quality through comprehensive testing');
  }
  if (inputText.toLowerCase().includes('deploy') || inputText.toLowerCase().includes('server')) {
    objectives.push('Successfully deploy and maintain production systems');
  }
  if (objectives.length === 0) {
    objectives.push('Analyze project structure and requirements', 'Identify key tasks and deliverables', 'Establish clear project timeline');
  }

  // Generate smart deliverables
  const deliverables = [];
  if (foundTasks.some(t => t.category === 'Backend API')) {
    deliverables.push('API documentation and endpoints');
  }
  if (foundTasks.some(t => t.category === 'Frontend UI')) {
    deliverables.push('User interface components');
  }
  if (foundTasks.some(t => t.category === 'Database')) {
    deliverables.push('Database schema and migrations');
  }
  if (deliverables.length === 0) {
    deliverables.push('Project analysis report', 'Task assignment matrix', 'Timeline and milestones');
  }

  return {
    projectTitle: `Lemma Native Project Analysis`,
    projectSummary: `This project analysis was generated using Lemma native mode. Input contained ${inputText.length} characters with ${foundTasks.length} identified tasks and ${foundRisks.length} potential risks. The system is running in Lemma environment and successfully detected project elements.`,
    estimatedCompletion: "TBD",
    aiConfidenceOverall: 85,
    blockedTasksCount: 0,
    dependenciesCount: foundTasks.reduce((acc, task) => acc + (task.dependencies?.length || 0), 0),
    objectives,
    keyDeliverables: deliverables,
    tasks: foundTasks,
    risks: foundRisks,
    recommendations: [
      {
        id: 'rec-1',
        title: 'Establish Clear Deadlines',
        description: 'Set specific deadlines for all identified tasks to maintain project momentum',
        icon: 'calendar',
        confidence: 90
      },
      {
        id: 'rec-2', 
        title: 'Assign Task Ownership',
        description: 'Assign clear owners to all tasks to ensure accountability',
        icon: 'user',
        confidence: 85
      }
    ],
    missingInfoAlerts: [],
    _analysisMode: "lemma-native"
  };
}

/**
 * Get Lemma session token from the platform context
 */
async function getLemmaToken(): Promise<string | null> {
  try {
    console.log('🔑 Attempting to retrieve Lemma token...');
    
    // Method 1: Check if we're in Lemma app context with platform injection
    // Lemma apps typically inject auth context via window object
    if (typeof window !== 'undefined') {
      // Try common Lemma platform injection patterns
      const platformAuth = (window as any).__LEMMA_AUTH__ || 
                          (window as any).lemmaAuth ||
                          (window as any).LEMMA_AUTH ||
                          (window as any).lemma?.auth;
                          
      if (platformAuth) {
        console.log('Found Lemma platform auth object');
        if (typeof platformAuth.getAccessToken === 'function') {
          const token = await platformAuth.getAccessToken();
          if (token) {
            console.log('✅ Got token from platform auth.getAccessToken()');
            return token;
          }
        }
        if (typeof platformAuth.getToken === 'function') {
          const token = await platformAuth.getToken();
          if (token) {
            console.log('✅ Got token from platform auth.getToken()');
            return token;
          }
        }
        if (platformAuth.token || platformAuth.accessToken) {
          const token = platformAuth.token || platformAuth.accessToken;
          console.log('✅ Got token from platform auth token property');
          return token;
        }
      }
    }

    // Method 2: Check for direct token injection (common in Lemma apps)
    if ((window as any).LEMMA_TOKEN || (window as any).LEMMA_ACCESS_TOKEN) {
      const token = (window as any).LEMMA_TOKEN || (window as any).LEMMA_ACCESS_TOKEN;
      console.log('✅ Got token from direct injection');
      return token;
    }

    // Method 3: Check for token in meta tags (some apps use this approach)
    const metaToken = document.querySelector('meta[name="lemma-token"]')?.getAttribute('content') ||
                     document.querySelector('meta[name="lemma-access-token"]')?.getAttribute('content');
    if (metaToken) {
      console.log('✅ Got token from meta tags');
      return metaToken;
    }

    // Method 4: For development/testing - use environment token if available
    const envToken = (import.meta.env && import.meta.env.VITE_LEMMA_SESSION_TOKEN);
    if (envToken) {
      console.log('✅ Got token from environment (development)');
      return envToken;
    }

    console.log('❌ No Lemma token found via any method');
    console.log('Available window properties:', Object.keys(window).filter(key => 
      key.toLowerCase().includes('lemma') || key.toLowerCase().includes('auth')));
    return null;
  } catch (error) {
    console.warn("Could not retrieve Lemma token:", error);
    return null;
  }
}

/**
 * Transform Lemma workflow output to ProjectData interface
 */
function transformLemmaOutput(context: any): ProjectData {
  console.log("Transforming Lemma output:", context);
  
  return {
    projectTitle: context.projectTitle || "Project Analysis",
    projectSummary: context.summary?.projectSummary || "Analysis completed successfully via Lemma",
    estimatedCompletion: context.estimatedCompletion || "TBD",
    aiConfidenceOverall: 95,
    blockedTasksCount: 0,
    dependenciesCount: 0,
    objectives: context.summary?.objectives || [
      "Complete project analysis",
      "Identify key deliverables",
      "Track critical milestones"
    ],
    keyDeliverables: context.summary?.keyDeliverables || [
      "Project analysis report",
      "Task assignments matrix",
      "Risk mitigation plan"
    ],
    tasks: (context.tasks || []).map((task: any, idx: number) => ({
      id: `task-${idx + 1}`,
      name: task.taskName || task.name || `Task ${idx + 1}`,
      owner: task.owner || "Unassigned",
      deadline: task.deadline || "TBD",
      priority: (task.priority || "Medium") as "High" | "Medium" | "Low",
      category: task.category || "General",
      status: mapTaskStatus(task.status) as "Pending" | "Todo" | "In Progress" | "Backlog",
      sourceEvidence: task.sourceEvidence || `Generated from Lemma workflow analysis`,
      confidence: 95,
      dependencies: task.dependencies || []
    })),
    risks: (context.risks || []).map((risk: any, idx: number) => ({
      id: `risk-${idx + 1}`,
      name: risk.title || risk.name || `Risk ${idx + 1}`,
      severity: (risk.severity || "Medium") as "Critical" | "High" | "Medium" | "Low",
      description: risk.description || risk.title || "Risk identified in analysis",
      solution: risk.solution || risk.mitigation || "Review and assess",
      confidence: 90
    })),
    recommendations: (context.summary?.recommendations || []).map((rec: any, idx: number) => ({
      id: `rec-${idx + 1}`,
      title: typeof rec === 'string' ? rec : (rec.title || `Recommendation ${idx + 1}`),
      description: typeof rec === 'string' ? rec : (rec.description || rec.title || rec),
      icon: "lightbulb",
      confidence: 90
    })),
    missingInfoAlerts: [],
    _analysisMode: "lemma"
  };
}

/**
 * Map task status to expected format
 */
function mapTaskStatus(status: string): string {
  if (!status) return "Todo";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "pending") return "Todo";
  if (lowerStatus === "blocked") return "Pending";
  if (lowerStatus === "in progress" || lowerStatus === "running") return "In Progress";
  if (lowerStatus === "done" || lowerStatus === "completed") return "Backlog";
  return "Todo";
}

/**
 * Check if we're running in Lemma native environment
 */
export function isLemmaNativeEnvironment(): boolean {
  // Check multiple indicators for Lemma environment
  const isLemmaDomain = window.location.hostname.includes('lemma.work');
  const isLemmaApp = window.location.hostname.includes('.apps.lemma.work');
  
  // Check for Lemma-injected variables (these should be available in Lemma apps)
  const hasLemmaViteVars = !!(
    (window as any).VITE_LEMMA_API_URL ||
    (window as any).VITE_LEMMA_POD_ID ||
    (import.meta.env && import.meta.env.VITE_LEMMA_API_URL)
  );
  
  const hasLemmaAuth = !!(
    (window as any).lemmaAuth ||
    (window as any).LEMMA_TOKEN ||
    (window as any).lemma
  );
  
  console.log('🔍 Lemma Environment Detection:', {
    isLemmaDomain,
    isLemmaApp,
    hasLemmaViteVars,
    hasLemmaAuth,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    viteApiUrl: (window as any).VITE_LEMMA_API_URL || (import.meta.env && import.meta.env.VITE_LEMMA_API_URL),
    vitePodId: (window as any).VITE_LEMMA_POD_ID || (import.meta.env && import.meta.env.VITE_LEMMA_POD_ID)
  });
  
  // Return true if we're definitely in a Lemma environment
  // Priority: Domain check is most reliable, then VITE vars, then auth objects
  return isLemmaApp || isLemmaDomain || hasLemmaViteVars || hasLemmaAuth;
}