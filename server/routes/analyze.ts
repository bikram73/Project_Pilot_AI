import { Router, Request, Response, NextFunction } from "express";
import { getLatestAnalysis, persistAnalysis } from "../services/lemma";
import { analyzeWithGemini } from "../services/gemini";

const router = Router();

// GET endpoint to retrieve the latest analysis results
router.get("/latest", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[Express API GET /api/analyze/latest] Retrieving latest analysis results.");
    const latestAnalysis = getLatestAnalysis();
    return res.json(latestAnalysis);
  } catch (err) {
    next(err);
  }
});

// POST endpoint for direct analysis (tries Lemma first, then falls back to Gemini)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, file } = req.body;

    console.log("[Express API /api/analyze] Starting direct analysis request.");

    try {
      // 1. First attempt: Try Lemma workflow for comprehensive analysis
      console.log("[Express API /api/analyze] Attempting Lemma workflow for comprehensive analysis...");
      const { runWorkflowDirectAPI, runWorkflow } = await import("../services/lemma");
      
      // Transform payload to match Lemma workflow expectations
      const lemmaPayload = {
        source: "manual",
        documents: [
          {
            title: file?.name || "Project Analysis Input",
            content: text || "Project analysis request"
          }
        ]
      };
      
      console.log("[Express API /api/analyze] Creating workflow...");
      console.log("[Express API /api/analyze] Payload:", JSON.stringify(lemmaPayload, null, 2));
      
      let result;
      try {
        // Try direct API first (bypasses potential SDK auth issues)
        console.log("[Express API /api/analyze] Trying direct REST API approach...");
        result = await runWorkflowDirectAPI(lemmaPayload);
      } catch (directApiError: any) {
        console.warn("[Express API /api/analyze] Direct API failed, trying SDK:", directApiError.message);
        // Fallback to SDK
        result = await runWorkflow(lemmaPayload);
      }
      
      console.log("[Express API /api/analyze] Workflow completed successfully:", JSON.stringify(result, null, 2));

      // Mark as Lemma analyzed
      result._analysisMode = "lemma";
      result._deploymentMode = "development";

      // Persist
      persistAnalysis(result);

      console.log("[Express API /api/analyze] Lemma workflow completed successfully.");
      return res.json(result);

    } catch (lemmaError: any) {
      console.warn(`[Express API /api/analyze] Lemma workflow failed:`, lemmaError.message);
      
      // Check if it's a timeout case where workflow might still be running
      if (lemmaError.message?.includes('LEMMA_TIMEOUT')) {
        console.warn(`[Express API /api/analyze] LEMMA TIMEOUT - workflow may still be completing`);
        console.warn(`[Express API /api/analyze] Consider checking workflow status manually or increasing timeout`);
        
        return res.status(408).json({
          error: "Lemma workflow timeout",
          message: "The workflow is taking longer than expected but may still be running. Please try again in a few moments or check the Lemma dashboard.",
          details: lemmaError.message,
          _analysisMode: "timeout"
        });
      }
      
      // Check if it's a token/auth issue
      if (lemmaError.message?.includes('expired') || lemmaError.message?.includes('unauthorized') || lemmaError.message?.includes('token')) {
        console.error(`[Express API /api/analyze] LEMMA TOKEN ISSUE: ${lemmaError.message}`);
        console.error(`[Express API /api/analyze] Please run: node refresh-lemma-token.cjs`);
        
        return res.status(401).json({
          error: "Lemma session expired",
          message: "Please refresh your Lemma token by running: node refresh-lemma-token.cjs",
          details: lemmaError.message,
          _analysisMode: "error"
        });
      }

      // Only use Gemini fallback for actual failures, not timeouts
      console.warn(`[Express API /api/analyze] Using Gemini fallback due to: ${lemmaError.message}`);

      // 2. Fallback: Use Gemini for analysis
      console.log("[Express API /api/analyze] Using Gemini fallback for analysis...");
      const geminiPayload = { text: text || "", file: file || null };
      const result = await analyzeWithGemini(geminiPayload);

      // Mark as Gemini analyzed
      result._analysisMode = "gemini";
      result._deploymentMode = "fallback";

      // Persist
      persistAnalysis(result);

      console.log("[Express API /api/analyze] Gemini fallback analysis completed successfully.");
      return res.json(result);
    }

  } catch (err) {
    next(err);
  }
});

export default router;
