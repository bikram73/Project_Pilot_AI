import { 
  LemmaClient, 
  isTerminalFlowStatus, 
  normalizeRunStatus, 
  AgentController, 
  selectAgentOutputs, 
  type WorkflowRunResponse 
} from "lemma-sdk";
import fs from "fs";
import path from "path";

const PERSIST_FILE = path.join(process.cwd(), "latest_analysis.json");

const DEFAULT_PROJECT = {
  projectTitle: "Horizon Phase 2 Rollout",
  projectSummary: "The 'Horizon Phase 2' project is currently operating at 85% operational efficiency. Our AI analysis suggests a minor bottleneck in the payment integration workflow, primarily due to pending client sandbox keys. Overall team velocity has increased by 12% in the last sprint. We recommend prioritizing API Schema finalization to avoid cascading delay in front-end implementation.",
  estimatedCompletion: "Nov 15, 2026",
  aiConfidenceOverall: 96,
  blockedTasksCount: 2,
  dependenciesCount: 3,
  objectives: [
    "Deliver the new secure authentication and registration client system.",
    "Upgrade dashboard layout to a highly responsive and high-density Bento Grid design.",
    "Implement automated backend database schema migrations with zero downtime.",
    "Incorporate secure third-party payment options with Stripe API keys."
  ],
  keyDeliverables: [
    "API Security Protocol documents.",
    "Responsive Bento-style React dashboard UI.",
    "Tested Database Migration CJS scripts.",
    "Fully integrated Stripe checkouts."
  ],
  tasks: [
    {
      id: "task-1",
      name: "Finalize API Security Protocols",
      owner: "Sarah D.",
      deadline: "Oct 24",
      priority: "High",
      category: "Core / Backend",
      status: "In Progress",
      sourceEvidence: "Sarah needs to finalize the security layer for backend routes by October 24th.",
      confidence: 98,
      dependencies: []
    },
    {
      id: "task-2",
      name: "Update Dashboard Bento Layout",
      owner: "Ananya",
      deadline: "Oct 28",
      priority: "Medium",
      category: "UI/UX Revamp",
      status: "Todo",
      sourceEvidence: "Ananya is scheduled to implement the Bento-style dashboard layout by Oct 28.",
      confidence: 95,
      dependencies: ["Finalize API Security Protocols"]
    },
    {
      id: "task-3",
      name: "Database Migration Script",
      owner: "Sarah D.",
      deadline: "Nov 2",
      priority: "Medium",
      category: "Core / Backend",
      status: "Todo",
      sourceEvidence: "Sarah will build the rollback migrations and checkouts by November 2.",
      confidence: 91,
      dependencies: []
    }
  ],
  risks: [
    {
      id: "risk-1",
      name: "Stripe API Key Delay",
      severity: "High",
      description: "Pending production sandbox keys from client can block the main payment integration rollout.",
      solution: "Engage the product owner immediately to obtain development sandbox credentials.",
      confidence: 94
    },
    {
      id: "risk-2",
      name: "Database Migration Incompatibility",
      severity: "Medium",
      description: "Legacy relational schemas might conflict with automated index generation.",
      solution: "Dry-run the scripts against a staging PostgreSQL duplicate environment.",
      confidence: 89
    }
  ],
  recommendations: [
    {
      id: "rec-1",
      title: "API Schema Lock",
      description: "Perform an early joint API lock review between frontend and backend engineers to guarantee compatibility.",
      icon: "speed",
      confidence: 97
    },
    {
      id: "rec-2",
      title: "PostgreSQL Dry Run",
      description: "Create a docker database setup to replicate production and perform rollback mock-up migrations.",
      icon: "build",
      confidence: 92
    }
  ],
  missingInfoAlerts: [
    {
      id: "alert-1",
      targetType: "project",
      targetName: "Horizon Phase 2 Rollout",
      severity: "Warning",
      description: "No specific deadline found for the secure frontend login integration.",
      suggestedAction: "Confirm dates with front-end lead during tomorrow's sync."
    }
  ]
};

// In-memory storage for workflow run tracking (in production, use Redis or database)
const activeWorkflows = new Map<string, { 
  status: string; 
  startTime: number; 
  payload: any;
  result?: any;
  error?: string;
}>();

// In-memory cache of the latest analysis
let cachedProjectData: any = null;

/**
 * Starts a Lemma workflow asynchronously and returns the run ID immediately (fire-and-forget)
 */
export async function startWorkflowAsync(payload: {
  source?: string;
  documents?: Array<{ title: string; content: string }>;
}): Promise<string> {
  const client = getLemmaClient();
  const workflowName = process.env.LEMMA_WORKFLOW || "project-analysis-workflow";

  console.log(`[Lemma Async Start] Initiating workflow: ${workflowName}`);

  // 1. Create Run
  const run = await client.workflows.runs.create(workflowName);
  const runId = run.id;
  
  // Store in tracking map
  activeWorkflows.set(runId, {
    status: "STARTING",
    startTime: Date.now(),
    payload
  });

  console.log(`[Lemma Async Start] Created run ID: ${runId}`);

  // 2. Start async processing (don't wait)
  processWorkflowAsync(runId, run, payload).catch(err => {
    console.error(`[Lemma Async Error] Run ${runId} failed:`, err);
    activeWorkflows.set(runId, {
      status: "FAILED",
      startTime: activeWorkflows.get(runId)?.startTime || Date.now(),
      payload,
      error: err.message
    });
  });

  return runId;
}

/**
 * Process the workflow asynchronously in the background
 */
async function processWorkflowAsync(runId: string, run: any, payload: any) {
  try {
    console.log(`[Lemma Async Process] Processing run ${runId}`);
    
    // Update status
    activeWorkflows.set(runId, {
      status: "SUBMITTING",
      startTime: activeWorkflows.get(runId)?.startTime || Date.now(),
      payload
    });

    const activeWait = run.active_wait;
    if (!activeWait) {
      throw new Error("The Lemma workflow did not open with an input form block.");
    }

    const client = getLemmaClient();

    // Submit form inputs
    const inputs: Record<string, any> = {};
    if (payload.source) inputs.source = payload.source;
    if (payload.documents) inputs.documents = payload.documents;

    console.log(`[Lemma Async Process] Submitting inputs for run ${runId}`);
    await client.workflows.runs.submitForm(runId, {
      node_id: activeWait.node_id,
      inputs,
    });

    // Update status
    activeWorkflows.set(runId, {
      status: "RUNNING",
      startTime: activeWorkflows.get(runId)?.startTime || Date.now(),
      payload
    });

    // Poll for completion (with longer timeout since it's async)
    console.log(`[Lemma Async Process] Polling run ${runId}`);
    const maxAttempts = 180; // 3 minutes for async processing
    let attempts = 0;

    while (attempts < maxAttempts) {
      const pollState = await client.workflows.runs.get(runId);
      const isTerminal = isTerminalFlowStatus(pollState.status);
      const normalized = normalizeRunStatus(pollState.status);

      console.log(`[Lemma Async Poll ${attempts}] Run ${runId} status: ${normalized}`);

      if (isTerminal) {
        if (normalized === "COMPLETED" || normalized === "SUCCEEDED") {
          const output = extractOutput(pollState);
          const transformedOutput = transformLemmaOutput(output);
          transformedOutput._analysisMode = "lemma";
          
          // Store result
          activeWorkflows.set(runId, {
            status: "COMPLETED",
            startTime: activeWorkflows.get(runId)?.startTime || Date.now(),
            payload,
            result: transformedOutput
          });

          // Also persist to file for backup
          persistAnalysis(transformedOutput);

          console.log(`[Lemma Async Complete] Run ${runId} completed successfully`);
          return;
        } else {
          throw new Error(`Workflow failed with status: ${normalized}. Error: ${pollState.error || "Unknown"}`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error("Async workflow polling timed out");

  } catch (error: any) {
    console.error(`[Lemma Async Error] Run ${runId}:`, error);
    activeWorkflows.set(runId, {
      status: "FAILED",
      startTime: activeWorkflows.get(runId)?.startTime || Date.now(),
      payload,
      error: error.message
    });
  }
}

/**
 * Get the status of a workflow run
 */
export async function getWorkflowStatus(runId: string): Promise<{
  runId: string;
  status: string;
  elapsed: number;
  result?: any;
  error?: string;
}> {
  const workflow = activeWorkflows.get(runId);
  
  if (!workflow) {
    // Try to check with Lemma directly
    try {
      const client = getLemmaClient();
      const run = await client.workflows.runs.get(runId);
      const normalized = normalizeRunStatus(run.status);
      
      return {
        runId,
        status: normalized,
        elapsed: 0,
        result: normalized === "COMPLETED" ? extractOutput(run) : undefined
      };
    } catch (err) {
      return {
        runId,
        status: "NOT_FOUND",
        elapsed: 0,
        error: "Workflow run not found"
      };
    }
  }

  const elapsed = Date.now() - workflow.startTime;

  return {
    runId,
    status: workflow.status,
    elapsed: Math.floor(elapsed / 1000),
    result: workflow.result,
    error: workflow.error
  };
}

// Active Chat Conversation ID
let activeConversationId: string | null = null;

// Initialize Lemma Client safely on the server side
let lemmaClientInstance: LemmaClient | null = null;

function getLemmaClient(): LemmaClient {
  if (!lemmaClientInstance) {
    const apiOrigin = process.env.LEMMA_API_URL || "https://api.lemma.work";
    const podId = process.env.LEMMA_POD_ID || "019f0d4a-33ad-75da-bc5d-43561cba9491";
    const sessionToken = process.env.LEMMA_SESSION_TOKEN;

    console.log(`[Lemma Server Service] Initializing with API URL: ${apiOrigin}, Pod: ${podId}`);
    
    lemmaClientInstance = new LemmaClient({
      apiUrl: apiOrigin,
      podId: podId,
    });

    if (sessionToken) {
      console.log("[Lemma Server Service] Injecting Bearer session token into LemmaClient.");
      (lemmaClientInstance.auth as any).injectedToken = sessionToken;
    } else {
      console.warn("[Lemma Server Service] WARNING: LEMMA_SESSION_TOKEN is missing in server environment variables.");
    }
  }
  return lemmaClientInstance;
}

/**
 * Load the latest saved analysis from file or fallback to memory / defaults.
 */
export function getLatestAnalysis(): any {
  if (cachedProjectData) {
    return cachedProjectData;
  }

  try {
    if (fs.existsSync(PERSIST_FILE)) {
      const dataStr = fs.readFileSync(PERSIST_FILE, "utf-8");
      cachedProjectData = JSON.parse(dataStr);
      console.log("[Lemma Service] Successfully loaded latest analysis from file persistence.");
      return cachedProjectData;
    }
  } catch (err) {
    console.warn("[Lemma Service] Could not load persisted analysis file:", err);
  }

  cachedProjectData = DEFAULT_PROJECT;
  return cachedProjectData;
}

/**
 * Persists the analyzed project data to file and memory.
 */
export function persistAnalysis(data: any): void {
  cachedProjectData = data;
  try {
    fs.writeFileSync(PERSIST_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("[Lemma Service] Persisted latest analysis results successfully to file:", PERSIST_FILE);
  } catch (err) {
    console.error("[Lemma Service] Error writing persistence file:", err);
  }
}

/**
 * Retrieves the tasks list from the latest analysis.
 */
export async function getTasks(): Promise<any[]> {
  const data = getLatestAnalysis();
  return data.tasks || [];
}

/**
 * Retrieves the risks list from the latest analysis.
 */
export async function getRisks(): Promise<any[]> {
  const data = getLatestAnalysis();
  return data.risks || [];
}

/**
 * Retrieves the latest project summary.
 */
export async function getSummary(): Promise<any> {
  const data = getLatestAnalysis();
  return {
    projectTitle: data.projectTitle || "Project Overview",
    projectSummary: data.projectSummary || "No summary available.",
    estimatedCompletion: data.estimatedCompletion || "TBD",
    aiConfidenceOverall: data.aiConfidenceOverall || 100,
    blockedTasksCount: data.blockedTasksCount || 0,
    dependenciesCount: data.dependenciesCount || 0,
    objectives: data.objectives || [],
    keyDeliverables: data.keyDeliverables || []
  };
}

/**
 * Extract structured outputs from the completed run context.
 */
function extractOutput(run: WorkflowRunResponse): any {
  if (!run || !run.execution_context) {
    throw new Error("Invalid run or missing execution context from workflow.");
  }

  const ctx = run.execution_context as Record<string, any>;

  if (ctx.projectTitle || ctx.tasks) {
    return ctx;
  }

  for (const key of Object.keys(ctx)) {
    const value = ctx[key];
    if (value && typeof value === "object") {
      if (value.projectTitle || value.tasks) {
        return value;
      }
    }
  }

  return ctx;
}

/**
 * Runs the full server-side Lemma Workflow run, input submission, and polling.
 */
export async function runWorkflow(payload: {
  source?: string;
  documents?: Array<{ title: string; content: string }>;
  // Legacy support
  text?: string;
  file?: { name: string; base64: string; mimeType: string } | null;
}): Promise<any> {
  const client = getLemmaClient();
  const workflowName = process.env.LEMMA_WORKFLOW || "project-analysis-workflow";
  const podId = process.env.LEMMA_POD_ID || "019f0d4a-33ad-75da-bc5d-43561cba9491";

  console.log(`[Lemma Workflow Start] Initiating workflow name: ${workflowName}, Pod: ${podId}`);
  const startTime = Date.now();

  // 1. Create Run
  const run = await client.workflows.runs.create(workflowName);
  const runId = run.id;
  console.log(`[Lemma Workflow Created] Run ID: ${runId}`);

  const activeWait = run.active_wait;
  if (!activeWait) {
    throw new Error("The Lemma workflow did not open with an input form block.");
  }

  // 2. Submit form inputs
  const inputs: Record<string, any> = {};
  if (payload.source) {
    inputs.source = payload.source;
  }
  if (payload.documents) {
    inputs.documents = payload.documents;
  }
  
  // Legacy support for old format (fallback)
  if (payload.text) {
    inputs.text = payload.text;
  }
  if (payload.file) {
    inputs.file = payload.file;
  }

  console.log(`[Lemma Workflow Submitting] Submitting inputs to node: ${activeWait.node_id}`);
  await client.workflows.runs.submitForm(runId, {
    node_id: activeWait.node_id,
    inputs,
  });

  // 3. Poll run until completed (optimized for serverless)
  console.log(`[Lemma Workflow Polling] Polling run status for ID: ${runId}`);
  const maxAttempts = 40; // 40 seconds maximum for serverless compatibility
  let attempts = 0;
  let finalRunState: WorkflowRunResponse | null = null;

  while (attempts < maxAttempts) {
    const pollState = await client.workflows.runs.get(runId);
    const isTerminal = isTerminalFlowStatus(pollState.status);
    const normalized = normalizeRunStatus(pollState.status);

    console.log(`[Lemma Workflow Poll ${attempts}] Status is: ${normalized}`);

    if (isTerminal) {
      if (normalized === "COMPLETED" || normalized === "SUCCEEDED") {
        finalRunState = pollState;
        break;
      } else {
        throw new Error(`Workflow run failed with terminal status: ${normalized}. Error: ${pollState.error || "Unknown"}`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every 1 second
    attempts++;
  }

  if (!finalRunState) {
    // For serverless environments, save the run ID and throw a specific error
    console.warn(`[Lemma Workflow] Polling timed out after ${maxAttempts}s for run ${runId}. Workflow may still be completing.`);
    throw new Error(`LEMMA_TIMEOUT:${runId}`);
  }

  const executionTime = Date.now() - startTime;
  console.log(`[Lemma Workflow Success] Run completed in ${executionTime}ms. Run ID: ${runId}`);

  // 4. Extract output JSON
  const output = extractOutput(finalRunState);
  const transformedOutput = transformLemmaOutput(output);
  return transformedOutput;
}

/**
 * Transform Lemma workflow output to match the frontend ProjectData interface
 */
function transformLemmaOutput(lemmaData: any): any {
  if (!lemmaData) return lemmaData;

  const transformed = {
    projectTitle: "Project Analysis", // Default title
    projectSummary: lemmaData.summary?.projectSummary || "Analysis completed successfully",
    estimatedCompletion: "TBD",
    aiConfidenceOverall: 95,
    blockedTasksCount: 0,
    dependenciesCount: 0,
    objectives: lemmaData.summary?.objectives || [],
    keyDeliverables: [],
    tasks: (lemmaData.tasks || []).map((task: any, idx: number) => ({
      id: `task-${idx + 1}`,
      name: task.taskName || task.name || `Task ${idx + 1}`,
      owner: task.owner || "Unassigned",
      deadline: task.deadline || "TBD",
      priority: capitalizeFirst(task.priority) || "Medium",
      category: "General",
      status: mapStatus(task.status) || "Todo",
      sourceEvidence: `Generated from project analysis`,
      confidence: 95
    })),
    risks: (lemmaData.risks || []).map((risk: any, idx: number) => ({
      id: `risk-${idx + 1}`,
      name: risk.title || risk.name || `Risk ${idx + 1}`,
      severity: capitalizeFirst(risk.severity) || "Medium",
      description: risk.title || risk.description || "",
      solution: risk.mitigation || risk.solution || "Review and assess",
      confidence: 90
    })),
    recommendations: (lemmaData.summary?.recommendations || []).map((rec: any, idx: number) => ({
      id: `rec-${idx + 1}`,
      title: typeof rec === 'string' ? rec : (rec.title || `Recommendation ${idx + 1}`),
      description: typeof rec === 'string' ? rec : (rec.description || rec),
      icon: "lightbulb",
      confidence: 90
    })),
    missingInfoAlerts: [],
    _analysisMode: "lemma"
  };

  // Count blocked tasks
  transformed.blockedTasksCount = transformed.tasks.filter((task: any) => 
    task.status === "Blocked" || task.status.toLowerCase().includes("blocked")
  ).length;

  return transformed;
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Helper function to map status values
 */
function mapStatus(status: string): string {
  if (!status) return "Todo";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "pending") return "Todo";
  if (lowerStatus === "blocked") return "Blocked";
  if (lowerStatus === "in progress" || lowerStatus === "running") return "In Progress";
  if (lowerStatus === "done" || lowerStatus === "completed") return "Done";
  return "Todo";
}

/**
 * Executes a Chat Agent conversation using Lemma SDK.
 */
export async function chat(
  message: string,
  projectData: any,
  history: any[] = []
): Promise<string> {
  const client = getLemmaClient();
  const podId = process.env.LEMMA_POD_ID || "019f0d4a-33ad-75da-bc5d-43561cba9491";
  const agentName = "project-analyzer";

  console.log(`[Lemma Chat] Routing message through Lemma Agent Controller. Conv ID: ${activeConversationId}`);

  const controller = new AgentController({
    client,
    scope: {
      podId,
      agentName,
    },
    initialConversationId: activeConversationId || undefined,
  });

  if (!activeConversationId) {
    console.log("[Lemma Chat] Creating a brand-new conversation session on Lemma backend...");
    const conv = await controller.createConversation({
      title: "Project operations sync",
      metadata: { projectData },
      agentName,
    });
    activeConversationId = conv.id;
  } else {
    try {
      await client.conversations.update(activeConversationId, {
        metadata: { projectData },
      });
    } catch (e) {
      console.warn("[Lemma Chat] Could not sync conversation metadata update:", e);
    }
  }

  console.log(`[Lemma Chat] Dispatching message to conversation: ${activeConversationId}`);
  await controller.sendMessage(message, {
    conversationId: activeConversationId,
    metadata: { projectData },
  });

  const state = controller.getState();
  if (state.error) {
    throw state.error;
  }

  const outputs = selectAgentOutputs(state);
  const replyText = outputs.outputText || outputs.finalOutputText;

  if (replyText) {
    return replyText;
  }

  const latestAgentMsg = state.messages.find(
    (m: any) => m.role === "assistant" && m.text
  );

  if (latestAgentMsg?.text) {
    return latestAgentMsg.text;
  }

  throw new Error("No agent reply was generated by Lemma Agent.");
}
