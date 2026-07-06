import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { calculateBandScore } from "../utils/bandScore";

export async function startTest(req: Request, res: Response) {
  const authReq = req as any;
  const { testId } = req.body;

  const test = await prisma.test.findUnique({
    where: { id: testId, isPublished: true },
  });
  if (!test) {
    res.status(404).json({ message: "Test topilmadi" });
    return;
  }

  // Avvalgi tugallanmagan sessiyani tekshirish
  const existing = await prisma.testResult.findFirst({
    where: { userId: authReq.user.userId, testId, completed: false },
  });
  if (existing) {
    res.json(existing);
    return;
  }

  const result = await prisma.testResult.create({
    data: { userId: authReq.user.userId, testId },
  });
  res.status(201).json(result);
}

export async function submitTest(req: Request, res: Response) {
  const authReq = req as any;
  const resultId = req.params["resultId"] as string;
  const { answers, timeSpent } = req.body as any;
  // answers: [{ questionId: string, userAnswer: string }]

  const testResult = await prisma.testResult.findUnique({
    where: { id: resultId },
    include: { test: { include: { passages: { include: { questions: true } } } } },
  });

  if (!testResult || testResult.userId !== authReq.user.userId) {
    res.status(403).json({ message: "Ruxsat yo'q" });
    return;
  }
  // Resubmitting an already-completed result is allowed — it's how the
  // "Analyze" review flow saves edited answers when the student finishes
  // reviewing.

  const allQuestions = testResult.test.passages.flatMap((p) => p.questions);
  const totalPoints = allQuestions.reduce((sum, q) => sum + q.points, 0);

  let rawScore = 0;
  const answerRecords = [];

  for (const q of allQuestions) {
    const submitted = answers.find((a: any) => a.questionId === q.id);
    const userAnswer = submitted?.userAnswer?.trim() ?? null;
    const isCorrect = userAnswer?.toLowerCase() === q.correctAnswer.toLowerCase();
    if (isCorrect) rawScore += q.points;

    answerRecords.push({
      testResultId: resultId,
      questionId: q.id,
      userAnswer,
      isCorrect,
    });
  }

  const bandScore = calculateBandScore(rawScore, totalPoints);

  // Upsert answers
  await prisma.$transaction([
    ...answerRecords.map((a) =>
      prisma.answer.upsert({
        where: { testResultId_questionId: { testResultId: a.testResultId, questionId: a.questionId } },
        create: a,
        update: { userAnswer: a.userAnswer, isCorrect: a.isCorrect },
      })
    ),
    prisma.testResult.update({
      where: { id: resultId },
      data: {
        completed: true,
        submittedAt: new Date(),
        timeSpent,
        rawScore,
        totalPoints,
        bandScore,
      },
    }),
  ]);

  const updated = await prisma.testResult.findUnique({
    where: { id: resultId },
    include: { answers: { include: { question: true } } },
  });

  res.json(updated);
}

export async function getMyResults(req: Request, res: Response) {
  const authReq = req as any;
  const results = await prisma.testResult.findMany({
    where: { userId: authReq.user.userId, completed: true },
    include: { test: { select: { id: true, title: true } } },
    orderBy: { submittedAt: "desc" },
  });
  res.json(results);
}

export async function getResultDetail(req: Request, res: Response) {
  const authReq = req as any;
  const id = req.params["id"] as string;

  const result = await prisma.testResult.findUnique({
    where: { id },
    include: {
      test: { select: { id: true, title: true } },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              order: true,
              type: true,
              questionText: true,
              options: true,
              correctAnswer: true,
              explanation: true,
              points: true,
              passage: { select: { title: true, order: true } },
            },
          },
        },
        orderBy: { question: { order: "asc" } },
      },
    },
  });

  if (!result || result.userId !== authReq.user.userId) {
    res.status(403).json({ message: "Ruxsat yo'q" });
    return;
  }

  res.json(result);
}

// Admin: barcha natijalar
export async function getAllResults(req: Request, res: Response) {
  const results = await prisma.testResult.findMany({
    where: { completed: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
      test: { select: { id: true, title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
  res.json(results);
}
