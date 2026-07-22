import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./config";
import { codeSubmissions, leaderboardEntries, users } from "./schema";

const sampleCodes = [
  {
    code: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].price > 100) {
      // Apply 10% discount for expensive items
      total += items[i].price * 0.9;
    } else {
      total += items[i].price;
    }
  }
  return total;
}`,
    language: "javascript",
    shameScore: 5,
    feedback:
      "Código básico mas funcional. Considere usar forEach ou reduce para melhor legibilidade.",
    roast:
      "Sério? Um loop for manual em 2024? Até meu primo de 8 anos usa forEach!",
  },
  {
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(30)
print(result)`,
    language: "python",
    shameScore: 8,
    feedback:
      "Implementação recursiva sem memoização. Performance extremamente ruim para números grandes.",
    roast:
      "Parabéns! Você acabou de descobrir como travar um computador com 3 linhas de código. Fibonacci recursivo sem cache é o equivalent a usar uma bomba para abrir uma porta.",
  },
  {
    code: `interface User {
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUsers(): User[] {
    return this.users;
  }
}`,
    language: "typescript",
    shameScore: 3,
    feedback:
      "Código bem estruturado com TypeScript. Boa separação de responsabilidades.",
    roast:
      "Hmm... está quase aceitável. Pelo menos você não usou `any` em tudo.",
  },
];

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Limpar dados existentes (ordem importante por causa das FK)
    console.log("🧹 Cleaning existing data...");
    await db.delete(leaderboardEntries);
    await db.delete(codeSubmissions);
    await db.delete(users);

    // Note: No need to reset sequences as we're using UUID primary keys

    // Criar usuários de teste
    console.log("👥 Creating test users...");
    const testUsers = await db
      .insert(users)
      .values([
        {
          sessionId: "dev-session-123",
          username: "devmaster",
          email: "dev@devroast.com",
        },
        {
          sessionId: "test-session-456",
          username: "codewrecker",
          email: "test@devroast.com",
        },
        {
          sessionId: "demo-session-789",
          username: "bugcreator",
          email: "demo@devroast.com",
        },
        {
          sessionId: "session-001",
          username: "nullpointer",
          email: "nullpointer@devroast.com",
        },
        {
          sessionId: "session-002",
          username: "stacksmash",
          email: "stacksmash@devroast.com",
        },
        {
          sessionId: "session-003",
          username: "lintwarrior",
          email: "lintwarrior@devroast.com",
        },
        {
          sessionId: "session-004",
          username: "typesage",
          email: "typesage@devroast.com",
        },
        {
          sessionId: "session-005",
          username: "callbackchaos",
          email: "callbackchaos@devroast.com",
        },
        {
          sessionId: "session-006",
          username: "sqlninja",
          email: "sqlninja@devroast.com",
        },
        {
          sessionId: "session-007",
          username: "featureflagger",
          email: "featureflagger@devroast.com",
        },
        {
          sessionId: "session-008",
          username: "mergeconflict",
          email: "mergeconflict@devroast.com",
        },
        {
          sessionId: "session-009",
          username: "packetloss",
          email: "packetloss@devroast.com",
        },
        {
          sessionId: "session-010",
          username: "devopsmancer",
          email: "devopsmancer@devroast.com",
        },
        {
          sessionId: "session-011",
          username: "regexrider",
          email: "regexrider@devroast.com",
        },
        {
          sessionId: "session-012",
          username: "heapwalker",
          email: "heapwalker@devroast.com",
        },
      ])
      .returning();

    console.log(`✅ Created ${testUsers.length} users`);

    // Criar submissões de código
    console.log("💻 Creating code submissions...");
    const submissions = [];

    for (let i = 0; i < sampleCodes.length; i++) {
      const sample = sampleCodes[i];
      const user = testUsers[i % testUsers.length];

      submissions.push({
        userId: user.id,
        originalCode: sample.code,
        language: sample.language,
        roastMode: "honest" as const,
        shameScore: sample.shameScore,
        aiFeedback: sample.feedback,
        aiRoast: sample.roast,
        analysisDurationMs: Math.floor(Math.random() * 5000) + 1000, // 1-6 segundos
        status: "completed" as const,
        analyzedAt: new Date(),
      });
    }

    const createdSubmissions = await db
      .insert(codeSubmissions)
      .values(submissions)
      .returning();
    console.log(`✅ Created ${createdSubmissions.length} code submissions`);

    // Criar entradas do leaderboard
    console.log("🏆 Creating leaderboard entries...");
    const leaderboardData = createdSubmissions
      .filter(
        (
          submission,
        ): submission is typeof submission & { shameScore: number } =>
          submission.shameScore !== null,
      )
      .map((submission, index) => ({
        userId: submission.userId,
        submissionId: submission.id,
        shameScore: submission.shameScore,
        language: submission.language,
        codePreview: `${submission.originalCode.slice(0, 100)}...`,
        rankPosition: index + 1,
        totalSubmissions: 1,
        averageScore: submission.shameScore.toString(),
      }));

    await db.insert(leaderboardEntries).values(leaderboardData);
    console.log(`✅ Created ${leaderboardData.length} leaderboard entries`);

    // Estatísticas finais
    console.log("\n📊 Seed completed! Database statistics:");

    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    const submissionCount = await db
      .select({ count: sql`count(*)` })
      .from(codeSubmissions);
    const leaderboardCount = await db
      .select({ count: sql`count(*)` })
      .from(leaderboardEntries);

    console.log(`👥 Users: ${userCount[0].count}`);
    console.log(`💻 Submissions: ${submissionCount[0].count}`);
    console.log(`🏆 Leaderboard entries: ${leaderboardCount[0].count}`);

    console.log("\n🎉 Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

// Execute seed
seed();
