import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchSchema = z.object({
  title: z.string().min(2).max(80),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const thread = await prisma.thread.findUnique({
    where: { slug },
    select: { id: true, userId: true },
  });

  if (!thread || thread.userId !== userId) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const updated = await prisma.thread.update({
    where: { id: thread.id },
    data: { title: parsed.data.title },
    select: { slug: true, title: true, updatedAt: true },
  });

  return NextResponse.json({ thread: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const thread = await prisma.thread.findUnique({
    where: { slug },
    select: { id: true, userId: true },
  });

  if (!thread || thread.userId !== userId) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  await prisma.thread.delete({ where: { id: thread.id } });

  return NextResponse.json({ ok: true });
}
