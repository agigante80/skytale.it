# skytale.it Redesign Patch v5: project page template + live stats

Apply after v1, v2, v3, v4 (all merged on `main`).

This patch defines the project detail template (hero with tagline + tier eyebrow, stats strip, audience cards, quick start, comparison table) and wires it up to a daily stats sync that pulls real npm / Docker / GitHub numbers into the page.

The worked example is `actual-mcp-server.mdx`. Once this is merged, filling the other 13 projects is pure frontmatter editing in tier order.

> **Two-prompt patch.** This README covers landing the template + worked example. A second prompt, **[`BACKFILL-INSTRUCTIONS.md`](./BACKFILL-INSTRUCTIONS.md)**, drives backfilling the remaining 13 projects in priority order. Run them in sequence: this one first, the backfill prompt after.

## 🤖 For Claude Code CLI

Extract this zip next to your `skytale.it` clone, then drop the following into Claude Code:

> I've extracted `skytale-redesign-patch-v5/` next to my `skytale.it` repo. Please apply this patch on top of v1-v4 (all merged):
>
> 1. Read `skytale-redesign-patch-v5/CHANGELOG.md`.
> 2. **Install the new dependency**: `npm install --save-dev gray-matter`
> 3. Copy every file from `skytale-redesign-patch-v5/patch-v5/` into the repo at the same relative path, overwriting existing files. Files in this patch:
>     - `src/content.config.ts` (replaces existing, adds 6 optional fields)
>     - `src/components/StatStrip.astro` (new)
>     - `src/components/AudienceCards.astro` (new)
>     - `src/components/QuickStart.astro` (new)
>     - `src/components/ComparisonTable.astro` (new)
>     - `src/pages/projects/[id].astro` (replaces existing, full rewrite)
>     - `src/content/projects/actual-mcp-server.mdx` (replaces existing, full rewrite as worked T1 example)
>     - `scripts/sync-stats.mjs` (new, executable)
>     - `.github/workflows/sync-stats.yml` (new)
>     - `src/data/stats.json` (new, empty object)
> 4. Make the sync script executable: `chmod +x scripts/sync-stats.mjs`
> 5. **Run the sync script once locally** to populate the initial JSON: `node scripts/sync-stats.mjs`. You should see one line per project; `src/data/stats.json` becomes populated.
> 6. Run `npm run dev` and verify:
>     - Visit `/projects/actual-mcp-server` and confirm:
>       - Hero shows tier eyebrow + status + version pill, the tagline "Talk to your budget. Run it anywhere. Trust it in production.", and 5 action buttons (Source, Docs, npm, docker, and Live demo if liveUrl exists).
>       - Stat strip directly below hero shows 4 cards. If sync ran successfully, the first 1-3 should be live (npm downloads, Docker pulls, GitHub stars). The "Synced Nh ago" badge appears below the strip.
>       - Audience section shows 4 cards in a 2-column grid (1 column on mobile).
>       - MDX body renders Problem, Key moves (5 ### subsections), Architecture (with the ASCII diagram in a code block), Decisions (3 ### subsections).
>       - Quick start section has two tabs (Docker, npx-stdio). Clicking the second tab switches the visible code block.
>       - Comparison table has 13 rows across 4 columns; the first data column is accent-tinted. Group separator rows ("Setup and distribution", "Security and access", etc.) render correctly.
>       - Sidebar shows tech stack chips, metadata (version, status, license, last release, last edit), share buttons.
>     - Visit `/projects/pic2vid` (or any other unedited project) and confirm:
>       - It still renders. No tagline pill, no stat strip, no audience, no quickstart, no comparison. The MDX body renders as before.
>       - No console errors.
> 7. Show me `git diff --stat` and `git status`. The new files should be listed under "untracked" and the rewrites under "modified".
> 8. Commit on a new branch `redesign/v5-project-template` with this message:
>     ```
>     redesign(v5): project page template + build-time stats sync
>
>     - Schema: add 6 optional frontmatter fields (tagline, version, links,
>       stats, audience, quickstart, comparison)
>     - New section components: StatStrip, AudienceCards, QuickStart,
>       ComparisonTable
>     - Rewrite [id].astro: hero with tagline + tier eyebrow + action CTAs,
>       merged live+manual stat strip, conditional structured sections, MDX
>       prose body between, sticky sidebar
>     - Build-time stats sync: scripts/sync-stats.mjs fetches npm downloads,
>       Docker Hub pulls, GitHub stars + releases. Daily GitHub Action
>       refreshes src/data/stats.json and commits with [skip ci]
>     - actual-mcp-server.mdx: rewritten as the worked T1 example. Fixes the
>       62 -> 63 tools count and lifts the README's tagline, stats, audience,
>       quickstart, and comparison table into structured frontmatter
>     ```
> 9. Optionally trigger the GitHub Action manually after pushing: visit the Actions tab on GitHub, find "sync-stats", click "Run workflow". First run populates real numbers for actual-mcp-server.

## Adding the new fields to another project

Open any project MDX and add what's relevant. Every field is optional; sections only render when their data exists. Example minimum for a T2 project:

```yaml
---
title: "VPN Sentinel"
# ... existing fields ...
tagline: "VPN failures that hide from the user. Now they don't."
links:
  docs: "https://github.com/agigante80/VPNSentinel#readme"
stats:
  - value: "3"
    label: "Probe types"
    sub: "DNS, IP, latency"
audience:
  - who: "Self-hosted VPN users"
    what: "Catch DNS leaks and silent fallbacks before they expose your traffic."
quickstart:
  primaryLabel: "Docker Compose"
  primaryCode: |
    git clone https://github.com/agigante80/VPNSentinel
    cd VPNSentinel
    docker compose up -d
---
```

## Rollback

```sh
git checkout main -- \
  src/content.config.ts \
  src/pages/projects/[id].astro \
  src/content/projects/actual-mcp-server.mdx
rm src/components/StatStrip.astro
rm src/components/AudienceCards.astro
rm src/components/QuickStart.astro
rm src/components/ComparisonTable.astro
rm scripts/sync-stats.mjs
rm .github/workflows/sync-stats.yml
rm src/data/stats.json
```

(`gray-matter` is harmless to keep installed.)

## Untouched (intentional v5 scope)

- All other project MDX files: they validate fine and render fine; fill them in tier order on your own pace.
- `/projects/index.astro`: still uses the v2 card-grid layout. Tier filtering and other niceties from the original proposal are queued for round 6.
- `/about`, `/articles`, `/`: no changes.

## What this enables next

Once the template is in place, the only work to surface a project on the site is editing its MDX file. Hero, stats, audience, quickstart, comparison: all expressed as data, all render automatically. That's the structural payoff.
