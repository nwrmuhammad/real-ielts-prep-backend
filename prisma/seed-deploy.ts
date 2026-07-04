import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SEED_SCRIPTS = [
  "prisma/seed.ts",
  "prisma/seed-cambridge17.ts",
  "prisma/seed-cambridge19.ts",
  "prisma/seed-plastics.ts",
  "prisma/seed-volume9.ts",
];

async function main() {
  const testCount = await prisma.test.count();
  if (testCount > 0) {
    console.log(`Seed skipped: ${testCount} test(s) already in database.`);
    return;
  }

  console.log("No tests found in database — running seed scripts...");
  for (const script of SEED_SCRIPTS) {
    console.log(`\n--- ${script} ---`);
    execSync(`npx ts-node -P tsconfig.seed.json ${script}`, { stdio: "inherit" });
  }
  console.log("\nDeploy seed completed.");
}

main()
  .catch((e) => {
    console.error("Deploy seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
