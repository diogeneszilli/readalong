import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Readalong — read aloud, level up",
  description:
    "An adaptive read-aloud story game for K–3 readers. The story listens, scores fluency, and adjusts its level page by page.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-amber-50 text-slate-800">{children}</body>
    </html>
  );
}
