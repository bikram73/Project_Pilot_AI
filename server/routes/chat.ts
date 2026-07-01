import { Router, Request, Response, NextFunction } from "express";
import { chat as chatWithLemma } from "../services/lemma";
import { chatWithGemini } from "../services/gemini";

const router = Router();

// Chat mode discovery
router.get("/mode", (req: Request, res: Response) => {
  if (process.env.LEMMA_SESSION_TOKEN) {
    return res.json({ mode: "lemma" });
  } else if (process.env.GEMINI_API_KEY) {
    return res.json({ mode: "gemini" });
  } else {
    return res.json({ mode: "offline" });
  }
});

// Chat availability endpoint
router.get("/availability", (req: Request, res: Response) => {
  const available = !!(process.env.LEMMA_SESSION_TOKEN || process.env.GEMINI_API_KEY);
  return res.json({ available });
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, projectData, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    console.log("[Express API /api/chat] Received chat message.");

    try {
      // 1. Attempt Lemma Chat Agent
      console.log("[Express API /api/chat] Attempting Lemma Chat Agent...");
      const reply = await chatWithLemma(message, projectData, history);
      console.log("[Express API /api/chat] Lemma Agent responded successfully.");
      return res.json({ reply, mode: "lemma" });

    } catch (lemmaError: any) {
      console.warn(
        `[Express API /api/chat] Lemma Agent unavailable. Running Gemini chat fallback. Error: ${lemmaError.message || lemmaError}`
      );

      // 2. Fallback to Gemini
      console.log("[Express API /api/chat] Activating Gemini conversational assistant...");
      const reply = await chatWithGemini(message, projectData, history);
      console.log("[Express API /api/chat] Gemini conversational assistant responded successfully.");
      return res.json({ reply, mode: "gemini" });
    }

  } catch (err) {
    next(err);
  }
});

export default router;
