import Parser from 'rss-parser';

export interface Article {
  title: string;
  description: string;
  date: Date;
  tags: string[];
  url: string;
  platform: 'medium' | 'linkedin';
  image?: string;
}

// LinkedIn articles - add manually here (LinkedIn has no public article API)
const linkedinArticles: Article[] = [
  {
    title: "Stages of AI-Assisted Development: How My Workflow Evolved",
    description: "A practitioner's account of how AI integration in software development evolved incrementally, from basic coding assistance to structured spec-first workflows and agent-based systems.",
    date: new Date('2026-03-18'),
    tags: ["AI", "Software Development", "Developer Workflow"],
    url: "https://www.linkedin.com/pulse/stages-ai-assisted-development-how-my-workflow-evolved-andrea-gigante-vpnqe",
    platform: 'linkedin',
    image: "/images/articles/stages-ai-assisted-development.jpg",
  },
  {
    title: "Why I Build Tools Like This (and Why I Share Them)",
    description: "Building is how I learn. Writing code forces me to deal with real constraints, trade-offs, and failures. I construct small tools and experimental projects publicly to understand systems deeply.",
    date: new Date('2026-03-13'),
    tags: ["AI", "Open Source", "Software Engineering"],
    url: "https://www.linkedin.com/pulse/why-i-build-tools-like-share-them-andrea-gigante-ok9ne",
    platform: 'linkedin',
    image: "/images/articles/why-i-build-tools.jpg",
  },
  {
    title: "How AI Will Affect the Skills of the New Generation: What We May Lose and Gain",
    description: "Exploring how AI adoption impacts skill development in younger generations. Potential cognitive losses like declining critical thinking alongside emerging capabilities like prompt engineering.",
    date: new Date('2025-08-01'),
    tags: ["AI", "Future of Work", "Education"],
    url: "https://www.linkedin.com/pulse/how-ai-affect-skills-new-generation-what-we-may-lose-gain-gigante-4attf",
    platform: 'linkedin',
    image: "/images/articles/ai-skills-generation.jpg",
  },
  {
    title: "P.U.N.K.: The Attributes That Define a Great Product!",
    description: "A framework for evaluating product quality through four key attributes: Proposition, Usability, Necessity, and Kansei. Analyzing Google Glass as a case study.",
    date: new Date('2018-07-12'),
    tags: ["Product Management", "Product Strategy", "UX"],
    url: "https://www.linkedin.com/pulse/punk-attributes-define-great-product-andrea-gigante",
    platform: 'linkedin',
    image: "/images/articles/punk-product.jpg",
  },
  {
    title: "Creating an Agile Roadmap Using Story Mapping",
    description: "Story mapping provides a visual framework that organizes user stories to clarify system functionality, identify backlog gaps, and plan releases that deliver consistent value.",
    date: new Date('2018-07-01'),
    tags: ["Agile", "Product Management", "Story Mapping"],
    url: "https://www.linkedin.com/pulse/creating-agile-roadmap-using-story-mapping-andrea-gigante",
    platform: 'linkedin',
    image: "/images/articles/agile-story-mapping.jpg",
  },
];

async function fetchMediumArticles(): Promise<Article[]> {
  try {
    const parser = new Parser({
      customFields: { item: [['content:encoded', 'contentEncoded']] },
    });
    const feed = await parser.parseURL('https://medium.com/feed/@andrea.gigante');

    return (feed.items || []).map(item => {
      // Extract first image from content
      const content = (item as any).contentEncoded || item.content || '';
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
      const image = imgMatch ? imgMatch[1] : undefined;

      return {
        title: item.title || 'Untitled',
        description: item.contentSnippet?.slice(0, 200) || item.title || '',
        date: new Date(item.isoDate || item.pubDate || Date.now()),
        tags: (item.categories || []).slice(0, 4),
        url: item.link || '',
        platform: 'medium' as const,
        image,
      };
    });
  } catch (e) {
    console.warn('Failed to fetch Medium RSS feed:', e);
    return [];
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const medium = await fetchMediumArticles();
  const all = [...linkedinArticles, ...medium];
  return all.sort((a, b) => b.date.getTime() - a.date.getTime());
}
