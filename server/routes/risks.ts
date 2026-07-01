import { Router, Request, Response, NextFunction } from "express";
import { getRisks } from "../services/lemma";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const risks = await getRisks();
    return res.json(risks);
  } catch (err) {
    next(err);
  }
});

export default router;
