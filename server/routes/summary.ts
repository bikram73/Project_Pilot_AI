import { Router, Request, Response, NextFunction } from "express";
import { getSummary } from "../services/lemma";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await getSummary();
    return res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;
