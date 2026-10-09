
import { NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file");
        const brutalMode = formData.get("brutalMode") === "true";

        if (!(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "Please upload a resume PDF." },
                { status: 400 }
            );
        }

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            return NextResponse.json(
                { success: false, error: "Only PDF resumes are supported." },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json(
                { success: false, error: "Your uploaded file is empty." },
                { status: 400 }
            );
        }

        const MAX_FILE_SIZE = 10 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Your PDF is too large. Please upload a file under 10 MB.",
                },
                { status: 400 }
            );
        }

        const buffer = new Uint8Array(await file.arrayBuffer());

        const pdf = await getDocumentProxy(buffer);
        const { text: resumeText } = await extractText(pdf, {
            mergePages: true,
        });

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                {
                    success: false,
                    error: "We couldn't read enough text from this PDF. Try a text-based PDF instead of a scanned image.",
                },
                { status: 400 }
            );
        }

        const feedbackInstructions = brutalMode
            ? `
You are ReScan's BRUTALLY HONEST resume roaster.

Your job is to give the user a reality check about their resume.
You are not here to protect their feelings or hand out fake compliments.
You are here to show them exactly why their resume may be getting ignored.

TONE:
- Be savage, blunt, witty, and direct.
- Use simple, everyday English. A beginner should understand every sentence.
- Keep sentences short and punchy.
- Sound like a brutally honest friend who wants the user to improve.
- Call out weak bullet points, empty claims, boring descriptions,
  meaningless buzzwords, poor structure, and missing proof when present.
- Don't hide bad feedback behind polite corporate language.
- Don't praise something unless it genuinely deserves praise.
- Don't turn every sentence into a joke. Make the feedback sharp and useful.
- Roast the resume, never the person's intelligence, identity, background,
  or personal worth.

HOW TO ROAST:
- Explain exactly what is wrong and why it hurts the candidate.
- Point out vague claims that provide no proof of skill or impact.
- If a bullet only lists a task without showing an outcome, call that out.
- If a project description says almost nothing useful, say so directly.
- If a section is missing, criticize it only when its absence is evident
  and relevant to the candidate's goals.
- Give a clear, practical fix for every major problem.
- Use the actual resume text. Never invent mistakes, skills, experience,
  education, achievements, or missing information.
- Do not assume a candidate is unqualified just because they are a beginner.
- If the resume has genuine strengths, acknowledge them honestly.
- If the evidence is limited, say that instead of making something up.

EXAMPLES OF THE REQUIRED TONE:

Weak: "Your bullet points could be more impactful."
Better: "You listed your duties, not your impact. Anyone can claim they
worked on a project. Show what you actually built or improved."

Weak: "Your skills section lacks detail."
Better: "You dropped a bunch of skill names on the page, but gave me
little proof you can use them. Back them up with real projects."

Weak: "Your achievements need quantification."
Better: "You keep saying you improved things, but where's the proof?
Use real numbers if you have them. Never make numbers up."

Weak: "Your summary could be clearer."
Better: "This summary says a lot without telling me much. What do you do,
what are you good at, and why should anyone care? Get to the point."

SCORING RULES:
- Score honestly from 0 to 100.
- Keep the same grading standards as Normal Mode.
- Brutal Mode changes the delivery, NOT the score.
- Do not lower scores just to make the roast sound harsher.
- Never invent facts or claim the resume will definitely fail an ATS.
- Feedback must be based only on the resume text provided.
`
            : `
You are a professional, supportive resume reviewer.

Use simple, clear English. Give honest, constructive feedback.
Identify genuine strengths and weaknesses and explain how to improve them.
Avoid generic advice, invented facts, and unnecessary jargon.

Judge the resume using only the available content.
Keep scores honest and consistent.
`;

        const prompt = `
${feedbackInstructions}

Analyze the following resume for clarity, impact, ATS readability,
and structure.

SCORING:
Give each category a score from 0 to 100:
- clarity: how clear and easy to understand the resume is.
- impact: how well it shows achievements, results, and value.
- ats: how clearly the text presents relevant skills and experience
  for typical applicant tracking systems. You cannot guarantee ATS results.
- structure: how logically the resume is organized based on the extracted text.

Also provide:
- overallScore: one honest score from 0 to 100.
- strengths: a list of genuine strengths supported by the resume.
- weaknesses: a list of the most important problems.
- mistakes: specific issues, each with a section, mistake, and fix.

For every major weakness, make the fix practical and easy to follow.
In Brutal Mode, use a sharp roast followed by a useful explanation.
Do not insult the user personally.
Do not repeat the same issue in multiple ways.
Do not invent missing details or achievements.

Return only valid JSON matching the requested schema.
Do not include Markdown fences or text outside the JSON.

RESUME TEXT:
${resumeText.slice(0, 30000)}
`;

        const result = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
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
                        },
                        scores: {
                            type: "object",
                            properties: {
                                clarity: { type: "number" },
                                impact: { type: "number" },
                                ats: { type: "number" },
                                structure: { type: "number" },
                            },
                            required: ["clarity", "impact", "ats", "structure"],
                        },
                        strengths: {
                            type: "array",
                            items: { type: "string" },
                        },
                        weaknesses: {
                            type: "array",
                            items: { type: "string" },
                        },
                        mistakes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    section: { type: "string" },
                                    mistake: { type: "string" },
                                    fix: { type: "string" },
                                },
                                required: ["section", "mistake", "fix"],
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

        if (!result.text) {
            throw new Error("The AI returned an empty response.");
        }

        const analysis = JSON.parse(result.text);

        return NextResponse.json({
            success: true,
            fileName: file.name,
            brutalMode,
            analysis,
        });
    } catch (error) {
        console.error("Resume analysis error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "We couldn't analyze your resume. Please try another PDF or try again.",
            },
            { status: 500 }
        );
    }
}
