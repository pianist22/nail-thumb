// "use client";

// import Link from "next/link";
// import { SignedIn, SignedOut } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";

// import { motion } from "framer-motion";
// import { GradientText } from "./gradient-test";

// export function LandingHero() {
//   return (
//     <section className="relative pt-32">
//       <div className="mx-auto max-w-6xl px-4">
//         <div className="grid items-center gap-10 lg:grid-cols-2">
//           {/* LEFT */}
//           <div>
//             <motion.p
//               className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//             >
//               <span className="h-2 w-2 rounded-full bg-orange-500" />
//               AI Thumbnail Generator • Nano Banana Powered
//             </motion.p>

//             <motion.h1
//               className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
//               initial={{ opacity: 0, y: 14 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.65, delay: 0.06 }}
//             >
//               Crafting simple images into real{" "}
//               <GradientText className="font-semibold">Thumbnails</GradientText>
//             </motion.h1>

//             <motion.p
//               className="mt-5 max-w-xl text-base text-white/65"
//               initial={{ opacity: 0, y: 14 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.65, delay: 0.12 }}
//             >
//               Upload your content image, answer a few smart questions, and
//               Nail@Thumb generates clean, bold, scroll-stopping thumbnails in
//               seconds.
//             </motion.p>

//             <motion.div
//               className="mt-7 flex flex-wrap items-center gap-3"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.18 }}
//             >
//               <SignedOut>
//                 <Link href="/sign-in">
//                   <Button className="h-11 rounded-xl bg-orange-500 px-6 text-black hover:bg-orange-400">
//                     Get Started
//                   </Button>
//                 </Link>

//                 <Link href="#features">
//                   <Button
//                     variant="ghost"
//                     className="h-11 rounded-xl bg-white/5 px-6 text-white/80 hover:bg-white/10 hover:text-white"
//                   >
//                     See Features
//                   </Button>
//                 </Link>
//               </SignedOut>

//               <SignedIn>
//                 <Link href="/generate">
//                   <Button className="h-11 rounded-xl bg-orange-500 px-6 text-black hover:bg-orange-400">
//                     Open Generator
//                   </Button>
//                 </Link>

//                 <Link href="#features">
//                   <Button
//                     variant="ghost"
//                     className="h-11 rounded-xl bg-white/5 px-6 text-white/80 hover:bg-white/10 hover:text-white"
//                   >
//                     Explore
//                   </Button>
//                 </Link>
//               </SignedIn>

//               <p className="text-sm text-white/55">No design skills needed.</p>
//             </motion.div>
//           </div>

//           {/* RIGHT */}
//           <motion.div
//             className="relative"
//             initial={{ opacity: 0, y: 18 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.08 }}
//           >
//             <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
//               <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
//                 <div className="flex items-center justify-between">
//                   <p className="text-sm font-medium text-white/80">Preview</p>
//                   <p className="text-xs text-white/55">16:9 • 1280×720</p>
//                 </div>

//                 <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/20 via-black to-orange-500/10">
//                   <div className="h-full w-full p-5">
//                     <div className="flex h-full flex-col justify-between">
//                       <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/75">
//                         Nail@Thumb AI
//                       </div>

//                       <div>
//                         <p className="text-xs text-white/60">Title overlay</p>
//                         <p className="mt-1 text-xl font-semibold text-white">
//                           MAKE YOUR THUMBNAILS POP!
//                         </p>
//                         <p className="mt-1 text-sm text-white/70">
//                           Clean • Bold • High CTR
//                         </p>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <span className="h-2 w-2 rounded-full bg-orange-400" />
//                         <span className="text-xs text-white/60">
//                           Generated in seconds
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4 grid grid-cols-3 gap-3">
//                   {[0, 1, 2].map((i) => (
//                     <div
//                       key={i}
//                       className="aspect-video rounded-xl border border-white/10 bg-white/5"
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
//                 <p className="text-sm text-white/70">Prompt quality</p>
//                 <div className="h-2 w-36 overflow-hidden rounded-full bg-white/10">
//                   <div className="h-full w-[78%] rounded-full bg-orange-500" />
//                 </div>
//               </div>
//             </div>

//             <motion.div
//               className="absolute -bottom-6 left-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 backdrop-blur-xl"
//               animate={{ y: [0, -6, 0] }}
//               transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
//             >
//               ✨ Out-of-the-box design + AI
//             </motion.div>
//           </motion.div>
//         </div>
//       </div>

//       {/* FEATURES */}
//       <div id="features" className="mx-auto mt-16 max-w-6xl px-4 pb-20">
//         <div className="grid gap-4 md:grid-cols-3">
//           {[
//             {
//               title: "Smart Questionnaire",
//               desc: "We ask what matters — style, emotion, text, vibe — for better output.",
//             },
//             {
//               title: "Prompt Rewriting",
//               desc: "Your input becomes a rich prompt that boosts thumbnail quality.",
//             },
//             {
//               title: "Iterative Refinement",
//               desc: "Keep improving: ask for edits, themes, and new variants.",
//             },
//           ].map((f) => (
//             <div
//               key={f.title}
//               className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
//             >
//               <p className="text-lg font-semibold text-white">{f.title}</p>
//               <p className="mt-2 text-sm text-white/65">{f.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { GradientText } from "./gradient-test";

import { HERO_BEST_THUMBNAIL, BEST_THUMBNAILS } from "@/lib/landing-thumbnails";
import { ThumbnailMarquee } from "@/components/landing/thumbnail-marquee";

export function LandingHero() {
  return (
    <section className="relative pt-28">
      <div className="mx-auto max-w-6xl px-4">
        {/* ✅ Testing alert */}
        <div className="mb-6 rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
          <span className="font-semibold text-orange-300">⚠ Nail@Thumb v1.0</span>{" "}
          is in testing mode. You can generate only{" "}
          <span className="font-semibold text-orange-300">3 thumbnails</span> for now.
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              AI Thumbnail Generator • Nano Banana Powered
            </motion.p>

            <motion.h1
              className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06 }}
            >
              Crafting simple images into real{" "}
              <GradientText className="font-semibold">Thumbnails</GradientText>
            </motion.h1>

            <motion.p
              className="mt-5 max-w-xl text-base text-white/65"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
            >
              Upload your content image, answer a few smart questions, and
              Nail@Thumb generates clean, bold, scroll-stopping thumbnails in
              seconds.
            </motion.p>

            <motion.div
              className="mt-7 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
            >
              <SignedOut>
                <Link href="/sign-in">
                  <Button className="h-11 rounded-xl bg-orange-500 px-6 text-black hover:bg-orange-400">
                    Get Started
                  </Button>
                </Link>

                <Link href="#features">
                  <Button
                    variant="ghost"
                    className="h-11 rounded-xl bg-white/5 px-6 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    See Features
                  </Button>
                </Link>
              </SignedOut>

              <SignedIn>
                <Link href="/generate">
                  <Button className="h-11 rounded-xl bg-orange-500 px-6 text-black hover:bg-orange-400">
                    Open Generator
                  </Button>
                </Link>

                <Link href="#features">
                  <Button
                    variant="ghost"
                    className="h-11 rounded-xl bg-white/5 px-6 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    Explore
                  </Button>
                </Link>
              </SignedIn>

              <p className="text-sm text-white/55">No design skills needed.</p>
            </motion.div>
          </div>

          {/* RIGHT */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/80">
                    Best Preview
                  </p>
                  <p className="text-xs text-white/55">16:9 • 1280×720</p>
                </div>

                {/* ✅ real best generated thumbnail */}
                <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO_BEST_THUMBNAIL}
                    alt="Best generated thumbnail"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* <div className="mt-4 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-xl border border-white/10 bg-white/5"
                    />
                  ))}
                </div> */}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-sm text-white/70">Prompt quality</p>
                <div className="h-2 w-36 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-orange-500" />
                </div>
              </div>
            </div>

            <motion.div
              className="absolute -bottom-6 left-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 backdrop-blur-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ✨ Out-of-the-box design + AI
            </motion.div>
          </motion.div>
        </div>

        {/* ✅ Marquee slider */}
        <div className="mt-14">
          <p className="mb-3 text-sm font-medium text-white/70">
            Best thumbnails generated by Nail@Thumb
          </p>
          <ThumbnailMarquee images={BEST_THUMBNAILS} />
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="mx-auto mt-16 max-w-6xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Smart Questionnaire",
              desc: "We ask what matters — style, emotion, text, vibe — for better output.",
            },
            {
              title: "Prompt Rewriting",
              desc: "Your input becomes a rich prompt that boosts thumbnail quality.",
            },
            {
              title: "Iterative Refinement",
              desc: "Keep improving: ask for edits, themes, and new variants.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <p className="text-lg font-semibold text-white">{f.title}</p>
              <p className="mt-2 text-sm text-white/65">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


