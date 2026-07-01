import { ProjectData, ChatMessage } from "../types";

/**
 * Checks if the Chat Agent is available by calling the server's availability endpoint.
 */
export async function checkChatAvailability(): Promise<boolean> {
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
 * Resolves the precise active Chat Mode by polling our Express backend's discovery route.
 * Returns "lemma" | "gemini" | "offline".
 */
export async function getChatMode(): Promise<"lemma" | "gemini" | "offline"> {
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
 * Dispatches the payload directly to the server, which handles routing to Lemma / Gemini seamlessly.
 */
export async function sendAgentMessage(
  message: string,
  projectData: ProjectData,
  history: ChatMessage[] = []
): Promise<string> {
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
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.reply;
  } catch (error: any) {
    console.error("[Chat Client] Error dispatching agent message:", error);
    throw new Error(error.message || "Failed to communicate with the project assistant.");
  }
}
