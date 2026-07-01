import { ProjectData } from "../types";

/**
 * Performs the server-side Project Analysis optimized for serverless deployments.
 * Uses Gemini directly for reliability on Vercel.
 */
export async function runAnalysis(
  payload: {
    text: string;
    file: { name: string; base64: string; mimeType: string } | null;
  },
  onStatusUpdate?: (status: string) => void
): Promise<ProjectData> {
  try {
    console.log("📡 Starting serverless-optimized analysis with Gemini");
    
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

    console.log("🚀 Making direct analysis request to serverless-optimized endpoint...");

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
    
    console.log("✅ Serverless analysis successful:", {
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
    console.error("❌ Serverless analysis failed:", err);
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
