import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getPublishedTests(req: Request, res: Response) {
  const tests = await prisma.test.findMany({
    where: { isPublished: true },
    include: {
      passages: {
        select: { id: true, order: true, title: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { passages: true, testResults: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(tests);
}

export async function getTestById(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      passages: {
        include: {
          questions: { orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!test || !test.isPublished) {
    res.status(404).json({ message: "Test topilmadi" });
    return;
  }

  const sanitized = {
    ...test,
    passages: test.passages.map((p) => ({
      ...p,
      questions: p.questions.map(({ correctAnswer, explanation, ...q }: any) => q),
    })),
  };

  res.json(sanitized);
}

export async function getTestByIdAdmin(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      passages: {
        include: {
          questions: { orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!test) {
    res.status(404).json({ message: "Test topilmadi" });
    return;
  }

  res.json(test);
}

export async function getAllTests(req: Request, res: Response) {
  const tests = await prisma.test.findMany({
    include: {
      _count: { select: { passages: true, testResults: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(tests);
}

export async function createTest(req: Request, res: Response) {
  const { title, description, timeLimit, status } = req.body as any;
  const test = await prisma.test.create({
    data: { title, description, timeLimit: timeLimit ?? 60, status: status ?? "FREE" },
    include: { _count: { select: { passages: true, testResults: true } } },
  });
  res.status(201).json(test);
}

export async function updateTest(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const { title, description, timeLimit, isPublished, status } = req.body as any;
  const test = await prisma.test.update({
    where: { id },
    data: { title, description, timeLimit, isPublished, status },
  });
  res.json(test);
}

export async function deleteTest(req: Request, res: Response) {
  const id = req.params["id"] as string;
  await prisma.test.delete({ where: { id } });
  res.json({ message: "Test o'chirildi" });
}

export async function addPassage(req: Request, res: Response) {
  const testId = req.params["testId"] as string;
  const { order, title, content } = req.body as any;
  const passage = await prisma.passage.create({
    data: { testId, order, title, content },
  });
  res.status(201).json(passage);
}

export async function addQuestion(req: Request, res: Response) {
  const passageId = req.params["passageId"] as string;
  const { order, type, questionText, instruction, options, correctAnswer, explanation, points } = req.body as any;
  const question = await prisma.question.create({
    data: { passageId, order, type, questionText, instruction, options, correctAnswer, explanation, points },
  });
  res.status(201).json(question);
}

export async function updateQuestion(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const data = req.body as any;
  const question = await prisma.question.update({ where: { id }, data });
  res.json(question);
}

export async function deleteQuestion(req: Request, res: Response) {
  const id = req.params["id"] as string;
  await prisma.question.delete({ where: { id } });
  res.json({ message: "Savol o'chirildi" });
}
