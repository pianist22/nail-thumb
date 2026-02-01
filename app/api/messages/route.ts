import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const threadSlug = searchParams.get("threadSlug");

  if (!threadSlug) {
    return NextResponse.json({ error: "threadSlug required" }, { status: 400 });
  }

  const thread = await prisma.thread.findUnique({
    where: { slug: threadSlug },
    select: { id: true, userId: true },
  });

  if (!thread || thread.userId !== userId) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages });
}
