import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ielts.uz" },
    update: {},
    create: { name: "Admin", email: "admin@ielts.uz", password: adminPassword, role: "ADMIN" },
  });

  // Demo user
  const userPassword = await bcrypt.hash("user123", 12);
  await prisma.user.upsert({
    where: { email: "student@ielts.uz" },
    update: {},
    create: { name: "Ali Karimov", email: "student@ielts.uz", password: userPassword },
  });

  // Test 1
  const test = await prisma.test.create({
    data: {
      title: "IELTS Academic Reading – Practice Test 1",
      description: "3 ta passage, 40 ta savol. Vaqt: 60 daqiqa.",
      timeLimit: 60,
      isPublished: true,
    },
  });

  // Passage 1
  const passage1 = await prisma.passage.create({
    data: {
      testId: test.id,
      order: 1,
      title: "The History of Coffee",
      content: `Coffee is one of the world's most popular beverages. Its history dates back to the 9th century in Ethiopia, where a goat herder named Kaldi noticed that his goats became unusually energetic after eating berries from a certain tree. The story goes that Kaldi reported his findings to the local monastery, where the abbot made a drink from the berries and found that it kept him alert through long evening prayers.

Knowledge of this energizing berry began to spread. Coffee cultivation and trade began on the Arabian Peninsula. By the 15th century, coffee was being grown in the Yemeni district of Arabia. By the 16th century, it was known in the rest of the Middle East, Persia, Turkey, and North Africa. Coffee was not only enjoyed in homes but also in the many public coffee houses — called qahveh khaneh — which began to appear in cities across the Near East.

The popularity of the coffee houses was unequaled and people came to them for all kinds of social activity. Coffee houses quickly became such an important center for the exchange of information that they were often referred to as "Schools of the Wise." With thousands of pilgrims visiting the holy city of Mecca each year from all over the world, knowledge of this "wine of Araby" began to spread. European travelers to the Near East brought back stories of an unusual dark black beverage.

By the 17th century, coffee had made its way to Europe and was becoming popular across the continent. Some people reacted to this new beverage with suspicion or fear, calling it the "bitter invention of Satan." The local clergy condemned coffee when it came to Venice in 1600. The controversy was so great that Pope Clement VIII was asked to intervene. He decided to taste the beverage for himself before making a decision, and found the drink so satisfying that he gave it papal approval.

Despite such controversy, coffee houses were quickly becoming centers of social activity and communication in England. By the mid-17th century, there were over 300 coffee houses in London. The first coffee house in America opened in Boston in 1689. The Boston Tea Party of 1773, when American colonists disguised as Mohawk Indians protested British taxes by throwing 342 chests of tea from British ships into Boston Harbour, helped shift the American preference from tea to coffee.`,
    },
  });

  const questions1 = [
    {
      order: 1,
      type: "TRUE_FALSE_NG" as const,
      questionText: "Kaldi was a monk who discovered the effects of coffee berries.",
      correctAnswer: "FALSE",
      explanation: "Kaldi was a goat herder, not a monk.",
      points: 1,
    },
    {
      order: 2,
      type: "TRUE_FALSE_NG" as const,
      questionText: "Coffee cultivation began in Arabia in the 15th century.",
      correctAnswer: "TRUE",
      explanation: "The text states coffee was grown in Yemen by the 15th century.",
      points: 1,
    },
    {
      order: 3,
      type: "TRUE_FALSE_NG" as const,
      questionText: "Pope Clement VIII banned coffee from Rome.",
      correctAnswer: "FALSE",
      explanation: "Pope Clement VIII gave coffee papal approval after tasting it.",
      points: 1,
    },
    {
      order: 4,
      type: "MULTIPLE_CHOICE" as const,
      questionText: "What were qahveh khaneh?",
      options: [
        "A) Places where coffee was grown",
        "B) Public coffee houses in Near Eastern cities",
        "C) Schools for religious education",
        "D) Trade markets for coffee beans",
      ],
      correctAnswer: "B",
      explanation: "Qahveh khaneh were public coffee houses in cities across the Near East.",
      points: 1,
    },
    {
      order: 5,
      type: "MULTIPLE_CHOICE" as const,
      questionText: "Why did coffee houses become known as 'Schools of the Wise'?",
      options: [
        "A) They offered formal education courses",
        "B) They were built next to universities",
        "C) They were important centers for sharing information",
        "D) Wise men exclusively frequented them",
      ],
      correctAnswer: "C",
      explanation: "Coffee houses became centers for the exchange of information.",
      points: 1,
    },
    {
      order: 6,
      type: "FILL_IN_BLANK" as const,
      questionText: "By the mid-17th century, there were over ___ coffee houses in London.",
      correctAnswer: "300",
      explanation: "The text states 'there were over 300 coffee houses in London.'",
      points: 1,
    },
    {
      order: 7,
      type: "SHORT_ANSWER" as const,
      questionText: "In which city did the first American coffee house open?",
      correctAnswer: "Boston",
      explanation: "The first coffee house in America opened in Boston in 1689.",
      points: 1,
    },
  ];

  for (const q of questions1) {
    await prisma.question.create({ data: { passageId: passage1.id, ...q } });
  }

  // Passage 2
  const passage2 = await prisma.passage.create({
    data: {
      testId: test.id,
      order: 2,
      title: "Ocean Plastic Pollution",
      content: `The world's oceans are facing an unprecedented pollution crisis. Every year, millions of tonnes of plastic waste enter the ocean from rivers, beaches, and direct dumping at sea. This plastic debris poses a serious threat to marine ecosystems, wildlife, and ultimately human health.

Plastic pollution in the ocean comes in various forms. Large items such as fishing nets, bottles, and bags can entangle and suffocate marine animals. Sea turtles often mistake plastic bags for jellyfish, their natural prey, and can die from ingesting them. Seabirds feed plastic fragments to their chicks, who then starve despite having full stomachs. Whales have been found dead with hundreds of kilograms of plastic in their digestive systems.

Perhaps even more concerning is the problem of microplastics — tiny fragments less than 5mm in size. These form when larger plastic items break down through exposure to sunlight, waves, and bacteria. Microplastics have been found everywhere from the deepest ocean trenches to Arctic sea ice. They are now present in the food chain: fish eat microplastics, which then enter the human body when we eat fish.

The Great Pacific Garbage Patch, located between Hawaii and California, is perhaps the most famous example of ocean plastic accumulation. Contrary to popular belief, it is not a solid island of trash but rather a vast area of ocean where plastic concentrations are significantly higher than elsewhere. Currents in the Pacific Ocean converge in this area, trapping floating plastic in a slow-moving spiral.

Addressing ocean plastic pollution requires action at multiple levels. Reducing plastic production and improving waste management on land are the most effective long-term solutions. Many countries have already banned single-use plastics such as straws, bags, and cutlery. Ocean cleanup technologies are also being developed, though experts caution that these cannot solve the problem alone. Public awareness and individual behavior change — such as reducing plastic consumption and participating in beach cleanups — also play an important role.`,
    },
  });

  const questions2 = [
    {
      order: 8,
      type: "MULTIPLE_CHOICE" as const,
      questionText: "According to the passage, how do sea turtles become harmed by plastic?",
      options: [
        "A) They get trapped in fishing nets",
        "B) They mistake plastic bags for jellyfish",
        "C) They swallow microplastics from seawater",
        "D) They are cut by sharp plastic fragments",
      ],
      correctAnswer: "B",
      explanation: "Sea turtles mistake plastic bags for jellyfish and ingest them.",
      points: 1,
    },
    {
      order: 9,
      type: "TRUE_FALSE_NG" as const,
      questionText: "Microplastics are fragments larger than 5mm that form from breaking down plastic.",
      correctAnswer: "FALSE",
      explanation: "Microplastics are LESS than 5mm in size.",
      points: 1,
    },
    {
      order: 10,
      type: "TRUE_FALSE_NG" as const,
      questionText: "The Great Pacific Garbage Patch is a solid island of plastic waste.",
      correctAnswer: "FALSE",
      explanation: "It is a vast area with higher plastic concentrations, not a solid island.",
      points: 1,
    },
    {
      order: 11,
      type: "TRUE_FALSE_NG" as const,
      questionText: "Some countries have banned certain single-use plastic items.",
      correctAnswer: "TRUE",
      explanation: "Many countries have banned single-use plastics such as straws, bags, and cutlery.",
      points: 1,
    },
    {
      order: 12,
      type: "FILL_IN_BLANK" as const,
      questionText: "The Great Pacific Garbage Patch is located between Hawaii and ___.",
      correctAnswer: "California",
      explanation: "The passage states it is located between Hawaii and California.",
      points: 1,
    },
    {
      order: 13,
      type: "SHORT_ANSWER" as const,
      questionText: "What is the maximum size of a microplastic fragment?",
      correctAnswer: "5mm",
      explanation: "Microplastics are defined as fragments less than 5mm in size.",
      points: 1,
    },
  ];

  for (const q of questions2) {
    await prisma.question.create({ data: { passageId: passage2.id, ...q } });
  }

  // Passage 3
  const passage3 = await prisma.passage.create({
    data: {
      testId: test.id,
      order: 3,
      title: "The Science of Sleep",
      content: `Sleep is one of the most fascinating and still somewhat mysterious aspects of human biology. We spend approximately one-third of our lives asleep, yet scientists are still uncovering the many ways in which sleep affects our physical and mental health.

Sleep occurs in cycles, each lasting about 90 minutes. Within each cycle, we move through different stages: light sleep, deep sleep, and REM (Rapid Eye Movement) sleep. During REM sleep, our brain activity increases significantly, and this is when most dreaming occurs. The body is essentially paralyzed during REM sleep, which prevents us from acting out our dreams.

Deep sleep, also known as slow-wave sleep, is particularly important for physical recovery. During this stage, the body repairs tissues, builds muscle, and strengthens the immune system. Growth hormone is primarily released during deep sleep, which is why adequate sleep is so important for children and adolescents. Adults who consistently get less than seven hours of sleep per night have been shown to have higher rates of obesity, diabetes, cardiovascular disease, and even certain cancers.

The brain also performs essential maintenance during sleep. The glymphatic system — a network of channels surrounding blood vessels in the brain — becomes highly active during sleep, flushing out toxic waste products that accumulate during waking hours. These waste products include amyloid-beta, a protein associated with Alzheimer's disease. This has led researchers to suggest that chronic sleep deprivation may be a significant risk factor for developing Alzheimer's.

Sleep deprivation has immediate cognitive consequences. Even one night of poor sleep can impair concentration, decision-making, and emotional regulation. Reaction times slow to levels comparable to legal intoxication. Despite these well-documented effects, modern society often treats sleep as a luxury rather than a biological necessity. Artificial lighting, screen time, irregular work schedules, and social pressure to remain productive have contributed to what sleep researchers call a "sleep epidemic" in industrialized nations.`,
    },
  });

  const questions3 = [
    {
      order: 14,
      type: "MULTIPLE_CHOICE" as const,
      questionText: "How long does each sleep cycle approximately last?",
      options: ["A) 60 minutes", "B) 90 minutes", "C) 120 minutes", "D) 45 minutes"],
      correctAnswer: "B",
      explanation: "Each sleep cycle lasts about 90 minutes.",
      points: 1,
    },
    {
      order: 15,
      type: "TRUE_FALSE_NG" as const,
      questionText: "People can move freely and act out their dreams during REM sleep.",
      correctAnswer: "FALSE",
      explanation: "The body is paralyzed during REM sleep to prevent acting out dreams.",
      points: 1,
    },
    {
      order: 16,
      type: "TRUE_FALSE_NG" as const,
      questionText: "Growth hormone is primarily released during the REM stage of sleep.",
      correctAnswer: "FALSE",
      explanation: "Growth hormone is primarily released during deep (slow-wave) sleep.",
      points: 1,
    },
    {
      order: 17,
      type: "TRUE_FALSE_NG" as const,
      questionText: "The glymphatic system removes waste products from the brain during sleep.",
      correctAnswer: "TRUE",
      explanation: "The glymphatic system flushes toxic waste from the brain during sleep.",
      points: 1,
    },
    {
      order: 18,
      type: "MULTIPLE_CHOICE" as const,
      questionText: "What is amyloid-beta?",
      options: [
        "A) A sleep-inducing hormone",
        "B) A channel in the glymphatic system",
        "C) A protein associated with Alzheimer's disease",
        "D) A type of brain wave during deep sleep",
      ],
      correctAnswer: "C",
      explanation: "Amyloid-beta is a protein associated with Alzheimer's disease.",
      points: 1,
    },
    {
      order: 19,
      type: "FILL_IN_BLANK" as const,
      questionText: "Adults who consistently get less than ___ hours of sleep per night have higher rates of disease.",
      correctAnswer: "seven",
      explanation: "The passage states less than seven hours is associated with higher disease rates.",
      points: 1,
    },
    {
      order: 20,
      type: "SHORT_ANSWER" as const,
      questionText: "What term do sleep researchers use to describe the widespread lack of sleep in industrialized nations?",
      correctAnswer: "sleep epidemic",
      explanation: "Researchers call it a 'sleep epidemic' in industrialized nations.",
      points: 1,
    },
  ];

  for (const q of questions3) {
    await prisma.question.create({ data: { passageId: passage3.id, ...q } });
  }

  console.log("✅ Seed completed!");
  console.log("Admin: admin@ielts.uz / admin123");
  console.log("Student: student@ielts.uz / user123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
