import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopLoader from "@/app/components/TopLoader";
import BottomNav from "@/app/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://novan.trustyvisual.my.id"),
  title: {
    default: "Novan Rohman — Portfolio",
    template: "%s | Novan Rohman",
  },
  description:
    "IT Risk & Security at Nusapala Berkah Autonomous, former Full-Stack Developer. Portfolio of web development, security, and risk management work.",
  keywords: ["Novan Rohman", "Portfolio", "Full-Stack Developer", "Next.js", "IT Security", "Risk Management"],
  authors: [{ name: "Novan Rohman" }],
  openGraph: {
    type: "website",
    url: "https://novan.trustyvisual.my.id",
    siteName: "Novan Rohman",
    title: "Novan Rohman — Portfolio",
    description:
      "IT Risk & Security at Nusapala Berkah Autonomous, former Full-Stack Developer. Portfolio of web development, security, and risk management work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novan Rohman — Portfolio",
    description:
      "IT Risk & Security at Nusapala Berkah Autonomous, former Full-Stack Developer.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 pb-28 md:pb-0">
        <TopLoader />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
