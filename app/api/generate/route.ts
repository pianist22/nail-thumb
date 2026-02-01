import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { put } from "@vercel/blob";
import { z } from "zod";
import { generateNanoBananaImages } from "@/lib/gemini";
import { makeTitleFromPrompt } from "@/lib/title";
import { checkDailyThumbnailLimit } from "@/lib/rate-limit";

const QuestionnaireSchema = z.object({
  thumbnailType: z.enum(["YouTube", "Instagram", "Course", "Podcast"]).default("YouTube"),
  textOverlay: z.enum(["Yes", "No"]).default("Yes"),
  fontStyle: z.enum(["Bold", "Clean", "Modern"]).default("Bold"),
  themeColor: z.enum(["Orange", "Neon", "Dark"]).default("Orange"),
  vibe: z.enum(["Cinematic", "Tech", "Funny", "Serious"]).default("Tech"),
  backgroundStyle: z.enum(["Blurred", "Abstract", "Gradient", "Realistic"]).default("Gradient"),
  subjectFocus: z.enum(["Center", "Left", "Right"]).default("Center"),
  objectsToInclude: z.string().default(""),
  objectsToExclude: z.string().default(""),
  variants: z.union([z.literal(1), z.literal(2)]).default(2),
});

const GenerateSchema = z.object({
  threadSlug: z.string().min(2),
  prompt: z.string().min(5, "Prompt is required"),
  imageUrl: z.string().url().optional(),
  enableEnhancement: z.boolean().default(false),
  questionnaire: QuestionnaireSchema.optional(),
});

function buildRewriteSystemPrompt() {
  return `
You are a professional prompt engineer for AI thumbnail generation.

Goal:
Rewrite the user's prompt into an optimized, clean, high-impact prompt for generating clickable social media thumbnails.

Rules:
- Keep output as ONE final prompt string (no explanations)
- Respect the user's preferences from the questionnaire strictly
- Ensure the result is suitable for a 16:9 thumbnail (1280x720)
- Emphasize contrast, bold composition, readable text, strong focal subject
- Avoid clutter; avoid unreadable small text; avoid watermark text

If imageUrl is provided:
- Assume the image contains the main subject
- The subject should remain clear, sharp, and front-focused

Output must include:
- Composition (subject placement + focus)
- Background style
- Color theme
- Typography style (if textOverlay = Yes)
- Short text overlay suggestion (max 5 words)
- Clean, modern thumbnail aesthetic
`.trim();
}

function buildUserPrompt({
  prompt,
  questionnaire,
  imageUrl,
}: {
  prompt: string;
  questionnaire: z.infer<typeof QuestionnaireSchema>;
  imageUrl?: string;
}) {
  return `
USER PROMPT:
${prompt}

QUESTIONNAIRE PREFERENCES (use exactly):
- thumbnailType: ${questionnaire.thumbnailType}
- textOverlay: ${questionnaire.textOverlay}
- fontStyle: ${questionnaire.fontStyle}
- themeColor: ${questionnaire.themeColor}
- vibe: ${questionnaire.vibe}
- backgroundStyle: ${questionnaire.backgroundStyle}
- subjectFocus: ${questionnaire.subjectFocus}
- objectsToInclude: ${questionnaire.objectsToInclude || "(none)"}
- objectsToExclude: ${questionnaire.objectsToExclude || "(none)"}
- variants: ${questionnaire.variants}

IMAGE CONTEXT URL:
${imageUrl ? imageUrl : "none"}
`.trim();
}

async function uploadBase64ToBlob(base64: string, mimeType: string) {
  const buffer = Buffer.from(base64, "base64");
  const ext = mimeType.includes("png") ? "png" : "jpg";
  const filename = `generated-${Date.now()}.${ext}`;

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: mimeType,
  });

  return blob.url;
}

// export async function POST(req: Request) {
//   const { isAuthenticated, userId } = await auth();
//   if (!isAuthenticated || !userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();
//   const parsed = GenerateSchema.safeParse(body);

//   if (!parsed.success) {
//     return NextResponse.json(
//       { error: "Invalid body", details: parsed.error.flatten() },
//       { status: 400 }
//     );
//   }

//   const { threadSlug, prompt, imageUrl, enableEnhancement } = parsed.data;

//   // If enhancement not enabled -> use defaults
//   const questionnaire = QuestionnaireSchema.parse(
//     enableEnhancement ? parsed.data.questionnaire ?? {} : {}
//   );

//   // Validate thread belongs to user
//   const thread = await prisma.thread.findUnique({
//     where: { slug: threadSlug },
//     select: { id: true, userId: true, title: true },
//   });

//   if (!thread || thread.userId !== userId) {
//     return NextResponse.json({ error: "Thread not found" }, { status: 404 });
//   }

//   const baseGenCount = await prisma.generation.count({
//     where: { threadId: thread.id, parentGenerationId: null },
//   });

//   if (baseGenCount >= 2) {
//     return NextResponse.json(
//       { error: "Thumbnail limit reached for this thread (2/2). Start a new chat." },
//       { status: 400 }
//     );
//   }

//   // Store user's message
//   await prisma.message.create({
//     data: {
//       threadId: thread.id,
//       role: "user",
//       content: {
//         prompt,
//         imageUrl: imageUrl ?? null,
//         enableEnhancement,
//         questionnaire,
//       },
//     },
//   });

//   // Prompt rewrite (GPT-4.1-mini)
//   const rewrite = await openai.chat.completions.create({
//     model: "gpt-4.1-mini",
//     temperature: 0.7,
//     messages: [
//       { role: "system", content: buildRewriteSystemPrompt() },
//       {
//         role: "user",
//         content: buildUserPrompt({ prompt, questionnaire, imageUrl }),
//       },
//     ],
//   });

//   const promptRewritten = rewrite.choices?.[0]?.message?.content?.trim() || prompt;

//   // Store assistant rewrite message
//   await prisma.message.create({
//     data: {
//       threadId: thread.id,
//       role: "assistant",
//       content: {
//         type: "prompt_rewrite",
//         promptRewritten,
//       },
//     },
//   });

//   // --- Generate images using Nano Banana (Gemini Image) ---
//     const images: Array<{ base64: string; mimeType: string }> = await generateNanoBananaImages({
//     prompt: promptRewritten,
//     imageUrl,
//     variants: questionnaire.variants,
//     });

//   if (images.length === 0) {
//     return NextResponse.json(
//       {
//         error:
//           "Nano Banana generation not implemented yet. Plug generateNanoBananaImages() in lib/gemini.ts",
//         promptRewritten,
//       },
//       { status: 501 }
//     );
//   }

//   // Upload generated images to Blob and return URLs
//   const urls = [];
//   for (const img of images) {
//     const url = await uploadBase64ToBlob(img.base64, img.mimeType);
//     urls.push({
//       url,
//       mimeType: img.mimeType,
//     });
//   }

//   // Store generation in DB
//   const generation = await prisma.generation.create({
//     data: {
//       threadId: thread.id,
//       promptRaw: prompt,
//       promptRewritten,
//       contextImageUrl: imageUrl ?? null,
//       variants: urls,
//       refinementCount: 0,
//       thumbnailCount: baseGenCount + 1
//     },
//     select: { id: true, createdAt: true },
//   });

//   // Store assistant generation message
//   await prisma.message.create({
//     data: {
//       threadId: thread.id,
//       role: "assistant",
//       content: {
//         type: "generation_result",
//         generationId: generation.id,
//         images: urls,
//       },
//     },
//   });

//   return NextResponse.json({
//     generationId: generation.id,
//     promptRewritten,
//     images: urls,
//   });
// }

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
  const parsed = GenerateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { threadSlug, prompt, imageUrl, enableEnhancement } = parsed.data;

  // If enhancement not enabled -> use defaults
  const questionnaire = QuestionnaireSchema.parse(
    enableEnhancement ? parsed.data.questionnaire ?? {} : {}
  );

  // Validate thread belongs to user
  const thread = await prisma.thread.findUnique({
    where: { slug: threadSlug },
    select: { id: true, userId: true, title: true },
  });

  if (!thread || thread.userId !== userId) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  // ✅ LIMIT: only 2 base generations per thread
  const baseGenCount = await prisma.generation.count({
    where: { threadId: thread.id, parentGenerationId: null },
  });

  if (baseGenCount >= 2) {
    return NextResponse.json(
      { error: "Thumbnail limit reached for this thread (2/2). Start a new chat." },
      { status: 400 }
    );
  }

  // Store user's message
  await prisma.message.create({
    data: {
      threadId: thread.id,
      role: "user",
      content: {
        prompt,
        imageUrl: imageUrl ?? null,
        enableEnhancement,
        questionnaire,
      },
    },
  });

  // Prompt rewrite (GPT-4.1-mini)
  const rewrite = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: buildRewriteSystemPrompt() },
      {
        role: "user",
        content: buildUserPrompt({ prompt, questionnaire, imageUrl }),
      },
    ],
  });

  const promptRewritten = rewrite.choices?.[0]?.message?.content?.trim() || prompt;

  // Store assistant rewrite message
  await prisma.message.create({
    data: {
      threadId: thread.id,
      role: "assistant",
      content: {
        type: "prompt_rewrite",
        promptRewritten,
      },
    },
  });

  // --- Generate images using Nano Banana (Gemini Image) ---
  const images: Array<{ base64: string; mimeType: string }> =
    await generateNanoBananaImages({
      prompt: promptRewritten,
      imageUrl,
      variants: questionnaire.variants,
    });

  // Upload generated images to Blob and return URLs
  const urls: Array<{ url: string; mimeType: string }> = [];
  for (const img of images) {
    const url = await uploadBase64ToBlob(img.base64, img.mimeType);
    urls.push({ url, mimeType: img.mimeType });
  }

  // Store generation in DB
  const generation = await prisma.generation.create({
    data: {
      threadId: thread.id,
      parentGenerationId: null, // ✅ base generation
      promptRaw: prompt,
      promptRewritten,
      contextImageUrl: imageUrl ?? null,
      variants: urls,
      refinementCount: 0,
      thumbnailCount: baseGenCount + 1,
    },
    select: { id: true, createdAt: true },
  });

  // Store assistant generation message
  await prisma.message.create({
    data: {
      threadId: thread.id,
      role: "assistant",
      content: {
        type: "generation_result",
        generationId: generation.id,
        images: urls,
      },
    },
  });

  // ✅ Keep thread ordering correct by updatedAt
  await prisma.thread.update({
    where: { id: thread.id },
    data: { updatedAt: new Date() },
  });

  if (thread.title === "New thumbnail chat") {
    await prisma.thread.update({
      where: { id: thread.id },
      data: {
        title: makeTitleFromPrompt(prompt),
      },
    });
  }


  return NextResponse.json({
    generationId: generation.id,
    promptRewritten,
    images: urls,
     remainingQuota: limit.remaining,
  });
}

