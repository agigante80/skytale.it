import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Project frontmatter schema.
 *
 * v5 adds the template-driven fields used by the rewritten /projects/[id]
 * page: tagline, version, links, stats, audience, quickstart, comparison.
 * All new fields are optional. Old MDX keeps rendering; new sections light
 * up only when the data exists.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    /* Existing fields (unchanged) */
    title: z.string(),
    description: z.string(),
    category: z.enum(['AI/MCP', 'Security', 'Finance', 'Utilities', 'Content']),
    tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    status: z.enum(['active', 'maintained', 'archived', 'experimental']),
    techStack: z.array(z.string()),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    metrics: z.string().optional(),
    heroImage: z.string().optional(),
    relatedArticles: z.array(z.string()).default([]),
    lastSyncedFrom: z.string().datetime().optional(),

    /* === v5 additions === */

    /* One-line "sticker" line shown under the project title. */
    tagline: z.string().optional(),

    /* Latest released version. Falls back to live stats sync if available. */
    version: z.string().optional(),

    /* External links surfaced as CTA buttons in the hero. */
    links: z.object({
      npm: z.string().url().optional(),
      docker: z.string().url().optional(),
      dockerHub: z.string().url().optional(),
      docs: z.string().url().optional(),
      demoVideo: z.string().url().optional(),
    }).optional(),

    /* Stat strip cards (manual entries; live stats merge on top). */
    stats: z.array(z.object({
      value: z.string(),                  // "63" or "84%"
      unit: z.string().optional(),        // "tools"
      label: z.string(),                  // "Most comprehensive"
      sub: z.string().optional(),         // "Across 12 categories"
    })).optional(),

    /* Audience cards. Two to four. */
    audience: z.array(z.object({
      who: z.string(),
      what: z.string(),
    })).optional(),

    /* Quick-start code block(s). Primary required if section is used. */
    quickstart: z.object({
      primaryLabel: z.string().default('Docker'),
      primaryCode: z.string(),
      altLabel: z.string().optional(),
      altCode: z.string().optional(),
      docsHref: z.string().optional(),
    }).optional(),

    /* Comparison table. Snapshot date + competitor column headers + rows. */
    comparison: z.object({
      snapshotDate: z.string(),
      competitors: z.array(z.string()),   // headers other than "this project"
      rows: z.array(z.object({
        group: z.string().optional(),     // group separator label
        label: z.string(),
        cells: z.array(z.string()),       // length === 1 + competitors.length
      })),
      caption: z.string().optional(),     // optional "when to choose another" line
    }).optional(),
  }),
});

export const collections = { projects };
