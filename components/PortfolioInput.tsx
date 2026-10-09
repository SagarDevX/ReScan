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

        // Add https:// if the user hasn't provided a protocol.
        let normalizedUrl = url.trim();

        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = `https://${normalizedUrl}`;
        }

        // Validate the URL.
        try {
            const parsedUrl = new URL(normalizedUrl);

            if (
                !["http:", "https:"].includes(parsedUrl.protocol) ||
                !parsedUrl.hostname.includes(".") ||
                parsedUrl.hostname.startsWith(".") ||
                parsedUrl.hostname.endsWith(".")
            ) {
                throw new Error("Please enter a valid portfolio URL.");
            }
        } catch {
            setError("Please enter a valid portfolio URL.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const response = await fetch("/api/analyze-portfolio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: normalizedUrl,
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
                data.url || normalizedUrl
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
                type="text"
                inputMode="url"
                autoComplete="url"
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleAnalyze();
                    }
                }}
                placeholder="Enter your portfolio URL"
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
                        className="mt-4 w-full cursor-pointer rounded-xl bg-white py-3.5 text-sm font-medium text-black transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 md:bg-black md:text-white"
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-black md:border-t-white" />
                                Analyzing portfolio...
                            </span>
                        ) : (
                            "Analyze Portfolio"
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {error && (
                <p className="mt-3 text-sm text-red-500" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}