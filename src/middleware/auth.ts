import { Request, Response, NextFunction } from "express";
import { verifyToken, STUDENT_COOKIE, ADMIN_COOKIE } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const cookieName = req.headers["x-auth-scope"] === "admin" ? ADMIN_COOKIE : STUDENT_COOKIE;
  const token = req.cookies?.[cookieName];
  if (!token) {
    res.status(401).json({ message: "Token taqdim etilmagan" });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Token noto'g'ri yoki muddati tugagan" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "Admin huquqi talab etiladi" });
    return;
  }
  next();
}
