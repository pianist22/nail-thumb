"use client";

import { useMemo } from "react";

export function ThumbnailMarquee({ images }: { images: string[] }) {
  // duplicate list to make seamless loop
  const duplicated = useMemo(() => [...images, ...images], [images]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80" />

      <div className="flex gap-4 p-4">
        <div className="flex gap-4 animate-marquee">
          {duplicated.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative h-38 w-56 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`thumb-${i}`}
                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
