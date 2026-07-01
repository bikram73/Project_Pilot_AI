// Netlify Function for /api/analyze endpoint
const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

// Global cache for analysis results (in production, use external storage)
global.cachedAnalysis = global.cachedAnalysis || null;

// Lemma direct API implementation for Netlify (avoiding SDK issues)
async function runLemmaWorkflowDirect(payload) {
  const apiUrl = process.env.LEMMA_API_URL || "https://api.lemma.work";
  const podId = process.env.LEMMA_POD_ID;
  const sessionToken = process.env.LEMMA_SESSION_TOKEN;
  const workflowName = process.env.LEMMA_WORKFLOW || "project-analysis-workflow";

  if (!podId || !sessionToken) {
    throw new Error("LEMMA_POD_ID and LEMMA_SESSION_TOKEN are required for Lemma integration");
  }

  console.log(`[Netlify Lemma] Starting workflow: ${workflowName}`);

  // Helper function for HTTPS requests
  const makeRequest = (url, options, postData) => {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        rejectUnauthorized: false // For development SSL issues
      };

      if (postData) {
        requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = data ? JSON.parse(data) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          } catch (parseError) {
            reject(new Error(`Parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => reject(new Error('Request timeout')));
      
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  };

  // 1. Create workflow run
  const createUrl = `${apiUrl}/pods/${podId}/workflows/${workflowName}/runs`;
  const run = await makeRequest(createUrl, { method: 'POST' });
  const runId = run.id;
  console.log(`[Netlify Lemma] Created run: ${runId}`);

  if (!run.active_wait) {
    throw new Error("Workflow did not open with input form");
  }

  // 2. Submit inputs
  const inputs = {
    source: "manual",
    documents: [
      {
        title: payload.file?.name || "Project Analysis Input",
        content: payload.text || "Project analysis request"
      }
    ]
  };

  const submitUrl = `${apiUrl}/pods/${podId}/workflows/runs/${runId}/submit-form`;
  const submitData = JSON.stringify({
    node_id: run.active_wait.node_id,
    inputs
  });

  await makeRequest(submitUrl, { method: 'POST' }, submitData);
  console.log(`[Netlify Lemma] Input submitted`);

  // 3. Poll for completion (shorter timeout for serverless)
  const maxAttempts = 20; // 20 seconds for Netlify
  let attempts = 0;
  const pollUrl = `${apiUrl}/pods/${podId}/workflows/runs/${runId}`;

  while (attempts < maxAttempts) {
    const runState = await makeRequest(pollUrl, { method: 'GET' });
    console.log(`[Netlify Lemma] Poll ${attempts}: ${runState.status}`);

    if (runState.status === 'completed' || runState.status === 'succeeded') {
      console.log(`[Netlify Lemma] Workflow completed!`);
      return transformLemmaOutput(runState.execution_context || {});
    }

    if (runState.status === 'failed' || runState.status === 'error') {
      throw new Error(`Workflow failed: ${runState.error || 'Unknown error'}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error(`Lemma workflow timed out after ${maxAttempts} seconds`);
}

function transformLemmaOutput(lemmaData) {
  if (!lemmaData) return lemmaData;

  const transformed = {
    projectTitle: "Project Analysis",
    projectSummary: lemmaData.summary?.projectSummary || "Analysis completed successfully",
    estimatedCompletion: "TBD",
    aiConfidenceOverall: 95,
    blockedTasksCount: 0,
    dependenciesCount: 0,
    objectives: lemmaData.summary?.objectives || [],
    keyDeliverables: [],
    tasks: (lemmaData.tasks || []).map((task, idx) => ({
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
    risks: (lemmaData.risks || []).map((risk, idx) => ({
      id: `risk-${idx + 1}`,
      name: risk.title || risk.name || `Risk ${idx + 1}`,
      severity: capitalizeFirst(risk.severity) || "Medium",
      description: risk.title || risk.description || "",
      solution: risk.mitigation || risk.solution || "Review and assess",
      confidence: 90
    })),
    recommendations: (lemmaData.summary?.recommendations || []).map((rec, idx) => ({
      id: `rec-${idx + 1}`,
      title: typeof rec === 'string' ? rec : (rec.title || `Recommendation ${idx + 1}`),
      description: typeof rec === 'string' ? rec : (rec.description || rec),
      icon: "lightbulb",
      confidence: 90
    })),
    missingInfoAlerts: [],
    _analysisMode: "lemma"
  };

  transformed.blockedTasksCount = transformed.tasks.filter(task => 
    task.status === "Blocked" || task.status.toLowerCase().includes("blocked")
  ).length;

  return transformed;
}

function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function mapStatus(status) {
  if (!status) return "Todo";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "pending") return "Todo";
  if (lowerStatus === "blocked") return "Blocked";
  if (lowerStatus === "in progress" || lowerStatus === "running") return "In Progress";
  if (lowerStatus === "done" || lowerStatus === "completed") return "Done";
  return "Todo";
}

// Gemini client setup
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenerativeAI(key);
  }
  return aiClient;
}

async function analyzeWithGemini(payload) {
  const ai = getGeminiClient();
  const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });

  const parts = [];

  if (payload.file && payload.file.base64 && payload.file.mimeType) {
    parts.push({
      inlineData: {
        data: payload.file.base64,
        mimeType: payload.file.mimeType,
      },
    });
  }

  const textPrompt = payload.text 
    ? `Please analyze this project notes/charter text:\n\n${payload.text}`
    : "Please analyze the attached project document and extract the structured project metadata.";
  
  parts.push({ text: textPrompt });

  const systemInstruction = `You are a professional Project Management Officer (PMO) and an expert Project Analyst.
Analyze the user's project text notes and/or uploaded document and extract structured project metadata, tasks, risks, and advisory recommendations.

You MUST respond with valid JSON that EXACTLY adheres to this TypeScript interface structure:

{
  "projectTitle": string, // clean, concise title (default to "Project Overview" if not clear)
  "projectSummary": string, // a short, high-quality, professional 2-3 sentence summary of the project
  "estimatedCompletion": string, // estimated completion date or timeline (e.g. "Q4 2026")
  "aiConfidenceOverall": number, // integer percentage between 0 and 100 (e.g. 92)
  "blockedTasksCount": number, // count of tasks that have listed dependencies or blockers
  "dependenciesCount": number, // total count of tasks that depend on others
  "objectives": string[], // key objectives of this project
  "keyDeliverables": string[], // major deliverables
  "tasks": [
    {
      "id": string, // generate unique short string (e.g., "task-1", "task-2")
      "name": string, // clean descriptive task name
      "owner": string, // name of owner, or "Unassigned" if not mentioned
      "deadline": string, // date or time period, or "TBD" if not mentioned
      "priority": "High" | "Medium" | "Low",
      "category": string, // e.g. "Development", "Marketing", "Design", "Legal", "Operations"
      "status": "Pending" | "Todo" | "In Progress" | "Backlog",
      "sourceEvidence": string, // a short excerpt from the source text supporting this task
      "confidence": number, // AI confidence level as percentage (integer between 0 and 100)
      "dependencies": string[], // array of other task names or conditions this task depends on
      "missingInfo": string, // details of any critical missing information (e.g. "No assignee specified")
      "suggestedAction": string // suggested immediate action to resolve the missing info
    }
  ],
  "risks": [
    {
      "id": string, // generate unique short string (e.g., "risk-1")
      "name": string, // name of the risk
      "severity": "Critical" | "High" | "Medium" | "Low",
      "description": string,
      "solution": string, // recommended mitigation strategy
      "confidence": number // percentage confidence (integer between 0 and 100)
    }
  ],
  "recommendations": [
    {
      "id": string, // e.g. "rec-1"
      "title": string,
      "description": string,
      "icon": string, // choose from: "speed", "group_add", "schedule", "task_alt", "build", "priority_high"
      "confidence": number
    }
  ],
  "missingInfoAlerts": [
    {
      "id": string,
      "targetType": "task" | "risk" | "project",
      "targetName": string,
      "severity": "Warning" | "Info",
      "description": string,
      "suggestedAction": string
    }
  ]
}

Ensure all lists are complete, rich, and highly accurate based on the text. Do not make up false facts, but you can infer standard industry practices if not specified. You MUST return ONLY the raw JSON object conforming to this structure, with no markdown wrappers or backticks in the response text itself, or formatted as a single clean JSON string.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    systemInstruction: systemInstruction,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const responseText = result.response.text();
  if (!responseText) {
    throw new Error("No response generated by Gemini model.");
  }

  return JSON.parse(responseText.trim());
}

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // GET /api/analyze/latest equivalent
      console.log("[Netlify Function] Retrieving latest analysis results.");
      
      const latestAnalysis = global.cachedAnalysis || {
        projectTitle: "No Analysis Available",
        projectSummary: "No analysis has been performed yet.",
        tasks: [],
        risks: [],
        recommendations: [],
        _analysisMode: "none"
      };
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(latestAnalysis),
      };
    }

    if (event.httpMethod === 'POST') {
      // POST /api/analyze equivalent
      console.log("[Netlify Function] Starting analysis request.");

      const { text, file } = JSON.parse(event.body);

      try {
        // Try Lemma first (with direct API approach)
        console.log("[Netlify Function] Attempting Lemma workflow...");
        const lemmaPayload = { text: text || "", file: file || null };
        const result = await runLemmaWorkflowDirect(lemmaPayload);

        // Mark as Lemma analyzed
        result._analysisMode = "lemma";
        result._deploymentMode = "netlify";

        // Cache the result
        global.cachedAnalysis = result;

        console.log("[Netlify Function] Lemma analysis completed successfully.");
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(result),
        };

      } catch (lemmaError) {
        console.warn(`[Netlify Function] Lemma failed, using Gemini fallback:`, lemmaError.message);

        // Fallback to Gemini
        console.log("[Netlify Function] Using Gemini fallback...");
        const geminiPayload = { text: text || "", file: file || null };
        const result = await analyzeWithGemini(geminiPayload);

        // Mark as Gemini analyzed
        result._analysisMode = "gemini";
        result._deploymentMode = "netlify-fallback";

        // Cache the result
        global.cachedAnalysis = result;

        console.log("[Netlify Function] Gemini fallback analysis completed successfully.");
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(result),
        };
      }
    }

    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };

  } catch (error) {
    console.error("[Netlify Function Error]:", error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error' 
      }),
    };
  }
};