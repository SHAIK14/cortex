import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cortex | The Memory Layer for LLMs",
  description: "Sophisticated long-term memory system for AI applications.",
};

import { CommandPalette } from "@/components/layout/CommandPalette";

import { SoundProvider } from "@/components/layout/SoundProvider";

import { NeuralCursor } from "@/components/ui/NeuralCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased crt-screen min-h-screen">
        <div className="vignette" />
        <div className="noise-overlay" />
        <SoundProvider>
          <NeuralCursor />
          <ThemeProvider>
            <CommandPalette />
            {children}
          </ThemeProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
