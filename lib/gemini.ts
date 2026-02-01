type NanoBananaImage = {
  base64: string;
  mimeType: string;
};

async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(imageUrl);

  if (!res.ok) {
    throw new Error(`Failed to fetch input image from URL: ${imageUrl}`);
  }

  const mimeType = res.headers.get("content-type") || "image/png";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return { base64, mimeType };
}

async function callGeminiGenerateImage({
  prompt,
  imageUrl,
}: {
  prompt: string;
  imageUrl?: string;
}): Promise<NanoBananaImage> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env.local");
  }

  const model = "gemini-2.5-flash-image";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  // ✅ Parts: text always included
  const parts: any[] = [{ text: prompt }];

  // ✅ If user uploaded image, attach it to the parts
  if (imageUrl) {
    const { base64, mimeType } = await fetchImageAsBase64(imageUrl);

    parts.push({
      inlineData: {
        data: base64,
        mimeType,
      },
    });
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts }],
    }),
  });

  const data = await res.json();

  // IMPORTANT: handle if Gemini fails
  if (!res.ok) {
    console.log("Gemini error response:", data);
    throw new Error(
      data?.error?.message || `Gemini API failed with status ${res.status}`
    );
  }

  const responseParts = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = responseParts.find((p: any) => p.inlineData);

  if (!imgPart?.inlineData?.data) {
    console.log("Gemini success but no image:", data);
    throw new Error("No image returned from Gemini");
  }

  return {
    base64: imgPart.inlineData.data,
    mimeType: imgPart.inlineData.mimeType || "image/png",
  };
}

export async function generateNanoBananaImages({
  prompt,
  imageUrl,
  variants = 2,
}: {
  prompt: string;
  imageUrl?: string;
  variants?: 1 | 2;
}): Promise<NanoBananaImage[]> {
  if (!prompt || prompt.trim().length < 3) {
    throw new Error("Prompt is required for image generation.");
  }

  // ✅ Ensure variants is either 1 or 2
  const count: 1 | 2 = variants === 1 ? 1 : 2;

  // ✅ Generate multiple variants by making multiple calls
  const results: NanoBananaImage[] = [];

  for (let i = 0; i < count; i++) {
    // You can slightly vary the prompt to encourage diversity
    const variantPrompt =
      count === 1
        ? prompt
        : `${prompt}\n\nVariant: ${i + 1} (generate a slightly different composition and layout).`;

    const img = await callGeminiGenerateImage({
      prompt: variantPrompt,
      imageUrl,
    });

    results.push(img);
  }

  return results;
}
