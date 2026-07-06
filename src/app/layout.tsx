import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Stackd — Spotlighting what's next",
  description: "Daily leaderboard of digital products from Indonesia & SEA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.variable}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
