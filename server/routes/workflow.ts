import { Router, Request, Response, NextFunction } from "express";
import { getWorkflowStatus, startWorkflowAsync } from "../services/lemma";

const router = Router();

// POST endpoint to start a workflow asynchronously (fire-and-forget)
router.post("/start", async (req: Request, res: Response, next: NextFunction) => {
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

    console.log("[Express API /api/workflow/start] Starting async workflow.");

    const runId = await startWorkflowAsync(payload);
    
    console.log(`[Express API /api/workflow/start] Started workflow with run ID: ${runId}`);
    
    return res.json({ 
      runId, 
      status: "RUNNING",
      message: "Workflow started successfully" 
    });

  } catch (err) {
    next(err);
  }
});

// GET endpoint to check workflow status
router.get("/status/:runId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { runId } = req.params;
    
    console.log(`[Express API /api/workflow/status] Checking status for run ID: ${runId}`);
    
    const status = await getWorkflowStatus(runId);
    
    return res.json(status);
    
  } catch (err) {
    next(err);
  }
});

export default router;