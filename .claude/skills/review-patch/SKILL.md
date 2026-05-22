---
name: review-patch
description: Review an incoming redesign or patch zip before it is applied. Extracts the patch, audits every file for compatibility with the current codebase, scans for forbidden em and en dashes, and reports findings with an apply recommendation. Does not apply, build, or commit anything.
user_invocable: true
arguments: optional path to a zip; defaults to the newest zip in temp/
---

# Review Patch

You are reviewing an incoming patch (usually a redesign round) before it gets applied. Patches arrive as zip files in `temp/` (which is gitignored, so patch artifacts never reach the repo). Your job is to **review and report**, not to apply. The user decides whether and how to apply after seeing your report.

## Hard rule: no em dashes or en dashes

Never write em dashes or en dashes in your report or anywhere else. Use hyphens only for compound modifiers. This is a project rule (see CLAUDE.md).

## Steps

### 1. Locate the patch

If the user gave a path, use it. Otherwise pick the newest zip in `temp/`:

```bash
ls -t temp/*.zip | head -1
```

Watch for misleading filenames: a file named `vN.zip` has, in the past, actually contained an older patch. Trust the zip's real contents, not its name.

### 2. Extract and inventory

```bash
unzip -l <zip>            # list contents first
cd temp && unzip -o <zip> && cd ..
```

Patches use a `patch-vN/` top-level folder containing `CHANGELOG.md`, `CLAUDE-INSTRUCTIONS.md`, and a tree (usually `src/`) mirroring the repo layout.

### 3. Read the patch's own docs

Read `CHANGELOG.md` and `CLAUDE-INSTRUCTIONS.md` inside the patch. They state the intended scope, which files are replaced versus new, any dependency changes, and the suggested commit message and branch name. Treat these as claims to verify, not facts.

### 4. Read every source file in the patch

Read each `.astro`, `.ts`, `.css`, `.mdx`, `.mjs`, `.yml`, and similar file in full. Do not skim. You are checking the real content against the current repo, not trusting the changelog.

### 5. Compatibility audit

For each file the patch **replaces**, compare against the current repo version and flag anything that regresses recent work. Specific checks, learned from past rounds:

- **Schema changes** (`src/content.config.ts`): new fields must be `.optional()` or carry `.default()`, or existing MDX stops validating. Confirm no existing field is removed or retyped.
- **Replaced pages and components**: confirm they preserve current behavior. For example `src/pages/projects/[id].astro` must keep the two-column sticky-sidebar layout, the git-mtime `dateModified`, the JSON-LD schema injection, `ogImage` wiring, and the related-articles section.
- **Design tokens**: components should reference `var(--color-*)` and `var(--font-*)`, not hardcoded hex values. A hardcoded color that ignores the single dark theme is a finding.
- **Astro scoped styles plus innerHTML**: any client script that builds HTML with `innerHTML` loses scoped styles unless it copies the `data-astro-cid-*` attribute onto the new elements. This bit the ScytaleBand component once.
- **Regex literals in `.astro` frontmatter**: a `/.../`-style regex literal can break the Astro compiler with an "Unexpected export" error. Prefer string methods like `endsWith` or `slice`.
- **`prose-*` classes are dead**: `@tailwindcss/typography` is not installed. Any `prose` or `prose-*` class does nothing. MDX case-study bodies are styled by the hand-rolled `.project-body` CSS in `[id].astro`.
- **CI and deploy**: a `[skip ci]` token in a commit message also skips the Cloudflare Workers Build, so the change never deploys. Flag any workflow that commits with `[skip ci]` content that needs to ship.
- **External resources**: a new script or font origin needs a matching entry in `public/_headers` CSP, or it is silently blocked in production.

### 6. Dash scan

Scan every patch source file for forbidden dashes:

```bash
grep -rnP '[\x{2013}\x{2014}]' temp/patch-vN/src temp/patch-vN/scripts 2>/dev/null
```

Also scan quoted prose for the ` - ` (space-hyphen-space) clause-separator substitute, which reads as an em dash. Report every hit with file and line. The PreToolUse hook blocks Claude from writing dashes into files, but it does not scrub an incoming patch, so this scan is the safety net for patch content.

### 7. Report

Give the user:

- **What the patch does**: concise, written from your own reading, not copied from the changelog.
- **Compatibility**: a table of replaced files and whether each preserves current behavior.
- **Findings**: dashes, hardcoded colors, regressions, Astro gotchas, each with `file:line`.
- **Dependency changes** the patch requires.
- **Apply recommendation**: which findings to fix before applying, and whether to apply on a branch or direct to main.

## What this skill does NOT do

- It does not apply the patch, copy files, install dependencies, run the build, commit, or push. Those steps happen only after the user reviews this report and says how to proceed.
- It does not delete the zip or other `temp/` contents.
