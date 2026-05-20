---
name: sync-projects
description: Scan github.com/agigante80 for public repos and reconcile with the portfolio. Auto-adds new repos at Tier 3, refreshes existing project pages whose underlying repo has changed since the MDX was last edited, marks newly-archived repos, and surfaces tier-vs-popularity mismatches based on multi-signal engagement (stars, forks, npm, PyPI, Docker Hub pulls). One commit per sync. Recoverable via `git revert HEAD`.
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

# Multi-signal thresholds, calibrated to Andrea's actual distribution
# (top project: 16 stars, 4 forks, 1880 npm DL/mo, 18530 Docker pulls)
ENGAGEMENT_THRESHOLDS = {
  notable: {
    stars: 3,
    forks: 2,
    npm_dl_per_month: 100,
    pypi_dl_per_month: 100,
    docker_pulls_total: 100,
  },
  outlier: {
    stars: 10,
    forks: 4,
    npm_dl_per_month: 1000,
    pypi_dl_per_month: 1000,
    docker_pulls_total: 5000,
  },
}

STATUS_FROM_PUSHED_AT = {
  active_within_days: 30,    # pushed in last 30 days = active
  maintained_within_days: 365,  # older but within a year = maintained
}

STALE_TIER1_MONTHS = 6   # Tier 1 with all-zero engagement AND > 6 months idle = consider demoting
```

## Helper: slug normalisation

GitHub repo names mix case and use both `_` and `-`. Portfolio slugs are lowercase with `-`. Use this normalisation everywhere a GH repo is matched to a local MDX:

```
normalise(name) = name.lower().replace('_', '-')
```

Examples that must match:
- `OndaHertz_es` (GH) → `ondahertz-es` matches MDX slug `ondahertz-es`
- `AgentGate` (GH) → `agentgate` matches MDX slug `agentgate`
- `SafeHarbor-Media-Stack` (GH) → `safeharbor-media-stack` matches MDX slug `safeharbor-media-stack`

Failing to normalise causes the first sync to flag every existing project as both ORPHAN (no GH match) and NEW (GH repo not in portfolio).

## Steps

### 1. Fetch GitHub state

```bash
gh api users/agigante80/repos --paginate \
  --jq '.[] | {name, description, fork, archived, pushed_at, stargazers_count, forks_count, default_branch, homepage, topics, language}'
```

For every candidate that survives filtering in step 2, also verify a README exists:

```bash
gh api "repos/agigante80/<name>/readme" --jq '.download_url' 2>/dev/null
```

### 2. Apply filters

The fork filter applies **only to NEW candidates**, not to lookups for existing portfolio entries. (Some portfolio projects are forks, e.g. galena-es; orphaning them is wrong.)

Build two sets:

**Filtered candidates** (for considering NEW additions):
- `fork == false`
- name (normalised) is not in `IGNORE_REPOS`
- `description` is non-empty
- README fetch succeeded
- `archived == false`

**Lookup set** (for "is this GH repo backing an existing MDX?"):
- ALL non-ignored repos, including forks and archived ones
- Used in step 4 matching

### 3. Read local MDX inventory

For each `src/content/projects/*.mdx`:

- Parse YAML frontmatter
- Extract: `githubUrl`, current `tier`, current `status`, current body (everything after the closing `---`)
- Get last-modified timestamp:
  ```bash
  git log -1 --format=%aI -- "src/content/projects/<slug>.mdx"
  ```
- Derive the GH repo name from `githubUrl` by splitting on `/` and taking the last segment, then apply `normalise()`. This is the key used to match against GH repos.

### 4. Classify each GitHub repo

Match using `normalise()` on both sides.

| Condition | Bucket |
|---|---|
| In portfolio (any GH repo, fork or not), GH `pushed_at` ≤ MDX git mtime | **SKIP** (already current) |
| In portfolio, GH `pushed_at` > MDX git mtime, and GH `archived == true` | **ARCHIVE** (set status to `archived`, no other changes) |
| In portfolio, GH `pushed_at` > MDX git mtime | **UPDATE** |
| Not in portfolio, passes the NEW-candidate filter | **NEW** |

Also produce an **ORPHAN** list: every MDX whose normalised repo name is not in the full GH lookup set (deleted on GitHub, or repo renamed).

### 5. Fetch multi-signal engagement (for every classified project + every portfolio project that was skipped)

The same fetcher feeds tier-suggestion logic in step 7. Run it once per project, store the results.

For each project, gather:

| Signal | How |
|---|---|
| `stars` | from GH response (always present) |
| `forks` | from GH response (always present) |
| `npm_dl` | try `https://api.npmjs.org/downloads/point/last-month/<slug>`; verify ownership before counting (next bullet) |
| `pypi_dl` | try `https://pypistats.org/api/packages/<slug>/recent`; verify ownership |
| `docker_pulls` | try `https://hub.docker.com/v2/repositories/agigante80/<slug>/`; built-in ownership (Andrea's namespace) |

**Ownership verification (critical):** npm and PyPI package names collide. The npm package `agentgate` exists but belongs to "Luis Montes," not Andrea. Verify by fetching the package metadata and checking that the source repository URL matches `https://github.com/agigante80/<name>` (normalised comparison). Examples:

- npm: `npm view <pkg> repository.url` → must contain `agigante80/<name>`
- PyPI: `curl https://pypi.org/pypi/<pkg>/json | jq '.info.project_urls'` → "Source" or "Homepage" must contain `agigante80/<name>`

If verification fails, do not count the downloads. Record as `null`, not zero.

### 6. Execute actions

For each NEW / UPDATE / ARCHIVE item, do exactly the following.

#### NEW (auto-add a fresh project at Tier 3)

- Slug: `normalise(repo_name)` (lowercase, hyphenated)
- Fetch README content:
  ```bash
  gh api "repos/agigante80/<name>/readme" --jq '.content' | base64 -d
  ```
- Derive `description`: rewrite GH description in portfolio voice. Max 160 chars. No em/en dashes.
- Derive `techStack`: GH `language` + GH `topics` that look like tech labels.
- Derive `status`: `active` if `pushed_at` within 30 days, else `maintained`.
- Derive `category`: best match from `[AI/MCP, Security, Finance, Utilities, Content]` based on topics and description. Default `Utilities`.
- Find a hero image in README: parse the first `![...](...)` whose URL does NOT contain any of `shields.io`, `badge.fury.io`, `/badge/`, `badges.`, or `badge` in the path. Resolve relative URLs against `https://raw.githubusercontent.com/agigante80/<name>/<default_branch>/`. Download to `public/images/projects/<slug>/hero.<ext>` and verify > 10 KB.
- **Suggest related articles:** load `src/lib/articles.ts`, do case-insensitive substring matching on each article's `title`, `description`, and `tldr` against the project name (and common variants: with/without hyphens, with/without "MCP" suffix, etc.). Collect article slugs whose text mentions the project. If matches found, add them to `relatedArticles`. Skip if no matches; do not invent links.
- Write `src/content/projects/<slug>.mdx`. Frontmatter only, no body:
  ```yaml
  ---
  title: "<repo name, prettified>"
  description: "<one sentence, ≤160 chars>"
  category: "<derived>"
  tier: 3
  status: "<derived>"
  techStack: [...]
  githubUrl: "https://github.com/agigante80/<name>"
  liveUrl: "<GH homepage if present>"   # omit if absent
  featured: false
  heroImage: "/images/projects/<slug>/hero.<ext>"   # omit if no hero found
  relatedArticles: [...]   # omit if empty
  ---
  ```

#### UPDATE (refresh an existing project)

- Read existing frontmatter and body
- **Preserved fields** (do not overwrite): `title`, `category`, `tier`, `featured`, `metrics`, `relatedArticles`
- **Refreshed fields**:
  - `description`: regenerate from current README first paragraph + GH description. Max 160 chars. No em/en dashes.
  - `techStack`: regenerate from current GH primary language + topics
  - `status`: derive from `pushed_at` and `archived`
  - `githubUrl`: refresh in case GH renamed the repo
  - `liveUrl`: refresh from current GH homepage
  - `heroImage`: if the README's hero image URL has changed OR the current heroImage file does not exist, re-download. Otherwise leave alone.
- **Body handling** (soft regen):
  - Body empty: leave empty
  - Body starts with `SOFT_REGEN_MARKER`: regenerate body using the standard H2 scaffold (What is X / The Problem / How I Built It / optional Architecture / Impact), pulling current README content for hints. Keep the marker at the top.
  - Marker absent: leave body untouched (user has taken ownership)

#### ARCHIVE (mark an existing project as archived)

- Read existing MDX
- Update `status:` line to `"archived"`
- No other changes

#### ORPHAN

- Take no action
- Add to report with the reason ("no matching GH repo for `<slug>` (was `<githubUrl>`)")

### 7. Tier-vs-popularity suggestions (multi-signal, no action)

For every project in the (post-sync) portfolio, use the engagement signals fetched in step 5 to decide.

A signal is **notable** if its value meets or exceeds the `notable` threshold for its type.
A signal is **outlier** if its value meets or exceeds the `outlier` threshold for its type.

Rules:

| Condition | Suggestion |
|---|---|
| `tier == 3` AND any signal hits **notable** | "consider promoting to Tier 2 or 1: <list the signals and values>" |
| `tier == 2` AND any signal hits **outlier** | "consider Tier 1: <list the signals>" |
| `tier == 1` AND all signals are zero (or `null`) AND last push > `STALE_TIER1_MONTHS` ago | "consider demoting Tier 1: no engagement and idle for N months" |
| `status == "archived"` AND `tier != 3` | "archived projects should not lead the portfolio: consider Tier 3" |
| `tier == 1` AND last push > 18 months ago | "Tier 1 project is stale (idle N months)" |

The skill never changes tier. These are text suggestions only.

### 8. Commit and push

If no writes occurred in step 6 (everything was current), skip commit. Otherwise:

```bash
git add -A
git commit -m "chore(sync): N added, M updated, K archived from github.com/agigante80"
git push origin main
```

Replace `N`, `M`, `K` with actual counts.

### 9. Report

Print to the user:

- **Summary line**: `N added | M updated | K newly archived | W orphaned`
- **Per-bucket detail** (only sections with items):
  - `Added:` slug, status, hero y/n, related-articles count
  - `Updated:` slug, what changed (description / techStack / status / hero / body-regen)
  - `Archived:` slug
  - `Orphaned:` slug + reason
- **Engagement table** for every portfolio project (post-sync), with columns: slug, tier, stars, forks, npm/mo, pypi/mo, docker pulls. Use `-` for `null` (no published package or ownership not verified) and `0` for verified-but-zero.
- **Tier suggestions** (if any), each citing which signals fired
- **Commit hash** (or `(no changes)`)

## What this skill explicitly does NOT do

- **Promote tier.** Tier is your editorial decision. The skill suggests, never acts.
- **Touch hand-edited bodies.** Bodies without the soft-regen marker are owned by you.
- **Delete MDX files** for repos missing from GitHub. Renames look like deletions; the skill flags them as orphans for your review.
- **Run on a schedule.** Manual invocation only.
- **Generate prose for new auto-added Tier 3 projects.** New projects get frontmatter only.
- **Count downloads from unverified packages.** A package name on npm or PyPI matching your repo slug is not enough; the source URL must match `agigante80/<name>` too.
- **Embed shields.io badges, license badges, CI badges, or any badge wall.** Same opinionation as `/add-project`.

## Recovery

If the sync produced unwanted changes:

```bash
git revert HEAD
git push origin main
```

One commit per sync means one revert undoes everything. If you have not yet pushed, `git reset --hard HEAD~1` also works.
