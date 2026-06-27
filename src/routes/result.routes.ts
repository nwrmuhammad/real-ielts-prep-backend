import { Router } from "express";
import {
  startTest,
  submitTest,
  getMyResults,
  getResultDetail,
  getAllResults,
} from "../controllers/result.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/start", authenticate, startTest);
router.post("/:resultId/submit", authenticate, submitTest);
router.get("/my", authenticate, getMyResults);
router.get("/admin/all", authenticate, requireAdmin, getAllResults);
router.get("/:id", authenticate, getResultDetail);

export default router;
