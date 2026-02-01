export function makeTitleFromPrompt(prompt: string) {
  const cleaned = prompt
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 42);

  return cleaned.length < prompt.trim().length ? `${cleaned}...` : cleaned;
}
