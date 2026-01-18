import type { Metadata } from "next";
import { Corben, Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/providers/user-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider as NextJSThemeProvider } from "next-themes";

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
  title: "Arbiter",
  description: "Agentic AI Workspace",
};

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
              {children}
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </UserProvider>
        </NextJSThemeProvider>
      </body>
    </html>
  );
}
