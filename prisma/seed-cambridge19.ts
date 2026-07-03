import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import test1 from "./data/cambridge19-test1.json";
import test2 from "./data/cambridge19-test2.json";
import test3 from "./data/cambridge19-test3.json";
import test4 from "./data/cambridge19-test4.json";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const tests = [test1, test2, test3, test4];

async function main() {
  for (const t of tests) {
    console.log(`Adding ${t.title}...`);

    const test = await prisma.test.create({
      data: {
        title: t.title,
        description: `IELTS Academic Reading — ${t.title}. 3 ta passage, 40 ta savol. Vaqt: 60 daqiqa.`,
        timeLimit: 60,
        isPublished: true,
        status: "FREE",
      },
    });

    for (const p of t.passages) {
      const passage = await prisma.passage.create({
        data: {
          testId: test.id,
          order: p.order,
          title: p.title,
          content: p.content,
        },
      });

      for (const q of p.questions) {
        await prisma.question.create({
          data: {
            passageId: passage.id,
            order: q.order,
            type: q.type as any,
            questionText: q.questionText,
            options: q.options ?? undefined,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points ?? 1,
          },
        });
      }
    }

    console.log(`✅ ${t.title} added! Test ID: ${test.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
