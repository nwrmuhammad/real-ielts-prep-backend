import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout, getMe, updateMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Slows down brute-force / credential-stuffing attempts against login & register.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Juda ko'p urinish qilindi. Birozdan so'ng qayta urinib ko'ring." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);

export default router;
