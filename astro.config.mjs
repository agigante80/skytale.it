// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.skytale.it',
  // Mobile-first responsive images: every <Image>/<Picture> defaults to a
  // constrained layout, so Astro auto-generates srcset + sizes scaled down to
  // the source width. Sharp (bundled) does the AVIF/WebP encoding at build time.
  image: {
    layout: 'constrained',
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith('/404/') && !page.endsWith('/404'),
    }),
  ],
});
