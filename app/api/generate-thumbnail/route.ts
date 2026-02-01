import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    const model = "gemini-2.5-flash-image";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await res.json();

    // IMPORTANT: handle if Gemini fails
    if (!res.ok) {
      console.log("Gemini error response:", data);
      return NextResponse.json(
        { error: "Gemini API failed", details: data },
        { status: res.status }
      );
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p: any) => p.inlineData);

    if (!imgPart) {
      console.log("Gemini success but no image:", data);
      return NextResponse.json(
        { error: "No image returned from Gemini", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageBase64: imgPart.inlineData.data,
      mimeType: imgPart.inlineData.mimeType,
    });
  } catch (err: any) {
    console.log("API route crash:", err);
    return NextResponse.json(
      { error: "Server crashed", details: err.message },
      { status: 500 }
    );
  }
}
