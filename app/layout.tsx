import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "ReScan",
  description: "AI-powered resume analysis with brutally honest feedback.",
  keywords: [
    "AI resume analyzer", "resume review", "resume feedback", "resume checker", "AI resume reviewer", "resume roast", "resume improvement",
  ],
  openGraph: {
    title: "ReScan — AI Resume Roast & Analysis",
    description:
      "Get your resume roasted by AI. Find weaknesses, improve your resume, and get brutally honest feedback.",
    type: "website",
    siteName: "ReScan",
  },

  twitter: {
    card: "summary_large_image",
    title: "ReScan — AI Resume Roast & Analysis",
    description:
      "Get your resume roasted by AI with brutally honest feedback.",
  },
};

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
