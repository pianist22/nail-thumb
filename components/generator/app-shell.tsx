"use client";

import { ReactNode } from "react";
import GeneratorSidebar from "@/components/generator/sidebar";


export function GeneratorAppShell({
  children,
  currentSlug,
}: {
  children: ReactNode;
  currentSlug: string;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* <GeneratorTopbar /> */}

      <div className="mx-auto max-w-7xl">
        <div className="flex">
          <GeneratorSidebar activeSlug={currentSlug} />

        <main
          className="
            flex-1 
            min-h-screen 
            px-4 
            pt-20        /* MOBILE OFFSET */
            md:pt-0      /* DESKTOP RESET */
          "
        >
          {children}
        </main>
        </div>
      </div>
    </div>
  );
}
