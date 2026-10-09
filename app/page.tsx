"use client";
import { motion } from "motion/react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ResumeUpload from "@/components/ResumeUpload";
import PortfolioInput from "@/components/PortfolioInput";
import { Shader } from "@/components/Shader";

const Page = () => {
  const [reviewType, setReviewType] = useState<"resume" | "portfolio">(
    "resume"
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black text-white">

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[70%] w-full md:h-[50%]">
        <Shader />
      </div>

      <div className="relative z-50 mx-auto w-full">
        <Navbar />
      </div>

      <div className="relative z-10 flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center gap-6 px-5 py-12 text-center sm:gap-8 sm:px-8">

        <h1 className="max-w-3xl text-3xl tracking-tight sm:text-4xl md:text-5xl font-medium">
          Strengthen your resume with clear AI insights.
        </h1>

        <p className="text-base leading-[1.2] text-neutral-300">
          Upload your resume and get AI-powered
          <br />
          feedback to make it stronger.
        </p>

        {/* Review type toggle */}
        <div className="relative flex rounded-4xl border border-white/10 bg-neutral-900/70 p-1 backdrop-blur-xl" >
          {/* Moving background */}
          <motion.span
            className="absolute top-1 bottom-1 w-21 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-[inset_0_2px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.2)]"
            animate={{
              x: reviewType === "resume" ? 0 : 84,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          <button
            type="button"
            onClick={() => setReviewType("resume")}
            className={`relative z-10 w-21 rounded-3xl px-4 py-2 text-sm ${reviewType === "resume"
                ? "text-white"
                : "text-neutral-600 hover:text-white cursor-pointer"
              }`}
          >
            Resume
          </button>

          <button
            type="button"
            onClick={() => setReviewType("portfolio")}
            className={`relative z-10 w-21 rounded-3xl px-4 py-2 text-sm ${reviewType === "portfolio"
                ? "text-white"
                : "text-neutral-600 hover:text-white cursor-pointer"
              }`}
          >
            Portfolio
          </button>
        </div>

        {/* Input */}
        {reviewType === "resume" ? (
          <ResumeUpload />
        ) : (
          <PortfolioInput />
        )}

      </div>

    </main>
  );
};

export default Page;