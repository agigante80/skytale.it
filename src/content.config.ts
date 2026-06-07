import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Project frontmatter schema.
 *
 * v6 adds the optional `builtWith` field: an array of other project slugs
 * in this collection that the current project depends on or extends. Surfaces
 * in the sidebar as a "Built with" cross-link card on the project page.
 *
 * Everything else is unchanged from v5.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
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
    heroImage: image().optional(),
    relatedArticles: z.array(z.string()).default([]),
    lastSyncedFrom: z.string().datetime().optional(),

    tagline: z.string().optional(),
    version: z.string().optional(),

    links: z.object({
      npm: z.string().url().optional(),
      docker: z.string().url().optional(),
      dockerHub: z.string().url().optional(),
      docs: z.string().url().optional(),
      demoVideo: z.string().url().optional(),
    }).optional(),

    stats: z.array(z.object({
      value: z.string(),
      unit: z.string().optional(),
      label: z.string(),
      sub: z.string().optional(),
    })).optional(),

    audience: z.array(z.object({
      who: z.string(),
      what: z.string(),
    })).optional(),

    quickstart: z.object({
      primaryLabel: z.string().default('Docker'),
      primaryCode: z.string(),
      altLabel: z.string().optional(),
      altCode: z.string().optional(),
      docsHref: z.string().optional(),
    }).optional(),

    comparison: z.object({
      snapshotDate: z.string(),
      competitors: z.array(z.string()),
      rows: z.array(z.object({
        group: z.string().optional(),
        label: z.string(),
        cells: z.array(z.string()),
      })),
      caption: z.string().optional(),
    }).optional(),

    /* v6: cross-project links surfaced as a sidebar card.
       Each entry is the slug (filename without .mdx) of another project. */
    builtWith: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
