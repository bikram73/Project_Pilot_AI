import { ProjectData } from "../types";

/**
 * Performs the server-side Project Analysis Workflow through Express and Lemma with Gemini fallback.
 * Sequentially triggers progress status updates to keep the frontend loading screens beautifully animated.
 */
/**
 * Performs the server-side Project Analysis Workflow through Express and Lemma with Gemini fallback.
 * Uses fire-and-forget + polling approach to handle long-running Lemma workflows.
 */
export async function runAnalysis(
  payload: {
    text: string;
    file: { name: string; base64: string; mimeType: string } | null;
  },
  onStatusUpdate?: (status: string) => void,
  signal?: AbortSignal
): Promise<ProjectData> {
  try {
    console.log("📡 Starting async analysis with payload:", payload);
    
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

    console.log("🚀 Starting background analysis...");
    
    // Start the analysis in the background (fire-and-forget)
    fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(err => {
      console.log("📝 Background request initiated (errors expected during long execution)");
    });

    console.log("🔄 Starting polling for results...");

    // Poll for results every 3 seconds
    let attempts = 0;
    const maxAttempts = 100; // 5 minutes of polling
    let lastProgressUpdate = Date.now();
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Update status every 10 seconds to show progress
      if (onStatusUpdate && Date.now() - lastProgressUpdate > 10000) {
        onStatusUpdate(`Running Agent (${Math.floor(attempts * 3 / 60)}m${(attempts * 3) % 60}s)`);
        lastProgressUpdate = Date.now();
      }
      
      console.log(`🔍 Polling attempt ${attempts}/${maxAttempts} for results...`);
      
      try {
        const pollRes = await fetch("/api/analyze/latest");
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          
          console.log("📊 Polled data:", {
            mode: pollData._analysisMode,
            tasks: pollData.tasks?.length || 0,
            risks: pollData.risks?.length || 0,
            recommendations: pollData.recommendations?.length || 0
          });
          
          // Check if this is fresh Lemma data with meaningful content
          if (pollData._analysisMode === "lemma" && 
              (pollData.tasks?.length > 0 || pollData.risks?.length > 0 || 
               pollData.recommendations?.length > 0)) {
            console.log("✅ Found fresh Lemma results!");
            
            if (onStatusUpdate) {
              onStatusUpdate("Saving Results");
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (onStatusUpdate) {
              onStatusUpdate("Loading Dashboard");
            }
            await new Promise((resolve) => setTimeout(resolve, 800));

            console.log("🎯 Polling successful, returning Lemma data");
            return pollData;
          }
        }
      } catch (pollError) {
        console.log(`Polling error (attempt ${attempts}):`, pollError);
      }
      
      // Wait 3 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    
    throw new Error("Analysis polling timed out after 5 minutes. The workflow may still be completing in the background.");

  } catch (err: any) {
    console.error("❌ Async analysis failed:", err);
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
