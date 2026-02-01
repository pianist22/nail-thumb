export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black">
      {/* 
        Desktop sidebar is FIXED with width = 18rem (w-72)
        So we offset main content on desktop
      */}
      <main
        className="
          min-h-screen
          px-4
          md:pt-6
          md:pl-72     /* reserve sidebar space */
          transition-all
        "
      >
        {children}
      </main>
    </div>
  );
}
