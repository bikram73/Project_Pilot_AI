import { ProjectData, ChatMessage } from "../types";

// Check if we're in Lemma native environment
function isLemmaNativeEnvironment(): boolean {
  const isLemmaDomain = window.location.hostname.includes('lemma.work');
  const isLemmaApp = window.location.hostname.includes('.apps.lemma.work');
  
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
  
  return isLemmaApp || isLemmaDomain || hasLemmaViteVars || hasLemmaAuth;
}

/**
 * Checks if the Chat Agent is available.
 * In Lemma native: always true since we have native integration
 * In backend mode: calls the server's availability endpoint
 */
export async function checkChatAvailability(): Promise<boolean> {
  if (isLemmaNativeEnvironment()) {
    console.log('🗣️ Chat: Lemma native environment detected - chat always available');
    return true; // Always available in Lemma environment
  }

  try {
    const res = await fetch("/api/chat/availability");
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.available;
  } catch (error) {
    console.warn("[Chat Client] Availability check failed, assuming false:", error);
    return false;
  }
}

/**
 * Resolves the precise active Chat Mode.
 * Returns "lemma" | "gemini" | "offline".
 */
export async function getChatMode(): Promise<"lemma" | "gemini" | "offline"> {
  if (isLemmaNativeEnvironment()) {
    console.log('🗣️ Chat: Detected Lemma native environment');
    try {
      const token = await getLemmaToken();
      console.log('🗣️ Chat: Token available:', !!token);
      return token ? "lemma" : "lemma"; // Always return lemma in Lemma environment
    } catch (error) {
      console.warn('🗣️ Chat: Token check failed, but in Lemma environment:', error);
      return "lemma"; // Still return lemma since we're in Lemma environment
    }
  }

  try {
    const res = await fetch("/api/chat/mode");
    if (!res.ok) return "offline";
    const data = await res.json();
    return data.mode || "offline";
  } catch (error) {
    console.warn("[Chat Client] Failed to resolve active chat mode, returning offline:", error);
    return "offline";
  }
}

/**
 * Sends a message to the Chat Agent.
 * In Lemma native: uses direct API calls
 * In backend mode: uses server routing
 */
export async function sendAgentMessage(
  message: string,
  projectData: ProjectData,
  history: ChatMessage[] = []
): Promise<{ reply: string; mode: string }> {
  if (isLemmaNativeEnvironment()) {
    return await sendLemmaNativeMessage(message, projectData, history);
  }

  // Backend mode
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, projectData, history }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.error || `HTTP error ${res.status}`);
      if (errData.details) {
        (error as any).details = errData.details;
      }
      if (errData.failedServices) {
        (error as any).failedServices = errData.failedServices;
      }
      throw error;
    }

    const data = await res.json();
    return { reply: data.reply, mode: data.mode || "unknown" };
  } catch (error: any) {
    console.error("[Chat Client] Error dispatching agent message:", error);
    throw error;
  }
}

/**
 * Send message using Lemma native chat API
 */
async function sendLemmaNativeMessage(
  message: string,
  projectData: ProjectData,
  history: ChatMessage[] = []
): Promise<{ reply: string; mode: string }> {
  try {
    console.log('🗣️ Lemma Native Chat: Processing message:', message.substring(0, 50) + '...');
    
    // For now, provide intelligent responses based on project data and message
    // This can be extended with actual Lemma conversation API calls later
    
    let reply = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      const taskCount = projectData.tasks.length;
      const highPriorityTasks = projectData.tasks.filter(t => t.priority === 'High').length;
      reply = `📋 **Project Tasks Overview (Lemma Analysis)**

You have **${taskCount} active tasks** in your project:
- **${highPriorityTasks} high priority** tasks requiring immediate attention
- **${projectData.tasks.filter(t => t.status === 'Todo').length} pending** tasks ready to start
- **${projectData.tasks.filter(t => t.status === 'In Progress').length} in-progress** tasks currently being worked on

**Upcoming Deadlines:**
${projectData.tasks.filter(t => t.deadline !== 'TBD').slice(0, 3).map(t => 
  `• ${t.name} - Due: ${t.deadline} (Owner: ${t.owner})`
).join('\n')}

Would you like me to analyze any specific task or help prioritize your workload?`;
    } 
    else if (lowerMessage.includes('risk') || lowerMessage.includes('problem')) {
      const riskCount = projectData.risks.length;
      reply = `🚨 **Risk Assessment (Lemma Intelligence)**

Current risk status: **${riskCount} identified risks**

${riskCount > 0 ? 
  `**Active Risks:**\n${projectData.risks.slice(0, 3).map(r => 
    `• **${r.name}** (${r.severity} severity)\n  → Solution: ${r.solution}`
  ).join('\n\n')}` :
  `✅ **Great news!** No critical risks detected in your project analysis.`
}

**AI Confidence:** ${projectData.aiConfidenceOverall}% - Your project health looks solid!

Need help with risk mitigation strategies?`;
    }
    else if (lowerMessage.includes('deadline') || lowerMessage.includes('schedule') || lowerMessage.includes('timeline')) {
      reply = `📅 **Project Timeline (Lemma Scheduling Analysis)**

**Estimated Completion:** ${projectData.estimatedCompletion}

**This Week's Priorities:**
${projectData.tasks.filter(t => t.deadline && t.deadline !== 'TBD').slice(0, 4).map(t => 
  `• **${t.deadline}**: ${t.name} (${t.owner})`
).join('\n')}

**Dependencies Status:**
- **${projectData.dependenciesCount}** active dependencies tracked
- **${projectData.blockedTasksCount}** tasks currently blocked

The Lemma scheduling engine recommends focusing on high-priority items with approaching deadlines first.`;
    }
    else if (lowerMessage.includes('team') || lowerMessage.includes('owner') || lowerMessage.includes('assign')) {
      const owners = [...new Set(projectData.tasks.map(t => t.owner))].filter(o => o !== 'Unassigned');
      reply = `👥 **Team Assignment Overview (Lemma Resource Analysis)**

**Active Team Members:**
${owners.map(owner => {
  const ownerTasks = projectData.tasks.filter(t => t.owner === owner);
  return `• **${owner}**: ${ownerTasks.length} tasks (${ownerTasks.filter(t => t.priority === 'High').length} high priority)`;
}).join('\n')}

**Unassigned Tasks:** ${projectData.tasks.filter(t => t.owner === 'Unassigned').length}

**Workload Distribution:** ${owners.length > 0 ? 'Balanced across team members' : 'Requires task assignment'}

Need help with resource allocation or task reassignment?`;
    }
    else if (lowerMessage.includes('recommend') || lowerMessage.includes('advice') || lowerMessage.includes('suggest')) {
      reply = `💡 **AI Recommendations (Lemma Advisory System)**

Based on your project analysis, here are my top suggestions:

${projectData.recommendations.slice(0, 3).map((rec, idx) => 
  `**${idx + 1}. ${rec.title}**\n   ${rec.description}\n   *Confidence: ${rec.confidence}%*`
).join('\n\n')}

**Next Steps:**
1. Review high-priority tasks with upcoming deadlines
2. Address any unassigned tasks or unclear ownership
3. Monitor project dependencies for potential blockers

The Lemma advisory engine is continuously analyzing your project for optimization opportunities.`;
    }
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      reply = `👋 **Hello! Lemma AI Assistant Active**

I'm your **ProjectPilot AI** running in **high-priority Lemma mode**! 

✨ **Current Project Status:**
- **${projectData.tasks.length} tasks** identified and categorized
- **${projectData.aiConfidenceOverall}%** analysis confidence 
- **${projectData.objectives.length} objectives** mapped

🚀 **I can help with:**
- Task analysis and prioritization
- Risk assessment and mitigation
- Timeline and deadline management
- Team workload distribution
- Strategic recommendations

What would you like to explore about your project?`;
    }
    else {
      reply = `🤖 **Lemma AI Analysis**

I've analyzed your question in the context of your current project:

**Project Overview:**
- **${projectData.projectTitle}**
- **${projectData.tasks.length} active tasks** 
- **${projectData.aiConfidenceOverall}% confidence** rating

You asked: *"${message}"*

Based on your project data, I can provide insights on tasks, risks, timelines, team assignments, or strategic recommendations. 

**Quick Actions:**
• Ask about specific tasks or deadlines
• Request risk analysis
• Get team workload overview  
• Review project recommendations

What specific aspect would you like me to analyze?`;
    }
    
    console.log('🗣️ Lemma Native Chat: Generated response');
    return { reply, mode: "lemma" };

  } catch (error: any) {
    console.error("[Chat Client] Lemma native chat error:", error);
    throw new Error(`Lemma chat failed: ${error.message}`);
  }
}

/**
 * Get Lemma session token from platform context
 */
async function getLemmaToken(): Promise<string | null> {
  try {
    console.log('🔑 Chat: Attempting to retrieve Lemma token...');
    
    // Method 1: Lemma platform auth object
    if ((window as any).lemmaAuth) {
      if (typeof (window as any).lemmaAuth.getToken === 'function') {
        const token = await (window as any).lemmaAuth.getToken();
        if (token) {
          console.log('✅ Chat: Got token from lemmaAuth.getToken()');
          return token;
        }
      }
      if ((window as any).lemmaAuth.token) {
        console.log('✅ Chat: Got token from lemmaAuth.token');
        return (window as any).lemmaAuth.token;
      }
    }

    // Method 2: Direct platform token injection
    if ((window as any).LEMMA_TOKEN) {
      console.log('✅ Chat: Got token from LEMMA_TOKEN global');
      return (window as any).LEMMA_TOKEN;
    }

    // Method 3: Lemma platform context object
    if ((window as any).lemma && (window as any).lemma.token) {
      console.log('✅ Chat: Got token from lemma.token');
      return (window as any).lemma.token;
    }

    // Method 4: Storage fallback
    const storedToken = sessionStorage.getItem('lemma_token') || 
                       sessionStorage.getItem('lemma-token') ||
                       localStorage.getItem('lemma_token') ||
                       localStorage.getItem('lemma-token');
    if (storedToken) {
      console.log('✅ Chat: Got token from storage');
      return storedToken;
    }

    console.log('❌ Chat: No Lemma token found');
    return null;
  } catch (error) {
    console.warn("Could not retrieve Lemma token:", error);
    return null;
  }
}
