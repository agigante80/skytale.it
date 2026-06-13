# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing Rules

**NEVER use em dashes (--) or en dashes (-) in any content, copy, descriptions, titles, TL;DRs, commit messages, or code comments.** This is a hard rule with no exceptions.
- Use a hyphen (-) to connect compound words or modifiers (e.g. "AI-assisted", "well-known").
- Rewrite sentences to avoid constructions that would normally call for an em or en dash. Use a period, a comma, parentheses, a colon, or restructure the sentence instead.
- Enforced by a `PreToolUse` hook (`.claude/hooks/block-dashes.py`, run via `python3`, wired in `.claude/settings.json`): any Write, Edit, MultiEdit, NotebookEdit, or Bash whose content contains an em or en dash is blocked. This is the canonical forge-kit `block-dashes` hook (version 1); it fails open on unparseable input. Incoming patch files are not scrubbed by the hook; the `/review-patch` skill scans those.

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

**Projects** use Astro content collections (`src/content/projects/*.mdx`). Schema defined in `src/content.config.ts` with Zod validation. Each project has:

- **Required:** `title`, `description`, `category` (enum), `tier` (1-3), `status` (enum: `active`, `maintained`, `archived`, `experimental`), `techStack`
- **Optional:** `githubUrl`, `liveUrl`, `featured` (bool), `metrics`, `heroImage` (an optimized image via the content-collection `image()` helper; value is a path **relative to the MDX file**, e.g. `../../assets/images/projects/<slug>/hero.png`, not a `/public` URL), `relatedArticles` (array of article slugs from `src/lib/articles.ts`), `lastSyncedFrom` (ISO 8601 timestamp; written by `/sync-projects`, never edited by hand; absent means "never synced"), `builtWith` (array of other project slugs in this collection that this project depends on or extends; resolved to titles and rendered as a "Built with" cross-link card in the sidebar), plus the enrichment fields `tagline`, `version`, `links`, `stats`, `audience`, `quickstart`, `comparison` (see `src/content.config.ts` for the exact, current shapes)

Every project gets a `/projects/[id]` page via `src/pages/projects/[id].astro`. The page is two-column on `lg:` (main + sticky sidebar with status/tech/actions/share) and stacks on mobile. The MDX body, when present, renders as the case-study content. Hero image renders above the body and is automatically used as `og:image` for social shares; without one, the default OG image is used. A "Wrote about this" section at the bottom auto-resolves `relatedArticles` slugs against `getAllArticles()` and links back to the article detail pages. The `SoftwareSourceCode` schema is auto-enriched with `dateModified` (from the MDX file's git mtime) and `keywords` (from `techStack`); skills do not need to write these.

To add or enrich a project, run `/manage-project <github-url-or-slug>`. Given a GitHub URL for a project that does not exist yet, it scaffolds a new MDX (frontmatter plus an optional case-study body). Given an existing slug, it enriches that project with the template fields (tagline, links, stats, audience, quickstart, comparison). For a batch reconcile across every repo, use `/sync-projects`.

**Articles** do NOT use content collections. They're managed in `src/lib/articles.ts` as a hybrid system:
- LinkedIn articles are hardcoded in a `linkedinArticles` array (LinkedIn has no public API)
- Medium articles are fetched at build time via RSS (`rss-parser`)
- `getAllArticles()` merges both sources, sorted by date descending
- Article `slug` is the last path segment of the LinkedIn URL (e.g. `some-title-andrea-gigante-xxxxx`).
- **Preferred path:** run `/add-article <linkedin-url>`. The skill fetches metadata, downloads the cover image to `src/assets/images/articles/<slug>.jpg`, writes the TL;DR, and appends the entry to `linkedinArticles`. Manual placement is not needed.
- **Manual path** (when the skill fails or for non-LinkedIn one-offs): add an entry to the `linkedinArticles` array in `src/lib/articles.ts`. Required fields: `title`, `description`, `date`, `tags`, `url`, `platform: 'linkedin'`, `slug`, `image`, Optional: `tldr`. Save the cover file under `src/assets/images/articles/<slug>.jpg` (so Astro optimizes it), but keep the `image` field as the legacy-style string `/images/articles/<slug>.jpg`: `resolveArticleCover()` (`src/lib/covers.ts`) matches the asset by filename stem, and the project/article pages render it through Astro's `<Image>`.
- Medium articles are fetched at build time from `https://medium.com/feed/@andrea.gigante` via RSS. Their covers are self-hosted by `scripts/fetch-medium-covers.mjs`, which downloads each post's cover to `src/assets/images/articles/medium/<slug>.<ext>` (matched by slug). Run it after new Medium posts appear; it is idempotent and never blocks a build. Hot-linking Medium's CDN is avoided because it sets a third-party cookie that tanks the Lighthouse Best Practices score.

### Layout & Theming

`src/layouts/Base.astro` is the single layout that handles SEO meta, OG tags, nav, footer, cookie consent, JSON-LD schema injection, and view transitions (`ClientRouter`). Props: `title` (required), `description`, `ogImage`, `ogType` (defaults to `"website"`), `schema` (pass structured data objects to inject `<script type="application/ld+json">`).

**Single dark theme.** The site has one theme: warm ink background, parchment text, teal accent. Tokens are defined once on `:root` in `global.css`. There is no light mode, no theme toggle, no `html.light` class. (A light/dark toggle existed through redesign v4 and was removed in v5 for simplicity.)

### Styling

`src/styles/global.css` defines design tokens via Tailwind v4's `@theme` directive and CSS custom properties on `:root`. There is one theme (dark), so there is no `html.light` block. Components use `var(--color-*)` references directly in Tailwind classes (e.g., `text-[var(--color-accent)]`).

- **Fonts:** two-font system loaded via `@fontsource-variable` - JetBrains Mono (display/headings, exposed as `--font-display`; the legacy `--font-heading` alias still resolves to it) and Inter (body, `--font-body`). There is no Space Grotesk. Only `inter` and `jetbrains-mono` fontsource packages are installed; do not reference fonts that are not imported in `global.css`.
- **Colors:** teal accent `--color-accent: #7ec6d6` (hover `#a3d5e0`), near-black background `--color-bg: #0a0c11`. Read the live `:root` tokens in `global.css` rather than hardcoding hex values in components.

### Integrations

- `@astrojs/sitemap`: auto-generates sitemap (canonical site URL: `https://www.skytale.it`, uses `www`); filter in `astro.config.mjs` excludes `/404` routes
- `@astrojs/mdx`: MDX support for project content

### Live Project Stats

A daily pipeline fetches public engagement numbers (npm downloads, Docker Hub pulls, GitHub stars/forks) for each project and bakes them into the site:

- **`scripts/sync-stats.mjs`** reads every `src/content/projects/*.mdx` (parsing frontmatter with `gray-matter`), resolves each project's `githubUrl`/links, fetches stats, and writes one merged `src/data/stats.json`. It is idempotent and never fails a build: a failed fetch keeps the previous value and exits 0.
- **`.github/workflows/sync-stats.yml`** runs it on a `0 6 * * *` cron (needs `GITHUB_TOKEN`) and commits the refreshed JSON - this is the source of the recurring `chore(stats): refresh` commits.
- **`src/pages/projects/[id].astro`** imports `stats.json` at build time and renders the numbers via `StatStrip.astro` (with a `syncedAt` timestamp). `stats.json` is a generated artifact - never hand-edit it; run the script instead.

### Images

All rendered raster images go through Astro's built-in image pipeline (Sharp, bundled) for mobile-first responsive output. The rule that makes this work: **optimizable images live under `src/assets/`, never `public/`** (Astro only transforms images under `src/`; anything in `public/` is served byte-for-byte). `astro.config.mjs` sets `image.layout: 'constrained'`, so every `<Image>` auto-generates a WebP `srcset` + `sizes` scaled down to the source width, plus intrinsic `width`/`height` (which prevents CLS).

- **Article covers:** stored under `src/assets/images/articles/`. `src/lib/covers.ts` (`resolveArticleCover(image, slug)`) maps an article's stored `image` string (LinkedIn) or `slug` (Medium) to the imported asset by filename stem; `ArticleCard.astro` and `articles/[slug].astro` render it via `<Image>`. The article-detail cover is the page LCP, so it is `loading="eager"` + `fetchpriority="high"`.
- **Project hero:** the `heroImage` field uses the content-collection `image()` helper (relative path in frontmatter), rendered via `<Image>` in `projects/[id].astro`.
- **og:image:** social scrapers need a stable JPEG, but `<Image>` emits WebP. So the article and project pages call `getImage({ src, width: 1200, height: 630, format: 'jpeg' })` and pass that `.src` (made absolute) as the OG image, separate from the on-page responsive output.
- **Exceptions kept in `public/`:** `profile.png` (referenced as a stable absolute URL in the Person JSON-LD schema in `Base.astro`), `logo.png`, and `og-default.png`. Do not move these into `src/` without also fixing their string references.

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
- **No theme toggle exists anymore.** The site is single dark theme (removed in v5). `Base.astro` has no theme script and there is no `html.light` class. If older copy, a screenshot script, or a Gotcha references a light mode or toggle, it is stale - do not reintroduce one without an explicit request.
- **View transitions are on (`ClientRouter`).** Any script that binds to DOM elements at page load needs `data-astro-rerun` or it will only work on first load and silently break on in-app navigation.
- **Images in `public/` are never optimized.** A cover or hero dropped into `public/images/` ships at full weight (this is exactly what regressed Lighthouse Performance to the 70s before the `src/assets` migration). Put any rendered raster image under `src/assets/` and use `<Image>`. See the Images section above. Also: never hot-link a remote cover (e.g. Medium's CDN) into an `<img>` - the third-party cookie alone drops Best Practices to 77. Self-host it.

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
- **manage-project skill**: `/manage-project <github-url-or-slug>` creates a new project MDX (from a GitHub URL) or enriches an existing one (by slug) with the template fields. One commit per project. Scaffolded bodies carry a soft-regen marker (`{/* auto-generated body, edit to take ownership */}`); remove it once you edit the body to claim ownership. To backfill the whole portfolio to the current template, run it once per project in tier order.
- **sync-projects skill**: `/sync-projects` reconciles the portfolio against `github.com/agigante80`. Auto-adds new public repos at Tier 3, refreshes existing projects whose GH `pushed_at` is newer than the MDX `lastSyncedFrom`, marks newly-archived projects, surfaces tier-vs-popularity mismatches. One commit per sync; revert with `git revert HEAD` if undesired. Hand-edited bodies (no marker) are never touched. Projects without `lastSyncedFrom` are treated as never-synced and get refreshed on next run.
- **review-patch skill**: `/review-patch [zip]` reviews an incoming patch zip (defaults to the newest in `temp/`) before it is applied. Extracts it, audits every file for compatibility, scans for forbidden dashes, reports findings and an apply recommendation. Does not apply or commit anything.
- **Lovart AI** (lovart.ai): External branding tool. Andrea generates images externally; provide prompts when needed.

## Content Guardrails

- **LinkedIn only**: all new articles target LinkedIn, not Medium
- **Delete old files, never archive**: keep the repo clean
- **Practical over theoretical**: show real projects, not abstract claims

## Reference Material

- `reference/about-andrea.md`: Biographical context, site purpose, external GitHub project list (for content writing, not code)
- `reference/current-site.md`: Content/design inventory from the existing site, needed images list
- `assets/reference/`: Original profile photos, brand logo, portfolio thumbnails, banner images
