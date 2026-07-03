import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken, authCookieOptions, STUDENT_COOKIE, ADMIN_COOKIE } from "../utils/jwt";

const MIN_PASSWORD_LENGTH = 6;

function cookieNameFor(req: Request, role: string): string {
  return req.headers["x-auth-scope"] === "admin" && role === "ADMIN" ? ADMIN_COOKIE : STUDENT_COOKIE;
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    return;
  }

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({ message: `Parol kamida ${MIN_PASSWORD_LENGTH} belgidan iborat bo'lishi kerak` });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, tariff: true },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.cookie(cookieNameFor(req, user.role), token, authCookieOptions);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email va parolni kiriting" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.cookie(cookieNameFor(req, user.role), token, authCookieOptions);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, tariff: user.tariff },
  });
}

export async function logout(req: Request, res: Response) {
  const cookieName = req.headers["x-auth-scope"] === "admin" ? ADMIN_COOKIE : STUDENT_COOKIE;
  res.clearCookie(cookieName, { ...authCookieOptions, maxAge: undefined });
  res.status(204).end();
}

export async function updateMe(req: Request, res: Response) {
  const authReq = req as any;
  const { name, email, currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: authReq.user.userId } });
  if (!user) { res.status(404).json({ message: "User topilmadi" }); return; }

  const data: Record<string, unknown> = {};

  if (name && name.trim()) data.name = name.trim();

  if (email && email.trim() && email.trim() !== user.email) {
    const conflict = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (conflict) { res.status(409).json({ message: "Bu email allaqachon band" }); return; }
    data.email = email.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ message: "Joriy parolni kiriting" }); return;
    }
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ message: `Parol kamida ${MIN_PASSWORD_LENGTH} belgidan iborat bo'lishi kerak` }); return;
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ message: "Joriy parol noto'g'ri" }); return;
    }
    data.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "O'zgartirish uchun ma'lumot kiriting" }); return;
  }

  const updated = await prisma.user.update({
    where: { id: authReq.user.userId },
    data,
    select: { id: true, name: true, email: true, role: true, tariff: true, tariffExpiresAt: true, createdAt: true },
  });
  res.json(updated);
}

export async function getMe(req: Request, res: Response) {
  const authReq = req as any;
  let user = await prisma.user.findUnique({
    where: { id: authReq.user.userId },
    select: { id: true, name: true, email: true, role: true, tariff: true, tariffExpiresAt: true, createdAt: true },
  });
  if (!user) { res.status(404).json({ message: "User topilmadi" }); return; }

  // auto-expire
  if (user.tariff === "ERKATOY" && user.tariffExpiresAt && user.tariffExpiresAt < new Date()) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { tariff: "XAVASKOR", tariffExpiresAt: null },
      select: { id: true, name: true, email: true, role: true, tariff: true, tariffExpiresAt: true, createdAt: true },
    });
  }

  res.json(user);
}
