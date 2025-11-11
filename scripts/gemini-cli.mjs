#!/usr/bin/env node
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { readFileSync } from "node:fs";

function printUsage() {
  console.log(`Usage: npm run gemini:article -- "path/to/code or inline code" [--guide "extra context"]

You can also pass --file <path> to read the code sample from disk.`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (!args.length || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  let code = '';
  let guidance = '';

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--file') {
      const filePath = args[i + 1];
      if (!filePath) {
        console.error('Missing path after --file');
        process.exit(1);
      }
      code = readFileSync(filePath, 'utf8');
      i += 1;
    } else if (arg === '--guide') {
      guidance = args[i + 1] ?? '';
      i += 1;
    } else if (!code) {
      code = arg;
    } else {
      code += ` ${arg}`;
    }
  }

  if (!code.trim()) {
    console.error('Provide a code sample via --file or inline argument.');
    process.exit(1);
  }

  return { code, guidance };
}

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing. Set it in your environment.');
    process.exit(1);
  }

  const { code, guidance } = parseArgs(process.argv);
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash' });

  const prompt = `Create a Medium-ready article from this code. Return JSON with title, author, subtitle, excerpt, sections (heading, body), and readingTimeMinutes.\n\nCode:\n${code}\n\nGuidance:${guidance}`;

  const response = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.5,
      responseMimeType: 'application/json',
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  });

  const text = response.response.text();
  console.log(text);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
