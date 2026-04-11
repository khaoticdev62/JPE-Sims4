import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GlobalTools } from "@/components/providers/GlobalTools";
import { ShortcutProvider } from "@/components/providers/ShortcutProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AutoSaveProvider } from "@/components/jpe-auto-save";



export const metadata: Metadata = {
  title: "JPE Studio Editor | Sims 4 Mod IDE",
  description: "Professional, responsive code editor for Sims 4 mod developers to write Just Plain English (JPE) files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body 
        className="font-sans min-h-screen bg-background text-foreground antialiased selection:bg-cyan/30 selection:text-white"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <AutoSaveProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <ShortcutProvider>
                {children}
                <GlobalTools />
                <Toaster position="bottom-right" richColors />
              </ShortcutProvider>
            </ThemeProvider>
          </AutoSaveProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
