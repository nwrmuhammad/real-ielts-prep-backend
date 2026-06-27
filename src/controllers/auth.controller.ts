import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
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
  res.status(201).json({ token, user });
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
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, tariff: user.tariff },
  });
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
