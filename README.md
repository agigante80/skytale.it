# Skytale.it

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/small.svg)](https://astro.build)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy: Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020.svg)](https://pages.cloudflare.com)

Personal portfolio and articles website for **Andrea Gigante** — Principal Product Manager, builder, and security enthusiast.

**Live site:** [www.skytale.it](https://www.skytale.it)

## About the Name

The **scytale** (Greek: σκυτάλη) was an ancient Spartan transposition cipher — a parchment strip wrapped around a cylinder that only someone with an identical cylinder could decode. **Skytale** represents a passion for security and encryption. **.it** stands for Italy and Information Technology.

## Tech Stack

- **[Astro 6](https://astro.build)** — Static site generation with content collections
- **[Tailwind CSS 4](https://tailwindcss.com)** — Utility-first styling (CSS-first config via `@tailwindcss/vite`)
- **[MDX](https://mdxjs.com)** — Rich content for project case studies
- **TypeScript** — Strict mode
- **Cloudflare Pages** — Hosting and edge delivery

## Getting Started

**Requirements:** Node.js >= 22.12.0

```bash
# Clone the repository
git clone https://github.com/agigante80/skytale.it.git
cd skytale.it

# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
  components/     # Astro components (Nav, Footer, cards, etc.)
  content/        # Content collections
    projects/     # Project case studies (MDX)
  layouts/        # Base layout with SEO, OG tags, JSON-LD
  lib/            # Articles system (LinkedIn + Medium RSS)
  pages/          # Routes: /, /about, /projects, /articles, /privacy
  styles/         # Design tokens and global styles
public/           # Static assets, favicons, robots.txt, llms.txt
```

### Content Systems

**Projects** use Astro content collections with MDX files and Zod schema validation. Each project has a tier (1-3) determining its display: Tier 1 gets a full case-study page, Tier 2 a detailed card, Tier 3 a compact grid card.

**Articles** are a hybrid system in `src/lib/articles.ts` — LinkedIn articles are listed manually (no public API), Medium articles are fetched via RSS at build time. Both sources merge and sort by date.

## Author

**Andrea Gigante** — Principal Product Manager at Oracle NetSuite

- [LinkedIn](https://linkedin.com/in/agigante)
- [GitHub](https://github.com/agigante80)
- [Website](https://www.skytale.it)

## License

[MIT](LICENSE)
