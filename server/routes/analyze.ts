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

// POST endpoint for direct analysis (tries Lemma synchronously first, then falls back to Gemini)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, file } = req.body;

    console.log("[Express API /api/analyze] Starting direct analysis request.");

    // For Vercel, try Gemini first since it's faster and more reliable on serverless
    console.log("[Express API /api/analyze] Using Gemini for serverless compatibility...");
    const geminiPayload = { text: text || "", file: file || null };
    const result = await analyzeWithGemini(geminiPayload);

    // Mark as Gemini analyzed
    result._analysisMode = "gemini";
    result._deploymentMode = "serverless";

    // Persist
    persistAnalysis(result);

    console.log("[Express API /api/analyze] Gemini analysis completed successfully.");
    return res.json(result);

  } catch (err) {
    next(err);
  }
});

export default router;
