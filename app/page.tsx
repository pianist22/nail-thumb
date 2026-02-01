import { AnimatedBackground } from "@/components/landing/animated-background";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <AnimatedBackground />
      <LandingNavbar />
      <LandingHero />
    </main>
  );
}
