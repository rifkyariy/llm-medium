-- Supabase seed data for Medium-style articles
-- Run inside the Supabase SQL editor or via `supabase db remote commit`.

create extension if not exists "pgcrypto";

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  excerpt text not null,
  sections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  reading_time_minutes integer,
  image_url text
);

with seed as (
  select
    (item->>'id')::uuid as id,
    item->>'title' as title,
    item->>'subtitle' as subtitle,
    item->>'excerpt' as excerpt,
    item->'sections' as sections,
    (item->>'readingTimeMinutes')::int as reading_time_minutes,
    item->>'imageUrl' as image_url,
    to_timestamp((item->>'createdAtEpoch')::numeric) at time zone 'utc' as created_at
  from jsonb_array_elements(
    '[
      {
        "id": "9adf5c91-2f4e-4a06-8a13-4b4dffe10ad1",
        "title": "Instrumenting Next.js Apps with Gemini-Assisted Docs",
        "subtitle": "A playbook for turning observability code into developer-focused content.",
        "excerpt": "Use Gemini to transform a monitoring hook into a compelling case study that helps teams ship reliable features faster.",
        "sections": [
          { "heading": "Why observability stories matter", "body": "Engineering leaders invest in instrumentation, yet the lessons rarely reach the broader org. High-signal articles fill that gap by pairing code with narrative context, showcasing the trade-offs, and guiding adoption." },
          { "heading": "Tell the story around the hook", "body": "Open with the problem of shipping experiments without insight. Highlight how the hook collects metrics and the results you surfaced. Gemini can expand raw code into reader-friendly commentary, including before/after snippets and checklist callouts." },
          { "heading": "Close with next actions", "body": "End every article with concrete recommendations: how to roll out the hook, dashboards to build, and what success metrics to monitor in the first week." }
        ],
        "readingTimeMinutes": 6,
        "imageUrl": "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731409500
      },
      {
        "id": "c6b0d923-45c0-4d3f-8d5c-a1c5bcf301aa",
        "title": "From Utility Function to Publishable How-To",
        "subtitle": "Showcase the human context behind a terse helper method.",
        "excerpt": "Turn your reusable utilities into snackable Medium posts that teach, inspire, and invite contribution.",
        "sections": [
          { "heading": "Start with an origin story", "body": "Explain the bug or workflow friction that triggered the helper. Readers connect with motivations first, implementation second." },
          { "heading": "Layer in usage patterns", "body": "Present the canonical usage block, then contrast it with a failure mode. Gemini can narrate the step-by-step reasoning that makes those examples memorable." },
          { "heading": "Invite feedback", "body": "Close by suggesting extensions and linking to your repo. Articles that end with an invitation earn more responses and save you review cycles later." }
        ],
        "readingTimeMinutes": 4,
        "imageUrl": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731406800
      },
      {
        "id": "7e3b4c1f-4c64-42ce-8d08-d13e0a1197af",
        "title": "Refactoring Cron Jobs with Gemini Code Walkthroughs",
        "subtitle": "Turn a monolithic scheduler into a maintainable playbook.",
        "excerpt": "Break down legacy cron scripts, explain the refactor, and give teammates a narrative they can follow without spelunking.",
        "sections": [
          { "heading": "Expose the pain points", "body": "Describe how the original cron job mixed business rules, retries, and logging in a single file. Visualize the chaos so readers feel the urgency for change." },
          { "heading": "Show the modular strategy", "body": "Translate the refactor into small modules, each with a clear contract. Gemini can turn your diff into a walkthrough that highlights the new flow." },
          { "heading": "Highlight the safety net", "body": "Document the monitoring hooks and test coverage that make the new scheduler resilient. End with a checklist others can reuse." }
        ],
        "readingTimeMinutes": 7,
        "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731404100
      },
      {
        "id": "54d90b5e-7ac0-46af-91ad-3c27fded8fb1",
        "title": "Shipping Feature Flags Without Surprises",
        "subtitle": "Document rollout code so product and QA stay aligned.",
        "excerpt": "Capture the strategy behind your flag helpers, default states, and kill switches so launches feel boring in the best way.",
        "sections": [
          { "heading": "Frame the rollout risk", "body": "Explain how fragmented flag usage caused inconsistent experiences. Acknowledge the confusion to hook skeptical readers." },
          { "heading": "Walk through the flag helper", "body": "Detail the TypeScript types, guardrails, and analytics you layered in. Gemini can translate the code into scenarios leadership cares about." },
          { "heading": "Codify the launch plan", "body": "Share the timeline, alerts, and review checklist that accompany every flag. Invite teams to adopt the template for future work." }
        ],
        "readingTimeMinutes": 5,
        "imageUrl": "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731401400
      },
      {
        "id": "f0c6b22c-3ad7-4f86-8c2a-2ac8d122220f",
        "title": "Designing Resilient Webhooks with Async Retries",
        "subtitle": "Teach the strategy behind a durable webhook worker.",
        "excerpt": "Turn your retry queue implementation into a story about reliability, observability, and customer trust.",
        "sections": [
          { "heading": "Start with the incident", "body": "Recount the downtime or missed events that forced you to rethink the webhook architecture. Give concrete stats so the stakes feel real." },
          { "heading": "Explain the resilience pattern", "body": "Introduce the job queue, backoff policy, and idempotency keys. Show snippets that illustrate how each piece defends against data loss." },
          { "heading": "Share the telemetry", "body": "Close with the dashboards and alarms that let you sleep at night. Offer a checklist others can apply to their own integration surfaces." }
        ],
        "readingTimeMinutes": 6,
        "imageUrl": "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731398700
      },
      {
        "id": "1f5a3b87-0e65-4021-8f5c-6e58de349c33",
        "title": "Teaching Domain Events Through Tests",
        "subtitle": "Use your event emitter to coach architecture thinking.",
        "excerpt": "Translate unit tests and fixtures into an approachable primer on event-driven design for your team.",
        "sections": [
          { "heading": "Clarify the problem statement", "body": "Describe the tangled service calls that made feature work slow. Show how events promise a cleaner separation of concerns." },
          { "heading": "Anchor the concept in tests", "body": "Pick two or three tests that demonstrate publishing, subscription, and failure handling. Gemini can narrate the intent behind each assertion." },
          { "heading": "Invite experimentation", "body": "Provide a sandbox branch, data seeding script, or kata exercise so readers can practice turning requirements into events." }
        ],
        "readingTimeMinutes": 5,
        "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731396000
      },
      {
        "id": "b7b6bbd3-4ac6-41cb-875d-74b0689dfcf5",
        "title": "Demystifying Zustand Store Patterns",
        "subtitle": "Show teammates how your state layer actually works.",
        "excerpt": "Break down a complex Zustand store into digestible sections, from slice organization to middleware-driven analytics.",
        "sections": [
          { "heading": "Highlight the motivation", "body": "Explain the pain of prop drilling or Redux boilerplate that led you to Zustand. Describe the code smell everyone recognizes." },
          { "heading": "Tour the store", "body": "Walk through initialization, selectors, and derived state. Gemini can expand inline comments into paragraphs that teach the mental model." },
          { "heading": "Lock in best practices", "body": "Share conventions for naming slices, handling async flows, and testing. Offer a quick checklist developers can pin next to their editor." }
        ],
        "readingTimeMinutes": 4,
        "imageUrl": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731393300
      },
      {
        "id": "d24fae58-6e40-4bb3-9a6e-36d983b8c9ce",
        "title": "Turning Tailwind Utilities into a Style Guide",
        "subtitle": "Narrate the decisions behind your design tokens.",
        "excerpt": "Use Tailwind configuration and component recipes to tell a story about intentional UI systems.",
        "sections": [
          { "heading": "Connect design pain to code", "body": "Describe the inconsistent spacing and color usage that caused UI bugs. Show a before screenshot or code snippet." },
          { "heading": "Explain the token strategy", "body": "Document how you defined spacing scales, typography, and semantic colors. Gemini can turn config files into human-readable rationale." },
          { "heading": "Provide adoption recipes", "body": "Share ready-to-copy component patterns and lint rules. Encourage designers and engineers to co-author future tokens." }
        ],
        "readingTimeMinutes": 5,
        "imageUrl": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731390600
      },
      {
        "id": "06edb6a1-5bd1-4b42-8bb4-3ac76c4f7d10",
        "title": "Scaling Edge Middleware with Observability",
        "subtitle": "Tell the story behind a reliable edge routing layer.",
        "excerpt": "Pair code, logs, and tracing to explain how your middleware defends performance globally.",
        "sections": [
          { "heading": "Reveal the performance cliff", "body": "Share the metrics that exposed latency spikes at the edge. Frame the stakes for both the business and users." },
          { "heading": "Walk through the middleware", "body": "Detail cache keys, rewrites, and guard clauses. Gemini can narrate the key decisions and when to revisit them." },
          { "heading": "Close with dashboards", "body": "Provide the alerts, traces, and synthetic checks that validate the architecture. Offer a template for monitoring new routes." }
        ],
        "readingTimeMinutes": 6,
        "imageUrl": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731387900
      },
      {
        "id": "1c3f2a5d-2754-4a2f-8a94-ff2aab6d9e21",
        "title": "Automating Release Notes from Git History",
        "subtitle": "Turn changelog scripts into a culture of narrative shipping.",
        "excerpt": "Document the pipeline that transforms commits into human-friendly release summaries everyone reads.",
        "sections": [
          { "heading": "Explain the communication gap", "body": "Describe how ad-hoc notes left stakeholders in the dark. Quantify the time saved by automation." },
          { "heading": "Detail the parsing workflow", "body": "Break down the commit message format, grouping logic, and templating. Gemini can elaborate the script so others can adapt it." },
          { "heading": "Promote continuous storytelling", "body": "Outline how the notes feed into demos, sales enablement, and support docs. Encourage contributions via pull request templates." }
        ],
        "readingTimeMinutes": 4,
        "imageUrl": "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731385200
      },
      {
        "id": "3b5f97ea-3e5b-49f0-8f5a-6d7ce1b2179a",
        "title": "Hardening GraphQL Resolvers with Validation",
        "subtitle": "Share defensive coding lessons with the team.",
        "excerpt": "Walk through how schema guards and business rules protect your API from misuse without blocking velocity.",
        "sections": [
          { "heading": "Surface the real-world bug", "body": "Tell the story of the malformed query that slipped into production. Detail the fallout so the fix feels urgent." },
          { "heading": "Show the layered defense", "body": "Explain schema validation, resolver guards, and domain checks. Use code to illustrate how each layer fails safely." },
          { "heading": "Share testing recipes", "body": "Provide contract tests, mocked contexts, and error snapshots. Invite readers to copy the patterns into their services." }
        ],
        "readingTimeMinutes": 6,
        "imageUrl": "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731382500
      },
      {
        "id": "4d265f9b-3e05-4a35-88c9-c22ddb24567f",
        "title": "Optimizing Image Pipelines with Next.js and AI",
        "subtitle": "Teach readers how you balanced quality, speed, and automation.",
        "excerpt": "Lay out the pipeline that compresses, tags, and distributes media using Next.js assets plus Gemini generated captions.",
        "sections": [
          { "heading": "Set the context", "body": "Explain the bandwidth costs and editorial delays that triggered the overhaul. Point to metrics everyone cares about." },
          { "heading": "Describe the new flow", "body": "Walk through upload handlers, optimization settings, and AI captioning. Gemini can expand on the decision tree for each asset type." },
          { "heading": "Share the outcomes", "body": "Give before-and-after load times and engagement stats. Offer a quickstart checklist for teams planning a similar upgrade." }
        ],
        "readingTimeMinutes": 7,
        "imageUrl": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731379800
      },
      {
        "id": "5f0ac1d4-20c9-4ab4-9a37-64dcbfad09e0",
        "title": "Migrating Fetch Calls to React Query",
        "subtitle": "Turn a refactor into a reusable migration guide.",
        "excerpt": "Help teammates understand caching, invalidation, and background refresh without reading every diff.",
        "sections": [
          { "heading": "Capture the legacy pain", "body": "Describe waterfall requests, stale data, and manual loading spinners. Include a snippet that highlights the repetition." },
          { "heading": "Walk through the hook", "body": "Show how you wrapped endpoints in typed hooks, hydration logic, and error boundaries. Gemini can narrate the trade-offs." },
          { "heading": "Provide adoption steps", "body": "Document how you phased the migration, added integration tests, and coached contributors. End with a migration checklist." }
        ],
        "readingTimeMinutes": 5,
        "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731377100
      },
      {
        "id": "6e3b1c59-1f4a-46f0-8c8e-1723940ee12b",
        "title": "Breaking Down Feature-Sliced Architecture",
        "subtitle": "Explain the module boundaries that keep your codebase sane.",
        "excerpt": "Use diagrams and code samples to show how feature slices align with business domains.",
        "sections": [
          { "heading": "State the alignment problem", "body": "Share how horizontal folders caused merge conflicts and unclear ownership. Put the reader inside a recent incident." },
          { "heading": "Illustrate the slice", "body": "Walk through a feature end-to-end, from UI to services. Gemini can translate folder structures into a narrative map." },
          { "heading": "Set success metrics", "body": "List the KPIs you track: deployment frequency, bug rates, onboarding time. Encourage readers to gather baseline data before adopting." }
        ],
        "readingTimeMinutes": 6,
        "imageUrl": "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731374400
      },
      {
        "id": "7cf1bd24-44e5-4e1b-87aa-ae52d601bba7",
        "title": "Coaching Juniors with Pairing Playbooks",
        "subtitle": "Document the rituals that level up newer engineers.",
        "excerpt": "Convert pairing notes and guidance snippets into an article mentors can reuse.",
        "sections": [
          { "heading": "Start with the coaching gap", "body": "Explain how ad-hoc pairing left juniors guessing about expectations. Share a real quote or support ticket to set the scene." },
          { "heading": "Outline the playbook", "body": "Detail the prep checklist, live-coding prompts, and reflection questions. Gemini can weave the bullet points into a friendly narrative." },
          { "heading": "Make it repeatable", "body": "Provide templates, retro cadence, and metrics to review progress. Encourage readers to remix the playbook for their squads." }
        ],
        "readingTimeMinutes": 4,
        "imageUrl": "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731371700
      },
      {
        "id": "8a4d5ef8-095c-452e-828a-b3d4e40f6f55",
        "title": "Documenting Serverless Costs with Data",
        "subtitle": "Tell the story behind your cost dashboards.",
        "excerpt": "Show how tagging, metrics, and automated reports keep cloud bills predictable and transparent.",
        "sections": [
          { "heading": "Call out the surprise bill", "body": "Recount the monthly spike that triggered the initiative. Quantify the risk to budgets and roadmaps." },
          { "heading": "Explain the instrumentation", "body": "Outline the logging hooks, cost allocation tags, and scheduled jobs that surface spend in near real time. Gemini can describe the architecture in plain language." },
          { "heading": "Share the decision loop", "body": "Detail the dashboards, alerts, and recurring reviews that keep costs in check. Offer an agenda teams can adopt." }
        ],
        "readingTimeMinutes": 5,
        "imageUrl": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731369000
      },
      {
        "id": "9bf56312-21d0-4f19-8e4e-26fc93bd3a12",
        "title": "Stabilizing E2E Suites with Better Fixtures",
        "subtitle": "Turn flaky tests into documentation that sticks.",
        "excerpt": "Explain how deterministic fixtures, seeded data, and retry logic made your CI green again.",
        "sections": [
          { "heading": "Expose the flake fatigue", "body": "Describe wasted hours on reruns and false alarms. Use stats to underline the morale hit." },
          { "heading": "Show the fixture pattern", "body": "Highlight helper functions, database seeds, and network shaping. Gemini can expand on how each piece drives determinism." },
          { "heading": "Track the improvements", "body": "Share pass-rate graphs and faster feedback loops. Encourage readers to run the checklist before adding new flows." }
        ],
        "readingTimeMinutes": 6,
        "imageUrl": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731366300
      },
      {
        "id": "aa7c4e1b-476c-4d2a-93c0-51b1bd0e4c8f",
        "title": "Modernizing CLIs with Node Streams",
        "subtitle": "Teach developers how your command-line tool evolved.",
        "excerpt": "Turn a CLI refactor into an article about ergonomics, performance, and maintainability.",
        "sections": [
          { "heading": "Diagnose the old UX", "body": "Explain why the original CLI frustrated users: slow output, blocking prompts, brittle parsing. Bring the reader into a real support thread." },
          { "heading": "Highlight the streaming model", "body": "Show how Node streams improved responsiveness, progress updates, and piping. Gemini can narrate the code paths in simple language." },
          { "heading": "Encourage extension", "body": "Document plug-in points, testing harnesses, and release procedures so others can extend the tool confidently." }
        ],
        "readingTimeMinutes": 5,
        "imageUrl": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731363600
      },
      {
        "id": "bb051d4c-3f24-4e61-8b61-e1c6e7dcb2fe",
        "title": "Storytelling Through Design System Tokens",
        "subtitle": "Share how tokens link code and brand.",
        "excerpt": "Use your design token pipeline to teach engineers why naming, theming, and governance matter.",
        "sections": [
          { "heading": "Reveal the consistency gap", "body": "Describe mismatched colors and spacing between apps. Help readers feel the friction users reported." },
          { "heading": "Explain the token stack", "body": "Map the source of truth, build scripts, and distribution packages. Gemini can turn the repo tree into a guided tour." },
          { "heading": "Invite contribution", "body": "Outline RFC templates, review cadence, and tooling that keeps tokens fresh. Encourage designers to co-author the backlog." }
        ],
        "readingTimeMinutes": 4,
        "imageUrl": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731360900
      },
      {
        "id": "cce6fd1a-54ab-4821-8d70-1f6cebb42a9d",
        "title": "Running Postmortems that Drive Refactors",
        "subtitle": "Document the engineering follow-through after incidents.",
        "excerpt": "Share how you translate action items into prioritized refactors and measurable wins.",
        "sections": [
          { "heading": "Set the emotional context", "body": "Describe the incident timeline and customer impact. Capture the tension that made change unavoidable." },
          { "heading": "Connect notes to code", "body": "Show how you turned postmortem insights into tracked epics, design docs, and pull requests. Gemini can narrate the workflow steps." },
          { "heading": "Close the feedback loop", "body": "Explain the review cadence, metrics, and storytelling you use to prove the refactors worked. Offer prompts for teams starting fresh." }
        ],
        "readingTimeMinutes": 5,
        "imageUrl": "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
        "createdAtEpoch": 1731358200
      }
    ]'::jsonb
  ) as item
)
insert into public.articles (id, title, subtitle, excerpt, sections, created_at, reading_time_minutes, image_url)
select
  seed.id,
  seed.title,
  seed.subtitle,
  seed.excerpt,
  seed.sections,
  seed.created_at,
  seed.reading_time_minutes,
  seed.image_url
from seed
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  excerpt = excluded.excerpt,
  sections = excluded.sections,
  created_at = excluded.created_at,
  reading_time_minutes = excluded.reading_time_minutes,
  image_url = excluded.image_url;
