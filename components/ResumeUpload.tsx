"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "motion/react";

export default function ResumeUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "application/pdf": [".pdf"],
        },

        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,

        onDrop: (acceptedFiles) => {
            setError("");

            if (acceptedFiles.length > 0) {
                setFile(acceptedFiles[0]);
            }
        },

        onDropRejected: () => {
            setFile(null);
            setError("Please upload a PDF smaller than 10MB.");
        },
    });

    const handleAnalyze = async () => {
        if (!file || isAnalyzing) {
            return;
        }

        setError("");
        setIsAnalyzing(true);

        console.log("🚀 Sending file:", file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            console.log("📡 Status:", response.status);

            const text = await response.text();

            console.log("📦 Raw response:", text);

            if (!response.ok) {
                console.error("❌ API error:", text);
                setError("Failed to analyze your resume. Please try again.");
                return;
            }

            const data = JSON.parse(text);

            console.log("📊 Resume analysis:", data.analysis);

            // Save analysis temporarily
            sessionStorage.setItem(
                "resume-analysis",
                JSON.stringify(data.analysis)
            );

            console.log("✅ Analysis saved");

            // Go to results page
            window.location.href = "/results";
        } catch (error) {
            console.error("❌ Upload failed:", error);

            setError(
                "Something went wrong while analyzing your resume."
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="mt-2 w-full max-w-md">

            {/* Upload area */}
            <div
                {...getRootProps()}
                className="w-full outline-none"
            >
                <input {...getInputProps()} />

                <motion.div
                    animate={{
                        borderColor: isDragActive
                            ? "#54E346"
                            : "#E5E5E5",
                        scale: isDragActive ? 1.01 : 1,
                    }}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut",
                    }}
                    className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-neutral-900 transition-all duration-200 ease-in-out hover:bg-neutral-800"
                >
                    {file ? (
                        <>
                            {/* Selected file */}
                            <div className="text-center">
                                <p className="text-base font-medium text-white">
                                    {file.name}
                                </p>

                                <p className="mt-2 text-sm text-neutral-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                <p className="mt-4 text-xs text-neutral-400">
                                    Click to replace
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Empty state */}
                            <motion.p
                                animate={{
                                    y: isDragActive ? -2 : 0,
                                }}
                                className="text-lg font-medium text-neutral-400"
                            >
                                {isDragActive
                                    ? "Drop your resume here"
                                    : "Drop your resume here"}
                            </motion.p>

                            <p className="mt-2 text-sm text-neutral-500">
                                or browse files
                            </p>

                            <p className="mt-4 text-xs text-neutral-400">
                                PDF · Max 10MB
                            </p>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Error */}
            {error && (
                <motion.p
                    initial={{
                        opacity: 0,
                        y: -5,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mt-3 text-center text-sm text-red-500"
                >
                    {error}
                </motion.p>
            )}

            {/* Analyze button */}
            {file && (
                <motion.button
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.25,
                        ease: "easeOut",
                    }}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleAnalyze}
                    className="mt-4 w-full cursor-pointer rounded-xl bg-black py-3.5 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isAnalyzing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-500 border-t-white" />
                            Analyzing resume...
                        </span>
                    ) : (
                        "Analyze Resume"
                    )}
                </motion.button>
            )}
        </div>
    );
}