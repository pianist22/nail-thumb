import { GeneratorAppShell } from "@/components/generator/app-shell";
import { HistoryPanel } from "@/components/history/history-panel";

export default async function HistoryPage() {
  return (
    <GeneratorAppShell currentSlug={"history"}>
      <HistoryPanel />
    </GeneratorAppShell>
  );
}
