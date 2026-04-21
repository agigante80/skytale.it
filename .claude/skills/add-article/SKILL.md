---
name: add-article
description: Add a LinkedIn article to the site. Fetches metadata, downloads cover image, adds entry to articles.ts, and publishes (commit + push).
user_invocable: true
arguments: url
---

# Add LinkedIn Article

You are adding a new LinkedIn article to the skytale.it portfolio site.

## Hard rule: no em dashes or en dashes

**NEVER write em dashes (--) or en dashes (-) anywhere** - not in descriptions, titles, TL;DRs, or any other field. Use hyphens (-) only for connecting compound words. Rewrite any sentence that would normally use an em or en dash: use a comma, a colon, parentheses, or split it into two sentences instead.

## Input

The user provides a LinkedIn article URL (e.g., `https://www.linkedin.com/pulse/...`).

## If the URL is a Medium article

Tell the user: "Medium articles are automatically fetched via RSS at build time. No manual entry needed. Just rebuild the site and it will appear."

## Steps for LinkedIn articles

### 1. Fetch article metadata

Use the WebFetch tool on the provided URL to extract the following fields. Each field powers specific SEO outputs. Quality matters:

| Field | What to extract | SEO role |
|-------|----------------|----------|
| **title** | The article headline, as-is from LinkedIn | `<title>` tag, `og:title`, Article schema `headline`. Rendered as `{title} \| Andrea Gigante`. Flag if title alone > 55 chars (total would exceed 60 chars in SERPs) |
| **description** | A compelling search snippet (**max 160 chars**) | `<meta name="description">` and `og:description`. Do not just copy the opening sentence; write it to make someone want to click. |
| **date** | Publication date (`YYYY-MM-DD`) | `article:published_time` OG tag and Article schema `datePublished` |
| **tags** | 2-4 specific, relevant topic tags | `<meta property="article:tag">`. Avoid generic terms like "Article" or "Post"; use meaningful topic labels |
| **og:image URL** | The cover image URL from `<meta property="og:image">` | `og:image` for social sharing previews and Article schema `image` |

### 2. Download cover image

Extract the **URL slug** directly from the LinkedIn pulse URL: it's the path segment after `/pulse/`. For example:
- URL: `https://www.linkedin.com/pulse/where-start-coding-ai-practical-guide-andrea-gigante-o8kie`
- Slug: `where-start-coding-ai-practical-guide-andrea-gigante-o8kie`

Use this slug as the image filename:
```bash
curl -sL -o public/images/articles/<slug>.jpg "<og:image URL>"
```

Verify the file downloaded and is a real cover image (should be > 10KB). Anything smaller is likely a placeholder or icon:
```bash
ls -la public/images/articles/<slug>.jpg
```

If the image is missing or < 10KB, warn the user: the article page will show a platform placeholder instead of a cover image, which is less compelling for social sharing.

### 3. Write a TL;DR

Based on the article content fetched in Step 1, write a **TL;DR**: 2-4 sentences that capture the core insight or argument. This is the main body content on the local detail page at `/articles/<slug>`.

Guidelines:
- It should read as a **standalone summary**. Someone who only reads the TL;DR should understand the article's core argument
- Do not just repeat the description; go deeper
- Contributes to E-E-A-T content quality signals for the local page

### 4. SEO self-check

Before writing the entry, verify all of the following and report the results to the user:

- [ ] `description` is ≤ 160 chars (count the characters)
- [ ] `title` is ≤ 55 chars (warn but don't block if longer)
- [ ] Image file is > 10KB (confirms it's a real cover, not a placeholder)
- [ ] `tags` are specific topic terms (not generic words like "Article", "Post", "LinkedIn")
- [ ] `slug` matches the LinkedIn URL path exactly (no manual truncation or modification)

### 5. Add entry to articles.ts

Open `src/lib/articles.ts` and add a new object to the `linkedinArticles` array. Insert it in chronological order (newest first). Follow this exact format:

```typescript
{
  title: "<title>",
  description: "<description (max 160 chars)>",
  date: new Date('<YYYY-MM-DD>'),
  tags: ["Tag1", "Tag2", "Tag3"],
  url: "<clean URL without tracking params>",
  platform: 'linkedin',
  image: "/images/articles/<slug>.jpg",
  slug: "<slug extracted from URL, exact match>",
  tldr: "<2-4 sentence TL;DR>",
},
```

**Important:** Strip tracking parameters (`trackingId`, `lipi`) from the URL. Keep only the base `/pulse/...` path.

### 6. Publish

Stage and commit the two changed files, then push to `main`:

```bash
git add src/lib/articles.ts public/images/articles/<slug>.jpg
git commit -m "Add article: <title>"
git push origin main
```

### 7. Verify

Tell the user the article has been added and published. Show them:
- Title and date
- Slug and live page URL: `https://www.skytale.it/articles/<slug>` (available once Cloudflare builds)
- Image path and file size
- Description char count
- SEO self-check results (pass/fail for each criterion)
- Commit hash from the push
