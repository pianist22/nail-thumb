import { prisma } from "@/lib/prisma";

const DAILY_LIMIT = 3;

function getTodayKey() {
  // Always UTC to avoid timezone abuse
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function checkDailyThumbnailLimit(userId: string) {
  const today = getTodayKey();

  const record = await prisma.rateLimit.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  if (!record) {
    // first request today
    await prisma.rateLimit.create({
      data: {
        userId,
        date: today,
        count: 1,
      },
    });

    return {
      allowed: true,
      remaining: DAILY_LIMIT - 1,
    };
  }

  if (record.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  await prisma.rateLimit.update({
    where: { id: record.id },
    data: { count: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: DAILY_LIMIT - (record.count + 1),
  };
}
