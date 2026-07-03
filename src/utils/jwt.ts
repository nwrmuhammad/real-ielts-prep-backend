import jwt from "jsonwebtoken";
import { CookieOptions } from "express";

const SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

// Student and admin sessions use separate cookie names so a browser can be
// signed in as both at once, without either token ever touching page JS.
export const STUDENT_COOKIE = "token";
export const ADMIN_COOKIE = "admin_token";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: MAX_AGE_MS,
  path: "/",
};
