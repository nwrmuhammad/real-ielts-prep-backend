import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const passageText = `A The first plastics were developed as a substitute for natural rubber. Chemically, rubber is a polymer—a compound containing large molecules that are formed by the bonding of many smaller, simpler units, repeated over and over again. The same bonding principle—polymerization—is the basis of the creation of a huge range of plastics by the chemical industry. The first plastic was developed as a result of a competition in the USA. In the 1860s, $10,000 was offered to anybody who could replace ivory—supplies of which were declining—with something equally good as a material for making billiard balls. The prize was won by John Wesley Hyatt, with a material called celluloid. Celluloid was made by dissolving cellulose, a carbohydrate obtained from plants, in a solution of camphor dissolved in ethanol. This new material rapidly found other applications in the manufacture of everyday products such as knife handles and detachable collars and cuffs. But perhaps the best-known celluloid product was photographic film, without which the film industry could never have taken off at the end of the 19th century. Celluloid can be repeatedly softened and reshaped by heat, and is known as a thermoplastic.

B In 1907, Leo Baekeland (1863–1944), a Belgian chemist working in the USA, invented a different kind of plastic, by causing phenol and formaldehyde to react together. Baekeland called it Bakelite, and it was the first of the thermosets—plastic that can be cast and moulded while hot, but cannot be softened by heat and reshaped once they have set. Bakelite was a good insulator, and was resistant to water and acid. With these properties it was soon being used in the manufacture of electrical switches as well as a variety of domestic items.

C As the century went on, the range of newly developed plastic increased. Chemists began looking for other small molecules that could be strung together to make polymers. In the 1930s, chemists in Britain discovered that the gas ethylene would polymerize under heat and pressure to form a thermoplastic they called polythene. Polypropylene followed in the 1950s. Both are used to make bottles, pipes and plastic bags. A small change in the starting material—replacing a hydrogen atom in ethylene with a chlorine atom—produced rigid PVC (polyvinyl chloride), a fireproof plastic suitable for drains and gutters. By adding certain chemicals, a soft form of PVC can be produced, suitable as a substitute for rubber in items such as waterproof clothing. A closely related plastic is Teflon or PTFE (polytetrafluoroethylene). It produces very little friction, making it ideal for products such as non-stick frying pans.

D Polystyrene, a hard, clear material like glass, was developed during the 1930s in Germany, and its applications included food containers and toys. Expanded polystyrene is rigid and is widely used in packaging and insulation. Polyurethane, developed in the same country, was commonly produced as a foam which was very useful in the production of insulating materials.

E In the 1930s, the first of the man-made fibres was created—nylon. Its inventor was a chemist called Wallace Carothers (1896–1937), who worked for the Du Pont company in the USA. He found that under the right conditions two particular chemicals would form a polymer that could be pumped out through holes and then stretched to form long glossy threads that could be woven like silk. Its first use was to make parachutes for the US armed forces in World War II. In the postwar years, it completely replaced silk in the manufacture of stockings. Many other synthetic fibres joined nylon, including Orion, Acrilan, and Terylene. Today most garments are made of a blend of natural fibres, such as cotton and wool, and man-made fibres that make fabrics easier to look after.

F Despite its enormous usefulness, plastic has its drawbacks. In fact one of its great strengths—its indestructibility—is its greatest disadvantage. Beaches all over the world, even on the remotest island, are littered with plastic bottles that nothing can destroy. Nor is it very easy to recycle plastics, as different types of plastic are often found in the same items and call for different treatments.

G Plastics can be made biodegradable by incorporating into their structure a material such as starch, which is attacked by bacteria and causes the plastic to fall apart. Other materials can be incorporated that gradually decay in sunlight—although bottles made of such materials have to be stored in the dark, to ensure they do not disintegrate before they have been used.`;

async function main() {
  console.log("Seeding: The development of plastics...");

  const test = await prisma.test.create({
    data: {
      title: "IELTS Academic Reading – The Development of Plastics",
      description: "A reading passage about the history and chemistry of plastics, with table completion and True/False/Not Given questions.",
      timeLimit: 20,
      isPublished: true,
    },
  });

  const passage = await prisma.passage.create({
    data: {
      testId: test.id,
      order: 1,
      title: "The Development of Plastics",
      content: passageText,
    },
  });

  // Questions 1–7: Table completion (FILL_IN_BLANK)
  const tableQuestions = [
    {
      order: 1,
      questionText: "What is the most well-known common use of Celluloid?",
      instruction: "NO MORE THAN THREE WORDS from the passage",
      correctAnswer: "photographic film",
      explanation: "Paragraph A: 'perhaps the best-known celluloid product was photographic film'",
    },
    {
      order: 2,
      questionText: "What is the name of the plastic invented in 1907 in the USA that can be cast and moulded but cannot be softened by heat?",
      instruction: "NO MORE THAN THREE WORDS from the passage",
      correctAnswer: "Bakelite",
      explanation: "Paragraph B: 'Baekeland called it Bakelite, and it was the first of the thermosets'",
    },
    {
      order: 3,
      questionText: "What was Bakelite commonly used to manufacture, besides domestic items?",
      instruction: "NO MORE THAN THREE WORDS from the passage",
      correctAnswer: "electrical switches",
      explanation: "Paragraph B: 'it was soon being used in the manufacture of electrical switches'",
    },
    {
      order: 4,
      questionText: "In which country was polythene discovered in the 1930s?",
      instruction: "NO MORE THAN THREE WORDS from the passage",
      correctAnswer: "Britain",
      explanation: "Paragraph C: 'chemists in Britain discovered that the gas ethylene would polymerize'",
    },
    {
      order: 5,
      questionText: "What property makes rigid PVC suitable for drains and gutters?",
      instruction: "NO MORE THAN THREE WORDS from the passage",
      correctAnswer: "fireproof",
      explanation: "Paragraph C: 'a fireproof plastic suitable for drains and gutters'",
    },
    {
      order: 6,
      questionText: "What is polystyrene described as in terms of its appearance and texture?",
      instruction: "NO MORE THAN THREE WORDS from the passage",
      correctAnswer: "hard, clear material",
      explanation: "Paragraph D: 'Polystyrene, a hard, clear material like glass'",
    },
    {
      order: 7,
      questionText: "In what form was polyurethane commonly produced?",
      instruction: "NO MORE THAN THREE WORDS from the passage",
      correctAnswer: "foam",
      explanation: "Paragraph D: 'commonly produced as a foam which was very useful in the production of insulating materials'",
    },
  ];

  for (const q of tableQuestions) {
    await prisma.question.create({
      data: {
        passageId: passage.id,
        order: q.order,
        type: "FILL_IN_BLANK",
        questionText: q.questionText,
        instruction: q.instruction,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: 1,
      },
    });
  }

  // Questions 8–13: TRUE / FALSE / NOT GIVEN
  const tfngQuestions = [
    {
      order: 8,
      questionText: "The chemical structure of rubber is very different to that of plastics.",
      correctAnswer: "FALSE",
      explanation: "Paragraph A: Both rubber and plastics share the same bonding principle—polymerization.",
    },
    {
      order: 9,
      questionText: "John Wesley Hyatt was an industrial chemist.",
      correctAnswer: "NOT GIVEN",
      explanation: "The passage says he won a competition but does not mention his profession.",
    },
    {
      order: 10,
      questionText: "Celluloid and Bakelite react in the same way to heat.",
      correctAnswer: "FALSE",
      explanation: "Celluloid is a thermoplastic (can be reshaped by heat); Bakelite is a thermoset (cannot be reshaped once set).",
    },
    {
      order: 11,
      questionText: "If an object is made of several plastics, these prove hard to break down and reuse.",
      correctAnswer: "TRUE",
      explanation: "Paragraph F: 'different types of plastic are often found in the same items and call for different treatments.'",
    },
    {
      order: 12,
      questionText: "Adding starch to plastic makes it more durable.",
      correctAnswer: "FALSE",
      explanation: "Paragraph G: starch is attacked by bacteria and causes the plastic to fall apart—making it biodegradable, not more durable.",
    },
    {
      order: 13,
      questionText: "Containers which are designed to decompose need particular storage conditions.",
      correctAnswer: "TRUE",
      explanation: "Paragraph G: 'bottles made of such materials have to be stored in the dark, to ensure they do not disintegrate before they have been used.'",
    },
  ];

  for (const q of tfngQuestions) {
    await prisma.question.create({
      data: {
        passageId: passage.id,
        order: q.order,
        type: "TRUE_FALSE_NG",
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: 1,
      },
    });
  }

  console.log(`✓ Test created: "${test.title}" (id: ${test.id})`);
  console.log(`✓ 1 passage, 13 questions added.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
