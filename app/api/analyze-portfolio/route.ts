
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
    try {
        const { url, brutalMode } = await request.json();
        const isBrutalMode = brutalMode === true;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { success: false, error: "Please provide a portfolio URL." },
                { status: 400 }
            );
        }

        let portfolioUrl: URL;

        try {
            portfolioUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: "Please enter a valid portfolio URL." },
                { status: 400 }
            );
        }

        if (!["http:", "https:"].includes(portfolioUrl.protocol)) {
            return NextResponse.json(
                { success: false, error: "Only HTTP and HTTPS URLs are supported." },
                { status: 400 }
            );
        }

        const response = await fetch(portfolioUrl.href, {
            headers: {
                "User-Agent": "Mozilla/5.0 ReScan Portfolio Analyzer",
                Accept: "text/html",
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: "We couldn't access this website. Check the URL and try again.",
                },
                { status: 400 }
            );
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("text/html")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "This URL doesn't appear to be a regular website.",
                },
                { status: 400 }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        $("script, style, noscript, iframe, svg, canvas").remove();

        const websiteData = {
            title: $("title").first().text().trim(),
            description:
                $('meta[name="description"]').attr("content")?.trim() || "",
            headings: $("h1, h2, h3")
                .map((_, element) => $(element).text().trim())
                .get()
                .filter(Boolean)
                .slice(0, 40),
            paragraphs: $("p")
                .map((_, element) => $(element).text().trim())
                .get()
                .filter(Boolean)
                .slice(0, 60),
            links: $("a")
                .map((_, element) => ({
                    text: $(element).text().trim(),
                    href: $(element).attr("href") || "",
                }))
                .get()
                .filter((link) => link.text || link.href)
                .slice(0, 60),
        };

        const feedbackInstructions = isBrutalMode
            ? `
You are ReScan's BRUTALLY HONEST portfolio roaster.

Your job is to give the user a serious reality check about their portfolio.
Do not sound like a polite corporate consultant. Sound like a sharp,
brutally honest friend who wants them to improve.

TONE:
- Be savage, blunt, witty, and direct.
- Use simple, everyday English that a beginner can understand.
- Prefer short sentences and punchy lines.
- Call out weak projects, boring descriptions, empty claims, unclear
  positioning, poor content, and weak presentation when the evidence supports it.
- Don't hide bad feedback behind polite words.
- Don't give fake praise just to make the user feel better.
- Don't make every line a joke. Make the criticism hit because it is true.
- Roast the work, not the person's intelligence, identity, or personal worth.

HOW TO REVIEW:
- Be specific about what is wrong and why it matters.
- Explain how a weakness could hurt the user's chances of getting hired.
- Give a clear, practical fix for every major problem.
- If the portfolio is genuinely strong in an area, acknowledge it honestly.
- Never invent projects, missing features, design flaws, broken interactions,
  performance problems, or other issues you cannot verify.
- You are reviewing extracted website content, not seeing the full website.
  You cannot reliably judge visual design, animations, responsiveness,
  accessibility, or working interactions from this text alone.
  Do not pretend you tested or saw those things.
- If there is not enough evidence to judge something, say so briefly
  in the relevant feedback rather than making up a roast.
- Keep scores honest. Brutal Mode changes the wording, NOT the grading standards.

EXAMPLES OF THE REQUIRED TONE:
Weak: "Your portfolio could communicate your skills more effectively."
Better: "Your portfolio makes me work too hard to figure out what you do.
Tell visitors what you build and why they should care."

Weak: "Your projects need more differentiation."
Better: "These projects don't give me a clear reason to remember you.
Show what you built yourself, what problem you solved, and what makes
your version worth looking at."

Weak: "Your descriptions lack detail."
Better: "You say you built it, but give me almost nothing to prove it.
Explain your role, the hard part, and what actually works."

Your roast must be based on THIS portfolio's actual extracted content.
No generic insults. No made-up problems. No long, fancy vocabulary.
`
            : `
You are a professional, supportive portfolio reviewer.

Use clear, simple English. Be honest, constructive, and specific.
Identify genuine strengths and weaknesses, explain why they matter,
and suggest practical improvements.

Do not invent problems or claim to have tested features you could not access.
You are reviewing extracted website content, so do not pretend you can
reliably judge visual design, animations, responsiveness, or interactions.
Keep scores honest and base them on the available evidence.
`;

        const prompt = `
${feedbackInstructions}

Review this developer portfolio for someone trying to present their work
professionally and improve their chances of getting hired.

Evaluate these four areas:
1. content: quality, clarity, and usefulness of the written content.
2. positioning: how clearly the developer communicates their skills and value.
3. ux: clarity of the website's content structure and navigation clues.
   Only judge what can reasonably be inferred from the extracted content.
4. seo: page title, meta description, headings, and other available content.

SCORING:
- Give each category a score from 0 to 100.
- Give an overall score from 0 to 100.
- Score only what the available evidence supports.
- Do not give high scores just to be nice.
- Do not give low scores just to sound brutal.
- Use the same scoring standards in both modes.

STRENGTHS:
List genuine strengths supported by the content.
Do not invent strengths. If there is little positive evidence, keep the list short.

WEAKNESSES:
List the most important real problems.
In Brutal Mode, explain them in blunt, simple language.
Avoid repeating the same problem.

MISTAKES:
Each item must contain:
- section: the part of the portfolio involved.
- mistake: what is wrong, explained clearly and directly.
- fix: a specific action the user can take to improve it.

Make the feedback useful, specific, and easy to understand.
Return only valid JSON matching the requested schema.
Do not include Markdown fences or any text outside the JSON.

PORTFOLIO URL:
${portfolioUrl.href}

EXTRACTED WEBSITE CONTENT:
${JSON.stringify(websiteData, null, 2)}
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
                                content: { type: "number" },
                                positioning: { type: "number" },
                                ux: { type: "number" },
                                seo: { type: "number" },
                            },
                            required: ["content", "positioning", "ux", "seo"],
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

        const text = result.text;

        if (!text) {
            throw new Error("The AI returned an empty response.");
        }

        const analysis = JSON.parse(text);

        return NextResponse.json({
            success: true,
            url: portfolioUrl.href,
            brutalMode: isBrutalMode,
            analysis,
        });
    } catch (error) {
        console.error("Portfolio analysis error:", error);

        if (error instanceof Error && error.name === "TimeoutError") {
            return NextResponse.json(
                {
                    success: false,
                    error: "This website took too long to respond. Try again.",
                },
                { status: 504 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "We couldn't analyze this portfolio. Please try again.",
            },
            { status: 500 }
        );
    }
}
