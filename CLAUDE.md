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

### Visual verification

For UI changes, take screenshots before reporting work as done:

```bash
python scripts/capture_localhost.py   # Desktop + mobile homepage, theme toggle before/after
python scripts/capture_task.py        # Specific pages (/privacy, footer, cookie banner)
```

Both write to `screenshots/`. Use them rather than asserting "looks good" without proof.

## Workflow

- **Direct commits to `main` are normal.** This is a personal site; no feature branches or PRs are required. Push directly when a change is complete and the build passes.
- **Always run `npm run build` before pushing.** Cloudflare Workers Builds will rebuild on push, but a local build catches schema, MDX, and type errors first.
- **No tests, no linter.** The build is the gate. If you touch TypeScript, rely on `tsc`-via-Astro to catch issues at build time.

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

**Projects** use Astro content collections (`src/content/projects/*.mdx`). Schema defined in `src/content.config.ts` with Zod validation. Each project has: title, description, category (enum: AI/MCP, Security, Finance, Utilities, Content), tier (1-3), techStack, optional githubUrl/liveUrl, featured flag, metrics. Every project gets a `/projects/[id]` page via `src/pages/projects/[id].astro`; the MDX body (if present) renders as the case-study content.

**Articles** do NOT use content collections. They're managed in `src/lib/articles.ts` as a hybrid system:
- LinkedIn articles are hardcoded in a `linkedinArticles` array (LinkedIn has no public API)
- Medium articles are fetched at build time via RSS (`rss-parser`)
- `getAllArticles()` merges both sources, sorted by date descending
- Article `slug` is the last path segment of the LinkedIn URL (e.g. `some-title-andrea-gigante-xxxxx`).
- **Preferred path:** run `/add-article <linkedin-url>`. The skill fetches metadata, downloads the cover image to `public/images/articles/<slug>.jpg`, writes the TL;DR, and appends the entry to `linkedinArticles`. Manual placement is not needed.
- **Manual path** (when the skill fails or for non-LinkedIn one-offs): add an entry to the `linkedinArticles` array in `src/lib/articles.ts`. Required fields: `title`, `description`, `date`, `tags`, `url`, `platform: 'linkedin'`, `slug`, `image` (path under `/public/images/articles/`). Optional: `tldr`. You must also save the cover image yourself.
- Medium articles are fetched at build time from `https://medium.com/feed/@andrea.gigante` via RSS. Nothing to do in the repo.

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

`/` (home), `/about`, `/projects`, `/projects/[id]` (one page per project; MDX body, if present, renders as the case study), `/articles`, `/articles/[slug]` (article detail with schema + breadcrumbs), `/privacy`, `/404`

### Static Files of Note

- `public/llms.txt`: AI discoverability file
- `public/_headers`: Cloudflare custom headers (CSP, HSTS, security). Current CSP allows `unsafe-inline` for scripts/styles, whitelists Google Tag Manager and `cdn.jsdelivr.net` in `script-src`, and allows `google-analytics.com` / `analytics.google.com` in `connect-src`. See Gotchas below.
- `public/robots.txt`: crawl directives
- `public/og-default.png`: fallback OG image

## Gotchas

- **CSP silently blocks new external resources.** Adding a `<script src="cdn.example.com/...">` or a new font host without updating `public/_headers` will fail in production with no obvious error in the build. This has bitten the project before (`cdn.jsdelivr.net` had to be retroactively allowed in commit `e49df2a`). Always update `_headers` in the same change that introduces a new external origin.
- **Dark mode is default; theme is toggled via `html.light`.** Two scripts in `Base.astro` cooperate: an inline `<head>` script sets the class before paint to prevent FOUC, and a `data-astro-rerun` script re-binds the toggle after view transitions. If you change theming, both must keep working.
- **View transitions are on (`ClientRouter`).** Any script that binds to DOM elements at page load needs `data-astro-rerun` or it will only work on first load and silently break on in-app navigation.

## Design System

- Three orthogonal signals on a project, each doing one job:
  - **`tier` (1-3)**: ordering only. Lower comes first on the projects index. Visual layout is identical across tiers. Within a tier, projects sort alphabetically by title.
  - **`featured: true`**: included on the home page; card also spans two columns on the projects index (md+ screens).
  - **MDX body present**: turns the `/projects/[id]` page into a real case study. Absent body means the detail page shows only the frontmatter (intentional for smaller projects).
- Home page shows `featured: true` projects ordered by `tier`, plus the 3 most recent articles.

## Author Context

Biographical info, the site's marketing purpose, and the source-of-truth list of Andrea's external GitHub projects live in `reference/about-andrea.md`. Read it before writing portfolio copy, an "about" section, or any content that speaks in Andrea's voice. For code work, the authoritative project list is `src/content/projects/*.mdx`.

## Tools Available

- **SEO Inspector MCP**: Configured in `.mcp.json`. Page-level SEO analysis.
- **claude-seo skill**: Installed globally. Run `/seo audit https://skytale.it` for full audits.
- **add-article skill**: `/add-article <linkedin-url>` fetches metadata, downloads the cover image, and appends to `src/lib/articles.ts`.
- **Lovart AI** (lovart.ai): External branding tool. Andrea generates images externally; provide prompts when needed.

## Content Guardrails

- **LinkedIn only**: all new articles target LinkedIn, not Medium
- **Delete old files, never archive**: keep the repo clean
- **Practical over theoretical**: show real projects, not abstract claims

## Reference Material

- `reference/about-andrea.md`: Biographical context, site purpose, external GitHub project list (for content writing, not code)
- `reference/current-site.md`: Content/design inventory from the existing site, needed images list
- `assets/reference/`: Original profile photos, brand logo, portfolio thumbnails, banner images
