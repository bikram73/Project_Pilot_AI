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
      // Try Gemini first for better reliability while Lemma chat is having issues
      console.log("[Express API /api/chat] Using Gemini chat for reliable responses...");
      const reply = await chatWithGemini(message, projectData, history);
      console.log("[Express API /api/chat] Gemini conversational assistant responded successfully.");
      return res.json({ reply, mode: "gemini" });

    } catch (geminiError: any) {
      console.warn(`[Express API /api/chat] Gemini chat failed: ${geminiError.message}`);

      // Fallback to Lemma if Gemini fails
      try {
        console.log("[Express API /api/chat] Attempting Lemma Chat Agent as fallback...");
        const reply = await chatWithLemma(message, projectData, history);
        console.log("[Express API /api/chat] Lemma Agent responded successfully.");
        return res.json({ reply, mode: "lemma" });

      } catch (lemmaError: any) {
        console.error(`[Express API /api/chat] Both chat services failed. Gemini: ${geminiError.message}, Lemma: ${lemmaError.message}`);
        
        // Return a helpful default response
        const defaultResponse = `I'm having trouble connecting to the AI assistant right now. Here are some suggestions based on your project:

**Immediate Actions:**
- Review your highest priority tasks first
- Check for any blocked items that need escalation  
- Identify tasks with approaching deadlines

**Common Focus Areas:**
- Address critical risks that could impact timeline
- Clear any dependencies blocking other team members
- Ensure testing environments are ready for upcoming deliveries

Please try your question again in a moment, or check the dashboard for detailed project insights.`;

        return res.json({ 
          reply: defaultResponse, 
          mode: "offline"
        });
      }
    }

  } catch (err) {
    next(err);
  }
});

export default router;
