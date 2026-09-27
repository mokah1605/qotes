import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";

function createDatabaseClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (tursoUrl) {
    return createClient({ url: tursoUrl, ...(tursoToken ? { authToken: tursoToken } : {}) });
  }
  return createClient({ url: `file:${path.resolve(process.cwd(), "dev.db")}` });
}

const database = createDatabaseClient();

type Theme = { word: string; category: string };

// These are original Qotes app lines. They are not translations or quotations
// attributed to another author.
const themes: Theme[] = [
  { word: "முயற்சி", category: "Motivation" },
  { word: "நம்பிக்கை", category: "Motivation" },
  { word: "நேர்மை", category: "Wisdom" },
  { word: "பொறுமை", category: "Wisdom" },
  { word: "கற்றல்", category: "Learning" },
  { word: "அன்பு", category: "Love" },
  { word: "தைரியம்", category: "Courage" },
  { word: "ஒழுக்கம்", category: "Discipline" },
  { word: "நேரம்", category: "Life" },
  { word: "உழைப்பு", category: "Success" },
  { word: "கனவு", category: "Dreams" },
  { word: "மனஅமைதி", category: "Mindfulness" },
  { word: "நன்றியுணர்வு", category: "Gratitude" },
  { word: "கருணை", category: "Kindness" },
  { word: "விடாமுயற்சி", category: "Motivation" },
  { word: "சுயநம்பிக்கை", category: "Confidence" },
  { word: "ஆர்வம்", category: "Learning" },
  { word: "பொறுப்பு", category: "Life" },
  { word: "மாற்றம்", category: "Growth" },
  { word: "நட்பு", category: "Friendship" },
];

const introductions = [
  "நினைவில் கொள்:",
  "இன்று உனக்கான நினைவூட்டல்:",
  "ஒவ்வொரு பயணமும் சொல்லும் உண்மை:",
  "மனம் தளரும்போது நினைவு கொள்:",
  "உன் நாளை வழிநடத்தும் எண்ணம்:",
];

const endings = [
  "சிறிய செயல்களை பெரிய மாற்றங்களாக மாற்றும்.",
  "தொடர்ச்சியால் தனது வலிமையை வெளிப்படுத்தும்.",
  "சவால்களை அனுபவங்களாக மாற்றக் கற்றுத்தரும்.",
  "தினமும் ஒரு படி முன்னேறச் செய்யும்.",
  "உன் திறமையை அமைதியாக வளர்க்கும்.",
  "சரியான தருணத்தை விட சரியான செயலை மதிக்கும்.",
  "இருளான நாளிலும் வழியைத் தேட வைக்கும்.",
  "உன் முடிவுகளுக்கு அர்த்தம் சேர்க்கும்.",
  "பயத்தை விட முன்னேற்றத்தைத் தேர்ந்தெடுக்க வைக்கும்.",
  "தோல்விக்குப் பின்னும் எழுந்து நிற்க உதவும்.",
  "நல்ல பழக்கங்களை நாளைய பலமாக மாற்றும்.",
  "உன் உள்ளத்தின் குரலை தெளிவாகக் கேட்க வைக்கும்.",
  "ஒவ்வொரு தொடக்கத்தையும் வாய்ப்பாகப் பார்க்கச் செய்யும்.",
  "உன்னைச் சுற்றியவர்களின் நாளையும் ஒளிரச் செய்யும்.",
  "அவசரத்தை விட தெளிவான சிந்தனையைத் தேர்ந்தெடுக்கும்.",
  "காத்திருப்பின் மதிப்பை உணர்த்தும்.",
  "கடினமான நாளை உறுதியான நாளாக மாற்றும்.",
  "உன் இலக்கை நினைவில் வைத்து பாதையை அமைக்கும்.",
  "அமைதியில்கூட முன்னேற்றத்தை உருவாக்கும்.",
  "ஒவ்வொரு நாளையும் புதிதாக தொடங்கும் தைரியம் தரும்.",
];

const reflections = [
  "ஒரு நல்ல முடிவின் முதல் அடியாக இருக்கும்.",
  "உன் வளர்ச்சிக்கான அமைதியான முதலீடாக இருக்கும்.",
  "மனதில் விதைத்தால் செயல்களில் மலரும்.",
  "சரியான வழியைத் தேர்ந்தெடுக்க உதவும்.",
  "சிறிய வெற்றிகளின் பின்னால் நிற்கும் சக்தியாக இருக்கும்.",
  "உன் எண்ணத்தை உன் செயலுடன் இணைக்கும்.",
  "சிரமத்தை விட தீர்வை நோக்கிப் பார்க்க வைக்கும்.",
  "வாழ்க்கையை மெதுவாகவும் உறுதியாகவும் மாற்றும்.",
  "இன்று செய்யும் செயலில் நாளைய நம்பிக்கையை சேர்க்கும்.",
  "உன்னை நீயே மதிக்க கற்றுத்தரும்.",
  "முன்னேற்றம் ஒரு பழக்கமாக மாற உதவும்.",
  "ஒவ்வொரு தவறிலும் ஒரு பாடத்தைத் தேடும்.",
  "உன் பாதையை உன் மதிப்புகளுடன் இணைக்கும்.",
  "சிறந்த நாளுக்கான கதவைத் திறக்கும்.",
  "நல்ல மாற்றத்தின் விதையை தினமும் விதைக்கும்.",
  "உன் உள்ளத்தை நிலையாக வைத்திருக்கும்.",
  "இலக்கை நோக்கிச் செல்லும் அடிகளை அர்த்தமுள்ளதாக்கும்.",
  "உன் முயற்சிக்கு நம்பிக்கையான துணையாக இருக்கும்.",
  "நாளை பற்றிய பயத்தை செயலாக மாற்றும்.",
  "வாழ்க்கையில் நல்ல தடம் பதிக்க உதவும்.",
];

const encouragements = [
  "உன்னை நிறுத்த நினைக்கும் சந்தேகத்தை விட வலிமையானது.",
  "காத்திருக்கும் வெற்றியை நோக்கி உன்னை அழைத்துச் செல்லும்.",
  "கடினமான நேரத்தில் உன் உள்ளத்தை நேராக நிறுத்தும்.",
  "தொடங்குவதற்கான காரணத்தை உனக்குள் உருவாக்கும்.",
  "சிறிய முன்னேற்றத்தையும் கொண்டாட கற்றுத்தரும்.",
  "உன் திறன் மீது நம்பிக்கை கொள்ளச் செய்யும்.",
  "புதிய பாதையை உருவாக்கும் துணிவை தரும்.",
  "நாளின் குழப்பத்தில் ஒரு தெளிவான திசையாக இருக்கும்.",
  "உன் உண்மையான இலக்கை மீண்டும் நினைவூட்டும்.",
  "சிரமத்தைச் சந்திக்கும் மனவலிமையை வளர்க்கும்.",
  "உன் வாழ்வில் நல்ல ஒழுங்கை உருவாக்கும்.",
  "ஒவ்வொரு நாளும் உன்னை கொஞ்சம் மேம்படுத்தும்.",
  "உன் செயல்களுக்கு அர்த்தமுள்ள வேகத்தை தரும்.",
  "அமைதியான முயற்சியை குறிப்பிடத்தக்க பலனாக மாற்றும்.",
  "கண்ணுக்கு தெரியாத உழைப்பையும் மதிப்புமிக்கதாக்கும்.",
  "உன் கனவுகளுக்கு ஒரு நடைபாதையை அமைக்கும்.",
  "தோல்வியை முடிவாக அல்ல, திருப்பமாகப் பார்க்க வைக்கும்.",
  "நல்ல எண்ணங்களை நல்ல செயல்களாக மாற்றும்.",
  "உன் வாழ்வில் நீயே ஒளியாக இருக்க உதவும்.",
  "மறுநாளை எதிர்கொள்ளும் உறுதியை தரும்.",
];

function buildQuotes() {
  const quotes: { content: string; author: string; category: string; language: string }[] = [];
  const groups = [endings, reflections, encouragements, endings, reflections];

  for (const theme of themes) {
    for (const [introductionIndex, introduction] of introductions.entries()) {
      for (const ending of groups[introductionIndex]) {
        quotes.push({
          content: `${introduction} ${theme.word} ${ending}`,
          author: "Qotes Original Tamil",
          category: theme.category,
          language: "ta",
        });
      }
    }
  }

  if (quotes.length !== 2_000 || new Set(quotes.map((quote) => quote.content)).size !== 2_000) {
    throw new Error("Tamil quote generator must produce exactly 2,000 unique records.");
  }
  return quotes;
}

async function ensureLanguageColumn() {
  const columns = await database.execute('PRAGMA table_info("Quote")');
  const hasLanguage = columns.rows.some((column) => column.name === "language");
  if (!hasLanguage) {
    await database.execute('ALTER TABLE "Quote" ADD COLUMN "language" TEXT NOT NULL DEFAULT \'en\'');
    console.log("Added the language column; existing quotes are marked as English.");
  }
}

async function main() {
  await ensureLanguageColumn();
  const existingResult = await database.execute({
    sql: 'SELECT COUNT(*) AS count FROM "Quote" WHERE "language" = ? AND "author" = ?',
    args: ["ta", "Qotes Original Tamil"],
  });
  const existing = Number(existingResult.rows[0].count);
  if (existing > 0) {
    console.log(`Tamil seed skipped: ${existing} original Tamil quotes already exist.`);
    return;
  }

  const quotes = buildQuotes();
  const timestamp = new Date().toISOString();
  const statements = quotes.map((quote) => ({
    sql: 'INSERT INTO "Quote" ("id", "content", "author", "category", "language", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [randomUUID(), quote.content, quote.author, quote.category, quote.language, timestamp, timestamp],
  }));

  // Small write batches avoid sending one very large request to Turso.
  for (let index = 0; index < statements.length; index += 100) {
    await database.batch(statements.slice(index, index + 100), "write");
  }
  console.log(`Seeded ${quotes.length} original Tamil quotes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => database.close());
