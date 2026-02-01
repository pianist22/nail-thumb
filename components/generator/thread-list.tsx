"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

type ThreadItem = {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ThreadList({
  currentSlug,
  onNavigate,
}: {
  currentSlug: string;
  onNavigate?: () => void;
}) {
  const { data, mutate, isLoading } = useSWR("/api/threads", fetcher);

  const threads: ThreadItem[] = data?.threads ?? [];

  const [renameSlug, setRenameSlug] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  async function doRename() {
    if (!renameSlug) return;
    const res = await fetch(`/api/threads/${renameSlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: renameTitle }),
    });
    if (res.ok) {
      await mutate();
      setRenameSlug(null);
    } else {
      alert("Rename failed");
    }
  }

  async function doDelete() {
    if (!deleteSlug) return;
    const res = await fetch(`/api/threads/${deleteSlug}`, { method: "DELETE" });
    if (res.ok) {
      await mutate();
      setDeleteSlug(null);
      // if user deleted current thread -> go to /generate new
      window.location.href = "/generate";
    } else {
      alert("Delete failed");
    }
  }

  if (isLoading) {
    return <p className="px-4 text-xs text-white/50">Loading threads...</p>;
  }

  return (
    <div className="px-2">
      {threads.map((t) => {
        const active = t.slug === currentSlug;

        return (
          <div
            key={t.id}
            className={`mb-1 flex items-center justify-between rounded-xl px-3 py-2 transition ${
              active ? "bg-orange-500/15 border border-orange-500/30" : "hover:bg-white/5"
            }`}
          >
            <Link
              href={`/generate-thumbnail/${t.slug}`}
              className="flex-1 truncate text-sm text-white/80"
              onClick={onNavigate}
            >
              {t.title}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-lg bg-white/0 text-white/60 hover:bg-white/10"
                >
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-white/10 bg-black/90 text-white">
                <DropdownMenuItem
                  onClick={() => {
                    setRenameSlug(t.slug);
                    setRenameTitle(t.title);
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-300 focus:text-red-300"
                  onClick={() => setDeleteSlug(t.slug)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}

      {/* Rename Dialog */}
      <AlertDialog open={!!renameSlug} onOpenChange={(v) => (!v ? setRenameSlug(null) : null)}>
        <AlertDialogContent className="border-white/10 bg-black/90 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Rename thread</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            className="border-white/10 bg-white/5 text-white"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl bg-white/5 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-orange-500 text-black hover:bg-orange-400"
              onClick={doRename}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteSlug} onOpenChange={(v) => (!v ? setDeleteSlug(null) : null)}>
        <AlertDialogContent className="border-white/10 bg-black/90 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this thread?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-white/60">
            This will delete all messages and generations in this chat.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl bg-white/5 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-500 text-black hover:bg-red-400"
              onClick={doDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
