import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['AI/MCP', 'Security', 'Finance', 'Utilities', 'Content']),
    tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    techStack: z.array(z.string()),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    metrics: z.string().optional(),
    sortOrder: z.number().default(99),
  }),
});

export const collections = { projects };
