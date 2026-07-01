import { Router, Request, Response, NextFunction } from "express";
import { getTasks } from "../services/lemma";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await getTasks();
    return res.json(tasks);
  } catch (err) {
    next(err);
  }
});

export default router;
