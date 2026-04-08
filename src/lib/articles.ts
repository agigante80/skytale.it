import Parser from 'rss-parser';

export interface Article {
  title: string;
  description: string;
  date: Date;
  tags: string[];
  url: string;
  platform: 'medium' | 'linkedin';
  image?: string;
  slug: string;
  tldr?: string;
}

// LinkedIn articles - add manually here (LinkedIn has no public article API)
const linkedinArticles: Article[] = [
  {
    title: "Where to Start Coding with AI: A Practical Guide",
    description: "I get a version of the same question at least once a week: Andrea, I want to start building something with AI, but I have no idea where to begin.",
    date: new Date('2026-04-08'),
    tags: ["Artificial Intelligence", "Software Development", "Coding & Programming", "Developer Tools"],
    url: "https://www.linkedin.com/pulse/where-start-coding-ai-practical-guide-andrea-gigante-o8kie",
    platform: 'linkedin',
    image: "/images/articles/where-to-start-coding-with-ai.jpg",
    slug: "where-start-coding-ai-practical-guide-andrea-gigante-o8kie",
    tldr: "The question is always the same: where do I begin? This guide breaks it down into concrete starting points — from choosing a problem worth automating, to picking the right tool for non-engineers, to avoiding the trap of over-engineering your first AI project. You don't need to understand how LLMs work to build something useful with them.",
  },
  {
    title: "Learn to Drive AI, Not Build the Engine",
    description: "Focus on using AI effectively rather than understanding its technical internals — being an AI \"client\" means describing outcomes, not mechanisms.",
    date: new Date('2026-04-05'),
    tags: ["Artificial Intelligence", "AI Tools & Skills", "Productivity", "Technology"],
    url: "https://www.linkedin.com/pulse/learn-drive-ai-build-engine-andrea-gigante-olfne/",
    platform: 'linkedin',
    image: "/images/articles/learn-to-drive-ai-not-build-engine.jpg",
    slug: "learn-drive-ai-build-engine-andrea-gigante-olfne",
    tldr: "Most people trying to use AI waste time learning how transformers work when they should be learning how to write a good prompt. Being an effective AI user is a skill in itself: knowing how to describe outcomes clearly, how to iterate on outputs, and how to stay in the driver's seat rather than under the hood.",
  },
  {
    title: "Stages of AI-Assisted Development: How My Workflow Evolved",
    description: "A practitioner's account of how AI integration in software development evolved incrementally, from basic coding assistance to structured spec-first workflows and agent-based systems.",
    date: new Date('2026-03-18'),
    tags: ["AI", "Software Development", "Developer Workflow"],
    url: "https://www.linkedin.com/pulse/stages-ai-assisted-development-how-my-workflow-evolved-andrea-gigante-vpnqe",
    platform: 'linkedin',
    image: "/images/articles/stages-ai-assisted-development.jpg",
    slug: "stages-ai-assisted-development-how-my-workflow-evolved-andrea-gigante-vpnqe",
    tldr: "AI assistance in development isn't all-or-nothing. This article traces a realistic progression — from using AI as a glorified autocomplete, to having it draft specs, to orchestrating multi-agent workflows — and explains what changes at each stage, what breaks, and why the mental model shift matters as much as the tooling.",
  },
  {
    title: "Why I Build Tools Like This (and Why I Share Them)",
    description: "Building is how I learn. Writing code forces me to deal with real constraints, trade-offs, and failures. I construct small tools and experimental projects publicly to understand systems deeply.",
    date: new Date('2026-03-13'),
    tags: ["AI", "Open Source", "Software Engineering"],
    url: "https://www.linkedin.com/pulse/why-i-build-tools-like-share-them-andrea-gigante-ok9ne",
    platform: 'linkedin',
    image: "/images/articles/why-i-build-tools.jpg",
    slug: "why-i-build-tools-like-share-them-andrea-gigante-ok9ne",
    tldr: "Building small tools publicly is how I learn. Real constraints force real decisions. Writing code that others might use raises the bar. This article explains the philosophy behind the projects on this site and why I think shipping imperfect work beats waiting for a perfect version that never ships.",
  },
  {
    title: "How AI Will Affect the Skills of the New Generation: What We May Lose and Gain",
    description: "Exploring how AI adoption impacts skill development in younger generations. Potential cognitive losses like declining critical thinking alongside emerging capabilities like prompt engineering.",
    date: new Date('2025-08-01'),
    tags: ["AI", "Future of Work", "Education"],
    url: "https://www.linkedin.com/pulse/how-ai-affect-skills-new-generation-what-we-may-lose-gain-gigante-4attf",
    platform: 'linkedin',
    image: "/images/articles/ai-skills-generation.jpg",
    slug: "how-ai-affect-skills-new-generation-what-we-may-lose-gain-gigante-4attf",
    tldr: "As AI handles more cognitive tasks, certain skills risk atrophying — critical thinking, reading deeply, tolerating ambiguity. But new skills emerge: output evaluation, knowing when to trust the machine, and navigating AI limitations. This article examines both sides honestly without pretending the outcome is predetermined.",
  },
  {
    title: "P.U.N.K.: The Attributes That Define a Great Product!",
    description: "A framework for evaluating product quality through four key attributes: Proposition, Usability, Necessity, and Kansei. Analyzing Google Glass as a case study.",
    date: new Date('2018-07-12'),
    tags: ["Product Management", "Product Strategy", "UX"],
    url: "https://www.linkedin.com/pulse/punk-attributes-define-great-product-andrea-gigante",
    platform: 'linkedin',
    image: "/images/articles/punk-product.jpg",
    slug: "punk-attributes-define-great-product-andrea-gigante",
    tldr: "A framework for evaluating products across four dimensions: Proposition (does it offer something unique?), Usability (can people actually use it?), Necessity (does anyone need it?), and Kansei (does it evoke the right emotional response?). Google Glass is dissected as a case study of a technically impressive product that failed most of these criteria.",
  },
  {
    title: "Creating an Agile Roadmap Using Story Mapping",
    description: "Story mapping provides a visual framework that organizes user stories to clarify system functionality, identify backlog gaps, and plan releases that deliver consistent value.",
    date: new Date('2018-07-01'),
    tags: ["Agile", "Product Management", "Story Mapping"],
    url: "https://www.linkedin.com/pulse/creating-agile-roadmap-using-story-mapping-andrea-gigante",
    platform: 'linkedin',
    image: "/images/articles/agile-story-mapping.jpg",
    slug: "creating-agile-roadmap-using-story-mapping-andrea-gigante",
    tldr: "Story mapping gives product teams a shared visual model of the full user journey, making it easier to spot backlog gaps, plan releases that deliver real value, and communicate priorities without drowning in spreadsheets. This article walks through the method step by step with practical examples.",
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

      const url = item.link || '';
      return {
        title: item.title || 'Untitled',
        description: item.contentSnippet?.slice(0, 200) || item.title || '',
        date: new Date(item.isoDate || item.pubDate || Date.now()),
        tags: (item.categories || []).slice(0, 4),
        url,
        platform: 'medium' as const,
        image,
        slug: url.split('/').pop()?.split('?')[0] || '',
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
