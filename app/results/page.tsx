"use client";
import { motion } from "motion/react"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Analysis = {
    overallScore: number;
    scores: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    mistakes: {
        section: string;
        mistake: string;
        fix: string;
    }[];
};

type AnalysisType = "resume" | "portfolio";

export default function ResultsPage() {
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [analysisType, setAnalysisType] =
        useState<AnalysisType>("resume");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        try {
            const storedType = sessionStorage.getItem("analysis-type");

            if (
                storedType !== "resume" &&
                storedType !== "portfolio"
            ) {
                setAnalysis(null);
                return;
            }

            if (storedType === "portfolio") {
                const portfolioData = sessionStorage.getItem(
                    "portfolio-analysis"
                );

                if (!portfolioData) {
                    setAnalysis(null);
                    return;
                }

                const parsed: Analysis = JSON.parse(portfolioData);

                if (
                    typeof parsed.overallScore !== "number" ||
                    !parsed.scores ||
                    typeof parsed.scores !== "object" ||
                    !Array.isArray(parsed.strengths) ||
                    !Array.isArray(parsed.weaknesses) ||
                    !Array.isArray(parsed.mistakes)
                ) {
                    setAnalysis(null);
                    return;
                }

                setAnalysis(parsed);
                setAnalysisType("portfolio");
                setPortfolioUrl(
                    sessionStorage.getItem("portfolio-url") || ""
                );
                return;
            }

            if (storedType === "resume") {
                const resumeData = sessionStorage.getItem(
                    "resume-analysis"
                );

                if (!resumeData) {
                    setAnalysis(null);
                    return;
                }

                const parsed: Analysis = JSON.parse(resumeData);

                if (
                    typeof parsed.overallScore !== "number" ||
                    !parsed.scores ||
                    typeof parsed.scores !== "object" ||
                    !Array.isArray(parsed.strengths) ||
                    !Array.isArray(parsed.weaknesses) ||
                    !Array.isArray(parsed.mistakes)
                ) {
                    setAnalysis(null);
                    return;
                }

                setAnalysis(parsed);
                setAnalysisType("resume");
            }
        } catch (error) {
            console.error("Failed to load analysis results:", error);
            setAnalysis(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FAFAF7] text-black">
                <div className="flex items-center gap-2">
                    {[0, 1, 2].map((dot) => (
                        <motion.div
                            key={dot}
                            className="h-2.5 w-2.5 rounded-full bg-neutral-800"
                            animate={{
                                y: [0, -12, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                repeatType: "loop",
                                delay: dot * 0.3,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            </main>
        );
    }

    if (!analysis) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAF7] text-black">
                <h1 className="text-2xl font-semibold">
                    No analysis found
                </h1>

                <p className="text-sm text-neutral-500">
                    Please analyze your resume or portfolio first.
                </p>

                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="rounded-xl bg-black px-5 py-3 text-sm text-white transition hover:bg-neutral-800"
                >
                    Back to ReScan
                </button>
            </main>
        );
    }

    const scoreLabels: Record<string, string> = {
        clarity: "Clarity",
        impact: "Impact",
        ats: "ATS",
        structure: "Structure",
        content: "Content",
        positioning: "Positioning",
        ux: "User Experience",
        seo: "SEO",
    };

    const scores = Object.entries(analysis.scores).map(
        ([key, score]) => ({
            name:
                scoreLabels[key] ||
                key.charAt(0).toUpperCase() + key.slice(1),
            score,
        })
    );

    const title =
        analysisType === "portfolio"
            ? "Portfolio Analysis"
            : "Resume Analysis";

    return (
        <main className="min-h-screen bg-white text-black">
            <div className="px-4 py-2">
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="md:fixed z-10 cursor-pointer rounded-2xl px-3 py-2 text-neutral-500 transition-colors hover:bg-neutral-200"
                >
                    ↩ Back
                </button>
            </div>

            <div className="mx-auto my-6 max-w-4xl px-6">

                <header>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                        {title}
                    </h1>

                    <p className="mt-3 text-neutral-500">
                        {analysisType === "portfolio"
                            ? "See what's working, what needs fixing, and how to improve your website."
                            : "A detailed breakdown of your resume."}
                    </p>

                    {analysisType === "portfolio" && portfolioUrl && (
                        <a
                            href={portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block max-w-full truncate text-md text-neutral-500 underline underline-offset-4 hover:text-black"
                        >
                            {portfolioUrl}
                        </a>
                    )}
                </header>

                <section className="mt-8">
                    <p className="text-sm text-neutral-500">
                        Overall Score
                    </p>

                    <p className="mt-2 text-7xl font-semibold tracking-tight">
                        {analysis.overallScore}
                        <span className="ml-2 text-2xl font-normal text-neutral-400">
                            / 100
                        </span>
                    </p>
                </section>

                <section className="mt-16">
                    <h2 className="text-xl font-semibold">
                        {analysisType === "portfolio"
                            ? "Website Scores"
                            : "Resume Scores"}
                    </h2>

                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {scores.map((item) => (
                            <div
                                key={item.name}
                                className="rounded-2xl border border-neutral-200 bg-white p-5"
                            >
                                <p className="text-sm text-neutral-500">
                                    {item.name}
                                </p>

                                <p className="mt-2 text-4xl font-semibold">
                                    {item.score}
                                    <span className="ml-1 text-base font-normal text-neutral-400">
                                        / 100
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-16">
                    <h2 className="text-2xl font-semibold">
                        Strengths
                    </h2>

                    <ul className="mt-6 space-y-4">
                        {analysis.strengths.map((strength, index) => (
                            <li
                                key={index}
                                className="border-b border-neutral-200 pb-4 text-neutral-700"
                            >
                                {strength}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-16">
                    <h2 className="text-2xl font-semibold">
                        Areas to Improve
                    </h2>

                    <ul className="mt-6 space-y-4">
                        {analysis.weaknesses.map((weakness, index) => (
                            <li
                                key={index}
                                className="border-b border-neutral-200 pb-4 text-neutral-700"
                            >
                                {weakness}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-16">
                    <h2 className="text-2xl font-semibold">
                        Problems & Fixes
                    </h2>

                    <div className="mt-6 space-y-8">
                        {analysis.mistakes.map((item, index) => (
                            <div
                                key={index}
                                className="border-b border-neutral-200 pb-8"
                            >
                                <p className="text-sm font-medium text-neutral-500">
                                    {item.section}
                                </p>

                                <h3 className="mt-2 text-lg font-medium">
                                    {item.mistake}
                                </h3>

                                <div className="mt-4">
                                    <p className="text-sm font-medium text-neutral-500">
                                        How to fix it
                                    </p>

                                    <p className="mt-1 leading-7 text-neutral-700">
                                        {item.fix}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="border-t border-neutral-200 py-8">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="cursor-pointer rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
                    >
                        Analyze another {analysisType}
                    </button>
                </div>
            </div>
        </main>
    );
}
