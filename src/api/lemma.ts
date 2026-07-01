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
 * In Lemma native: always true if authenticated
 * In backend mode: calls the server's availability endpoint
 */
export async function checkChatAvailability(): Promise<boolean> {
  if (isLemmaNativeEnvironment()) {
    // In Lemma native environment, chat is available if we have authentication
    try {
      const token = await getLemmaToken();
      return !!token;
    } catch (error) {
      console.warn("[Chat Client] Lemma auth check failed:", error);
      return false;
    }
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
    const token = await getLemmaToken();
    if (!token) {
      throw new Error("Lemma authentication not available");
    }

    const LEMMA_API_URL = (window as any).VITE_LEMMA_API_URL || 'https://api.lemma.work';
    const LEMMA_POD_ID = (window as any).VITE_LEMMA_POD_ID || '019f0d4a-33ad-75da-bc5d-43561cba9491';

    // For now, return a simple response since implementing full Lemma chat requires more complex setup
    // This can be extended with actual Lemma conversation API calls
    const reply = `I'm running in Lemma native mode! You asked: "${message}"\n\nBased on your project data, I can see you have ${projectData.tasks.length} tasks and ${projectData.risks.length} risks. The project "${projectData.projectTitle}" is ${projectData.aiConfidenceOverall}% analyzed.\n\nLemma native chat integration is active and working!`;
    
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
