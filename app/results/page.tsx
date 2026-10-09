
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Analysis = {
    overallScore: number;

    scores: {
        clarity: number;
        impact: number;
        ats: number;
        structure: number;
    };

    strengths: string[];

    weaknesses: string[];

    mistakes: {
        section: string;
        mistake: string;
        fix: string;
    }[];
};

export default function ResultsPage() {
    const [analysis, setAnalysis] =
        useState<Analysis | null>(null);

    const router = useRouter();

    useEffect(() => {
        const storedAnalysis =
            sessionStorage.getItem("resume-analysis");

        if (!storedAnalysis) {
            return;
        }

        try {
            const parsedAnalysis = JSON.parse(
                storedAnalysis
            );

            setAnalysis(parsedAnalysis);
        } catch (error) {
            console.error(
                "Failed to parse resume analysis:",
                error
            );
        }
    }, []);

    if (!analysis) {
        return (
            <main className="flex min-h-screen items-center justify-center text-black bg-[#FAFAF7]">
                <p className="text-sm text-neutral-500">
                    Loading results...
                </p>
            </main>
        );
    }

    const scores = [
        {
            name: "Clarity",
            score: analysis.scores.clarity,
        },
        {
            name: "Impact",
            score: analysis.scores.impact,
        },
        {
            name: "ATS",
            score: analysis.scores.ats,
        },
        {
            name: "Structure",
            score: analysis.scores.structure,
        },
    ];

    return (
        <main className="min-h-screen bg-white text-black">
            <div className="w-full px-4 py-2 ">
                <button className="fixed px-2 py-1 rounded-2xl hover:bg-neutral-200 cursor-pointer transition-transform duration-300 ease-linear text-neutral-500 "
                  onClick={() => router.push("/")}
                >↩ back</button>
            </div>
            <div className="mx-auto max-w-4xl px-6 my-6">

                {/* Header */}
                <header>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                        Resume Analysis
                    </h1>

                    <p className="mt-3 text-neutral-500">
                        A detailed breakdown of your resume.
                    </p>
                </header>

                {/* Overall Score */}
                <section className="mt-16">
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

                {/* Individual Scores */}
                <section className="mt-16">
                    <h2 className="text-xl font-semibold">
                        Resume Scores
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

                {/* Strengths */}
                <section className="mt-16">
                    <h2 className="text-2xl font-semibold">
                        Strengths
                    </h2>

                    <ul className="mt-6 space-y-4">
                        {analysis.strengths.map(
                            (strength, index) => (
                                <li
                                    key={index}
                                    className="border-b border-neutral-200 pb-4 text-neutral-700"
                                >
                                    {strength}
                                </li>
                            )
                        )}
                    </ul>
                </section>

                {/* Weaknesses */}
                <section className="mt-16">
                    <h2 className="text-2xl font-semibold">
                        Weaknesses
                    </h2>

                    <ul className="mt-6 space-y-4">
                        {analysis.weaknesses.map(
                            (weakness, index) => (
                                <li
                                    key={index}
                                    className="border-b border-neutral-200 pb-4 text-neutral-700"
                                >
                                    {weakness}
                                </li>
                            )
                        )}
                    </ul>
                </section>

                {/* Mistakes & Fixes */}
                <section className="mt-16">
                    <h2 className="text-2xl font-semibold">
                        Mistakes & Fixes
                    </h2>

                    <div className="mt-6 space-y-8">
                        {analysis.mistakes.map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="border-b border-neutral-200 pb-8"
                                >
                                    {/* Section */}
                                    <p className="text-sm font-medium text-neutral-500">
                                        {item.section}
                                    </p>

                                    {/* Mistake */}
                                    <h3 className="mt-2 text-lg font-medium">
                                        {item.mistake}
                                    </h3>

                                    {/* Fix */}
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-neutral-500">
                                            Fix
                                        </p>

                                        <p className="mt-1 leading-7 text-neutral-700">
                                            {item.fix}
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}