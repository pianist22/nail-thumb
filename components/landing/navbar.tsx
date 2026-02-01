"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* blur overlay when menu open */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <header className="fixed top-0 z-50 w-full">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <Image
                    src="/logo.png"
                    alt="Nail@Thumb"
                    width={120}
                    height={120}
                    priority

                  />
                </div>

                <div className="leading-tight">
                  <p className="text-sm text-white/70">Welcome to</p>
                  <p className="text-lg font-semibold tracking-tight">
                    <span className="text-orange-400">Nail</span>
                    <span className="text-white/80">@</span>
                    <span className="text-orange-400">Thumb</span>
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <SignedOut>
                  <Link href="/sign-in">
                    <Button
                      variant="ghost"
                      className="rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="rounded-xl bg-orange-500 text-black hover:bg-orange-400">
                      Sign Up
                    </Button>
                  </Link>
                </SignedOut>

                <SignedIn>
                  {/* Generate button that opens pop menu */}
                  <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                      <Button className="rounded-xl bg-orange-500 text-black hover:bg-orange-400">
                        Generate
                      </Button>
                    </SheetTrigger>

                    <SheetContent
                      side="right"
                      className="z-50 w-[360px] border-l border-white/10 bg-black/70 backdrop-blur-xl text-white"
                    >
                      <SheetHeader>
                        <SheetTitle className="text-white">
                          Quick Actions
                        </SheetTitle>
                      </SheetHeader>

                      <div className="mt-6 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-white/70">
                            Start building now
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            Generate stunning thumbnails
                          </p>
                          <p className="mt-2 text-sm text-white/60">
                            Upload an image + answer a few questions, and we’ll
                            craft a thumbnail that pops.
                          </p>

                          <Link href="/generate" onClick={() => setOpen(false)}>
                            <Button className="mt-4 w-full rounded-xl bg-orange-500 text-black hover:bg-orange-400">
                              Go to Generator
                            </Button>
                          </Link>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-white/70">Account</p>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-white/80">
                              Manage profile
                            </p>
                            <UserButton afterSignOutUrl="/" />
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* User icon always visible */}
                  <div className="hidden sm:block">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
