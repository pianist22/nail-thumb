import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { makeThreadSlug } from "@/lib/thread";

export default async function GenerateIndexPage() {
  const { isAuthenticated, userId } = await auth();

  // ✅ Protect route (Clerk recommended)
  if (!isAuthenticated || !userId) {
    redirect("/sign-in");
  }

  // ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  // create a new thread
  const thread = await prisma.thread.create({
    data: {
      userId,
      title: "New thumbnail chat",
      slug: makeThreadSlug(),
    },
    select: { slug: true },
  });

  redirect(`/generate-thumbnail/${thread.slug}`);
}
