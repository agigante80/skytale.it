# Changelog: Redesign v5 (project page template + live stats)

The biggest patch since v1. Adds a structured section system to the project detail template and a daily build-time stats sync for npm and Docker numbers. No deps added except `gray-matter` (used only by the sync script).

---

## New files

### `src/content.config.ts` (REPLACED)

Adds six optional fields to the `projects` collection schema. All optional, so every existing MDX file keeps validating without edits.

- `tagline` — one-line "sticker" under the title
- `version` — overridden by live stats sync when present
- `links` — `npm`, `docker`, `dockerHub`, `docs`, `demoVideo` URLs
- `stats` — array of `{ value, unit, label, sub }` cards
- `audience` — array of `{ who, what }` cards
- `quickstart` — `{ primaryLabel, primaryCode, altLabel, altCode, docsHref }`
- `comparison` — `{ snapshotDate, competitors, rows, caption }`

### `src/components/StatStrip.astro` (NEW)

Renders 2 to 5 at-a-glance cards (numbers + labels) in a horizontal strip. Left-bordered accent. Shows "Synced Nh ago" badge when `syncedAt` is passed. Collapses to 2-column grid below 720px.

### `src/components/AudienceCards.astro` (NEW)

Renders the "who this is for" 2-to-4 card grid. Whitespace-aware: returns null when `cards` is empty so the section silently disappears.

### `src/components/QuickStart.astro` (NEW)

Renders one or two tabs of code (e.g. Docker + npx). Inline-script tab switching, no framework. Auto-hides the tab bar when only one variant is provided.

### `src/components/ComparisonTable.astro` (NEW)

Renders the feature-comparison table. First data column is always "this project" and gets accent tinting. Auto-colours cells that start with `✓`, `✗`, `~`, or `N/A`. Supports group separator rows.

### `src/pages/projects/[id].astro` (REPLACED)

The big one. Now renders:

1. Back link
2. Hero with tier / category / status / version eyebrow + tagline + description + CTAs (source, live, docs, npm, docker)
3. `<StatStrip>` (merged live + frontmatter, max 4 cards)
4. Hero image (if any)
5. `<AudienceCards>` (if frontmatter has them)
6. MDX prose body (problem, key moves, architecture, decisions)
7. `<QuickStart>` (if frontmatter has it)
8. `<ComparisonTable>` (if frontmatter has it)
9. Related articles
10. Sidebar: tech stack, metadata (version, status, license, last release, last edit), share buttons

Reads `src/data/stats.json` at build time and merges live numbers (npm downloads, Docker pulls, GitHub stars) on top of frontmatter `stats`. Live cards lead; frontmatter fills the remaining slots up to 4.

### `scripts/sync-stats.mjs` (NEW)

Reads every MDX, looks at `links.npm`, `links.dockerHub`, and `githubUrl`, fetches public APIs, writes `src/data/stats.json`. Designed to never break a build: a failed fetch keeps the previous value and exits 0.

Endpoints used:
- `https://api.npmjs.org/downloads/point/last-month/{pkg}`
- `https://registry.npmjs.org/{pkg}/latest`
- `https://hub.docker.com/v2/repositories/{user}/{repo}/`
- `https://api.github.com/repos/{owner}/{repo}` (with optional bearer token)
- `https://api.github.com/repos/{owner}/{repo}/releases/latest`

GHCR pull counts are not publicly accessible; the sync deliberately uses the Docker Hub mirror when both are configured.

### `.github/workflows/sync-stats.yml` (NEW)

Daily cron at 06:00 UTC + `workflow_dispatch`. Installs deps, runs `sync-stats.mjs`, commits `src/data/stats.json` with `[skip ci]` if changed. Daily commit creates a tiny stream of "chore(stats): refresh" entries in git history; that is intentional and traceable.

### `src/data/stats.json` (NEW)

Initial empty object `{}`. The first GitHub Action run populates it.

### `src/content/projects/actual-mcp-server.mdx` (REPLACED)

The worked T1 example. Pulls every credibility asset from the README into the new frontmatter shape:

- **Fixed**: 62 -> 63 tools (the README and v0.6.14 both say 63)
- **Added**: tagline ("Talk to your budget. Run it anywhere. Trust it in production.")
- **Added**: `version: "0.6.14"` (live sync overrides on first cron run)
- **Added**: `links` (npm, Docker Hub, docs)
- **Added**: `stats[]` (4 manual cards; live npm + Docker + GitHub will join automatically once the cron runs)
- **Added**: `audience[]` (4 personas)
- **Added**: `quickstart` (Docker primary + npx-stdio alt)
- **Added**: `comparison` (13 rows across 4 columns)
- **Rewrote MDX body**: problem, 5 key moves, architecture with ASCII diagram, 3 decisions

Sections like Problem and Decisions stay in MDX because that is where the narrative voice belongs. Stats, audience, quickstart, and comparison move to frontmatter because they are structured data that the template can render consistently.

---

## Dependency change

The sync script needs `gray-matter` to parse MDX frontmatter:

```sh
npm install --save-dev gray-matter
```

If you'd rather not add the dep, swap the import for a hand-rolled YAML parser; the script only reads top-level scalars and one level of nesting.

---

## What about the other 13 projects?

Their existing MDX files still validate against the new schema and still render. They just do not light up the new sections until you fill the new frontmatter fields. Filling order suggestion: **vpnsentinel and agentgate next** (the other two T1s), then the four T2s, then the T3s. Estimated effort per tier is in the original proposal (`Project Page Template.html`).
