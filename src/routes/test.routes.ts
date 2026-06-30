import { Router } from "express";
import {
  getPublishedTests,
  getTestById,
  getTestByIdAdmin,
  getAllTests,
  createTest,
  updateTest,
  deleteTest,
  addPassage,
  deletePassage,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/test.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// Public / authenticated
router.get("/", authenticate, getPublishedTests);

// Admin only
router.get("/admin/all", authenticate, requireAdmin, getAllTests);
router.get("/admin/:id", authenticate, requireAdmin, getTestByIdAdmin);
router.post("/", authenticate, requireAdmin, createTest);
router.get("/:id", authenticate, getTestById);
router.put("/:id", authenticate, requireAdmin, updateTest);
router.delete("/:id", authenticate, requireAdmin, deleteTest);

router.post("/:testId/passages", authenticate, requireAdmin, addPassage);
router.delete("/passages/:id", authenticate, requireAdmin, deletePassage);
router.post("/passages/:passageId/questions", authenticate, requireAdmin, addQuestion);
router.put("/questions/:id", authenticate, requireAdmin, updateQuestion);
router.delete("/questions/:id", authenticate, requireAdmin, deleteQuestion);

export default router;
