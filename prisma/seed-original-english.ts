import { randomUUID } from "node:crypto";
import path from "node:path";
import { createClient } from "@libsql/client";

type Theme = { word: string; category: string };

function createDatabaseClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return url
    ? createClient({ url, ...(authToken ? { authToken } : {}) })
    : createClient({ url: `file:${path.resolve(process.cwd(), "dev.db")}` });
}

const database = createDatabaseClient();

// Written for Qotes. These are not quotations, translations, or adaptations of
// another author's work. The combinations intentionally form a 4,000-item catalog.
const themes: Theme[] = [
  { word: "courage", category: "Courage" },
  { word: "patience", category: "Wisdom" },
  { word: "focus", category: "Productivity" },
  { word: "kindness", category: "Kindness" },
  { word: "curiosity", category: "Learning" },
  { word: "discipline", category: "Discipline" },
  { word: "hope", category: "Motivation" },
  { word: "gratitude", category: "Gratitude" },
  { word: "confidence", category: "Confidence" },
  { word: "calm", category: "Mindfulness" },
  { word: "effort", category: "Success" },
  { word: "honesty", category: "Wisdom" },
  { word: "resilience", category: "Growth" },
  { word: "creativity", category: "Creativity" },
  { word: "friendship", category: "Friendship" },
  { word: "balance", category: "Life" },
  { word: "purpose", category: "Life" },
  { word: "learning", category: "Learning" },
  { word: "progress", category: "Motivation" },
  { word: "self-respect", category: "Confidence" },
];

const openings = [
  "A little",
  "Quiet",
  "Daily",
  "Honest",
  "Steady",
  "Patient",
  "Thoughtful",
  "Brave",
  "Simple",
  "Real",
];

const outcomes = [
  "turns an ordinary decision into a better direction.",
  "gives small actions a stronger meaning.",
  "helps tomorrow begin with a clearer mind.",
  "makes room for progress without demanding perfection.",
  "builds trust one choice at a time.",
  "keeps a hard day from deciding who you become.",
  "is often the first step toward a life you value.",
  "lets your values speak through your actions.",
  "grows when you practise it before you need it.",
  "can make the next step feel possible.",
  "turns uncertainty into something you can learn from.",
  "is stronger when it is joined by consistent action.",
  "helps you notice what is already working.",
  "leaves space for both ambition and rest.",
  "makes difficult choices easier to carry.",
  "creates a future from the work you do today.",
  "keeps you moving when the result is not visible yet.",
  "is a useful companion on any worthwhile journey.",
  "becomes more reliable every time you choose it.",
  "reminds you that growth does not need an audience.",
];

function buildQuotes() {
  const quotes: { content: string; author: string; category: string; language: string }[] = [];
  for (const theme of themes) {
    for (const opening of openings) {
      for (const outcome of outcomes) {
        quotes.push({
          content: `${opening} ${theme.word} ${outcome}`,
          author: "Qotes Original",
          category: theme.category,
          language: "en",
        });
      }
    }
  }
  if (quotes.length !== 4_000 || new Set(quotes.map((quote) => quote.content)).size !== 4_000) {
    throw new Error("English quote generator must produce exactly 4,000 unique records.");
  }
  return quotes;
}

async function main() {
  const columns = await database.execute('PRAGMA table_info("Quote")');
  if (!columns.rows.some((column) => column.name === "language")) {
    await database.execute('ALTER TABLE "Quote" ADD COLUMN "language" TEXT NOT NULL DEFAULT \'en\'');
  }

  // Likes for removed English records cannot remain because they reference Quote rows.
  await database.execute('DELETE FROM "Like" WHERE "quoteId" IN (SELECT "id" FROM "Quote" WHERE "language" = ?)', ["en"]);
  const removed = await database.execute('DELETE FROM "Quote" WHERE "language" = ?', ["en"]);

  const timestamp = new Date().toISOString();
  const statements = buildQuotes().map((quote) => ({
    sql: 'INSERT INTO "Quote" ("id", "content", "author", "category", "language", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [randomUUID(), quote.content, quote.author, quote.category, quote.language, timestamp, timestamp],
  }));
  for (let index = 0; index < statements.length; index += 100) {
    await database.batch(statements.slice(index, index + 100), "write");
  }
  console.log(`Removed ${removed.rowsAffected} English quotes and seeded 4,000 original English quotes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => database.close());
