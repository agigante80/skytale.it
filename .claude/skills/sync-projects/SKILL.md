---
name: sync-projects
description: Scan github.com/agigante80 for public repos and reconcile with the portfolio. Auto-adds new repos at Tier 3, refreshes existing project pages whose underlying repo has changed since the MDX was last edited, marks newly-archived repos, and surfaces tier-vs-popularity mismatches. One commit per sync. Recoverable via `git revert HEAD`.
user_invocable: true
arguments: (none)
---

# Sync Projects

You reconcile `src/content/projects/*.mdx` with the user's public GitHub repositories. The skill is deliberately non-interactive: it scans, decides, acts, commits, pushes, and reports. If the sync produced bad output, the recovery path is `git revert HEAD` (and `git push` if already published).

## Hard rule: no em dashes or en dashes

**NEVER write em dashes or en dashes anywhere** in any field you generate (descriptions, body prose, anything). Use hyphens only for compound modifiers. The space-hyphen-space pattern (` - `) used as a clause separator is an em-dash substitute and is forbidden. Use commas, colons, parentheses, or split sentences.

## Pre-flight: abort conditions

Stop and tell the user before doing anything if any of the following are true:

1. `git status --porcelain` returns non-empty output. Tell the user to commit or stash first. The skill makes a commit; running on a dirty tree risks mingling unrelated edits.
2. `gh auth status` fails. The user must run `gh auth login` first.
3. `gh api user --jq .login` does not return `agigante80`. Wrong account is configured.

## Configuration (edit inline as needed)

These constants are intentionally hardcoded in this file. Editing them is the way you customise behaviour.

```
GITHUB_USER = "agigante80"

IGNORE_REPOS = [
  "skytale.it",                      # this portfolio itself
  "backup_skytale_it",               # backup repo
  "agigante-creative-theme-jekyll",  # old Jekyll theme
]

SOFT_REGEN_MARKER = "{/* auto-generated body, edit to take ownership */}"

TIER_MISMATCH = {
  high_stars_low_tier: 50,   # >= 50 stars but Tier 3 → suggest promote
  low_stars_high_tier: 5,    # < 5 stars but Tier 1 → suggest demote
}

STATUS_FROM_PUSHED_AT = {
  active_within_days: 30,    # pushed in last 30 days = active
  maintained_within_days: 365  # older but within a year = maintained (else: keep current or ask)
}
```

## Steps

### 1. Fetch GitHub state

```bash
gh api users/agigante80/repos --paginate \
  --jq '.[] | {name, description, fork, archived, pushed_at, stargazers_count, default_branch, homepage, topics, language}'
```

For every candidate that passes the filter in step 2, also verify a README exists:

```bash
gh api "repos/agigante80/<name>/readme" --jq '.download_url' 2>/dev/null
```

If the call fails or returns nothing, the repo has no README; drop it.

### 2. Apply filters

Drop any repo where any of:

- `fork == true`
- name is in `IGNORE_REPOS`
- `description` is null or empty
- README fetch failed
- `archived == true` AND repo is not already in the portfolio (we never auto-add archived projects; if it's already in the portfolio and just got archived, we handle that as a status update in step 5)

### 3. Read local MDX inventory

For each `src/content/projects/*.mdx`:

- Parse YAML frontmatter
- Extract: `githubUrl`, current `tier`, current `status`, current body (everything after the closing `---`)
- Get last-modified timestamp:
  ```bash
  git log -1 --format=%aI -- "src/content/projects/<slug>.mdx"
  ```
- Derive the GH repo name by splitting `githubUrl` on `/` and taking the last segment (lowercase comparison)

### 4. Classify each GitHub repo

Match GH repos to local MDX by case-insensitive repo-name equality.

| Condition | Bucket |
|---|---|
| In portfolio, GH `pushed_at` ≤ MDX git mtime | **SKIP** (already current) |
| In portfolio, GH `pushed_at` > MDX git mtime, and GH `archived == true` | **ARCHIVE** (set status to `archived`, no other changes) |
| In portfolio, GH `pushed_at` > MDX git mtime | **UPDATE** |
| Not in portfolio, passes filters | **NEW** |

Also produce an **ORPHAN** list: every MDX whose `githubUrl` repo name is not in the GH response (deleted or renamed on GitHub).

### 5. Execute actions

For each item, do exactly the following.

#### NEW (auto-add a fresh project at Tier 3)

- Slug: lowercase repo name with non-alphanumerics replaced by hyphens
- Fetch the README content:
  ```bash
  gh api "repos/agigante80/<name>/readme" --jq '.content' | base64 -d
  ```
- Derive `description`: rewrite GH's description into one portfolio-voice sentence. Max 160 chars. No em/en dashes. Do not copy the GH description verbatim; it is usually too terse or too marketing-flavoured.
- Derive `techStack`: GH `language` + any of the GH `topics` that look like tech labels (e.g. "typescript", "docker", "mcp"). Capitalize sensibly.
- Derive `status`:
  - `active` if `pushed_at` within last 30 days
  - `maintained` otherwise
- Derive `category`: best match from the enum `[AI/MCP, Security, Finance, Utilities, Content]` based on topics and repo description. Default `Utilities` if unclear.
- Try to find a hero image in the README: parse the first markdown image `![...](...)` whose URL does NOT contain any of `shields.io`, `badge.fury.io`, `/badge/`, `badges.`, or include the word `badge` in the path. If the URL is relative, resolve against `https://raw.githubusercontent.com/agigante80/<name>/<default_branch>/`. Download with `curl -sL` to `public/images/projects/<slug>/hero.<ext>`. Verify > 10 KB. Skip if no valid hero found.
- Write `src/content/projects/<slug>.mdx` with frontmatter only (no body). Required fields:
  ```yaml
  ---
  title: "<repo name, prettified>"
  description: "<one sentence, ≤160 chars>"
  category: "<derived category>"
  tier: 3
  status: "<derived status>"
  techStack: ["..."]
  githubUrl: "https://github.com/agigante80/<name>"
  liveUrl: "<GH homepage if present>"
  featured: false
  heroImage: "/images/projects/<slug>/hero.<ext>"   # omit if no hero found
  ---
  ```
- No `metrics`, no `relatedArticles`, no body. These are editorial fields for the user to add later via `/add-project` interactive mode or by hand.

#### UPDATE (refresh an existing project)

- Read existing frontmatter and body
- **Preserved fields** (do not overwrite): `title`, `category`, `tier`, `featured`, `metrics`, `relatedArticles`
- **Refreshed fields**:
  - `description`: regenerate from current README first paragraph + GH description. Max 160 chars. No em/en dashes.
  - `techStack`: regenerate from current GH primary language + topics
  - `status`: derive from `pushed_at` and `archived` flag
  - `githubUrl`: refresh in case GH renamed the repo (canonical URL from GH response)
  - `liveUrl`: refresh from current GH homepage
  - `heroImage`: if the README's hero image URL has changed OR the current heroImage file no longer exists, re-download to `public/images/projects/<slug>/hero.<ext>`. Otherwise leave alone.
- **Body handling** (soft regen):
  - If body is empty: leave empty
  - If body starts with `SOFT_REGEN_MARKER`: regenerate the body using the standard H2 scaffold (What is X / The Problem / How I Built It / optional Architecture / Impact). Pull current README content for hints. **Keep the marker at the top so future syncs continue to refresh.** No em/en dashes anywhere.
  - Otherwise (body exists and marker absent): leave body untouched. The user has taken ownership.

#### ARCHIVE (mark an existing project as archived)

- Read existing MDX
- Update `status:` line to `"archived"`
- Make no other changes (do not refresh description, body, hero, anything)

#### ORPHAN

- Take no action
- Add to the orphan section of the report

### 6. Tier-vs-popularity check (suggestions only)

For every project in the (post-sync) portfolio, fetch current `stargazers_count`. Flag mismatches:

- `tier == 3` AND `stars >= 50`: suggest "consider promoting to Tier 1 or 2"
- `tier == 1` AND `stars < 5`: suggest "consider demoting (low external engagement)"

These are SUGGESTIONS for the user to read. Do not change `tier`.

### 7. Commit and push

If no writes occurred in step 5, skip commit. Otherwise:

```bash
git add -A
git commit -m "chore(sync): N added, M updated, K archived from github.com/agigante80"
git push origin main
```

Replace `N`, `M`, `K` with actual counts.

### 8. Report

Print to the user:

- **Summary line**: `N added | M updated | K newly archived | W orphaned`
- **Per-bucket detail** (only sections with items):
  - `Added:` slug, status, hero image included y/n
  - `Updated:` slug, what changed (description / techStack / status / hero / body-regen)
  - `Archived:` slug
  - `Orphaned:` slug + reason (no matching GH repo found)
- **Tier suggestions** (if any): "project X has Y stars at Tier Z; consider tier change"
- **Commit hash** (or `(no changes)`)

## What this skill explicitly does NOT do

- **Promote tier.** Tier is your editorial decision. The skill suggests, never acts.
- **Touch hand-edited bodies.** Bodies without the soft-regen marker are owned by you.
- **Delete MDX files** for repos missing from GitHub. Renames look like deletions; the skill flags them as orphans for your review.
- **Run on a schedule.** Manual invocation only. If you want a cron, that is a separate decision; this skill never wires itself into one.
- **Generate prose for new auto-added Tier 3 projects.** New projects get frontmatter only. If you later want a case study, either promote tier and write the body manually, or invoke `/add-project` interactively to get the scaffold (with the soft-regen marker).
- **Embed shields.io badges, license badges, CI badges, or any badge wall.** Same opinionation as `/add-project`.

## Recovery

If the sync produced unwanted changes:

```bash
git revert HEAD
git push origin main
```

One commit per sync means one revert undoes everything. If you have not yet pushed, `git reset --hard HEAD~1` also works.
