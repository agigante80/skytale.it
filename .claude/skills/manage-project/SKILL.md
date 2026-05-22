---
name: manage-project
description: Create or enrich one project on the skytale.it portfolio. Given a GitHub repo URL it scaffolds a new project MDX when none exists; given an existing project slug it enriches that project with the v5 template fields (tagline, links, stats, audience, quickstart, comparison) and optionally refines the body. Commits per project. For a batch reconcile across every repo use /sync-projects instead.
user_invocable: true
arguments: a GitHub repo URL (creates a new project) or an existing project slug (enriches it)
---

# Manage Project

This skill manages a single project's MDX file across its whole lifecycle: first creation, then enrichment into a full case study. For a batch reconcile across every repo, use `/sync-projects` instead.

## Hard rule: no em dashes or en dashes

**NEVER write em dashes or en dashes anywhere** in frontmatter, body prose, headings, or commit messages. Use hyphens only for compound modifiers (e.g. "AI-assisted", "open-source"). The ` - ` space-hyphen-space pattern used to join clauses is an em-dash substitute and is also forbidden: use a comma, a colon, parentheses, or two sentences. A `PreToolUse` hook blocks Write/Edit content containing the dash characters, so a slip will fail loudly.

## Step 0: Resolve the target and pick the mode

From the argument:

- **A GitHub URL** (`https://github.com/agigante80/<repo>`): the slug is the repo name normalised to lowercase with `_` replaced by `-`.
- **A bare slug**: use it directly.

Then check whether `src/content/projects/<slug>.mdx` exists:

- **Does not exist** -> CREATE mode. Requires a GitHub URL; if only a slug was given, ask the user for the repo URL.
- **Exists** -> ENRICH mode. The repo URL comes from the MDX `githubUrl` field if a slug was given.

State which mode you are in before proceeding, then follow that section.

---

# CREATE mode

You are scaffolding a new project MDX from a GitHub repo. The goal is a working page fast; the v5 template fields are offered at the end as an optional enrich pass.

## 1. Fetch repo metadata

`gh repo view <owner>/<repo> --json name,description,topics,languages,license,homepageUrl,defaultBranchRef,stargazerCount,pushedAt`. Fall back to WebFetch on the repo URL if `gh` is unavailable.

| Field | Source | Use |
|---|---|---|
| slug | URL last segment, normalised | filename |
| description | GH `description` | rewrite into one portfolio-voice sentence; the GH text is usually too terse |
| primaryLanguage / topics | GH `languages`, `topics` | seed `techStack` and suggest `category` |
| homepage | GH `homepageUrl` | optional `liveUrl` (skip if it points back at the repo itself) |
| pushedAt | GH | suggest a `status` default |

## 2. Ask the decisions you cannot infer

Use AskUserQuestion. Do not guess these.

- **category**: `AI/MCP`, `Security`, `Finance`, `Utilities`, `Content`. Suggest one from topics.
- **tier** (1, 2, 3): ordering only, lower appears earlier on the index. Visual layout is identical across tiers. Independent of whether there is a body.
- **write a body?** (yes/no): separate from tier. Yes gets the case-study scaffold in step 6.
- **status**: `active`, `maintained`, `experimental`, `archived`. Default from `pushedAt`: under 30 days = active, under 6 months = maintained, otherwise ask. Never silently choose `archived`.
- **featured** (yes/no): if yes, the project shows on the home page and gets a wider card on the index.

## 3. Identify a hero image (optional)

Fetch the README (`gh api repos/<owner>/<repo>/readme --jq .download_url`, then `curl -sL`). Find the first markdown image whose URL does NOT contain `shields.io`, `badge.fury.io`, `/badge/`, `badges.`, or `badge` in the path. Resolve relative paths against `https://raw.githubusercontent.com/<owner>/<repo>/<defaultBranch>/`. Confirm with the user, then:

```bash
mkdir -p public/images/projects/<slug>
curl -sL -o public/images/projects/<slug>/hero.<ext> "<resolved-url>"
```

Verify it is over 10 KB. Skip the field entirely if no real hero is found.

## 4. Suggest related articles

Read `src/lib/articles.ts`. Surface every article whose title, description, or tldr mentions the project (case-insensitive substring on the project name and near-variants). Present matches as a multi-select. Selected slugs go into `relatedArticles`. Invent nothing.

## 5. Write the MDX frontmatter

```yaml
---
title: "<Project Title>"
description: "<one sentence, present tense, <=160 chars, no dashes>"
category: "<chosen>"
tier: <1 | 2 | 3>
status: "<chosen>"
techStack: ["<lang>", "<framework>", "<runtime>"]
githubUrl: "<repo URL>"
liveUrl: "<homepage URL>"        # omit if absent
featured: <true | false>
heroImage: "/images/projects/<slug>/hero.<ext>"   # omit if none
relatedArticles: ["<slug>", ...]                  # omit if empty
---
```

Omit optional fields entirely rather than writing empty strings or arrays. The v5 template fields (tagline, stats, audience, quickstart, comparison) are added in the ENRICH pass, not here.

## 6. Scaffold the body (only if the user said yes in step 2)

Put the soft-regen marker as the first line so `/sync-projects` knows the body is auto-generated and may refresh it. The user removes the marker when they edit the body to claim ownership.

```markdown
{/* auto-generated body, edit to take ownership */}

## The problem

<2 to 4 sentences. What was missing or broken before this existed.>

## How I built it

<3 to 6 sentences. Key design decisions and why; name rejected alternatives.>

## Architecture

<Include only if the system has non-obvious structure. Otherwise omit.>

## Impact

<2 to 4 bullets. What is true now that was not. Real numbers only.>
```

If the user said no, the MDX ends after the frontmatter. The detail page renders only the header, which is intentional for minor projects.

## 7. Self-check, build, commit

Run the shared self-check (see "Self-check" below), then:

```bash
npm run build
git add src/content/projects/<slug>.mdx public/images/projects/<slug>/
git commit -m "Add project: <Project Title>"
git push
```

## 8. Offer the enrich pass

Tell the user the project is live, then ask: "Run the enrich pass now to add the v5 template fields (tagline, stats, audience, quickstart, comparison)?" If yes, continue into ENRICH mode for this slug. If no, tell them they can run `/manage-project <slug>` any time to enrich it.

---

# ENRICH mode

You are bringing an existing project up to the v5 template. The GitHub README is the source of truth; the MDX usually lags it.

## Ground rules

- **Read the GitHub README first.** Then edit the MDX.
- **Only add a field you can support from real data.** Do not invent stats, audience personas, or comparisons.
- **Empty is fine.** An omitted field means the section silently hides. That is correct for projects that do not warrant it. Honesty over completeness.
- **One commit per project.**

## Steps

1. Read `src/content/projects/<slug>.mdx`; note what is already filled.
2. Read the README: `gh api repos/<owner>/<repo>/readme --jq .content | base64 -d`.
3. Work through the v5 fields below, adding each only when the data supports it.
4. Handle the body (see "Body handling").
5. Update `lastSyncedFrom` to the current date.
6. Run the self-check and build, then commit `content(<slug>): enrich to v5 template` and push.

## v5 field reference

All optional. Shapes match `src/content.config.ts`.

- **`tagline`**: one line, sticker energy, under 80 chars. From the README lead or "why this project" framing; write one from the core promise if the README has none. Example: `"Talk to your budget. Run it anywhere. Trust it in production."`
- **`version`**: latest released version string. `sync-stats.mjs` overrides it from GitHub releases when one exists.
- **`links`**: object with any of `npm`, `docker`, `dockerHub`, `docs`, `demoVideo`. Only real URLs. `npm` if the project publishes an npm package; `dockerHub` if it ships an image to Docker Hub (`agigante80/<name>`); `docs` is the README permalink or a docs site.
- **`stats`**: array of 2 to 4 `{ value, unit?, label, sub? }` cards. Numeric proof points from the README (tool count, API coverage, probe types, posts published, launch flags documented). Omit the field if nothing real fits; the live sync still adds GitHub stars on its own.
- **`audience`**: array of 2 to 4 `{ who, what }` cards, only when the project has genuinely distinct user groups. Specific beats generic: `{ who: "Multi-budget families", what: "Switch budgets mid-conversation without restarting." }` is good; `{ who: "Developers", what: "Useful for coding." }` means skip the section.
- **`quickstart`**: `{ primaryLabel, primaryCode, altLabel?, altCode?, docsHref? }`. Only for installable projects. `primaryLabel` names the method (Docker, npm, git clone, Steam launch options); `primaryCode` is a copy-pasteable block. For a doc-only repo the "quickstart" can be the launch-flag string.
- **`comparison`**: `{ snapshotDate, competitors[], rows[{ group?, label, cells[] }], caption? }`. The rarest section. Add only when there are at least two named alternatives in the same space AND the README already has a comparison. `cells` length must equal `1 + competitors.length` (the first cell is this project). Cells starting with the characters that the ComparisonTable colours automatically render as such.

## Body handling

- If the body is empty and the project warrants a case study, scaffold one with the soft-regen marker and the standard headings (`## The problem`, `## What this does that the others do not` for T1, `## Architecture`, `## Decisions worth knowing about` for T1).
- If the body starts with the soft-regen marker, you may rewrite it freely.
- If the body has no marker, it is hand-owned. Do not rewrite it. A full rewrite of a hand-owned body happens only if the user explicitly asks for it in this run.
- Lower tiers may use only `## The problem` and a short `## How I built it`.

---

# Self-check (both modes)

Verify and report:

- No em or en dashes anywhere, including the ` - ` clause separator.
- `description` is one present-tense sentence, <=160 chars.
- `title` <=43 chars (warn only; it renders as `{title} | Andrea Gigante`).
- If `heroImage` is set: file exists, over 10 KB, aspect ratio between 1.5:1 and 2.5:1 (1.91:1 is the social-card sweet spot).
- If `relatedArticles` is set: every slug exists in `src/lib/articles.ts`.
- If `comparison` is set: every row's `cells` length equals `1 + competitors.length`.
- `npm run build` succeeds. This is the schema validator; never skip it. Fix any Zod error and rebuild before committing.

The page renderer adds `og:image` from `heroImage`, `dateModified` from git, and schema `keywords` from `techStack` automatically. Do not duplicate those in frontmatter.

---

# Backfilling the whole portfolio

To bring every project up to the v5 template, run ENRICH once per project, in this priority order (the first, `actual-mcp-server`, is already the worked example):

`vpnsentinel`, `agentgate`, `forge-kit`, `safeharbor-media-stack`, `homeassistant-bypass-wiring-fan`, `actual-sync`, `pic2vid`, `qr-with-icon`, `lego-city-undercover-linux`, `contentgen-ai`, `vibe-coding-prompts`, `ondahertz-es`, `galena-es`.

One commit per project. After the last one, run `node scripts/sync-stats.mjs` and commit `src/data/stats.json`. If a project's README genuinely has nothing new to fill, just bump `lastSyncedFrom` and move on; a sharp Tier 3 utility does not need invented sections.

# What this skill does NOT do

- It does not batch-reconcile every repo at once. That is `/sync-projects`.
- It does not import README content verbatim. The README is for developers; the portfolio page is for recruiters and peers. Rewrite from scratch.
- It does not add license, CI, or language badges, and does not embed `shields.io` SVGs.
- It does not invent stats, audiences, or comparisons to fill the template.
