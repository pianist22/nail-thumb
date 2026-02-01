

// "use client";

// import useSWR from "swr";
// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

// type Thread = {
//   id: string;
//   slug: string;
//   title: string;
//   updatedAt: string;
// };

// export default function GeneratorSidebar({
//   activeSlug,
// }: {
//   activeSlug?: string;
// }) {
//   const router = useRouter();
//   const { data, isLoading, mutate } = useSWR("/api/threads", fetcher);
//   const threads: Thread[] = data?.threads ?? [];

//   const [mobileOpen, setMobileOpen] = useState(false);

//   // rename state
//   const [renameOpen, setRenameOpen] = useState(false);
//   const [renameSlug, setRenameSlug] = useState<string | null>(null);
//   const [renameValue, setRenameValue] = useState("");
//   const [renameLoading, setRenameLoading] = useState(false);

//   const [creatingChat, setCreatingChat] = useState(false);

//   useEffect(() => {
//     const h = () => mutate();
//     window.addEventListener("threads:refresh", h);
//     return () => window.removeEventListener("threads:refresh", h);
//   }, [mutate]);

//   useEffect(() => {
//     setMobileOpen(false);
//   }, [activeSlug]);

//   const sortedThreads = useMemo(
//     () =>
//       [...threads].sort(
//         (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
//       ),
//     [threads]
//   );

//   async function createNewChat() {
//     setCreatingChat(true);
//     try {
//       const res = await fetch("/api/threads", { method: "POST" });
//       const data = await res.json();
//       if (!res.ok) return alert(data?.error || "Failed to create thread");

//       await mutate();
//       router.push(`/generate-thumbnail/${data.thread.slug}`);
//     } finally {
//       setCreatingChat(false);
//     }
//   }

//   function openRenameDialog(t: Thread) {
//     setRenameSlug(t.slug);
//     setRenameValue(t.title);
//     setRenameOpen(true);
//   }

//   async function renameThread() {
//     if (!renameSlug || !renameValue.trim()) return;

//     setRenameLoading(true);
//     try {
//       const res = await fetch(`/api/threads/${renameSlug}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title: renameValue.trim() }),
//       });

//       if (!res.ok) throw new Error();
//       setRenameOpen(false);
//       setRenameSlug(null);
//       setRenameValue("");
//       await mutate();
//       window.dispatchEvent(new CustomEvent("threads:refresh"));
//     } catch {
//       alert("Rename failed");
//     } finally {
//       setRenameLoading(false);
//     }
//   }

//   async function deleteThread(slug: string) {
//     setRenameOpen(false);
//     try {
//       const res = await fetch(`/api/threads/${slug}`, { method: "DELETE" });
//       if (!res.ok) throw new Error();

//       await mutate();
//       window.dispatchEvent(new CustomEvent("threads:refresh"));

//       if (activeSlug === slug) router.push("/generate");
//     } catch {
//       alert("Delete failed");
//     }
//   }

//   function SidebarContent() {
//     return (
//       <div className="flex h-full flex-col">
//         {/* Brand */}
//         <Link
//           href="/"
//           className="text-sm font-semibold tracking-tight hover:opacity-80"
//         >
//           <span className="text-orange-400">Nail</span>
//           <span className="text-white/70">@</span>
//           <span className="text-orange-400">Thumb</span>
//         </Link>

//         <p className="mt-1 text-xs text-white/50">
//           Your thumbnail conversations
//         </p>

//         <Button
//           className="mt-4 rounded-xl bg-orange-500 text-black hover:bg-orange-400"
//           onClick={createNewChat}
//           disabled={creatingChat}
//         >
//           {creatingChat ? "Creating..." : "+ New Chat"}
//         </Button>

//         {/* Threads */}
//         <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
//           {isLoading && (
//             <div className="text-sm text-white/50">Loading...</div>
//           )}

//           {sortedThreads.map((t) => {
//             const active = t.slug === activeSlug;
//             return (
//               <div
//                 key={t.slug}
//                 className={`group flex items-center justify-between gap-2 rounded-xl border p-3
//                 ${
//                   active
//                     ? "border-orange-500/40 bg-orange-500/5"
//                     : "border-white/5 bg-white/2 hover:border-orange-500/30"
//                 }`}
//               >
//                 <Link
//                   href={`/generate-thumbnail/${t.slug}`}
//                   className="min-w-0 flex-1"
//                 >
//                   <div className="truncate text-sm font-medium text-white/85">
//                     {t.title}
//                   </div>
//                   <div className="text-[11px] text-white/50">
//                     {new Date(t.updatedAt).toLocaleString()}
//                   </div>
//                 </Link>

//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <button className="px-2 text-white/50 hover:text-orange-300">
//                       ⋮
//                     </button>
//                   </DropdownMenuTrigger>

//                   <DropdownMenuContent className="bg-black text-white border-white/10">
//                     <DropdownMenuItem onClick={() => openRenameDialog(t)}>
//                       Rename
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       className="text-red-300"
//                       onClick={() => deleteThread(t.slug)}
//                     >
//                       Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Mobile top bar */}
//       <div className="md:hidden sticky top-0 z-50 bg-black/80 border-b border-white/10">
//         <div className="flex items-center justify-between px-4 py-3">
//           <Button
//             variant="ghost"
//             className="bg-white/5 text-white"
//             onClick={() => setMobileOpen(true)}
//           >
//             ☰
//           </Button>
//           <Link href="/" className="text-sm font-semibold">
//             <span className="text-orange-400">Nail</span>
//             <span className="text-white/70">@</span>
//             <span className="text-orange-400">Thumb</span>
//           </Link>
//           <div className="w-8" />
//         </div>
//       </div>

//       {/* Desktop sidebar */}
//       <aside className="hidden md:block w-72 border-r border-white/5 bg-black/90 p-4 sticky top-0 h-screen">
//         <SidebarContent />
//       </aside>

//       {/* Mobile drawer */}
//       {mobileOpen && (
//         <div className="fixed inset-0 z-[60] md:hidden">
//           <div
//             className="absolute inset-0 bg-black/60"
//             onClick={() => setMobileOpen(false)}
//           />
//           <div className="absolute left-0 top-0 h-full w-[85%] bg-black p-4 border-r border-white/10">
//             <Button
//               variant="ghost"
//               className="mb-4 bg-white/5 text-white"
//               onClick={() => setMobileOpen(false)}
//             >
//               ✕ Close
//             </Button>
//             <SidebarContent />
//           </div>
//         </div>
//       )}

//       {/* Rename dialog */}
//       <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
//         <DialogContent className="bg-black border-white/10 text-white">
//           <DialogHeader>
//             <DialogTitle>Rename Thread</DialogTitle>
//           </DialogHeader>

//           <Input
//             value={renameValue}
//             onChange={(e) => setRenameValue(e.target.value)}
//             className="bg-white/5 border-white/10 text-white"
//           />

//           <div className="flex justify-end gap-2">
//             <Button variant="ghost" onClick={() => setRenameOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               className="bg-orange-500 text-black"
//               onClick={renameThread}
//               disabled={renameLoading}
//             >
//               Save
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }


"use client";

import useSWR from "swr";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Thread = {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
};

export default function GeneratorSidebar({
  activeSlug,
}: {
  activeSlug?: string;
}) {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR("/api/threads", fetcher);
  const threads: Thread[] = data?.threads ?? [];

  const [mobileOpen, setMobileOpen] = useState(false);

  // rename dialog
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameSlug, setRenameSlug] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    const h = () => mutate();
    window.addEventListener("threads:refresh", h);
    return () => window.removeEventListener("threads:refresh", h);
  }, [mutate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [activeSlug]);

  const sortedThreads = useMemo(() => {
    return [...threads].sort(
      (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
    );
  }, [threads]);

  async function createNewChat() {
    setCreatingChat(true);
    try {
      const res = await fetch("/api/threads", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      await mutate();
      router.push(`/generate-thumbnail/${data.thread.slug}`);
    } finally {
      setCreatingChat(false);
    }
  }

  async function renameThread() {
    if (!renameSlug || !renameValue.trim()) return;
    setRenameLoading(true);
    try {
      const res = await fetch(`/api/threads/${renameSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue }),
      });
      if (!res.ok) throw new Error();
      setRenameOpen(false);
      await mutate();
      window.dispatchEvent(new CustomEvent("threads:refresh"));
    } finally {
      setRenameLoading(false);
    }
  }

  async function deleteThread(slug: string) {
    const res = await fetch(`/api/threads/${slug}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    await mutate();
    window.dispatchEvent(new CustomEvent("threads:refresh"));
    if (activeSlug === slug) router.push("/generate");
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight mb-2"
        >
          <span className="text-orange-400">Nail</span>
          <span className="text-white/70">@</span>
          <span className="text-orange-400">Thumb</span>
        </Link>

        <p className="text-xs text-white/50">Your thumbnail threads</p>

        <Button
          className="mt-4 rounded-xl bg-orange-500 text-black hover:bg-orange-400"
          onClick={createNewChat}
          disabled={creatingChat}
        >
          {creatingChat ? "Creating..." : "+ New Chat"}
        </Button>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {isLoading && <p className="text-white/50">Loading...</p>}

          {sortedThreads.map((t) => {
            const active = t.slug === activeSlug;
            return (
              <div
                key={t.slug}
                className={`group flex items-center justify-between gap-2 rounded-xl border p-3
                ${
                  active
                    ? "border-orange-500/40 bg-orange-500/5"
                    : "border-white/5 hover:border-orange-500/30"
                }`}
              >
                <Link
                  href={`/generate-thumbnail/${t.slug}`}
                  className="flex-1 min-w-0"
                >
                  <div className="truncate text-sm text-white/80">
                    {t.title}
                  </div>
                  <div className="text-[11px] text-white/40">
                    {new Date(t.updatedAt).toLocaleString()}
                  </div>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-2 text-white/50 hover:text-orange-300">
                      ⋮
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black border-white/10">
                    <DropdownMenuItem
                      onClick={() => {
                        setRenameSlug(t.slug);
                        setRenameValue(t.title);
                        setRenameOpen(true);
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400"
                      onClick={() => deleteThread(t.slug)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ MOBILE TOP BAR (FIXED, NOT STICKY) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-black/90 border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            className="bg-white/5 text-white"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </Button>

          <Link href="/" className="text-sm font-semibold">
            <span className="text-orange-400">Nail</span>
            <span className="text-white/70">@</span>
            <span className="text-orange-400">Thumb</span>
          </Link>

          <div className="w-8" />
        </div>
      </div>

      {/* ✅ DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-72 border-r border-white/10 bg-black/90 p-4 fixed left-0 top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ✅ MOBILE DRAWER */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-black p-4">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="bg-black text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Rename Thread</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="bg-white/5 border-white/10"
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={renameThread} disabled={renameLoading}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

