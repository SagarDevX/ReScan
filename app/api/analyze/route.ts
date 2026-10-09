
import { NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
    try {
        // 1. Get uploaded file
        const formData = await request.formData();
        const file = formData.get("file");

        console.log("📥 Received request");

        // 2. Check file
        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        console.log("📄 File:", file.name);
        console.log("📦 Size:", file.size);
        console.log("📎 Type:", file.type);

        // 3. Validate PDF
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are allowed" },
                { status: 400 }
            );
        }

        // 4. Validate file size
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File must be smaller than 10MB" },
                { status: 400 }
            );
        }

        // 5. Read PDF
        console.log("🔄 Reading PDF...");

        const buffer = await file.arrayBuffer();
        const pdfData = new Uint8Array(buffer);

        // 6. Load PDF
        console.log("📖 Loading PDF...");

        const pdf = await getDocumentProxy(pdfData);

        // 7. Extract text
        console.log("📝 Extracting text...");

        const { text } = await extractText(pdf, {
            mergePages: true,
        });

        console.log("✅ PDF text extracted");
        console.log("📊 Text length:", text.length);

        if (!text.trim()) {
            return NextResponse.json(
                {
                    error: "Could not extract text from this PDF.",
                },
                { status: 400 }
            );
        }

        // 8. Check API key
        console.log(
            "🔑 Gemini API key exists:",
            Boolean(process.env.GEMINI_API_KEY)
        );

        // 9. Send resume to Gemini
        console.log("🤖 Starting Gemini request...");

        const start = Date.now();

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `
You are an expert resume reviewer.

Analyze the entire resume carefully.

Evaluate the resume using these four scoring categories:

1. Clarity
How clear, concise, readable, and easy to understand the resume is.

2. Impact
How well the resume demonstrates achievements, measurable results, and value instead of simply listing responsibilities.

3. ATS
How well the resume is optimized for ATS systems, including keywords, standard sections, readable formatting, and machine-readable content.

4. Structure
How well the resume is organized, including section order, hierarchy, consistency, spacing, and overall readability.

Also provide an overallScore that represents the overall quality of the resume.

Scoring rules:
- overallScore must be an integer from 0 to 100.
- Every category score must be an integer from 0 to 100.
- 100 is the best possible score.
- Never use decimals.
- Never use scores out of 10.
- Do not use percentages.

After scoring, analyze the entire resume and provide:

STRENGTHS:
List the strongest aspects of the resume.

WEAKNESSES:
List the biggest areas that need improvement.

MISTAKES:
Identify specific mistakes or problems in the resume.

For every mistake:
- Identify the resume section.
- Explain the mistake clearly.
- Give a practical fix.

Do not repeat strengths and weaknesses for each score.
Do not give generic advice.
Be specific and practical.
Base the analysis only on the provided resume.

Resume:

${text}
`,

            config: {
                thinkingConfig: {
                    thinkingLevel: ThinkingLevel.LOW,
                },

                responseMimeType: "application/json",

                responseSchema: {
                    type: "object",

                    properties: {
                        overallScore: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                        },

                        scores: {
                            type: "object",

                            properties: {
                                clarity: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },

                                impact: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },

                                ats: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },

                                structure: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },
                            },

                            required: [
                                "clarity",
                                "impact",
                                "ats",
                                "structure",
                            ],
                        },

                        strengths: {
                            type: "array",

                            items: {
                                type: "string",
                            },
                        },

                        weaknesses: {
                            type: "array",

                            items: {
                                type: "string",
                            },
                        },

                        mistakes: {
                            type: "array",

                            items: {
                                type: "object",

                                properties: {
                                    section: {
                                        type: "string",
                                    },

                                    mistake: {
                                        type: "string",
                                    },

                                    fix: {
                                        type: "string",
                                    },
                                },

                                required: [
                                    "section",
                                    "mistake",
                                    "fix",
                                ],
                            },
                        },
                    },

                    required: [
                        "overallScore",
                        "scores",
                        "strengths",
                        "weaknesses",
                        "mistakes",
                    ],
                },
            },
        });

        console.log(
            `⏱️ Gemini took ${Date.now() - start}ms`
        );

        const analysis = response.text;

        if (!analysis) {
            throw new Error("Gemini returned an empty response");
        }

        console.log("🤖 Gemini response:");
        console.log(analysis);

        const parsedAnalysis = JSON.parse(analysis);

        console.log("✅ Gemini request finished");

        return NextResponse.json({
            success: true,
            fileName: file.name,
            analysis: parsedAnalysis,
        });
    } catch (error) {
        console.error("❌ Analyze API error:");
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to analyze resume",
            },
            { status: 500 }
        );
    }
}