#!/usr/bin/env node
/**
 * fetch-medium-covers.mjs
 *
 * Medium articles are pulled from RSS at build time (see src/lib/articles.ts).
 * Their cover images live on Medium's CDN (cdn-images-1.medium.com), and
 * hot-linking them hurts the page two ways: the CDN sets a third-party cookie
 * (tanks the Lighthouse Best Practices score) and the images are unoptimized.
 *
 * This script self-hosts them: it reads the same Medium feed, extracts each
 * post's first content image, and downloads it to
 *   src/assets/images/articles/medium/<slug>.jpg
 * where <slug> matches the slug articles.ts derives (last path segment of the
 * Medium URL). Once a cover sits under src/, Astro's <Image> pipeline optimizes
 * it (WebP/AVIF, responsive srcset, first-party URL) exactly like the LinkedIn
 * covers, and resolveArticleCover() picks it up by slug.
 *
 * Idempotent and non-blocking: existing files are skipped, and any failure
 * (feed down, image 404) is logged and skipped so a missing cover gracefully
 * falls back to the decorative cipher cover rather than breaking the build.
 * Run on demand after new Medium posts appear: `node scripts/fetch-medium-covers.mjs`.
 */
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Parser from 'rss-parser';

const FEED = 'https://medium.com/feed/@andrea.gigante';
const OUT_DIR = './src/assets/images/articles/medium';

function extOf(contentType, url) {
  if (contentType?.includes('png')) return 'png';
  if (contentType?.includes('webp')) return 'webp';
  if (contentType?.includes('gif')) return 'gif';
  if (/\.png(\?|$)/i.test(url)) return 'png';
  if (/\.webp(\?|$)/i.test(url)) return 'webp';
  return 'jpg';
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const existing = new Set((await readdir(OUT_DIR).catch(() => [])).map(f => f.replace(/\.[^.]+$/, '')));

  let feed;
  try {
    const parser = new Parser({ customFields: { item: [['content:encoded', 'contentEncoded']] } });
    feed = await parser.parseURL(FEED);
  } catch (e) {
    console.warn('! Could not read Medium feed, nothing to do:', e.message);
    return; // never block
  }

  let fetched = 0, skipped = 0, failed = 0;
  for (const item of feed.items || []) {
    const url = item.link || '';
    const slug = url.split('/').pop()?.split('?')[0] || '';
    if (!slug) continue;
    if (existing.has(slug)) { skipped++; continue; }

    const content = item.contentEncoded || item.content || '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
    const imgUrl = imgMatch ? imgMatch[1] : undefined;
    if (!imgUrl) { console.warn(`  ! ${slug}: no cover image in feed`); failed++; continue; }

    try {
      const res = await fetch(imgUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = extOf(res.headers.get('content-type'), imgUrl);
      await writeFile(join(OUT_DIR, `${slug}.${ext}`), buf);
      console.log(`  + ${slug}.${ext} (${Math.round(buf.length / 1024)}KB)`);
      fetched++;
    } catch (e) {
      console.warn(`  ! ${slug}: ${e.message}`);
      failed++;
    }
  }
  console.log(`Done: ${fetched} fetched, ${skipped} already present, ${failed} skipped.`);
}

main();
