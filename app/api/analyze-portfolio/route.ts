import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
    try {
        // 1. Get URL
        const body = await request.json();
        const { url } = body;

        // 2. Check URL
        if (!url) {
            return NextResponse.json(
                {
                    error: "Portfolio URL is required",
                },
                { status: 400 }
            );
        }

        // 3. Validate URL
        let portfolioUrl: URL;

        try {
            portfolioUrl = new URL(url);
        } catch {
            return NextResponse.json(
                {
                    error: "Please enter a valid URL",
                },
                { status: 400 }
            );
        }

        // 4. Only allow HTTP / HTTPS
        if (
            portfolioUrl.protocol !== "http:" &&
            portfolioUrl.protocol !== "https:"
        ) {
            return NextResponse.json(
                {
                    error: "Only HTTP and HTTPS URLs are allowed",
                },
                { status: 400 }
            );
        }

        // 5. Fetch website
        const response = await fetch(portfolioUrl.href, {
            headers: {
                "User-Agent": "Mozilla/5.0 ReScan",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: `Website returned status ${response.status}`,
                },
                { status: 400 }
            );
        }

        // 6. Get HTML
        const html = await response.text();


        // 7. Load HTML with Cheerio
        const $ = cheerio.load(html);

        // 8. Extract title
        const title = $("title").text().trim();

        // 9. Extract meta description
        const description =
            $('meta[name="description"]')
                .attr("content")
                ?.trim() || "";

        // 10. Extract headings
        const headings = $("h1, h2, h3")
            .map((_, element) => $(element).text().trim())
            .get()
            .filter(Boolean);

        // 11. Extract paragraphs
        const paragraphs = $("p")
            .map((_, element) => $(element).text().trim())
            .get()
            .filter(Boolean);

        // 12. Extract links
        const links = $("a")
            .map((_, element) => ({
                text: $(element).text().trim(),
                href: $(element).attr("href") || "",
            }))
            .get()
            .filter((link) => link.text || link.href);

        // 13. Prepare website data
        const websiteData = {
            title,
            description,
            headings,
            paragraphs,
            links,
        };

        // 14. Send data to Gemini
        const start = Date.now();

        const geminiResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `
You are ReScan, a friendly but brutally honest portfolio reviewer.

Your job is to review a developer's portfolio and explain what is good,
what is bad, and what they should change.

IMPORTANT WRITING RULES:

- Use simple everyday English.
- Write like you are explaining the problem to a developer.
- Avoid complicated or academic vocabulary.
- Avoid corporate and marketing language.
- Keep sentences short and clear.
- Do not use words just to sound intelligent.
- If a simple word works, use the simple word.
- Be honest and direct, but never rude.
- Give practical advice that the developer can actually follow.
- Do not give generic advice.
- Mention the actual problem you found.
- Explain WHY it is a problem.
- Then explain HOW to fix it.

For example:

BAD:
"The portfolio lacks clear positioning and fails to communicate
the developer's value proposition effectively."

GOOD:
"It's not clear what kind of developer you are or what type of work
you want to get. Add a short line near the top that clearly says
what you do."

Another example:

BAD:
"The site's information hierarchy could be optimized."

GOOD:
"The important information is hard to find. Your name, role,
and main project should stand out more."

Another example:

BAD:
"The website has insufficient semantic structure for search engines."

GOOD:
"Your page is missing useful headings. Add clear H1 and H2 headings
so both visitors and search engines can understand the page."

---

Analyze the portfolio using these four categories:

1. Content
Is the text clear and useful?
Does the portfolio explain the developer and their work well?

2. Positioning
Is it clear what the developer does?
Is it clear what kind of developer they are?
Is it clear what type of work they are looking for?

3. UX
Is the website easy to understand and navigate?
Can visitors quickly find important information?

4. SEO
Check the page title, meta description, headings,
and content structure.

Also provide:

STRENGTHS:
List the best things about the portfolio.

WEAKNESSES:
List the biggest things that could be better.

MISTAKES:
Find specific problems in the portfolio.

For every mistake:
- Say which section has the problem.
- Explain the problem in simple English.
- Give a clear and practical fix.

IMPORTANT:

- Only use information from the provided website data.
- Never invent something that is not there.
- Do not give generic advice.
- Be specific.
- Use simple English.
- Scores must be integers from 0 to 100.
- 100 means excellent.
- Keep feedback concise and useful.

Website data:

${JSON.stringify(websiteData, null, 2)}
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
                                content: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },

                                positioning: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },

                                ux: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },

                                seo: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100,
                                },
                            },

                            required: [
                                "content",
                                "positioning",
                                "ux",
                                "seo",
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


        // 15. Get Gemini response
        const analysis = geminiResponse.text;

        if (!analysis) {
            throw new Error(
                "Gemini returned an empty response"
            );
        }


        // 16. Parse JSON
        const parsedAnalysis = JSON.parse(analysis);


        // 17. Return analysis
        return NextResponse.json({
            success: true,
            url: portfolioUrl.href,
            analysis: parsedAnalysis,
        });
    } catch (error) {
        console.error("❌ Portfolio analysis error:");
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to analyze portfolio",
            },
            { status: 500 }
        );
    }
}