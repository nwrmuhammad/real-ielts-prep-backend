import { Router } from "express";
import { listUsers, getUser, updateUser, deleteUser } from "../controllers/user.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/",        listUsers);
router.get("/:id",     getUser);
router.put("/:id",     updateUser);
router.delete("/:id",  deleteUser);

export default router;
