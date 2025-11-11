import { NextRequest, NextResponse } from "next/server";

import {
	GeminiUnavailableError,
	generateArticle,
} from "@/lib/gemini";
import { persistArticle } from "@/lib/articles-repository";
import type { Article } from "@/types/article";

function normalizeString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export async function POST(request: NextRequest) {
	console.log("🎯 API Route - POST request received");

	let rawBody = "";

	try {
		rawBody = await request.text();
	} catch (error) {
		console.error("💥 Failed to read request body", error);
		return NextResponse.json(
			{ error: "Unable to read request body." },
			{ status: 400 },
		);
	}

	console.log("📦 Raw body length:", rawBody.length);

	if (!rawBody.trim()) {
		console.log("❌ Empty request body");
		return NextResponse.json(
			{ error: "Request body cannot be empty." },
			{ status: 400 },
		);
	}

	let payload: Record<string, unknown>;

	try {
		payload = JSON.parse(rawBody);
		console.log("✅ JSON parsed successfully");
	} catch (error) {
		console.error("💥 Failed to parse JSON body", error);
		return NextResponse.json(
			{ error: "Invalid JSON payload." },
			{ status: 400 },
		);
	}

	const codeValue = normalizeString(payload.code);
	const guidanceValue = normalizeString(payload.guidance);
	const apiKeyValue = normalizeString(payload.apiKey);
	const modelValue = normalizeString(payload.model);

	const environmentSnapshot = {
		GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "SET" : "MISSING",
		GEMINI_MODEL: process.env.GEMINI_MODEL ?? "unset",
		RUNNING_PORT: process.env.RUNNING_PORT ?? "unset",
	} as const;

	console.log("🔧 API Route - Environment check:", environmentSnapshot);

	const diagnostics = {
		hasCode: Boolean(codeValue.trim()),
		hasGuidance: Boolean(guidanceValue.trim()),
		hasApiKey: Boolean(apiKeyValue.trim()),
		model: modelValue.trim() || null,
		envHasKey: environmentSnapshot.GEMINI_API_KEY === "SET",
		envModel: environmentSnapshot.GEMINI_MODEL,
	};

	console.log("🔧 API Route - Received request:", diagnostics);

	if (!diagnostics.hasCode) {
		console.log("❌ Missing code sample in request");
		return NextResponse.json(
			{ error: "Code sample is required to generate an article." },
			{ status: 400 },
		);
	}

	const startTime = Date.now();
	console.log("🤖 Calling Gemini API...");

	try {
			const generated = await generateArticle({
			code: codeValue,
			guidance: guidanceValue || undefined,
			apiKey: apiKeyValue || undefined,
			model: modelValue || undefined,
		});

				const enrichedArticle: Article = {
					id:
						typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
							? crypto.randomUUID()
							: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
				title: generated.title,
				subtitle: generated.subtitle,
				excerpt: generated.excerpt,
				sections: generated.sections,
				createdAt: new Date().toISOString(),
				readingTimeMinutes: generated.readingTimeMinutes,
				imageUrl: undefined,
				comments: [],
			};

			const persistedArticle = await persistArticle(enrichedArticle);

		const elapsed = Date.now() - startTime;
		console.log(`✅ Gemini responded in ${elapsed}ms`);
			console.log("📤 Sending response with article:", persistedArticle.title);

			return NextResponse.json(persistedArticle);
	} catch (error) {
		if (error instanceof GeminiUnavailableError) {
			console.error("🚧 Gemini temporarily unavailable", error);
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

			if (error instanceof Error) {
				console.error("💥 Article generation failed", error);

				return NextResponse.json(
					{ error: error.message },
					{ status: 500 },
				);
		}

		console.error("💥 Article generation failed (unknown error)", error);
		return NextResponse.json(
			{ error: "Unexpected error while generating the article." },
			{ status: 500 },
		);
	}
}
