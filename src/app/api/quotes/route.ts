import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QUOTE_CATEGORIES, clientKey, error, isRateLimited, readJson } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim() || null;
  const search = searchParams.get("search")?.trim() || null;
  const language = searchParams.get("language")?.trim() || null;
  const pageValue = searchParams.get("page") ?? "1";
  if (!/^[1-9]\d{0,4}$/.test(pageValue)) return error("Page must be a positive integer", 400);
  if (category && category !== "All" && !QUOTE_CATEGORIES.has(category)) return error("Unknown category", 400);
  if (language && language !== "en" && language !== "ta") return error("Unknown language", 400);
  if (search && search.length > 100) return error("Search must be 100 characters or fewer", 400);
  const page = Number(pageValue);
  const limit = 12;

  const where = {
    ...(category && category !== "All" ? { category } : {}),
    ...(language ? { language } : {}),
    ...(search
      ? {
          OR: [
            { content: { contains: search } },
            { author: { contains: search } },
          ],
        }
      : {}),
  };

  const userId = session?.user?.id;

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        user: { select: { name: true, image: true } },
        ...(userId
          ? { likes: { where: { userId } } }
          : {}),
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  return NextResponse.json({
    quotes: quotes.map((q) => ({
      ...q,
      liked: userId ? ("likes" in q && Array.isArray(q.likes) ? q.likes.length > 0 : false) : false,
      likesCount: q._count.likes,
      likes: undefined,
      _count: undefined,
    })),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(clientKey(req, session.user.id), 10, 60 * 60 * 1000)) {
    return error("Too many quote submissions. Try again later.", 429);
  }

  const body = await readJson(req);
  if (!body) return error("A JSON object is required", 400);
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "General";

  if (!content || !author) {
    return NextResponse.json(
      { error: "Content and author are required" },
      { status: 400 }
    );
  }
  if (content.length > 1_000 || author.length > 120) return error("Quote or author is too long", 400);
  if (!QUOTE_CATEGORIES.has(category)) return error("Unknown category", 400);

  const quote = await prisma.quote.create({
    data: {
      content,
      author,
      category,
      userId: session.user.id,
    },
  });

  return NextResponse.json(quote, { status: 201 });
}
