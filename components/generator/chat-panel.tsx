

"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ThreadTimeline } from "@/components/generator/thread-timeline";

type Questionnaire = {
  thumbnailType: "YouTube" | "Instagram" | "Course" | "Podcast";
  textOverlay: "Yes" | "No";
  fontStyle: "Bold" | "Clean" | "Modern";
  themeColor: "Orange" | "Neon" | "Dark";
  vibe: "Cinematic" | "Tech" | "Funny" | "Serious";
  backgroundStyle: "Blurred" | "Abstract" | "Gradient" | "Realistic";
  subjectFocus: "Center" | "Left" | "Right";
  objectsToInclude: string;
  objectsToExclude: string;
  variants: 1 | 2;
};

const DEFAULT_Q: Questionnaire = {
  thumbnailType: "YouTube",
  textOverlay: "Yes",
  fontStyle: "Bold",
  themeColor: "Orange",
  vibe: "Tech",
  backgroundStyle: "Gradient",
  subjectFocus: "Center",
  objectsToInclude: "",
  objectsToExclude: "",
  variants: 2,
};

type GenImage = { url: string; mimeType: string };

async function forceDownloadImage(url: string, filename = "thumbnail.png") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download image");
  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

/**
 * Truncate helper for thread renaming
 */
function truncateTitle(s: string, n = 60) {
  if (!s) return "Thumbnail";
  return s.length <= n ? s : s.slice(0, n).trim() + "...";
}

export function GeneratorChatPanel({ threadSlug }: { threadSlug: string }) {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileUploading, setFileUploading] = useState(false);

  const [enhanceEnabled, setEnhanceEnabled] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(DEFAULT_Q);

  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);

  const [loadingStage, setLoadingStage] = useState<
    null | "prompt" | "rewrite" | "generate" | "final"
  >(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const [generated, setGenerated] = useState<GenImage[]>([]);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // Refinement states
  const [refineOpen, setRefineOpen] = useState(false);
  const [selectedVariantUrl, setSelectedVariantUrl] = useState<string | null>(
    null
  );
  const [refinePrompt, setRefinePrompt] = useState("");
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(
    null
  );
  const [remainingRefines, setRemainingRefines] = useState<number>(3);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);


  // Timeline refresh key (auto refreshes timeline & sidebar via event)
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0);

  const stages = useMemo(() => {
    return [
      { key: "prompt", label: "Prompt received" },
      { key: "rewrite", label: "Rewriting + enhancing prompt" },
      { key: "generate", label: "Generating thumbnail variants" },
      { key: "final", label: "Finalizing + delivering output" },
    ] as const;
  }, []);

  async function uploadFile(file: File) {
    setFileUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setImageUrl(data.url);
    } finally {
      setFileUploading(false);
    }
  }

  /**
   * Auto rename thread:
   *  - only rename if current title === "New thumbnail chat"
   *  - use provided newTitle (from promptRewritten or prompt snippet)
   *  - on success dispatch 'threads:refresh' event so sidebar refreshes
   */
  async function autoRenameThreadIfDefault(newTitleCandidate: string) {
    try {
      const infoRes = await fetch(`/api/thread?slug=${encodeURIComponent(threadSlug)}`);
      if (!infoRes.ok) return;
      const infoData = await infoRes.json();
      const currentTitle = infoData?.thread?.title;
      if (!currentTitle) return;

      if (currentTitle === "New thumbnail chat") {
        const newTitle = truncateTitle(newTitleCandidate || prompt);
        const renameRes = await fetch("/api/threads/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadSlug, newTitle }),
        });
        if (renameRes.ok) {
          // notify all listeners (sidebar etc.)
          window.dispatchEvent(new CustomEvent("threads:refresh"));
          // also refresh timeline list
          setTimelineRefreshKey((k) => k + 1);
        }
      }
    } catch (err) {
      // non-blocking — just log
      console.warn("auto rename failed", err);
    }
  }

  async function onGenerate() {
    if (!prompt.trim()) {
      alert("Prompt description is required.");
      return;
    }

    setGenerated([]);
    setLoadingStage("prompt");
    setLoadingMessage("Received your prompt. Preparing your thumbnail request...");

    // UX-driven stage animation loop (stops when API returns)
    let stageIndex = 0;
    const stageSequence: Array<"prompt" | "rewrite" | "generate" | "final"> = [
      "prompt",
      "rewrite",
      "generate",
      "final",
    ];

    const stageMessages: Record<(typeof stageSequence)[number], string[]> = {
      prompt: [
        "Received your prompt. Preparing your thumbnail request...",
        "Analyzing your input and thumbnail intent...",
      ],
      rewrite: [
        "Enhancing prompt with professional thumbnail structure...",
        "Optimizing style, vibe, and layout preferences...",
      ],
      generate: [
        "Generating stunning thumbnail variants (this can take time)...",
        "Rendering composition, colors, and text placement...",
      ],
      final: ["Finalizing output quality...", "Uploading results and preparing download..."],
    };

    let msgIndex = 0;
    const interval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stageSequence.length - 1);
      const currentStage = stageSequence[stageIndex];
      setLoadingStage(currentStage);
      const msgs = stageMessages[currentStage];
      msgIndex = (msgIndex + 1) % msgs.length;
      setLoadingMessage(msgs[msgIndex]);
    }, 3500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadSlug,
          prompt,
          imageUrl: imageUrl ? imageUrl : undefined,
          enableEnhancement: enhanceEnabled,
          questionnaire,
        }),
      });

      const data = await res.json();

      //  RATE LIMIT HANDLING
      if (res.status === 429) {
        alert(
          data?.message ??
            "Daily limit reached. You can generate only 3 thumbnails per day."
        );
        return;
      }

      if (!res.ok) {
        console.error(data);
        alert(data?.error || "Generation failed");
        return;
      }

      // store generationId for possible future refinements
      setActiveGenerationId(data.generationId);
      setRemainingRefines(3); // reset refinement allowance for this new generation

      // set images and finish loading
      setGenerated(data.images || []);
      setLoadingStage("final");
      setLoadingMessage("Done! Delivering your thumbnails...");

      if (typeof data.remainingQuota === "number") {
        setRemainingQuota(data.remainingQuota);
      }


      // Auto rename if needed (use promptRewritten if returned)
      const promptRewritten = data.promptRewritten || prompt;
      autoRenameThreadIfDefault(promptRewritten);

      // refresh timeline (shows the new assistant messages)
      setTimelineRefreshKey((k) => k + 1);

      // notify global listeners (sidebar)
      window.dispatchEvent(new CustomEvent("threads:refresh"));
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Try again.");
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setLoadingStage(null);
        setLoadingMessage("");
      }, 700);
    }
  }

  /**
   * Refinement flow:
   * - close modal immediately for UX
   * - show progress in the main panel (loadingStage)
   * - call /api/refine and update images + timeline
   */
  async function onRefine() {
    if (!activeGenerationId) {
      alert("No generation found to refine.");
      return;
    }
    if (!selectedVariantUrl) {
      alert("Please select a thumbnail variant to refine.");
      return;
    }
    if (!refinePrompt.trim()) {
      alert("Refinement prompt is required.");
      return;
    }

    // Close modal right away for better UX
    setRefineOpen(false);

    // start progress
    setLoadingStage("prompt");
    setLoadingMessage("Sending your refinement request...");

    // stage animation loop
    let stageIndex = 0;
    const stageSequence: Array<"prompt" | "rewrite" | "generate" | "final"> = [
      "prompt",
      "rewrite",
      "generate",
      "final",
    ];
    const stageMessages: Record<(typeof stageSequence)[number], string[]> = {
      prompt: ["Preparing refinement..."],
      rewrite: ["Rewriting refinement prompt..."],
      generate: ["Generating refined images..."],
      final: ["Finalizing refined images..."],
    };
    let msgIndex = 0;
    const interval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stageSequence.length - 1);
      const currentStage = stageSequence[stageIndex];
      setLoadingStage(currentStage);
      const msgs = stageMessages[currentStage];
      msgIndex = (msgIndex + 1) % msgs.length;
      setLoadingMessage(msgs[msgIndex]);
    }, 3000);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadSlug,
          generationId: activeGenerationId,
          selectedImageUrl: selectedVariantUrl,
          refinePrompt,
        }),
      });

      const data = await res.json();

      // RATE LIMIT HANDLING
      if (res.status === 429) {
        alert(
          data?.message ??
            "Daily limit reached. You can generate only 3 thumbnails per day."
        );
        return;
      }

      if (!res.ok) {
        console.error(data);
        alert(data?.error || "Refinement failed");
        return;
      }

      // update images, generation id, remaining refines
      setGenerated(data.images || []);
      setActiveGenerationId(data.generationId);
      setRemainingRefines(data.remainingRefinements ?? 0);

      if (typeof data.remainingQuota === "number") {
        setRemainingQuota(data.remainingQuota);
      }


      // refresh timeline + sidebar
      setTimelineRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent("threads:refresh"));

      // reset refine inputs
      setRefinePrompt("");
      setSelectedVariantUrl(null);
    } catch (err) {
      console.error(err);
      alert("Refinement request failed. Try again.");
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setLoadingStage(null);
        setLoadingMessage("");
      }, 600);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Timeline (auto-refreshes when timelineRefreshKey changes) */}
      <ThreadTimeline threadSlug={threadSlug} refreshKey={timelineRefreshKey} />

      {/* Main panel */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs text-white/50">Thread: {threadSlug}</p>
        <h1 className="mt-2 text-2xl font-semibold">Generate Thumbnail</h1>
        <p className="mt-2 text-sm text-white/65">
          Upload an image (optional) and describe your thumbnail. Output: 2 variants.
        </p>

        {/* Upload + prompt */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border-white/10 bg-black/30 p-4">
            <p className="text-sm font-medium text-white/80">Upload Image (Optional)</p>
            <p className="mt-1 text-xs text-white/55">
              Upload from device OR paste an image URL.
            </p>

            <div className="mt-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f);
                }}
                className="border-white/10 bg-white/5 text-white file:text-white"
              />
              {fileUploading && (
                <p className="mt-2 text-xs text-orange-300">Uploading...</p>
              )}
            </div>

            <div className="mt-3">
              <Input
                placeholder="Or paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            {imageUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full object-cover" />
              </div>
            )}
          </Card>

          <Card className="rounded-2xl border-white/10 bg-black/30 p-4">
            <p className="text-sm font-medium text-white/80">
              Prompt Description <span className="text-orange-400">*</span>
            </p>
            <p className="mt-1 text-xs text-white/55">
              Describe what thumbnail you want. Keep it short + clear.
            </p>

            <div className="mt-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Example: "Make a bold YouTube thumbnail with this image. Add text: AI Thumbnail Hack"'
                className="min-h-[140px] border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                className={`rounded-xl border border-white/10 bg-white/5 text-white/80
                hover:bg-orange-500/15 hover:text-orange-300 hover:border-orange-500/40
                ${enhanceEnabled ? "ring-1 ring-orange-500/40" : ""}`}
                onClick={() => {
                  setEnhanceEnabled(true);
                  setQuestionnaireOpen(true);
                }}
              >
                ✨ AI Enhancements
              </Button>

              <Button
                className="rounded-xl bg-orange-500 text-black hover:bg-orange-400"
                onClick={onGenerate}
              >
                Generate Thumbnail
              </Button>

              <p className="text-xs text-white/50">
                Can take <span className="text-orange-300">30–60s</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Loader */}
        {loadingStage && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm font-medium text-white/80">Generating...</p>

            <p className="mt-2 text-xs text-orange-300">{loadingMessage}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {stages.map((s) => {
                const isActive = loadingStage === s.key;
                return (
                  <Badge
                    key={s.key}
                    className={`rounded-full border px-3 py-1 text-white/70 transition
                      border-white/10 bg-white/5
                      ${isActive ? "border-orange-500/40 text-orange-300 bg-orange-500/10" : ""}
                    `}
                  >
                    {isActive ? "● " : ""}
                    {s.label}
                  </Badge>
                );
              })}
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-orange-500/70" />
            </div>

            <p className="mt-3 text-xs text-white/55">
              Please don’t refresh. This can take{" "}
              <span className="text-orange-300">30–60 seconds</span>.
            </p>
          </div>
        )}

        {/* Results */}
        {generated.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Generated Thumbnails</h2>
            <p className="mt-1 text-sm text-white/60">
              Hover to download • Click image to open in new tab
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {generated.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                >
                  {/* click opens in new tab */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`thumb-${idx}`}
                    className="h-full w-full cursor-pointer object-cover"
                    onClick={() => window.open(img.url, "_blank", "noopener,noreferrer")}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100" />

                  {/* Download */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <Button
                      className="w-full rounded-xl bg-orange-500 text-black hover:bg-orange-400"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          setDownloadingIndex(idx);
                          const ext = img.mimeType?.includes("png") ? "png" : "jpg";
                          const filename = `nail-thumb-${threadSlug}-${idx + 1}.${ext}`;
                          await forceDownloadImage(img.url, filename);
                        } catch (err) {
                          console.error(err);
                          alert("Download failed. Try again.");
                        } finally {
                          setDownloadingIndex(null);
                        }
                      }}
                      disabled={downloadingIndex === idx}
                    >
                      {downloadingIndex === idx ? "Downloading..." : "Download"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                className="rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-orange-500/15 hover:text-orange-300 hover:border-orange-500/40"
                onClick={() => {
                  if (remainingRefines <= 0) {
                    alert("Refinement limit reached (3/3). Start a new thumbnail or new chat.");
                    return;
                  }
                  setRefineOpen(true);
                }}
              >
                Refine this thumbnail
              </Button>
              <Badge className="rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300">
                Remaining today: {remainingQuota}/3
              </Badge>
              <Button
                className="rounded-xl bg-orange-500 text-black hover:bg-orange-400"
                onClick={() => {
                  setPrompt("");
                  setImageUrl("");
                  setGenerated([]);
                  setEnhanceEnabled(false);
                  setQuestionnaire(DEFAULT_Q);
                  setSelectedVariantUrl(null);
                  setRefinePrompt("");
                  setActiveGenerationId(null);
                  setRemainingRefines(3);
                }}
              >
                Generate New Thumbnail
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Questionnaire modal component (same as before) */}
      <QuestionnaireModal
        open={questionnaireOpen}
        onClose={() => setQuestionnaireOpen(false)}
        value={questionnaire}
        onChange={setQuestionnaire}
        onDone={() => setQuestionnaireOpen(false)}
      />

      {/* Refinement modal */}
      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="border-white/10 bg-black/90 text-white">
          <DialogHeader>
            <DialogTitle>Refine Thumbnail</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-white/60">Select the best variant and describe changes.</p>

          <div className="mt-3 flex items-center gap-2">
            <Badge className="rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300">
              Remaining: {remainingRefines}/3
            </Badge>
            <Badge className="rounded-full border border-white/10 bg-white/5 text-white/70">
              This keeps chat memory intact ✅
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {generated.map((img, idx) => {
              const active = selectedVariantUrl === img.url;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`overflow-hidden rounded-xl border transition ${
                    active ? "border-orange-500/50 ring-2 ring-orange-500/20" : "border-white/10 hover:border-orange-500/30"
                  }`}
                  onClick={() => setSelectedVariantUrl(img.url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} className="h-28 w-full object-cover" alt="variant" />
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <Textarea
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              placeholder='Example: "Make the text larger, add orange glow, background more cinematic."'
              className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="ghost"
              className="rounded-xl bg-white/5 text-white hover:bg-orange-500/15 hover:text-orange-300"
              onClick={() => setRefineOpen(false)}
            >
              Cancel
            </Button>

            <Button className="rounded-xl bg-orange-500 text-black hover:bg-orange-400" onClick={onRefine}>
              Refine Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* QuestionnaireModal: same as before, omitted for brevity in this snippet; keep your existing QuestionnaireModal implementation (unchanged) */
function QuestionnaireModal({
  open,
  onClose,
  value,
  onChange,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  value: Questionnaire;
  onChange: (v: Questionnaire) => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Thumbnail Type",
      key: "thumbnailType" as const,
      options: ["YouTube", "Instagram", "Course", "Podcast"] as const,
    },
    {
      title: "Text Overlay",
      key: "textOverlay" as const,
      options: ["Yes", "No"] as const,
    },
    {
      title: "Font Style",
      key: "fontStyle" as const,
      options: ["Bold", "Clean", "Modern"] as const,
    },
    {
      title: "Theme Color",
      key: "themeColor" as const,
      options: ["Orange", "Neon", "Dark"] as const,
    },
    {
      title: "Vibe",
      key: "vibe" as const,
      options: ["Cinematic", "Tech", "Funny", "Serious"] as const,
    },
    {
      title: "Background Style",
      key: "backgroundStyle" as const,
      options: ["Blurred", "Abstract", "Gradient", "Realistic"] as const,
    },
    {
      title: "Subject Focus",
      key: "subjectFocus" as const,
      options: ["Center", "Left", "Right"] as const,
    },
    {
      title: "Variants",
      key: "variants" as const,
      options: [1, 2] as const,
    },
  ];

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="border-white/10 bg-black/90 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{current.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-wrap gap-2">
          {current.options.map((opt) => {
            const active = (value as any)[current.key] === opt;

            return (
              <Button
                key={String(opt)}
                variant="ghost"
                className={`rounded-xl border border-white/10 bg-white/5 text-white/75 hover:bg-orange-500/15 hover:text-orange-300 hover:border-orange-500/40 ${active ? "border-orange-500/40 text-orange-300" : ""
                  }`}
                onClick={() => onChange({ ...value, [current.key]: opt } as Questionnaire)}
              >
                {String(opt)}
              </Button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            className="rounded-xl bg-white/5 text-white hover:bg-orange-500/15 hover:text-orange-300"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>

          {step < steps.length - 1 ? (
            <Button className="rounded-xl bg-orange-500 text-black hover:bg-orange-400" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
              Next
            </Button>
          ) : (
            <Button className="rounded-xl bg-orange-500 text-black hover:bg-orange-400" onClick={onDone}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
