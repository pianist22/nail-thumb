import { GeneratorAppShell } from "@/components/generator/app-shell";
import { GeneratorChatPanel } from "@/components/generator/chat-panel";

export default async function GenerateThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <GeneratorAppShell currentSlug={slug}>
      <GeneratorChatPanel threadSlug={slug} />
    </GeneratorAppShell>
  );
}
