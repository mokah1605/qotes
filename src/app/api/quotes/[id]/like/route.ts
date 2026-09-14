import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientKey, error, isRateLimited } from "@/lib/api";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isRateLimited(clientKey(_req, session.user.id), 60, 60 * 1000)) return error("Too many requests", 429);

  const { id: quoteId } = await params;
  const quote = await prisma.quote.findUnique({ where: { id: quoteId }, select: { id: true } });
  if (!quote) return error("Quote not found", 404);
  const existing = await prisma.like.findUnique({ where: { userId_quoteId: { userId: session.user.id, quoteId } } });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { quoteId } });
    return NextResponse.json({ liked: false, likesCount: count });
  }

  try {
    await prisma.like.create({ data: { userId: session.user.id, quoteId } });
  } catch {
    return error("Like state changed. Please retry.", 409);
  }
  const count = await prisma.like.count({ where: { quoteId } });
  return NextResponse.json({ liked: true, likesCount: count });
}
