## Gemini-Powered Medium UI

A Next.js + Tailwind experience that mirrors Medium’s reading flow, drives article generation through the Gemini API, and persists every story in Supabase.

### Prerequisites

- Node.js 18 or newer
- Supabase project (URL + anon key; service role key recommended for inserts)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env` to `.env.local` (or export the variables in your hosting provider) and populate:

```properties
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-pro            # optional override
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role # optional, required if RLS blocks anon inserts
RUNNING_PORT=3099
```

### 3. Prepare Supabase data

Run the SQL script at `supabase/seed-articles.sql` inside the Supabase SQL editor (or via the Supabase CLI). This script:

- Creates `public.articles` (uuid primary key, text metadata, JSONB sections, timestamps)
- Seeds 20 Medium-style drafts identical to the local `seed-articles` fallback

Re-running the script is safe thanks to `ON CONFLICT` upserts.

### 4. Start the app

```bash
npm run dev
```

Open `http://localhost:3099` and explore:

- Search box triggers “quick generate” on Enter or suggestion click—no modal required
- Gemini requests persist straight into Supabase and appear immediately in the feed
- Queue widget (bottom-right) shows pending, generating, posted, and error states

### 5. Production & diagnostics

```bash
npm run lint   # ESLint
npm run build  # Production build
npm run start  # Serve the built app (uses port 3099 by default)
```

The CLI shortcut remains available when you prefer the terminal:

```bash
npm run gemini:article -- --file ./path/to/snippet.ts --guide "focus on testing strategy"
```

It prints the Gemini JSON payload; you can manually insert it via Supabase or pipe it somewhere else.

### Supabase schema reference

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | `uuid` | Primary key, defaults to `gen_random_uuid()` |
| `title`, `subtitle`, `excerpt` | `text` | Core article metadata |
| `sections` | `jsonb` | Array of `{ heading, body }` blocks |
| `reading_time_minutes` | `integer` | Optional runtime estimate |
| `image_url` | `text` | Hero image per story |
| `created_at` | `timestamptz` | Defaults to `now()`; used for pagination |

If you rely on anon keys exclusively, ensure your RLS policies allow `insert` and `select` on `public.articles`.

### How the flow works

- `src/lib/articles-repository.ts` creates a Supabase client with the provided keys; the UI falls back to static seeds only when env vars are missing
- `/api/generate` calls Gemini, then persists the normalized article via Supabase before responding
- Search suggestions call the generator directly, enqueueing progress into the queue widget while the card is posting

That combination keeps the Medium-style feed, the Gemini generator, and Supabase in sync without extra clicks.
