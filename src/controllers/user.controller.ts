import { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  tariff: true,
  tariffExpiresAt: true,
  createdAt: true,
  _count: { select: { testResults: true } },
} as const;

// auto-expire: if tariff expired, downgrade to XAVASKOR
async function resolveUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!user) return null;
  const isPaid = user.tariff === "ERKATOY" || user.tariff === "AMATEUR";
  if (isPaid && user.tariffExpiresAt && user.tariffExpiresAt < new Date()) {
    return prisma.user.update({
      where: { id },
      data: { tariff: "XAVASKOR", tariffExpiresAt: null },
      select: USER_SELECT,
    });
  }
  return user;
}

export async function listUsers(req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: USER_SELECT,
    orderBy: { createdAt: "desc" },
  });

  // auto-expire in-place (no DB writes on list — frontend shows remaining days)
  const now = new Date();
  const result = users.map((u) => {
    const isPaid = u.tariff === "ERKATOY" || u.tariff === "AMATEUR";
    if (isPaid && u.tariffExpiresAt && u.tariffExpiresAt < now) {
      return { ...u, tariff: "XAVASKOR" as const, tariffExpiresAt: null };
    }
    return u;
  });

  res.json(result);
}

export async function getUser(req: AuthRequest, res: Response) {
  const user = await resolveUser(req.params["id"] as string);
  if (!user) { res.status(404).json({ message: "User topilmadi" }); return; }
  res.json(user);
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { name, email, role, password, tariff } = req.body;
  const id = req.params["id"] as string;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ message: "User topilmadi" }); return; }

  if (email && email !== existing.email) {
    const conflict = await prisma.user.findUnique({ where: { email } });
    if (conflict) { res.status(409).json({ message: "Bu email allaqachon band" }); return; }
  }

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 12);

  if (tariff) {
    data.tariff = tariff;
    if (tariff === "ERKATOY" || tariff === "AMATEUR") {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      data.tariffExpiresAt = expires;
    } else {
      data.tariffExpiresAt = null;
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
  res.json(user);
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const id = req.params["id"] as string;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ message: "User topilmadi" }); return; }

  if (existing.id === req.user?.userId) {
    res.status(400).json({ message: "O'zingizni o'chira olmaysiz" }); return;
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: "User o'chirildi" });
}
