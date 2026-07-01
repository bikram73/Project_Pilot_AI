// Simplified Netlify Function for /api/analyze endpoint with working Lemma integration
const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

// Global cache for analysis results
global.cachedAnalysis = global.cachedAnalysis || null;

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

// Simple Lemma API call function
function lemmaRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = process.env.LEMMA_SESSION_TOKEN;
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ProjectPilot-Netlify/1.0',
        ...options.headers
      },
      rejectUnauthorized: false
    };

    if (options.data) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.data);
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[Lemma] ${requestOptions.method} ${url} -> ${res.statusCode}`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          console.error(`[Lemma] Error ${res.statusCode}: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => reject(new Error('Request timeout')));
    
    if (options.data) {
      req.write(options.data);
    }
    req.end();
  });
}

// Simplified Lemma workflow runner
async function runLemmaWorkflow(text) {
  const apiUrl = process.env.LEMMA_API_URL || 'https://api.lemma.work';
  const podId = process.env.LEMMA_POD_ID;
  const workflowName = 'project-analysis-workflow';

  if (!podId || !process.env.LEMMA_SESSION_TOKEN) {
    throw new Error('Missing Lemma credentials');
  }

  console.log('[Lemma] Starting workflow execution...');

  // Step 1: Create workflow run
  const createUrl = `${apiUrl}/pods/${podId}/workflows/${workflowName}/runs`;
  const run = await lemmaRequest(createUrl, { method: 'POST' });
  
  if (!run.id) {
    throw new Error('Failed to create workflow run');
  }

  console.log(`[Lemma] Created run: ${run.id}`);

  // Step 2: Submit input (if workflow is waiting)
  if (run.active_wait) {
    const inputs = {
      source: "manual",
      documents: [{
        title: "Project Analysis Input",
        content: text || "Project analysis request"
      }]
    };

    const submitUrl = `${apiUrl}/pods/${podId}/workflows/runs/${run.id}/submit-form`;
    const submitData = JSON.stringify({
      node_id: run.active_wait.node_id,
      inputs
    });

    await lemmaRequest(submitUrl, { 
      method: 'POST', 
      data: submitData 
    });

    console.log('[Lemma] Input submitted successfully');
  }

  // Step 3: Poll for completion
  const pollUrl = `${apiUrl}/pods/${podId}/workflows/runs/${run.id}`;
  const maxAttempts = 12; // 12 seconds max for Netlify
  
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`[Lemma] Polling attempt ${i + 1}/${maxAttempts}`);
    
    const runState = await lemmaRequest(pollUrl);
    console.log(`[Lemma] Status: ${runState.status}`);

    if (runState.status === 'completed' || runState.status === 'succeeded') {
      console.log('[Lemma] Workflow completed successfully!');
      
      // Transform the output
      const context = runState.execution_context || {};
      return {
        projectTitle: "Project Analysis",
        projectSummary: context.summary?.projectSummary || "Analysis completed via Lemma",
        estimatedCompletion: "TBD",
        aiConfidenceOverall: 95,
        blockedTasksCount: 0,
        dependenciesCount: 0,
        objectives: context.summary?.objectives || [],
        keyDeliverables: [],
        tasks: (context.tasks || []).map((task, idx) => ({
          id: `task-${idx + 1}`,
          name: task.taskName || task.name || `Task ${idx + 1}`,
          owner: task.owner || "Unassigned",
          deadline: task.deadline || "TBD",
          priority: task.priority || "Medium",
          category: "General",
          status: task.status || "Todo",
          sourceEvidence: "Generated from Lemma workflow",
          confidence: 95
        })),
        risks: (context.risks || []).map((risk, idx) => ({
          id: `risk-${idx + 1}`,
          name: risk.title || risk.name || `Risk ${idx + 1}`,
          severity: risk.severity || "Medium",
          description: risk.description || "",
          solution: risk.solution || risk.mitigation || "Review and assess",
          confidence: 90
        })),
        recommendations: (context.summary?.recommendations || []).map((rec, idx) => ({
          id: `rec-${idx + 1}`,
          title: typeof rec === 'string' ? rec : (rec.title || `Recommendation ${idx + 1}`),
          description: typeof rec === 'string' ? rec : (rec.description || rec),
          icon: "lightbulb",
          confidence: 90
        })),
        missingInfoAlerts: [],
        _analysisMode: "lemma"
      };
    }

    if (runState.status === 'failed' || runState.status === 'error') {
      throw new Error(`Workflow failed: ${runState.error || 'Unknown error'}`);
    }

    // Wait 1 second before next poll
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Workflow timed out');
}

// Gemini analysis function (existing)
async function analyzeWithGemini(payload) {
  const ai = getGeminiClient();
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  "projectTitle": string,
  "projectSummary": string,
  "estimatedCompletion": string,
  "aiConfidenceOverall": number,
  "blockedTasksCount": number,
  "dependenciesCount": number,
  "objectives": string[],
  "keyDeliverables": string[],
  "tasks": [
    {
      "id": string,
      "name": string,
      "owner": string,
      "deadline": string,
      "priority": "High" | "Medium" | "Low",
      "category": string,
      "status": "Pending" | "Todo" | "In Progress" | "Backlog",
      "sourceEvidence": string,
      "confidence": number
    }
  ],
  "risks": [
    {
      "id": string,
      "name": string,
      "severity": "Critical" | "High" | "Medium" | "Low",
      "description": string,
      "solution": string,
      "confidence": number
    }
  ],
  "recommendations": [
    {
      "id": string,
      "title": string,
      "description": string,
      "icon": string,
      "confidence": number
    }
  ],
  "missingInfoAlerts": [],
  "_analysisMode": "gemini"
}

You MUST return ONLY the raw JSON object conforming to this structure.`;

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
      console.log("[Netlify Function] Starting analysis request.");

      const { text, file } = JSON.parse(event.body);

      // Try Lemma first, then fallback to Gemini
      try {
        console.log("[Netlify Function] Attempting Lemma workflow...");
        const result = await runLemmaWorkflow(text);

        result._analysisMode = "lemma";
        result._deploymentMode = "netlify";
        global.cachedAnalysis = result;

        console.log("[Netlify Function] Lemma analysis completed successfully!");
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(result),
        };

      } catch (lemmaError) {
        console.error("[Netlify Function] Lemma failed:", lemmaError.message);

        // Fallback to Gemini
        console.log("[Netlify Function] Using Gemini fallback...");
        const result = await analyzeWithGemini({ text: text || "", file: file || null });

        result._analysisMode = "gemini";
        result._deploymentMode = "netlify-fallback";
        global.cachedAnalysis = result;

        console.log("[Netlify Function] Gemini fallback completed successfully.");
        
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
      headers: { 'Access-Control-Allow-Origin': '*' },
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