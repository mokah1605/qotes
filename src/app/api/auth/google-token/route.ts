import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { clientKey, error, isRateLimited, readJson } from "@/lib/api";

const googleClient = new OAuth2Client();

export async function POST(req: NextRequest) {
  if (isRateLimited(clientKey(req), 20, 10 * 60 * 1000)) return error("Too many sign-in attempts", 429);
  const body = await readJson(req);
  const idToken = typeof body?.idToken === "string" ? body.idToken : "";
  if (!idToken) return error("Missing token", 400);
  const audience = process.env.AUTH_GOOGLE_ID;
  if (!audience) return error("Authentication is not configured", 503);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience });
    payload = ticket.getPayload();
  } catch {
    return error("Invalid token", 401);
  }
  if (!payload || !payload.sub || !payload.email || !payload.email_verified ||
      !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss ?? "")) {
    return error("Invalid token", 401);
  }
  const { sub, email, name, picture } = payload;

  // Find or create user
  const existingAccount = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: sub } },
    include: { user: true },
  });
  let user = existingAccount?.user ?? await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name, image: picture, emailVerified: new Date() },
    });
  } else {
    // Keep name/image up to date
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name, image: picture },
    });
  }

  // Find or create the linked Google account
  if (!existingAccount) {
    await prisma.account.create({
      data: { userId: user.id, type: "oauth", provider: "google", providerAccountId: sub },
    });
  }

  // Keep a bounded number of active sessions and remove expired ones.
  const sessionToken = randomBytes(32).toString("hex");
  await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId: user.id, expires: { lt: new Date() } } });
    const sessions = await tx.session.findMany({ where: { userId: user.id }, orderBy: { expires: "asc" } });
    if (sessions.length >= 5) await tx.session.delete({ where: { id: sessions[0].id } });
    await tx.session.create({ data: { sessionToken, userId: user.id, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
  });

  return NextResponse.json({
    token: sessionToken,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? null,
  });
}
