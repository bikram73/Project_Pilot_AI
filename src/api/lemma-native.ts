import { ProjectData } from "../types";
import { createSemanticAnalysis } from "./lemma-native-improved";

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
  // Use the new semantic analysis instead of the old line-by-line parsing
  return createSemanticAnalysis(payload, onStatusUpdate);
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