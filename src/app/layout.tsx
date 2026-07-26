import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { LayoutShell } from "@/components/layout-shell";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: {
    default: "Stackd — Spotlighting what's next",
    template: "%s · Stackd",
  },
  description: "Daily leaderboard of digital products from Indonesia & Southeast Asia. Discover, upvote, and launch what makers are building.",
  openGraph: {
    title: "Stackd — Spotlighting what's next",
    description: "Daily leaderboard of digital products from Indonesia & Southeast Asia.",
    siteName: "Stackd",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stackd — Spotlighting what's next",
    description: "Daily leaderboard of digital products from Indonesia & Southeast Asia.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.variable}>
        <Providers>
          <LayoutShell header={<Header />} footer={<Footer />}>
            {children}
          </LayoutShell>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
