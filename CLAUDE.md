# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev               # Start dev server
bun run dev:webhook       # Start dev server + smee webhook proxy
bun run build             # Production build
bun run preview           # Preview production build

# Code quality
bun run lint              # ESLint with auto-fix
bun run format            # Prettier format
bun run lint:check        # ESLint check only
bun run format:check      # Prettier check only

# Database (Drizzle Kit)
bunx drizzle-kit generate   # Generate migrations from schema changes
bunx drizzle-kit migrate    # Apply migrations
bunx drizzle-kit studio     # Open Drizzle Studio
```

## Architecture Overview

This is a **Nuxt 4 SSR portfolio** for samuhlo.dev. The core feature is an automated project ingestion pipeline: GitHub pushes trigger a webhook that uses AI (DeepSeek) to extract project metadata from READMEs and stores it in a Neon PostgreSQL database.

### Key architectural patterns

**Nuxt 4 directory structure** — `srcDir` is set to `app/`, so all frontend code lives under `app/`. The server (`server/`) stays at the project root. Shared types live in `shared/`.

**Data flow for projects:**
1. GitHub push webhook → `server/api/webhooks/github.post.ts`
2. README fetched via Octokit → `server/utils/ingest.ts`
3. DeepSeek AI extracts structured data → `server/utils/ai.ts`
4. Validated against Zod schema → `shared/types.ts` (`ProjectSchema`)
5. Upserted into Neon DB via Drizzle → `server/db/`
6. Cached with Nitro SWR cache (5 min TTL) → `server/utils/cache.ts`
7. Frontend fetches via Pinia store → `app/stores/projects.ts`

**README metadata conventions** — project READMEs can embed HTML comments for extra metadata parsed by the ingest pipeline:
- `<!-- portfolio:hidden -->` — excludes the project entirely
- `<!-- accent_color: #hex -->` — project card accent color
- `<!-- hover_text_card: text -->` — hover text on project card
- `<!-- post_url: url -->`, `<!-- blog_url: url -->`, `<!-- images_url: ... -->` — extra metadata

**Strict mode** (`NUXT_STRICT_MODE`, defaults `true`) — projects missing `mainImgUrl`, `imagesUrl`, or `liveUrl` are deleted from the DB.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEON_DATABASE_URL` / `DATABASE_URL` | Neon PostgreSQL connection string |
| `NUXT_DEEPSEEK_API_KEY` / `DEEPSEEK_API_KEY` | DeepSeek AI API key |
| `GITHUB_SEED_TOKEN` / `GITHUB_TOKEN` | GitHub token for Octokit |
| `NUXT_STRICT_MODE` | Set to `false` to skip strict field validation on ingest |

### Frontend structure

- `app/pages/index.vue` — single-page portfolio with sections
- `app/components/sections/` — HeroSection, BioSection, PlaygroundSection, ContactSection
- `app/components/playground/` — project cards and modal system
- `app/composables/` — GSAP animations (`useGSAP`), Lenis smooth scroll (`useLenis`), physics (`usePhysicsLetters`, `useErrorPhysics`), parallax, magnetic hover, drag scroll
- `app/plugins/lenis.client.ts` — Lenis smooth scroll initialized globally
- `app/config/site.ts` — global site constants (URL, email, social links, colors, breakpoints)

### Tech stack summary

- **Runtime**: Nuxt 4 + Vue 3, SSR enabled
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`), Space Mono font
- **Animations**: GSAP + Lenis + Matter.js (physics)
- **DB**: Drizzle ORM + Neon serverless PostgreSQL (neon-http driver)
- **State**: Pinia
- **Validation**: Zod (shared between server and AI extraction)
- **Webhook proxy (dev)**: smee-client via `dev:webhook` script
