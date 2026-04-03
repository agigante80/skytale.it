# Contributing

Thanks for your interest in contributing to skytale.it! This is a personal portfolio site, so contributions are focused on bug fixes, accessibility improvements, and performance enhancements.

## Development Setup

```bash
npm install
npm run dev    # http://localhost:4321
```

Requires **Node.js >= 22.12.0**.

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm run build` to verify the production build succeeds
4. Submit a pull request

## Code Style

No linter or formatter is configured. Match the patterns you see in existing code:

- Astro components use Tailwind utility classes with CSS custom properties (`var(--color-*)`)
- Design tokens are defined in `src/styles/global.css` via Tailwind v4's `@theme` directive
- TypeScript strict mode is enabled

## Adding Content

**Projects:** Create an MDX file in `src/content/projects/` following the schema in `src/content.config.ts`.

**LinkedIn Articles:** Add an entry to the `linkedinArticles` array in `src/lib/articles.ts`.

## Reporting Issues

Use [GitHub Issues](https://github.com/agigante80/skytale.it/issues) for bug reports and feature requests.
