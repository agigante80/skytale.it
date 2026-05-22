#!/usr/bin/env node
/**
 * sync-stats.mjs
 *
 * Reads every project MDX file, looks at its links + githubUrl, fetches
 * public stats from npm / Docker Hub / GitHub, writes one merged JSON
 * file at src/data/stats.json.
 *
 * Run by .github/workflows/sync-stats.yml on a cron. Designed to be
 * idempotent and never block a build: if a fetch fails, the previous
 * value is kept and the script exits 0.
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import matter from 'gray-matter';

const PROJECTS_DIR = './src/content/projects';
const OUT = './src/data/stats.json';
const GH_TOKEN = process.env.GITHUB_TOKEN;

async function fetchJson(url, headers = {}) {
  try {
    const r = await fetch(url, { headers });
    if (!r.ok) {
      console.warn(`  ! ${url} -> ${r.status}`);
      return null;
    }
    return await r.json();
  } catch (e) {
    console.warn(`  ! ${url} -> ${e.message}`);
    return null;
  }
}

function extractNpmPkg(url) {
  return url?.match(/npmjs\.com\/package\/([^/?#]+)/)?.[1] ?? null;
}
function extractDockerHubPath(url) {
  return url?.match(/hub\.docker\.com\/r\/([^/]+\/[^/?#]+)/)?.[1] ?? null;
}
function extractGitHubPath(url) {
  return url?.match(/github\.com\/([^/]+\/[^/?#]+)/)?.[1]?.replace(/\.git$/, '') ?? null;
}

async function statsFor(slug, fm) {
  const out = {};

  // npm: monthly downloads + latest version
  const npmPkg = extractNpmPkg(fm.links?.npm);
  if (npmPkg) {
    const dl = await fetchJson(`https://api.npmjs.org/downloads/point/last-month/${npmPkg}`);
    if (dl?.downloads != null) out.npmDownloads = dl.downloads;
    const meta = await fetchJson(`https://registry.npmjs.org/${npmPkg}/latest`);
    if (meta?.version) out.version = meta.version;
  }

  // Docker Hub: total pull count
  const dhPath = extractDockerHubPath(fm.links?.dockerHub);
  if (dhPath) {
    const d = await fetchJson(`https://hub.docker.com/v2/repositories/${dhPath}/`);
    if (d?.pull_count != null) out.dockerPulls = d.pull_count;
  }

  // GitHub: stars, forks, latest release
  const ghPath = extractGitHubPath(fm.githubUrl);
  if (ghPath) {
    const headers = GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {};
    const repo = await fetchJson(`https://api.github.com/repos/${ghPath}`, headers);
    if (repo) {
      if (repo.stargazers_count != null) out.stars = repo.stargazers_count;
      if (repo.forks_count != null) out.forks = repo.forks_count;
    }
    const release = await fetchJson(`https://api.github.com/repos/${ghPath}/releases/latest`, headers);
    if (release) {
      if (!out.version && release.tag_name) out.version = release.tag_name.replace(/^v/, '');
      if (release.published_at) out.releasedAt = release.published_at;
    }
  }

  return out;
}

async function loadExisting() {
  try { return JSON.parse(await readFile(OUT, 'utf8')); }
  catch { return {}; }
}

async function main() {
  const existing = await loadExisting();
  const files = (await readdir(PROJECTS_DIR)).filter(f => f.endsWith('.mdx'));
  const merged = {};

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const raw = await readFile(join(PROJECTS_DIR, file), 'utf8');
    const { data: fm } = matter(raw);

    console.log(`> ${slug}`);
    const fetched = await statsFor(slug, fm);

    // Merge: anything fetched wins; gaps fall back to the previous value
    // so a transient failure does not erase a known-good number.
    const previous = existing[slug] ?? {};
    merged[slug] = {
      ...previous,
      ...fetched,
      syncedAt: new Date().toISOString(),
    };
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(merged, null, 2) + '\n');
  console.log(`\nWrote stats for ${Object.keys(merged).length} projects to ${OUT}`);
}

main().catch(err => {
  console.error('sync-stats failed:', err);
  process.exitCode = 0; // never break the build
});
