// "use client";

// import useSWR from "swr";

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

// export function ThreadTimeline({ threadSlug }: { threadSlug: string }) {
//   const { data, isLoading, mutate } = useSWR(
//     `/api/messages?threadSlug=${threadSlug}`,
//     fetcher
//   );

//   const messages = data?.messages ?? [];

//   if (isLoading) {
//     return (
//       <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
//         Loading chat...
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
//       <div className="mb-3 flex items-center justify-between">
//         <p className="text-sm font-medium text-white/80">Chat Timeline</p>
//         <button
//           onClick={() => mutate()}
//           className="text-xs text-orange-300 hover:text-orange-200"
//         >
//           Refresh
//         </button>
//       </div>

//       <div className="space-y-3">
//         {messages.map((m: any) => (
//           <div
//             key={m.id}
//             className={`rounded-xl border border-white/10 p-3 ${
//               m.role === "user" ? "bg-white/5" : "bg-black/20"
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <p className="text-xs text-white/50">
//                 {m.role.toUpperCase()}
//               </p>
//               <p className="text-[10px] text-white/35">
//                 {new Date(m.createdAt).toLocaleTimeString()}
//               </p>
//             </div>

//             <pre className="mt-2 whitespace-pre-wrap text-xs text-white/70">
//               {JSON.stringify(m.content, null, 2)}
//             </pre>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


// "use client";

// import useSWR from "swr";
// import { useEffect } from "react";

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

// export function ThreadTimeline({
//   threadSlug,
//   refreshKey,
// }: {
//   threadSlug: string;
//   refreshKey: number;
// }) {
//   const { data, isLoading, mutate } = useSWR(
//     `/api/messages?threadSlug=${threadSlug}`,
//     fetcher
//   );

//   // ✅ Auto refresh whenever refreshKey changes
//   useEffect(() => {
//     mutate();
//   }, [refreshKey, mutate]);

//   const messages = data?.messages ?? [];

//   if (isLoading) {
//     return (
//       <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
//         Loading chat...
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
//       <div className="mb-3 flex items-center justify-between">
//         <p className="text-sm font-medium text-white/80">Chat Timeline</p>
//         <button
//           onClick={() => mutate()}
//           className="text-xs text-orange-300 hover:text-orange-200"
//         >
//           Refresh
//         </button>
//       </div>

//       <div className="space-y-3">
//         {messages.map((m: any) => (
//           <div
//             key={m.id}
//             className={`rounded-xl border border-white/10 p-3 ${
//               m.role === "user" ? "bg-white/5" : "bg-black/20"
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <p className="text-xs text-white/50">{m.role.toUpperCase()}</p>
//               <p className="text-[10px] text-white/35">
//                 {new Date(m.createdAt).toLocaleTimeString()}
//               </p>
//             </div>

//             <pre className="mt-2 whitespace-pre-wrap text-xs text-white/70">
//               {JSON.stringify(m.content, null, 2)}
//             </pre>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



// "use client";

// import useSWR from "swr";
// import { useEffect } from "react";
// import { Badge } from "@/components/ui/badge";

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

// export function ThreadTimeline({
//   threadSlug,
//   refreshKey = 0,
// }: {
//   threadSlug: string;
//   refreshKey?: number;
// }) {
//   const { data, isLoading, mutate } = useSWR(`/api/messages?threadSlug=${encodeURIComponent(threadSlug)}`, fetcher);

//   // Auto refresh when refreshKey changes
//   useEffect(() => {
//     mutate();
//   }, [refreshKey, mutate]);

//   const messages = data?.messages ?? [];

//   if (isLoading) {
//     return (
//       <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
//         Loading chat...
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
//       <div className="mb-3 flex items-center justify-between">
//         <p className="text-sm font-medium text-white/80">Chat Timeline</p>
//         <button onClick={() => mutate()} className="text-xs text-orange-300 hover:text-orange-200">Refresh</button>
//       </div>

//       <div className="space-y-4">
//         {messages.map((m: any) => {
//           const time = new Date(m.createdAt).toLocaleTimeString();
//           // Role: user | assistant
//           if (m.role === "user") {
//             // content may have prompt, imageUrl etc.
//             const content = m.content || {};
//             return (
//               <div key={m.id} className="rounded-xl border border-white/10 p-4 bg-white/5">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-white/70">USER</p>
//                     <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">{content.prompt || content.text || "User input"}</p>
//                     {content.imageUrl ? (
//                       <div className="mt-3 inline-block overflow-hidden rounded-md border border-white/10">
//                         {/* small preview */}
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img src={content.imageUrl} alt="user-img" className="h-20 w-36 object-cover" />
//                       </div>
//                     ) : null}
//                   </div>

//                   <div className="text-[11px] text-white/40">{time}</div>
//                 </div>
//               </div>
//             );
//           }

//           // assistant messages: can be prompt_rewrite, generation_result, refine_result
//           const content = m.content || {};
//           if (content.type === "prompt_rewrite") {
//             return (
//               <div key={m.id} className="rounded-xl border border-white/10 p-4 bg-black/20">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-white/70">ASSISTANT — Prompt Rewrite</p>
//                     <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">{content.promptRewritten}</p>
//                   </div>
//                   <div className="text-[11px] text-white/40">{time}</div>
//                 </div>
//               </div>
//             );
//           }

//           if (content.type === "generation_result" || content.type === "refine_result") {
//             const label = content.type === "generation_result" ? "Generation" : "Refinement";
//             const images = content.images || [];
//             return (
//               <div key={m.id} className="rounded-xl border border-white/10 p-4 bg-black/20">
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs font-medium text-white/70">ASSISTANT — {label}</p>
//                   <div className="text-[11px] text-white/40">{time}</div>
//                 </div>

//                 <div className="mt-3 grid grid-cols-2 gap-3">
//                   {images.map((img: any, i: number) => (
//                     <div key={i} className="rounded-lg overflow-hidden border border-white/10">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={img.url} alt={`gen-${i}`} className="h-28 w-full object-cover cursor-pointer" onClick={() => window.open(img.url, "_blank", "noopener,noreferrer")} />
//                       <div className="p-2 bg-white/5">
//                         <a className="text-xs text-orange-300 hover:underline" href={img.url} target="_blank" rel="noreferrer">Open</a>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {content.promptRewritten ? (
//                   <div className="mt-3 text-xs text-white/60">
//                     <p className="font-medium text-white/70">Used prompt</p>
//                     <p className="whitespace-pre-wrap">{content.promptRewritten}</p>
//                   </div>
//                 ) : null}
//               </div>
//             );
//           }

//           // fallback render
//           return (
//             <div key={m.id} className="rounded-xl border border-white/10 p-4 bg-white/5">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-xs font-medium text-white/70">{(m.role || "assistant").toUpperCase()}</p>
//                   <pre className="mt-2 whitespace-pre-wrap text-xs text-white/70">{JSON.stringify(m.content, null, 2)}</pre>
//                 </div>
//                 <div className="text-[11px] text-white/40">{time}</div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

export function ThreadTimeline({
  threadSlug,
  refreshKey = 0,
}: {
  threadSlug: string;
  refreshKey?: number;
}) {
  const { data, isLoading, mutate } = useSWR(
    `/api/messages?threadSlug=${encodeURIComponent(threadSlug)}`,
    fetcher
  );

  const [downloading, setDownloading] = useState<string | null>(null);

  // Auto refresh when refreshKey changes
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);

  const messages = data?.messages ?? [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-white/80">Chat Timeline</p>
        <button
          onClick={() => mutate()}
          className="text-xs text-orange-300 hover:text-orange-200"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {messages.map((m: any) => {
          const time = new Date(m.createdAt).toLocaleTimeString();

          // ✅ USER
          if (m.role === "user") {
            const content = m.content || {};
            return (
              <div
                key={m.id}
                className="rounded-xl border border-white/10 p-4 bg-white/5"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/70">USER</p>

                    {/* show only prompt text */}
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">
                      {content.prompt || content.text || "User input"}
                    </p>

                    {/* image preview small */}
                    {content.imageUrl ? (
                      <div className="mt-3 inline-block overflow-hidden rounded-md border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={content.imageUrl}
                          alt="user-img"
                          className="h-20 w-36 object-cover cursor-pointer"
                          onClick={() =>
                            window.open(
                              content.imageUrl,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="text-[11px] text-white/40">{time}</div>
                </div>
              </div>
            );
          }

          // ✅ ASSISTANT
          const content = m.content || {};

          // rewrite
          if (content.type === "prompt_rewrite") {
            return (
              <div
                key={m.id}
                className="rounded-xl border border-white/10 p-4 bg-black/20"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/70">
                      ASSISTANT — Prompt Rewrite
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">
                      {content.promptRewritten}
                    </p>
                  </div>
                  <div className="text-[11px] text-white/40">{time}</div>
                </div>
              </div>
            );
          }

          // generation/refine result
          if (
            content.type === "generation_result" ||
            content.type === "refine_result"
          ) {
            const label =
              content.type === "generation_result"
                ? "Generation"
                : "Refinement";

            const images = content.images || [];

            return (
              <div
                key={m.id}
                className="rounded-xl border border-white/10 p-4 bg-black/20"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white/70">
                    ASSISTANT — {label}
                  </p>
                  <div className="text-[11px] text-white/40">{time}</div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {images.map((img: any, i: number) => {
                    const ext = img?.mimeType?.includes("png") ? "png" : "jpg";
                    const filename = `nail-thumb-${threadSlug}-${label.toLowerCase()}-${i + 1}.${ext}`;

                    return (
                      <div
                        key={i}
                        className="rounded-lg overflow-hidden border border-white/10 bg-white/5"
                      >
                        {/* preview opens in new tab */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={`gen-${i}`}
                          className="h-28 w-full object-cover cursor-pointer"
                          onClick={() =>
                            window.open(img.url, "_blank", "noopener,noreferrer")
                          }
                        />

                        <div className="flex items-center justify-between gap-2 p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-lg bg-white/5 text-white/80 hover:bg-orange-500/15 hover:text-orange-300"
                            onClick={() =>
                              window.open(img.url, "_blank", "noopener,noreferrer")
                            }
                          >
                            Open
                          </Button>

                          <Button
                            size="sm"
                            className="rounded-lg bg-orange-500 text-black hover:bg-orange-400"
                            disabled={downloading === img.url}
                            onClick={async () => {
                              try {
                                setDownloading(img.url);
                                await forceDownloadImage(img.url, filename);
                              } catch (err) {
                                console.error(err);
                                alert("Download failed. Try again.");
                              } finally {
                                setDownloading(null);
                              }
                            }}
                          >
                            {downloading === img.url ? "..." : "Download"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {content.promptRewritten ? (
                  <div className="mt-3 text-xs text-white/60">
                    <p className="font-medium text-white/70">Used prompt</p>
                    <p className="whitespace-pre-wrap">{content.promptRewritten}</p>
                  </div>
                ) : null}
              </div>
            );
          }

          // fallback
          return (
            <div
              key={m.id}
              className="rounded-xl border border-white/10 p-4 bg-white/5"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/70">
                    {(m.role || "assistant").toUpperCase()}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-white/70">
                    {JSON.stringify(m.content, null, 2)}
                  </pre>
                </div>
                <div className="text-[11px] text-white/40">{time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
