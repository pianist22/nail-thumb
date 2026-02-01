import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { makeThreadSlug } from "@/lib/thread";

export async function GET() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threads = await prisma.thread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  // console.log(threads);

  return NextResponse.json({ threads });
}

export async function POST() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  const thread = await prisma.thread.create({
    data: {
      userId,
      title: "New thumbnail chat",
      slug: makeThreadSlug(),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ thread }, { status: 201 });
}
