// "use client";

// import useSWR from "swr";
// import Link from "next/link";

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

// export function HistoryPanel() {
//   const { data, isLoading } = useSWR("/api/threads", fetcher);
//   const threads = data?.threads ?? [];

//   if (isLoading) return <p className="text-white/60">Loading history...</p>;

//   return (
//     <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
//       <h1 className="text-xl font-semibold">History</h1>
//       <p className="mt-2 text-sm text-white/60">
//         Open any previous chat thread.
//       </p>

//       <div className="mt-6 grid gap-3">
//         {threads.map((t: any) => (
//           <Link
//             key={t.slug}
//             href={`/generate-thumbnail/${t.slug}`}
//             className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 hover:bg-white/5"
//           >
//             <div className="text-sm font-medium text-white/80">{t.title}</div>
//             <div className="text-xs text-white/50">
//               Updated: {new Date(t.updatedAt).toLocaleString()}
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function HistoryPanel() {
  const { data, isLoading } = useSWR("/api/threads", fetcher);
  const threads = data?.threads ?? [];

  if (isLoading)
    return <p className="text-white/60">Loading history...</p>;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
      <h1 className="text-xl font-semibold">History</h1>
      <p className="mt-2 text-sm text-white/60">
        Open any previous chat thread.
      </p>

      <div className="mt-6 grid gap-3">
        {threads.map((t: any) => (
          <Link
            key={t.slug}
            href={`/generate-thumbnail/${t.slug}`}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4 hover:bg-white/5"
          >
            <div className="text-sm font-medium text-white/80">
              {t.title}
            </div>
            <div className="text-xs text-white/50 mt-1">
              Updated: {new Date(t.updatedAt).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
