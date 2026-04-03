---
title: "skytale.it — Current Site Reference"
description: "Content, design, and assets from existing skytale.it for redesign reference"
last_updated: "2026-04-02"
---

# skytale.it — Current Site Reference

This document captures everything from the existing site that should inform the redesign.

---

## The "Why Skytale.it" Story (KEEP — great branding narrative)

The name comes from the **scytale** (σκυτάλη) — an ancient Greek transposition cipher tool used by Spartans during military campaigns. A parchment strip wrapped around a cylinder of specific diameter; only someone with an identical cylinder could decode the message.

- **Skytale** = Andrea's passion for security and encryption since childhood (steganography with friends)
- **.it** = Italy (country of origin) + Information Technology (his field)

> "For me, Skytale symbolizes clarity, precision, and secure communication — values I strive to embody in my professional journey."

This should remain a prominent part of the redesigned site — it's a unique, memorable brand story.

---

## Current Design System

### Colors
- **Primary accent:** `#82bfce` (teal/cyan)
- **Secondary accent:** `#5b686d` (dark slate)
- **Headings:** `#444` (dark gray)
- **Background:** `#767777` (medium gray)
- **Light text:** `#d8d8d8`
- **Footer:** `#2e3038` (very dark gray)

### Typography
- **Font:** Open Sans (weights: 300 Light, 400 Regular, 700 Bold)

### Notes for Redesign
- The teal/slate palette is professional and distinctive — consider keeping or evolving it
- Open Sans is clean but generic — could upgrade to something with more personality
- Current site feels dated (WordPress theme from ~2017) — needs modern layout, better whitespace

---

## Content to Preserve (Updated)

### Hero / Tagline
- Current: "Bridging Innovation and Business Value"
- Still accurate — keep or refine

### About Section — NEEDS UPDATING
**Current (outdated):**
- "Digital Product Owner" → now **Principal Product Manager**
- Company: QMetric → now **Oracle NetSuite**
- 13+ years experience → now **13+ years** (still correct)

**Keep:**
- "Bridge between business acumen and technical knowledge"
- Industries: Finance, Sports Betting, Insurance, Automotive
- Languages: English, Italian, Spanish
- Personal interests: Security enthusiast, Coffee addict, Sci-fi fan
- Shorinji Kempo (from older version)
- Chess lover, Linux user (from older version)

### Expertise Areas — NEEDS UPDATING
Current four pillars are still valid but should expand:
1. Product Management & Innovation (AI & Data Viz)
2. Agile & Lean Product Delivery
3. Security & Strategic Solutions
4. Collaborative & User-Centric Approach

**Add:** AI-Assisted Development, MCP/Agent Architecture, Self-Hosting & Infrastructure

### Portfolio — NEEDS MAJOR UPDATE
Current site shows only 6 projects. Andrea now has 13 public repos.

**Current portfolio (from site):**
1. ContentGen-AI — AI automation & web dev
2. Personal AI Chat Agent — NLP (in development)
3. Data Visualization Module — UI/UX
4. In-App Advertisement Feature — business impact
5. Breached Data Analysis — cybersecurity
6. Agile Roadmap using Story Mapping — methodology

**Should add (public repos):**
- actual-mcp-server (62 tools, production-grade MCP)
- AgentGate (multi-agent orchestration)
- Actual-sync (bank sync automation)
- VPNSentinel (distributed VPN monitoring)
- SafeHarbor-Media-Stack (self-hosted media on Synology)
- vibe-coding-prompts (AI prompt engineering)
- pic2vid (FFmpeg utility)
- qr-with-icon (QR generator)
- galena_es / OndaHertz_es (AI-generated content sites)

### Contact — KEEP
- GitHub: agigante80
- LinkedIn: agigante
- Email: a.gigante@gmail.com

---

## Existing Image Assets (saved to `assets/reference/`)

### Profile (`assets/reference/profile/`)
- `AndreaGigante.274x274.png` — Main profile photo (may want a new one)
- `apple-touch-icon.png` — Current favicon/touch icon
- `favicon-16x16.png` — Current favicon

### Brand (`assets/reference/brand/`)
- `Skytale-300x171.png` — Current Skytale logo

### Portfolio (`assets/reference/portfolio/`)
- `1.jpg` — ContentGen-AI screenshot
- `2.jpg` — Personal chatbot illustration
- `3.jpg` — Data visualization dashboard
- `4.jpg` — In-app advertisement illustration
- `5.jpg` — Breached data visualization
- `6.jpg` — Agile story map illustration

### Banners (`assets/reference/banners/`)
- `header.jpg` — Current hero background
- `ryan-tang-2000x1200.jpg` — Dark landscape
- `sergio-rola-2000x1200.jpg` — Dark atmospheric
- `rishi-deep-272926_dark-2000x1333.jpg` — Dark moody
- `jose-martin-ramirez-c-651_really_dark-5184x3456.jpg` — Very dark (5K)
- `pexels-photo-296324_dark-4928x3264.jpeg` — Dark abstract (5K)

---

## New Images Needed

These projects don't have portfolio thumbnails yet. Andrea will generate them — prompts to be provided when we build the portfolio section:

1. **actual-mcp-server** — Needs: dashboard/API visualization
2. **AgentGate** — Needs: multi-agent orchestration diagram
3. **Actual-sync** — Needs: bank sync / finance automation visual
4. **VPNSentinel** — Needs: security monitoring dashboard
5. **SafeHarbor-Media-Stack** — Needs: self-hosted infrastructure / NAS visual
6. **vibe-coding-prompts** — Needs: AI prompt engineering visual
7. **pic2vid** — Needs: image-to-video conversion visual
8. **qr-with-icon** — Could use a generated QR code as its own thumbnail
9. **galena_es / OndaHertz_es** — Could screenshot the live sites

Also needed:
- **New hero image** for the redesigned site
- **New professional headshot** (the current one is from ~2017)
- **New Skytale logo** (or refined version)

---

## SEO Metadata from Current Site

- **Title:** "Andrea Gigante | Product owner" → update to "Andrea Gigante | Principal Product Manager"
- **Description:** "Personal website of the agile product owner Andrea Gigante, specialised in digital products" → rewrite
- **Google verification:** `e9ldlWE1cGp9uRxCGRq0kcLMMOfTmTz0yWkUT9bzEMo`
- **Microsoft verification:** `365AF03E7B8A580F183CF123919A511A`
- **Pinterest verification:** `b66de94b560f45599c7f53104841cd20`

Keep verification tags if still valid; update meta title and description for the redesign.

---

## Site Structure (Current vs Proposed)

### Current (single-page + 1 subpage)
- Home (hero → about → expertise → portfolio → contact)
- /why-skytale-it/

### Proposed for Redesign
- **Home** — Hero, brief intro, featured projects, latest articles
- **About** — Full bio, skills, the Skytale story, languages, interests
- **Projects** — Full portfolio with filters (AI/MCP, Security, Finance, Utilities)
- **Articles** — Blog section (sourced from articles-as-Andrea repo)
- **Contact** — Links, email, social
