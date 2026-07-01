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
      const { analyze } = await import("../services/lemma");
      const lemmaPayload = { text: text || "", file: file || null };
      const result = await analyze(lemmaPayload);

      // Mark as Lemma analyzed
      result._analysisMode = "lemma";
      result._deploymentMode = "development";

      // Persist
      persistAnalysis(result);

      console.log("[Express API /api/analyze] Lemma workflow completed successfully.");
      return res.json(result);

    } catch (lemmaError: any) {
      console.warn(`[Express API /api/analyze] Lemma workflow unavailable, falling back to Gemini. Error: ${lemmaError.message || lemmaError}`);

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
