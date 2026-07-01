import { ProjectData } from "../types";
import { runLemmaNativeAnalysis, isLemmaNativeEnvironment } from "./lemma-native";

/**
 * Performs the server-side Project Analysis with automatic environment detection.
 * Uses Lemma-native when running on Lemma platform, otherwise uses backend API.
 */
export async function runAnalysis(
  payload: {
    text: string;
    file: { name: string; base64: string; mimeType: string } | null;
  },
  onStatusUpdate?: (status: string) => void
): Promise<ProjectData> {
  try {
    // Check if we're running in Lemma native environment
    if (isLemmaNativeEnvironment()) {
      console.log("🚀 Detected Lemma native environment, using direct integration");
      console.log("Environment details:", {
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        hasViteVars: !!((window as any).VITE_LEMMA_API_URL)
      });
      return await runLemmaNativeAnalysis(payload, onStatusUpdate);
    }

    // Otherwise use the backend API approach
    console.log("📡 Using backend API for analysis");
    
    if (onStatusUpdate) {
      console.log("📊 Updating status: Creating Workflow");
      onStatusUpdate("Creating Workflow");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onStatusUpdate) {
      console.log("📊 Updating status: Submitting Notes");
      onStatusUpdate("Submitting Notes");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onStatusUpdate) {
      console.log("📊 Updating status: Running Agent");
      onStatusUpdate("Running Agent");
    }
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("🚀 Making analysis request to backend endpoint...");

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Analysis request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    console.log("✅ Backend analysis successful:", {
      mode: result._analysisMode,
      tasks: result.tasks?.length || 0,
      risks: result.risks?.length || 0
    });

    if (onStatusUpdate) {
      onStatusUpdate("Saving Results");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onStatusUpdate) {
      onStatusUpdate("Loading Dashboard");
    }
    await new Promise((resolve) => setTimeout(resolve, 800));

    return result;

  } catch (err: any) {
    console.error("❌ Analysis failed:", err);
    throw err;
  }
}

/**
 * Legacy Gemini client-side fallback - unused in new proxy design but kept for safety.
 */
export async function runGeminiAnalysis(
  payload: {
    text: string;
    file: { name: string; base64: string; mimeType: string } | null;
  }
): Promise<ProjectData> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Fallback endpoint failed with status ${res.status}`);
  }
  return await res.json();
}
