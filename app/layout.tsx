import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
    metadataBase: new URL("https://rescan-ai.vercel.app"),

    title: {
        default: "ReScan - AI Resume & Portfolio Analyzer",
        template: "%s | ReScan",
    },

    description:
        "Analyze your resume or portfolio with AI-powered feedback. Discover weaknesses, identify areas for improvement, and build a stronger professional presence.",

    applicationName: "ReScan",

    keywords: [
        "AI resume analyzer",
        "AI resume checker",
        "resume review tool",
        "resume feedback",
        "resume improvement",
        "AI portfolio analyzer",
        "portfolio review tool",
        "website portfolio analysis",
        "developer portfolio review",
        "brutal resume review",
    ],

    openGraph: {
        title: "ReScan - AI Resume & Portfolio Analyzer",
        description:
            "Get actionable AI feedback on your resume or portfolio. Find weaknesses, improve your presentation, and strengthen your professional profile.",
        url: "https://rescan-ai.vercel.app",
        siteName: "ReScan",
        type: "website",
        images: [
            {
                url: "/rescan.png",
                width: 1200,
                height: 630,
                alt: "ReScan - AI Resume & Portfolio Analyzer",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "ReScan - AI Resume & Portfolio Analyzer",
        description:
            "Analyze your resume or portfolio with AI. Get honest feedback and actionable suggestions for improvement.",
        images: ["/rescan.png"],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
  }

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}</body>
    </html>
  );
}
