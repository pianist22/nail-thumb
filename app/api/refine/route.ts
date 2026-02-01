import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { generateNanoBananaImages } from "@/lib/gemini";
import { put } from "@vercel/blob";
import { checkDailyThumbnailLimit } from "@/lib/rate-limit";

const RefineSchema = z.object({
  threadSlug: z.string().min(2),
  generationId: z.string().min(5),
  selectedImageUrl: z.string().url(),
  refinePrompt: z.string().min(3),
});

async function uploadBase64ToBlob(base64: string, mimeType: string) {
  const buffer = Buffer.from(base64, "base64");
  const ext = mimeType.includes("png") ? "png" : "jpg";
  const filename = `refined-${Date.now()}.${ext}`;

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: mimeType,
  });

  return blob.url;
}

function refineSystemPrompt() {
  return `
You are a professional refinement prompt engineer for AI thumbnail generation.

Task:
Rewrite the user's refinement request into a short, direct image generation prompt.

Rules:
- Keep it concise, high signal (no fluff)
- Preserve the original thumbnail style and branding
- Apply ONLY requested refinements
- Ensure readability and strong contrast
- Output must be one single prompt string only
`.trim();
}

export async function POST(req: Request) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Rate limit check
  const limit = await checkDailyThumbnailLimit(userId);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Daily thumbnail limit reached",
        message: "You can generate only 3 thumbnails per day (v1.0 limit).",
        reset: "Resets at midnight UTC",
      },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = RefineSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { threadSlug, generationId, selectedImageUrl, refinePrompt } = parsed.data;

  const thread = await prisma.thread.findUnique({
    where: { slug: threadSlug },
    select: { id: true, userId: true },
  });

  if (!thread || thread.userId !== userId) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const gen = await prisma.generation.findUnique({
    where: { id: generationId },
    select: {
      id: true,
      threadId: true,
      promptRaw: true,
      promptRewritten: true,
      refinementCount: true,
      thumbnailCount: true,
      variants: true,
    },
  });

  if (!gen || gen.threadId !== thread.id) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  if (gen.refinementCount >= 3) {
    return NextResponse.json(
      { error: "Refinement limit reached (3/3)" },
      { status: 400 }
    );
  }

  // Store user refine message
  await prisma.message.create({
    data: {
      threadId: thread.id,
      role: "user",
      content: {
        type: "refine_request",
        generationId,
        selectedImageUrl,
        refinePrompt,
      },
    },
  });

  // rewrite refinement prompt
  const rewrite = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.5,
    messages: [
      { role: "system", content: refineSystemPrompt() },
      {
        role: "user",
        content: `
ORIGINAL PROMPT:
${gen.promptRewritten}

SELECTED VARIANT IMAGE:
${selectedImageUrl}

REFINEMENT REQUEST:
${refinePrompt}
`.trim(),
      },
    ],
  });

  const refinedPrompt =
    rewrite.choices?.[0]?.message?.content?.trim() || refinePrompt;

  // Generate images using selectedImageUrl as context image
  const images = await generateNanoBananaImages({
    prompt: refinedPrompt,
    imageUrl: selectedImageUrl,
    variants: 2,
  });

  const urls = [];
  for (const img of images) {
    const url = await uploadBase64ToBlob(img.base64, img.mimeType);
    urls.push({ url, mimeType: img.mimeType });
  }

  const newGen = await prisma.generation.create({
    data: {
      threadId: thread.id,
      parentGenerationId: gen.id,
      promptRaw: refinePrompt,
      promptRewritten: refinedPrompt,
      contextImageUrl: selectedImageUrl,
      variants: urls,
      refinementCount: gen.refinementCount + 1,
      thumbnailCount: gen.thumbnailCount,
    },
    select: { id: true, createdAt: true },
  });

  // assistant message
  await prisma.message.create({
    data: {
      threadId: thread.id,
      role: "assistant",
      content: {
        type: "refine_result",
        generationId: newGen.id,
        promptRewritten: refinedPrompt,
        images: urls,
      },
    },
  });

  // Touch thread updatedAt
  await prisma.thread.update({
    where: { id: thread.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    generationId: newGen.id,
    promptRewritten: refinedPrompt,
    images: urls,
    refinementCount: gen.refinementCount + 1,
    remainingRefinements: 3 - (gen.refinementCount + 1),
    remainingQuota: limit.remaining,
  });
}
