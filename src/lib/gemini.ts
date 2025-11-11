import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

export type ArticleSection = {
  heading: string;
  body: string;
};

export type GeneratedArticle = {
  title: string;
  author: string;
  subtitle?: string;
  excerpt: string;
  sections: ArticleSection[];
  readingTimeMinutes?: number;
};

export type ArticleRequest = {
  code: string;
  guidance?: string;
  apiKey?: string;
  model?: string;
};

const ENV_DEFAULT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const GEMINI_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES ?? 3);
const GEMINI_RETRY_DELAY_MS = Number(
  process.env.GEMINI_RETRY_DELAY_MS ?? 1_500,
);

export class GeminiUnavailableError extends Error {
  readonly status = 503;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GeminiUnavailableError";
  }
}

function buildPrompt({ code, guidance }: ArticleRequest) {
  const optionalGuidance = guidance?.trim()
    ? `\nAdditional direction from the developer: ${guidance.trim()}`
    : "";

  return `You are a senior developer writing for Medium. Turn the following code into a narrative article that explains what the code does, why it matters, and how to adapt it. Focus on clarity and actionable insights.\n\nReturn a JSON object that fits this TypeScript schema:\n\ninterface Article {\n  title: string; // engaging, 8-12 words\n  author: string; // byline with first and last name, 2-4 words total\n  subtitle?: string; // optional supporting line, <= 120 characters\n  excerpt: string; // 2-3 sentence summary\n  sections: { heading: string; body: string; }[]; // each section < 350 words and can include Markdown lists\n  readingTimeMinutes?: number; // estimated reading time as an integer\n}\n\nEvery section body should be written as Markdown paragraphs and lists when appropriate.\n\nHere is the code to analyze:\n\n\n\n${code}\n\n${optionalGuidance}\n\nRespond ONLY with the JSON object. Do not wrap it in markdown or add commentary.`;
}

export async function generateArticle({
  code,
  guidance,
  apiKey: apiKeyOverride,
  model: modelOverride,
}: ArticleRequest): Promise<GeneratedArticle> {
  console.log('🔑 Checking API key...');
  const apiKey = apiKeyOverride?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }
  console.log('✅ API key found');

  if (!code?.trim()) {
    throw new Error("Code sample is required to generate an article.");
  }

  console.log('🤖 Initializing Gemini client...');
  const client = new GoogleGenerativeAI(apiKey);
  const modelName = modelOverride?.trim() || ENV_DEFAULT_MODEL;
  console.log('📋 Using model:', modelName);
  const model = client.getGenerativeModel({ model: modelName });

  const prompt = buildPrompt({ code, guidance });
  console.log('📝 Prompt length:', prompt.length, 'characters');

  console.log('⏳ Calling Gemini API (this may take 10-30 seconds)...');
  const response = await generateWithRetry(async () =>
    model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        topP: 0.8,
        responseMimeType: "application/json",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    }),
  );

  console.log('✅ Gemini API responded');
  const text = response.response.text();
  console.log('📄 Response length:', text.length, 'characters');

  try {
    const parsed = JSON.parse(text);
    console.log('✅ Response JSON parsed successfully');
    const sections = Array.isArray(parsed.sections)
      ? parsed.sections
          .map((section: ArticleSection) => ({
            heading: section.heading?.trim() || "Takeaways",
            body: section.body?.trim() || "",
          }))
          .filter((section: ArticleSection) => Boolean(section.body))
      : [];

    return {
      title: parsed.title?.trim() || "Untitled Article",
      author: parsed.author?.trim() || "Gemini Assistant",
      subtitle: parsed.subtitle?.trim() || parsed.dek?.trim(),
      excerpt:
        parsed.excerpt?.trim() ||
        sections[0]?.body?.slice(0, 160) ||
        "A developer deep dive generated from your code sample.",
      sections: sections.length
        ? sections
        : [
            {
              heading: "Overview",
              body: "The Gemini API returned an empty body. Please try again with a different code sample.",
            },
          ],
      readingTimeMinutes: Number.isFinite(parsed.readingTimeMinutes)
        ? Math.max(1, Math.round(parsed.readingTimeMinutes))
        : undefined,
    };
  } catch (error) {
    throw new Error(
      `Gemini returned an unexpected response. Raw output: ${text}`,
      { cause: error instanceof Error ? error : undefined },
    );
  }
}

function shouldRetry(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("temporarily")
  );
}

async function generateWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let attempt = 0;

  while (true) {
    attempt += 1;

    try {
      return await operation();
    } catch (error) {
      const hasAttemptsLeft = attempt < GEMINI_MAX_RETRIES;

      if (shouldRetry(error) && hasAttemptsLeft) {
        await delay(attempt * GEMINI_RETRY_DELAY_MS);
        continue;
      }

      if (shouldRetry(error)) {
        throw new GeminiUnavailableError(
          "Gemini service is temporarily unavailable. Please try again in a few moments.",
          { cause: error },
        );
      }

      throw error;
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
