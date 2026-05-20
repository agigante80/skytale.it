---
name: add-project
description: Add a GitHub project to the skytale.it portfolio. Fetches repo metadata, downloads optional hero image, scaffolds an MDX case study with the standard structure, and publishes (commit + push).
user_invocable: true
arguments: github-url
---

# Add GitHub Project

You are adding a new portfolio project to skytale.it. The user provides a GitHub repository URL. You create one MDX file in `src/content/projects/`, optionally download a hero image, then commit and push to `main`.

## Hard rule: no em dashes or en dashes

**NEVER write em dashes or en dashes anywhere.** This includes the description, the body prose, headings, anything. Use hyphens only for compound modifiers (e.g. "AI-assisted", "open-source"). If a sentence wants to use a dash, rewrite it with a comma, a colon, parentheses, or split into two sentences.

A common trap: ` - ` (space-hyphen-space) used to separate clauses *is an em-dash substitute*. Replace it with a period or a comma.

## Input

A GitHub repository URL such as `https://github.com/agigante80/AgentGate`.

## Steps

### 1. Fetch repo metadata

Use `gh repo view <owner>/<repo> --json name,description,topics,languages,license,homepageUrl,defaultBranchRef,stargazerCount,pushedAt` via Bash. Fall back to WebFetch on the repo URL if `gh` is unavailable.

Extract:

| Field | Source | Notes |
|---|---|---|
| `repo` | URL last segment | becomes the slug if it works as one. Lowercase, hyphenate if needed. The user may override. |
| `description` | GH `description` | Rewrite for the portfolio. The GH description is usually too terse. Aim for one sentence that names what it is and what it does. |
| `primaryLanguage` | GH `languages` | seeds `techStack` |
| `topics` | GH `topics` | suggests `techStack` and `category` |
| `homepage` | GH `homepageUrl` | optional `liveUrl` |
| `lastActivity` | GH `pushedAt` | use to suggest a `status` default |
| `license` | GH `license.spdxId` | informational only; do not display as a badge |

### 2. Ask the user the decisions you cannot infer

Use AskUserQuestion. Do not guess these.

- **category** (single-select from `AI/MCP`, `Security`, `Finance`, `Utilities`, `Content`). Suggest one based on topics.
- **tier** (single-select 1, 2, 3). Tier 1 means you will write a full case-study body. Tier 2/3 get only frontmatter and an empty body, rendered as a sparse detail page.
- **status** (single-select `active`, `maintained`, `experimental`, `archived`). Default suggestion based on `pushedAt`: < 30 days = active, < 6 months = maintained, otherwise ask. Never silently choose `archived`.
- **featured** (yes/no). Only ask if tier == 1. If yes, the project shows on the home page.
- **metrics** (optional one-liner like `"62 tools | Production-ready | Docker"`). Pipe-separated, max ~40 chars. Skip if no strong claim to make.

### 3. Identify the hero image (optional)

Many of Andrea's repos ship a hero image in README. Try, in order:

1. Open the README via `gh api repos/<owner>/<repo>/readme --jq .download_url` and `curl -sL <url>` to fetch its rendered Markdown.
2. Find the first image reference (`![...](...)`) that points to a non-badge file. Badges live on `img.shields.io`, `badge.fury.io`, or contain `badge` in the path. **Skip those.**
3. If the image path is relative, resolve it against `https://raw.githubusercontent.com/<owner>/<repo>/<defaultBranch>/`.
4. Confirm with the user before downloading: "Use `<resolved-url>` as the hero image?" Show the URL.

If the user confirms:
```bash
mkdir -p public/images/projects/<slug>
curl -sL -o public/images/projects/<slug>/hero.<ext> "<resolved-url>"
```
Verify the file is > 10KB. Anything smaller is likely a logo or icon, not a hero.

If no good hero image is found or the user declines, skip this step. The `heroImage` field is optional.

### 4. Suggest related articles

Read `src/lib/articles.ts` and surface every article slug whose title or description mentions the project (case-insensitive substring match on the project name or a near-variant). Present the matches as a multi-select question. Selected slugs go into the `relatedArticles` array.

If no matches, skip. Do not invent links.

### 5. Generate the MDX file

Write `src/content/projects/<slug>.mdx`. Required frontmatter shape:

```yaml
---
title: "<Project Title>"
description: "<one-sentence portfolio description, no dashes>"
category: "<chosen category>"
tier: <1 | 2 | 3>
status: "<chosen status>"
techStack: ["<lang>", "<framework>", "<runtime>"]
githubUrl: "<repo URL>"
liveUrl: "<optional homepage URL>"
featured: <true | false>
metrics: "<optional pipe-separated string>"
heroImage: "/images/projects/<slug>/hero.<ext>"
relatedArticles: ["<article-slug-1>", "<article-slug-2>"]
---
```

Omit `heroImage`, `metrics`, `liveUrl`, and `relatedArticles` fields entirely if empty (do not leave them as empty strings or empty arrays explicitly, except `relatedArticles` which has a `default([])` in the schema and may be omitted).

### 6. Scaffold the body (Tier 1 only)

For Tier 1 projects, write a body following this exact structure. Use the section headings as-is for consistency across the portfolio:

```markdown
## What is <Project Name>?

<2 to 4 sentences. Name the user, the action, the outcome. Do not just paraphrase the description; go one level deeper into what the tool actually does.>

## The Problem

<2 to 4 sentences. What was broken or missing before this existed? What did you personally hit that motivated building it? Concrete is better than abstract.>

## How I Built It

<3 to 6 sentences. The key design decisions and why, not a feature list. Naming the alternatives you rejected is high signal. If you used an unusual library or pattern, explain why.>

## Architecture (optional)

<Include only if the system has non-obvious structure: multi-process, distributed, plugin-based, etc. Otherwise skip this section entirely.>

## Impact

<2 to 4 bullets. What is true now that was not true before? Hard numbers if you have them ("309 tests", "62 tools", "saves N hours/month"). Avoid claims you cannot back up.>
```

For Tier 2 and Tier 3 projects, write **no body**. The detail page will render only the frontmatter, which is intentional.

### 7. Self-check before committing

Verify all of the following and report results to the user:

- [ ] No em or en dashes anywhere in the file (including ` - ` as a clause separator)
- [ ] `description` is one sentence, present tense, names the tool and what it does
- [ ] `slug` matches the filename (no trailing extension in slug references)
- [ ] If `heroImage` is set, the file exists at the referenced path and is > 10KB
- [ ] If `relatedArticles` is set, every slug exists in `src/lib/articles.ts`
- [ ] Tier 1 has a body with the standard four (or five) H2 sections; Tier 2/3 has no body
- [ ] `npm run build` succeeds (this is the schema validator; do not skip it)

If `npm run build` fails on a Zod validation error, fix the frontmatter and rebuild before committing.

### 8. Commit and push

```bash
git add src/content/projects/<slug>.mdx \
  public/images/projects/<slug>/  # only if a hero image was downloaded
git commit -m "Add project: <Project Title>"
git push origin main
```

### 9. Report

Tell the user:
- Slug and live URL: `https://www.skytale.it/projects/<slug>` (available once Cloudflare builds)
- Tier, category, status
- Whether a hero image was added
- Related articles linked (if any)
- Self-check pass/fail results
- Commit hash

## Common mistakes to avoid

- **Do not import GitHub README content verbatim into the MDX body.** The README is for developers picking up the tool. The portfolio page is for a different audience (recruiters, peers, employers). Rewrite from scratch.
- **Do not add a license badge, a CI badge, or language badges.** These belong on a README, not a portfolio. The page's design system already conveys tech stack via chips.
- **Do not embed live `shields.io` SVG URLs.** They add external requests, hurt CWV, and require CSP changes. If we add live stats later, it will be a build-time fetch, not embedded badges.
- **Do not write a feature list.** Trade-offs and decisions are more interesting than a bullet list of capabilities.
- **Do not invent metrics.** If you do not have a real number, leave the `metrics` field out.
