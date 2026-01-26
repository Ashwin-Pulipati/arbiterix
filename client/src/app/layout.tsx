import { Shell } from "@/components/layout/shell";
import { UserProvider } from "@/components/providers/user-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { ThemeProvider as NextJSThemeProvider } from "next-themes";
import { Corben, Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";

const corben = Corben({
  variable: "--font-corben",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunitoSans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arbiterix",
    template: `%s - Arbiterix`,
  },
  description:
    "Arbiterix: An intelligent, multi-tenant application for seamless interaction with documents, movies, and AI-powered chat. Built with Next.js, Django, and LangChain.",
  keywords: [
    "Arbiterix",
    "Ashwin Pulipati",
    "AI workspace",
    "document management",
    "movie search",
    "AI chat",
    "Next.js",
    "Django",
    "LangChain",
    "multi-tenant",
  ],
  authors: [
    { name: "Ashwin Pulipati", url: "https://github.com/Ashwin-Pulipati" },
  ],
  creator: "Ashwin Pulipati",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/Ashwin-Pulipati/arbiterix",
    title: "Arbiterix - AI-Powered Workspace",
    description:
      "An intelligent, multi-tenant application for seamless interaction with documents, movies, and AI-powered chat.",
    siteName: "Arbiterix",
  },
};

import { ChatProvider } from "@/components/providers/chat-provider";

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${corben.variable} ${nunito.variable} ${nunitoSans.variable}`}
    >
      <body className="bg-background text-foreground antialiased min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-2xl focus:bg-background focus:px-4 focus:py-2 focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>

        <NextJSThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <TooltipProvider delayDuration={0}>
              <ChatProvider>
                <Shell>{children}</Shell>
              </ChatProvider>
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </UserProvider>
        </NextJSThemeProvider>
      </body>
    </html>
  );
}
