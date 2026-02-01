import { nanoid } from "nanoid";

export function makeThreadSlug() {
  // Example: 232-cbac
  return `${Math.floor(Math.random() * 900 + 100)}-${nanoid(4)}`.toLowerCase();
}

export function makeThreadTitleFromPrompt(prompt: string) {
  // simple safe title generator (first MVP)
  const clean = (prompt || "").trim().replace(/\s+/g, " ");
  if (!clean) return "New thumbnail chat";
  return clean.length > 30 ? clean.slice(0, 30) + "..." : clean;
}
