import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";


export const metadata: Metadata = {
title: "Nail@Thumb",
description: "Crafting simple images into real thumbnails.",
};


export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<ClerkProvider>
<html lang="en">
<body className="min-h-screen bg-black text-white antialiased">
{children}
</body>
</html>
</ClerkProvider>
);
}