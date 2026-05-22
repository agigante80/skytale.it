# 🤖 Backfill prompt: bring every project up to the v5 template

After patch v5 is merged, run this prompt against your `skytale.it` clone to backfill the remaining 13 projects. Designed to be pasted into Claude Code in chunks (one tier at a time) or run end-to-end.

The first project, `actual-mcp-server`, is already done as the worked example. Use it as the visual reference for what "fully filled" looks like.

> **Important**: many projects will not have npm packages or Docker images. Some will not have any numeric stats worth showing. **That is fine.** Every new frontmatter field is optional. Sections silently hide when their data is empty. Do not invent stats. Do not pad audience cards. Do not write a comparison table just because the field exists. **Honesty over completeness.**

---

## The prompt

Copy from `>` to the end of this section into Claude Code.

> Please backfill the remaining 13 project MDX files in this repo to use the v5 template. Each project lives at `src/content/projects/{slug}.mdx`. The worked example is `actual-mcp-server.mdx`; use it as the visual reference.
>
> ### Ground rules
>
> 1. **Read the project's GitHub README first** before editing its MDX. The README is the source of truth. I'll list the GitHub URL for each project below.
> 2. **Only add a field if you can support it from real data in the README.** Do not invent stats, do not invent audience personas, do not invent a comparison.
> 3. **Empty is fine.** A field omitted from frontmatter means the section silently disappears from the page. That is the desired behaviour for projects where the section is not warranted.
> 4. **No em dashes, no en dashes.** Use periods, semicolons, or ASCII hyphens. This is a repo-wide style rule.
> 5. **Verify each project after editing it.** Run `npm run dev`, visit `/projects/{slug}`, confirm the page renders without errors and that any section you filled is visible. Then move to the next project.
> 6. **Commit per project** with a message like `content({slug}): backfill v5 template`. One commit per project keeps each reviewable.
>
> ### Field-by-field guidance
>
> For every project, work through this checklist. Skip a field if the data is not in the README or the project does not warrant it.
>
> **Required (probably already filled, but check):**
> - `title`, `description`, `category`, `tier`, `status`, `techStack`, `githubUrl`, `featured`
> - `lastSyncedFrom`: update to the current date
>
> **Always-add for v5:**
> - `tagline`: one line, "sticker" energy. Pull from the README's tagline / lead paragraph / "Why this project?" section. **If the README has none, write one based on the project's core promise.** Keep it under 80 characters. Examples:
>   - actual-mcp-server: "Talk to your budget. Run it anywhere. Trust it in production."
>   - vpnsentinel (suggested): "VPN failures that hide from the user. Now they don't."
>   - pic2vid (suggested): "Images in. Video out. One flag away."
>
> **Add if data exists:**
> - `version`: latest released version. Will be overridden by `sync-stats.mjs` if the project has a GitHub release; if not, set whatever the README declares.
> - `links`: only fields that point at real URLs.
>   - `npm`: if the project has an npm package (check for `https://www.npmjs.com/package/...` in README badges or install instructions)
>   - `dockerHub`: if the project ships a Docker image to Docker Hub (look for `agigante80/{name}` or similar). GHCR alone doesn't populate `dockerPulls` so listing it is optional.
>   - `docs`: README permalink, or a docs site if one exists
>   - `demoVideo`: if there's a YouTube / Loom link
> - `stats`: 2 to 4 numeric proof points from the README. Examples by category:
>   - **For tools with a real install base**: API coverage %, tool count, supported clients, plugin count
>   - **For infra projects**: probe types, monitored hosts, alert channels, latency targets
>   - **For content sites**: articles published, languages supported, automation steps
>   - **For LEGO-City-Linux-style fix-log projects**: "15 launch flags documented", "7 crash modes solved", "1 unique fix"
>   - **If nothing fits**: omit the field entirely. The live stats sync will still add GitHub stars to the strip on its own.
> - `audience`: 2 to 4 cards describing **specific** users. Only if the project clearly has distinct audiences. Most T2 / T3 projects have one obvious audience and don't need this section.
>   - Good: `{ who: "Multi-budget families", what: "Switch budgets mid-conversation without restarting." }`
>   - Bad: `{ who: "Developers", what: "Useful for coding." }` (generic = skip the section)
> - `quickstart`: only for **installable** projects (npm, Docker, git clone + script). For doc-only repos like lego-city-undercover-linux, this is the **launch flag string**, which is still a quickstart.
>   - `primaryLabel` should name the install method (Docker, npm, git clone, Steam launch options).
>   - `primaryCode` is a copy-pasteable code block.
>   - `altLabel` + `altCode` only if a meaningful second path exists.
>   - `docsHref` should point at the README's "Quick Start" anchor.
> - `comparison`: only when there are at least two named alternatives in the same problem space AND the README already has a comparison table or list. **This is the rarest section.** Likely only applicable to actual-mcp-server, possibly forge-kit, possibly vpnsentinel. Most projects skip this.
>
> ### MDX body
>
> The MDX body (everything below the frontmatter `---`) should contain the narrative sections:
>
> - `## The problem` — one to two paragraphs. What gap does this fill?
> - `## What this does that the others do not` (T1 only) — three to six `### subsections` of one paragraph each. Each subsection is a differentiator.
> - `## Architecture` (T1 / T2 only) — one paragraph of prose, optionally followed by a `\`\`\`` code block with an ASCII diagram or config sketch.
> - `## Decisions worth knowing about` (T1 only) — two to three `### subsections`. Each is a tradeoff the project made and the reasoning. Doubles as future article fodder.
>
> Lower tiers may use only `## The problem` and a single paragraph of `## How I built it` (or skip the latter). Match the existing MDX structure where it already works.
>
> ### Projects to backfill (in priority order)
>
> Work through this list top to bottom. Skip a section if there's no data for it.
>
> | Slug | Tier | GitHub URL | Notes |
> |---|---|---|---|
> | `vpnsentinel` | 1 | https://github.com/agigante80/VPNSentinel | Has Docker. Likely no npm. Multi-vantage point monitoring is the core differentiator. |
> | `agentgate` | 1 | https://github.com/agigante80/AgentGate | Python service, likely no npm. The "messaging-platform-as-control-plane" angle is unique. |
> | `forge-kit` | 2 | https://github.com/agigante80/forge-kit | Check the README; if it has a comparison with claude-flow / aider / etc. add the table. |
> | `safeharbor-media-stack` | 2 | https://github.com/agigante80/SafeHarbor-Media-Stack | Docker Compose stack. Quickstart should be `docker compose up`. |
> | `homeassistant-bypass-wiring-fan` | 2 | https://github.com/agigante80/homeassistant-bypass-wiring-fan | Hardware + automation guide. Quickstart is the YAML automation snippet. |
> | `actual-sync` | 2 | https://github.com/agigante80/Actual-sync | Companion to actual-mcp-server. Likely has Docker. |
> | `pic2vid` | 3 | https://github.com/agigante80/pic2vid | Bash + FFmpeg. Quickstart is one shell command. |
> | `qr-with-icon` | 3 | https://github.com/agigante80/qr-with-icon | Python utility. Quickstart is `pip install` + one command. |
> | `lego-city-undercover-linux` | 3 | https://github.com/agigante80/lego-city-undercover-linux | The "quickstart" is the launch flag string. Existing MDX has it; lift into frontmatter. |
> | `contentgen-ai` | 3 | https://github.com/agigante80/ContentGen-AI | Python content pipeline. |
> | `vibe-coding-prompts` | 3 | https://github.com/agigante80/vibe-coding-prompts | Curated prompts repo. Stats: count of prompts. |
> | `ondahertz-es` | 3 | https://github.com/agigante80/OndaHertz_es | AI content site about radio. Stats: posts published, languages. Likely no quickstart. |
> | `galena-es` | 3 | https://github.com/agigante80/galena_es | AI content site about minerals. Same shape as ondahertz-es. |
>
> ### Per-project workflow
>
> For each project in the list:
>
> 1. Open the README at the GitHub URL. Read the first 25% carefully (tagline, problem framing, install). Skim the rest for stat hooks and comparison tables.
> 2. Open the existing MDX file. Note what's already there.
> 3. Edit the frontmatter:
>    - Add `tagline` (always).
>    - Add `links` if any external URLs apply.
>    - Add `stats` if there are at least two real numeric proof points.
>    - Add `audience` if there are at least two distinct user personas.
>    - Add `quickstart` if there's a copy-pasteable install / setup line.
>    - Add `comparison` only if the README already has a comparison table.
>    - Update `lastSyncedFrom` to today.
> 4. If the MDX body needs rewriting to use the new heading structure, do it. Otherwise leave the prose alone.
> 5. Run `npm run dev` and visit `/projects/{slug}`. Verify the page renders, the filled sections appear, and the unfilled sections don't.
> 6. Commit: `git commit -am "content({slug}): backfill v5 template"`
> 7. Move to the next project.
>
> ### After all 13 are done
>
> 1. Run `node scripts/sync-stats.mjs` once to populate live stats for every project that has a `githubUrl` (and any with `links.npm` / `links.dockerHub`).
> 2. Commit the updated `src/data/stats.json`.
> 3. Build the site: `npm run build`. Confirm no errors.
> 4. Visit each project page in the preview and spot-check.
> 5. Push the branch and open a PR. Title suggestion: `content: backfill v5 template across 13 projects`.
>
> ### Final reality check
>
> If after reading a project's README you realise the project genuinely has nothing new to fill (a one-paragraph fix log with no stats, no audiences, no install) **just bump `lastSyncedFrom` and move on**. The page will still render; it just won't grow new sections. That's correct behaviour for a sharp Tier-3 utility.

---

## Why this prompt is structured this way

A few choices worth surfacing, so you can tweak them if you disagree:

- **Per-project commits** instead of one giant backfill commit: each project becomes independently reviewable and revertible. Git history reads as a content timeline rather than a single megabatch.
- **Read README first** is non-negotiable: most of these projects have meaningful README evolution since the MDX was last written. The MDX summaries lag the source.
- **Honesty over completeness**: a half-filled template that's accurate beats a fully-filled template that invents stats. The frontmatter schema is permissive on purpose.
- **Live stats run after** content backfill, not before: if you run `sync-stats.mjs` first, projects without `links.npm` etc. will get only GitHub stars in their JSON, which is fine but means you'll have to re-run after adding more links. Adding links during the backfill and syncing at the end is cleaner.

## What you'll have at the end

13 project pages, each with the structured sections that actually apply, none with the sections that don't. A `stats.json` populated by a one-shot manual sync. A `redesign/v5-content-backfill` branch with 13 commits, each named for its project. From there the daily Action takes over.
