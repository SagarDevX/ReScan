"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function PortfolioInput() {
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const router = useRouter();

    const handleAnalyze = async () => {
        if (!url || isAnalyzing) return;

        try {
            setIsAnalyzing(true);

            const response = await fetch("/api/analyze-portfolio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Failed to analyze portfolio"
                );
            }

            // Save portfolio analysis
            sessionStorage.setItem(
                "portfolio-analysis",
                JSON.stringify(data.analysis)
            );

            // Save portfolio URL
            sessionStorage.setItem(
                "portfolio-url",
                data.url
            );

            // Go to results page
            router.push("/results");
        } catch (error) {
            console.error("❌ Portfolio analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="mt-2 w-full max-w-md min-h-48">
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                disabled={isAnalyzing}
                className="w-full rounded-2xl border border-neutral-700 px-5 py-4 text-sm text-white outline-none   focus:border-white disabled:opacity-50 bg-neutral-900 transition-all duration-200 ease-in-out hover:bg-neutral-800 placeholder:text-neutral-400"
            />


            {url.trim() && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{
                        duration: 0.25,
                        ease: "easeOut",
                    }}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleAnalyze}
                    className="mt-4 w-full rounded-xl bg-white py-3.5 text-sm font-medium text-black transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                >
                    {isAnalyzing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-black" />
                            Analyzing portfolio...
                        </span>
                    ) : (
                        "Analyze Portfolio"
                    )}
                </motion.button>
            )}


        </div>
    );
}