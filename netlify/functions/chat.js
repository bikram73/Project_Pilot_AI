// Netlify Function for /api/chat endpoint
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

async function chatWithGemini(message, projectData, history = []) {
  const ai = getGeminiClient();
  const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });
  const safeProjectData = projectData || {};

  const systemInstruction = `You are ProjectPilot AI, a highly professional operational assistant and project management expert.
You are assisting the user with their project titled "${safeProjectData.projectTitle || "Untitled Project"}".

Here is the current state of the project data extracted from the project charter/documents:
- Project Title: ${safeProjectData.projectTitle || "Unknown"}
- Summary: ${safeProjectData.projectSummary || "No summary available."}
- Estimated Completion: ${safeProjectData.estimatedCompletion || "TBD"}
- Overall AI Confidence: ${safeProjectData.aiConfidenceOverall || 100}%
- Blocked Tasks: ${safeProjectData.blockedTasksCount || 0}
- Identified Dependencies: ${safeProjectData.dependenciesCount || 0}

Key Deliverables:
${(safeProjectData.keyDeliverables || []).map(d => `- ${d}`).join("\n") || "None listed"}

Objectives:
${(safeProjectData.objectives || []).map(o => `- ${o}`).join("\n") || "None listed"}

Core Tasks:
${(safeProjectData.tasks || []).map(t => `- [${t.status || "Todo"}] ${t.name} (Owner: ${t.owner || "Unassigned"}, Deadline: ${t.deadline || "TBD"}, Priority: ${t.priority || "Medium"})`).join("\n") || "No tasks listed"}

Identified Risks:
${(safeProjectData.risks || []).map(r => `- [${r.severity || "High"}] ${r.name}: ${r.description || ""} (Solution: ${r.solution || ""})`).join("\n") || "No risks listed"}

Advisory Recommendations:
${(safeProjectData.recommendations || []).map(rec => `- ${rec.title}: ${rec.description}`).join("\n") || "No recommendations listed"}

Use this context to answer any user questions, analyze blockers, estimate risks, suggest optimizations, or detail operational workloads. Keep your tone professional, structured, helpful, and concise. Use Markdown formatting for headings, bullet points, and tables when presenting information.`;

  const contents = [];
  const safeHistory = history || [];

  // Add conversation history
  const firstUserIdx = safeHistory.findIndex(m => m.sender === "user" || m.role === "user");
  if (firstUserIdx !== -1) {
    for (let i = firstUserIdx; i < safeHistory.length; i++) {
      const m = safeHistory[i];
      const role = (m.sender === "user" || m.role === "user") ? "user" : "model";
      contents.push({
        role,
        parts: [{ text: m.text || m.content || "" }],
      });
    }
  }

  // Add current message
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  const result = await model.generateContent({
    contents: contents,
    systemInstruction: systemInstruction,
    generationConfig: {
      temperature: 0.7,
    },
  });

  return result.response.text() || "I was unable to generate a response. Please try again.";
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
      // Handle chat mode discovery and availability endpoints
      const path = event.path;
      
      if (path.includes('/mode')) {
        // GET /api/chat/mode equivalent
        const mode = process.env.GEMINI_API_KEY ? "gemini" : "offline";
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ mode }),
        };
      }
      
      if (path.includes('/availability')) {
        // GET /api/chat/availability equivalent
        const available = !!process.env.GEMINI_API_KEY;
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ available }),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      // POST /api/chat equivalent
      console.log("[Netlify Function] Received chat message.");

      const { message, projectData, history } = JSON.parse(event.body);

      if (!message) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: "Message is required." }),
        };
      }

      console.log("[Netlify Function] Activating Gemini conversational assistant...");
      const reply = await chatWithGemini(message, projectData, history);
      console.log("[Netlify Function] Gemini conversational assistant responded successfully.");
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ reply, mode: "gemini" }),
      };
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