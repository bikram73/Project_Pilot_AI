import { Router, Request, Response, NextFunction } from "express";
import { runWorkflow, persistAnalysis, getLatestAnalysis } from "../services/lemma";
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

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, file } = req.body;

    // Transform the payload to match the Lemma workflow schema
    const payload = {
      source: "manual",
      documents: [
        {
          title: file?.name || "Project Analysis Input",
          content: text || ""
        }
      ]
    };

    console.log("[Express API /api/analyze] Starting analysis request.");

    try {
      // 1. Try Lemma
      console.log("[Express API /api/analyze] Attempting Lemma Workflow execution...");
      const result = await runWorkflow(payload);
      
      // Mark as Lemma analyzed
      result._analysisMode = "lemma";

      // 2. Persist
      persistAnalysis(result);

      console.log("[Express API /api/analyze] Lemma Workflow completed successfully.");
      return res.json(result);

    } catch (lemmaError: any) {
      console.warn(
        `[Express API /api/analyze] Lemma temporarily unavailable. Running Gemini fallback. Error: ${lemmaError.message || lemmaError}`
      );

      // 3. Fallback to Gemini - convert back to original format for Gemini
      console.log("[Express API /api/analyze] Activating Gemini fallback...");
      const geminiPayload = { text: text || "", file: file || null };
      const fallbackResult = await analyzeWithGemini(geminiPayload);

      // Mark as Gemini analyzed
      fallbackResult._analysisMode = "gemini";
      fallbackResult._lemmaError = lemmaError.message || String(lemmaError);

      // 4. Persist
      persistAnalysis(fallbackResult);

      console.log("[Express API /api/analyze] Gemini fallback analysis completed successfully.");
      return res.json(fallbackResult);
    }

  } catch (err) {
    next(err);
  }
});

export default router;
