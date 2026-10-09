"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

type PortfolioInputProps = {
    brutalMode: boolean;
};

export default function PortfolioInput({
    brutalMode,
}: PortfolioInputProps) {
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();


    const handleAnalyze = async () => {
        if (!url.trim() || isAnalyzing) return;

        setIsAnalyzing(true);
        setError("");


        try {
            const response = await fetch("/api/analyze-portfolio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: url.trim(),
                    brutalMode,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.analysis) {
                throw new Error(
                    data.error || "Failed to analyze portfolio."
                );
            }
            sessionStorage.removeItem("resume-analysis");

            sessionStorage.setItem(
                "portfolio-analysis",
                JSON.stringify(data.analysis)
            );

            sessionStorage.setItem(
                "portfolio-url",
                data.url || url.trim()
            );

            sessionStorage.setItem("analysis-type", "portfolio");

            sessionStorage.setItem(
                "brutal-mode",
                String(data.brutalMode ?? brutalMode)
            );

            router.push("/results");
        } catch (error) {
            console.error("Portfolio analysis failed:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <div className="mt-2 min-h-48 w-full max-w-md">
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                disabled={isAnalyzing}
                className="w-full rounded-2xl border border-neutral-400 bg-neutral-900 px-5 py-4 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white disabled:opacity-50"
            />

            <AnimatePresence>
                {url.trim() && (
                    <motion.button
                        key="analyze-button"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        type="button"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="mt-4 w-full rounded-xl bg-white md:bg-black py-3.5 text-sm font-medium text-black md:text-white transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
            </AnimatePresence>

            {error && (
                <p className="mt-3 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}