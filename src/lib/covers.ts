/**
 * Resolve an article cover image to an importable Astro image asset so the build
 * can optimize it (AVIF/WebP, responsive srcset, intrinsic dimensions).
 *
 * Covers live in src/assets/images/articles/ (Astro only optimizes images under
 * src/, never public/). Two cases:
 *   - LinkedIn covers are committed by hand / the add-article skill as
 *     "<name>.jpg"; articles.ts stores the path "/images/articles/<name>.jpg".
 *     We match on the filename stem.
 *   - Medium covers are self-hosted by scripts/fetch-medium-covers.mjs into
 *     medium/<slug>.<ext>; articles.ts stores a remote cdn-images-1.medium.com
 *     URL for them, so the stored path is useless here and we match on the slug.
 *
 * Returns undefined when nothing matches, so callers fall back to the
 * decorative cipher cover (e.g. a brand-new Medium post whose cover has not been
 * fetched yet). Matching by stem keeps a single index for both folders.
 */
import type { ImageMetadata } from 'astro';

const assets = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/articles/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const byStem: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(assets)) {
  const stem = path.split('/').pop()?.replace(/\.[^.]+$/, '');
  if (stem) byStem[stem] = mod.default;
}

const stemOf = (p: string) => p.split('/').pop()?.replace(/\.[^.]+$/, '');

export function resolveArticleCover(image?: string, slug?: string): ImageMetadata | undefined {
  if (image && !image.startsWith('http')) {
    const stem = stemOf(image);
    if (stem && byStem[stem]) return byStem[stem];
  }
  if (slug && byStem[slug]) return byStem[slug];
  return undefined;
}
