# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing Rules

**NEVER use em dashes (--) or en dashes (-) in any content, copy, descriptions, titles, TL;DRs, commit messages, or code comments.** This is a hard rule with no exceptions.
- Use a hyphen (-) to connect compound words or modifiers (e.g. "AI-assisted", "well-known").
- Rewrite sentences to avoid constructions that would normally call for an em or en dash. Use a period, a comma, parentheses, a colon, or restructure the sentence instead.

## Project Overview

Andrea Gigante's personal portfolio and articles website. Astro static site deployed on Cloudflare Workers.

### Brand: "Skytale.it"
The scytale (σκυτάλη) is an ancient Greek transposition cipher. Combined with .it (Italy + IT). Strong brand differentiator; keep it prominent in all designs.

## Tech Stack

- **Astro 6.x**: static site generation with content collections
- **Tailwind CSS 4.x**: utility-first styling via `@tailwindcss/vite` (v4 uses CSS-first config, not `tailwind.config.js`)
- **MDX**: rich content for projects via `@astrojs/mdx`
- **TypeScript** (strict mode, extends `astro/tsconfigs/strict`)
- **Node.js >=22.12.0** required

No linter, formatter, or test runner is configured.

## Commands

```bash
npm run dev        # Start dev server (localhost:4321)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

## Deployment

GitHub Actions (`.github/workflows/build.yml`) runs `npm run build` on all PRs and pushes to `main` as a build validation check. Actual deployment is handled separately by Cloudflare Workers Builds (not GitHub Actions). Config:

- **Build:** `npm run build` → **Deploy:** `npx wrangler deploy`
- **Wrangler config:** `wrangler.jsonc` (name: `skytale-it`, static assets from `dist/`)
- **Env variable:** `NODE_VERSION=22` (set in Cloudflare dashboard)
- **Production URL:** `https://www.skytale.it`
- **Workers URL:** `skytale-it.a-gigante.workers.dev`
- **Preview URLs:** `*-skytale-it.a-gigante.workers.dev` (auto-generated for non-production branches)
- **Custom headers:** `public/_headers` (CSP, HSTS, security headers, applied by Cloudflare)

## Architecture

### Content: Two Different Systems

**Projects** use Astro content collections (`src/content/projects/*.mdx`). Schema defined in `src/content.config.ts` with Zod validation. Each project has: title, description, category (enum: AI/MCP, Security, Finance, Utilities, Content), tier (1-3), techStack, optional githubUrl/liveUrl, featured flag, metrics, sortOrder. Tier 1 projects get full case-study pages at `/projects/[id]` via `src/pages/projects/[id].astro`.

**Articles** do NOT use content collections. They're managed in `src/lib/articles.ts` as a hybrid system:
- LinkedIn articles are hardcoded in a `linkedinArticles` array (LinkedIn has no public API)
- Medium articles are fetched at build time via RSS (`rss-parser`)
- `getAllArticles()` merges both sources, sorted by date descending
- To add a LinkedIn article, add an entry to the array in `src/lib/articles.ts`. Required fields: `title`, `description`, `date`, `tags`, `url`, `platform: 'linkedin'`, `slug`, `image` (path under `/public/images/articles/`). Optional: `tldr` (one-paragraph summary shown on detail page).
- Article `slug` is the last path segment of the LinkedIn URL (e.g. `some-title-andrea-gigante-xxxxx`). Image should be placed at `public/images/articles/<slug>.jpg`.
- Medium articles are fetched at build time from `https://medium.com/feed/@andrea.gigante` via RSS.
- Use the `add-article` skill (`/add-article`) to automate fetching metadata and adding the entry.

### Layout & Theming

`src/layouts/Base.astro` is the single layout that handles SEO meta, OG tags, nav, footer, cookie consent, JSON-LD schema injection, and view transitions (`ClientRouter`). Props: `title` (required), `description`, `ogImage`, `ogType` (defaults to `"website"`), `schema` (pass structured data objects to inject `<script type="application/ld+json">`).

**Dark mode is default.** Light mode activates by adding `html.light` class. Theme toggle persists to `localStorage`. An inline `<script>` in `<head>` prevents FOUC by reading the preference before paint. A second `data-astro-rerun` script handles toggle button behavior and survives Astro view transitions.

### Styling

`src/styles/global.css` defines design tokens via Tailwind v4's `@theme` directive and CSS custom properties on `:root` / `html.light`. Components use `var(--color-*)` references directly in Tailwind classes (e.g., `text-[var(--color-accent)]`).

- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (code/tech labels), loaded via `@fontsource-variable`
- **Colors:** Teal accent `#82bfce`, dark slate backgrounds `#0f172a`/`#1e293b`, amber CTA `#f59e0b`

### Integrations

- `@astrojs/sitemap`: auto-generates sitemap (canonical site URL: `https://www.skytale.it`, uses `www`); filter in `astro.config.mjs` excludes `/404` routes
- `@astrojs/mdx`: MDX support for project content

### Key Components

- `ShareButtons.astro`: LinkedIn + Twitter share links rendered as plain `<a target="_blank">` anchors (no external JS library)
- `FilterTabs.astro`: client-side project filtering by category on `/projects`
- `CookieConsent.astro`: cookie banner included in `Base.astro` on every page

### Routes

`/` (home), `/about`, `/projects`, `/projects/[id]` (Tier 1 case studies), `/articles`, `/articles/[slug]` (article detail with schema + breadcrumbs), `/privacy`, `/404`

### Static Files of Note

- `public/llms.txt`: AI discoverability file
- `public/_headers`: Cloudflare custom headers (CSP, HSTS, security). **When adding external scripts or fonts, update the CSP here too.** Missing entries silently block resources (e.g. `cdn.jsdelivr.net` had to be added after it was blocked). Current CSP allows `unsafe-inline` for scripts/styles, whitelists Google Tag Manager and `cdn.jsdelivr.net` in `script-src`, and allows `google-analytics.com` / `analytics.google.com` in `connect-src`.
- `public/robots.txt`: crawl directives
- `public/og-default.png`: fallback OG image

## Design System

- Projects use a 3-tier system: Tier 1 = full case study (MDX body rendered at `/projects/[id]`), Tier 2 = detailed card, Tier 3 = grid card
- Home page shows `featured: true` projects sorted by `sortOrder`, plus the 3 most recent articles

## About Andrea

- **Role:** Principal Product Manager at Oracle NetSuite
- **Location:** Málaga, Spain (Italian origin)
- **Education:** The Open University
- **Background:** 13+ years experience. Scrum & Kanban expert, roadmap redesign, waterfall-to-agile transitions. Industries: sports betting, insurance, automotive, finance.
- **Self-description:** A "bridge" connecting business acumen and technical knowledge
- **Languages:** English, Italian, Spanish
- **Interests:** Security enthusiast, coffee addict, sci-fi fan, chess, Shorinji Kempo, Linux user
- **GitHub:** github.com/agigante80
- **LinkedIn:** linkedin.com/in/agigante/

## Site Purpose

Showcase practical skills and knowledge to potential future employers. The site should demonstrate that Andrea is more than a PM title. He builds real tools, understands infrastructure, and ships code.

## GitHub Projects (for portfolio section)

### Public (can link directly)
- **actual-mcp-server**: MCP server for Actual Budget, 62 tools, TypeScript, Docker
- **AgentGate**: Remote AI CLI control via Telegram/Slack, multi-agent orchestration, Python
- **Actual-sync**: Automated bank sync for Actual Budget, Node.js, Docker, 309 tests
- **VPNSentinel**: Distributed VPN monitoring, DNS leak detection, Python, Flask
- **SafeHarbor-Media-Stack**: Self-hosted media stack on Synology NAS, Docker Compose
- **vibe-coding-prompts**: Curated AI meta-prompts for dev workflows
- **ContentGen-AI**: AI blog content pipeline, OpenAI API, Python
- **galena_es**: AI-generated minerals blog (galena.es), Jekyll + ContentGen-AI
- **OndaHertz_es**: AI-generated ham radio blog (ondahertz.es), Jekyll + ContentGen-AI
- **pic2vid**: Image-to-video converter, Bash/FFmpeg
- **qr-with-icon**: QR code generator with custom icons, Python
- **backup_skytale_it**: Backup of current site
- **agigante-creative-theme-jekyll**: Current site's Jekyll theme


## Tools Available

- **Figma MCP**: Not yet configured. To install:
  ```bash
  claude mcp add figma -- npx -y figma-developer-mcp --figma-api-key=<FIGMA_API_KEY>
  ```
- **SEO Inspector MCP**: Configured in `.mcp.json`. Page-level SEO analysis.
- **claude-seo skill**: Installed globally. Run `/seo audit https://skytale.it` for full audits.
- **Lovart AI** (lovart.ai): External branding tool. Andrea generates images externally; provide prompts when needed.
- **add-article skill**: `/add-article` fetches LinkedIn article metadata, downloads cover image, and adds entry to `articles.ts`.

## Content Guardrails

- **LinkedIn only**: all new articles target LinkedIn, not Medium
- **Delete old files, never archive**: keep the repo clean
- **Practical over theoretical**: show real projects, not abstract claims

## Reference Material

- `reference/current-site.md`: Content/design inventory from the existing site, needed images list
- `assets/reference/`: Original profile photos, brand logo, portfolio thumbnails, banner images
- `scripts/capture_task.py`: Playwright screenshot utility (captures specific pages: `/privacy`, footer area, cookie banner)
- `scripts/capture_localhost.py`: Captures desktop + mobile screenshots of homepage, including theme toggle before/after; saves to `screenshots/`
