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
    title: "A Smart Ceiling Fan, a Wall Switch, and Two Evenings with Claude",
    description: "Two evenings researching with Claude saved a smart ceiling fan purchase, then debugged a hidden install bug. The case for AI research before hardware buys.",
    date: new Date('2026-05-20'),
    tags: ["Home Automation", "Home Assistant", "AI-Assisted Development", "Smart Home"],
    url: "https://www.linkedin.com/pulse/smart-ceiling-fan-wall-switch-two-evenings-claude-andrea-gigante-lfcwe",
    platform: 'linkedin',
    image: "/images/articles/smart-ceiling-fan-wall-switch-two-evenings-claude-andrea-gigante-lfcwe.jpg",
    slug: "smart-ceiling-fan-wall-switch-two-evenings-claude-andrea-gigante-lfcwe",
    tldr: "Smart hardware buying goes wrong because the spec sheet hides the failure modes. Two evenings of research with Claude before purchasing an Ovlaim ceiling fan caught most issues, but one stayed hidden: flipping the existing wall switch killed the canopy's WiFi every time. A second session led to a bypass-wiring solution where the canopy stays permanently live, the wall switch becomes a state sensor for a Home Assistant relay, and the result is published as a parameterised automation on GitHub. AI is at its best as a parallel reader of forums and manuals, not as the one making the call.",
  },
  {
    title: "I Let AI Write 100% of Two Blogs. Here's What I Learned",
    description: "I handed two blogs entirely to AI: every article, image, and SEO tag. Here's what months of automated publishing revealed about AI's real limits.",
    date: new Date('2026-04-21'),
    tags: ["Artificial Intelligence", "Content Creation", "AI Automation", "Blogging"],
    url: "https://www.linkedin.com/pulse/i-let-ai-write-100-two-blogs-heres-what-learned-andrea-gigante-gmgse",
    platform: 'linkedin',
    image: "/images/articles/i-let-ai-write-100-two-blogs-heres-what-learned-andrea-gigante-gmgse.jpg",
    slug: "i-let-ai-write-100-two-blogs-heres-what-learned-andrea-gigante-gmgse",
    tldr: "Running two fully automated blogs for months revealed that AI did not fail at writing. It failed at having something worth saying. The bottleneck was the brief: generic prompts with no personal voice, no real opinions, and no specific angles produced content that was technically correct but empty. Providing AI with style profiles, first-person context, and concrete angles transformed the output from filler to something genuinely authored.",
  },
  {
    title: "From AI Chat Rooms to AI Councils",
    description: "How multi-agent AI systems evolved from chat-room coordination to structured councils with ticket-gates that enforce quality standards.",
    date: new Date('2026-04-15'),
    tags: ["AI Agents", "Multi-Agent Systems", "AI Orchestration", "Software Development"],
    url: "https://www.linkedin.com/pulse/from-ai-chat-rooms-councils-andrea-gigante-ignqe",
    platform: 'linkedin',
    image: "/images/articles/from-ai-chat-rooms-councils-andrea-gigante-ignqe.jpg",
    slug: "from-ai-chat-rooms-councils-andrea-gigante-ignqe",
    tldr: "Multi-agent AI systems work best when chat-room flexibility gives way to council-style structure. AgentGate evolved from concurrent Slack-based agent conversations to a sequential pipeline where specialist agents each score a GitHub ticket from 1 to 10. All must reach 10 before work proceeds. This ticket-gate approach eliminates coordination overhead and enforces a Definition of Done, turning vague AI suggestions into actionable, consistently high-quality outputs.",
  },
  {
    title: "Which AI Model Should I Use? Let the AI Decide",
    description: "AI model rankings change monthly. Stop chasing benchmarks. Learn to ask AI itself which model fits your task and why that skill outlasts any current ranking.",
    date: new Date('2026-04-10'),
    tags: ["Artificial Intelligence", "Developer Tools", "Software Development", "AI Tools & Skills"],
    url: "https://www.linkedin.com/pulse/which-ai-model-should-i-use-let-decide-andrea-gigante-pojbe",
    platform: 'linkedin',
    image: "/images/articles/which-ai-model-should-i-use-let-decide-andrea-gigante-pojbe.jpg",
    slug: "which-ai-model-should-i-use-let-decide-andrea-gigante-pojbe",
    tldr: "AI model rankings go stale fast. What was best last quarter may not be best now. Instead of memorizing current benchmarks, develop the meta-skill of asking an AI tool which model fits your specific task by sharing context about what you need. Tools like GitHub Copilot let you switch between models, and matching model to task phase (planning vs. generation vs. security review) matters more than picking one winner. The ability to choose well outlasts any particular recommendation.",
  },
  {
    title: "Where to Start Coding with AI: A Practical Guide",
    description: "I get a version of the same question at least once a week: Andrea, I want to start building something with AI, but I have no idea where to begin.",
    date: new Date('2026-04-08'),
    tags: ["Artificial Intelligence", "Software Development", "Coding & Programming", "Developer Tools"],
    url: "https://www.linkedin.com/pulse/where-start-coding-ai-practical-guide-andrea-gigante-o8kie",
    platform: 'linkedin',
    image: "/images/articles/where-to-start-coding-with-ai.jpg",
    slug: "where-start-coding-ai-practical-guide-andrea-gigante-o8kie",
    tldr: "The question is always the same: where do I begin? This guide breaks it down into concrete starting points, from choosing a problem worth automating, to picking the right tool for non-engineers, to avoiding the trap of over-engineering your first AI project. You don't need to understand how LLMs work to build something useful with them.",
  },
  {
    title: "Learn to Drive AI, Not Build the Engine",
    description: "Focus on using AI effectively rather than understanding its technical internals. Being an AI \"client\" means describing outcomes, not mechanisms.",
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
    tldr: "AI assistance in development isn't all-or-nothing. This article traces a realistic progression: from using AI as a glorified autocomplete, to having it draft specs, to orchestrating multi-agent workflows. It explains what changes at each stage, what breaks, and why the mental model shift matters as much as the tooling.",
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
    tldr: "As AI handles more cognitive tasks, certain skills risk atrophying: critical thinking, reading deeply, and tolerating ambiguity. But new skills emerge: output evaluation, knowing when to trust the machine, and navigating AI limitations. This article examines both sides honestly without pretending the outcome is predetermined.",
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
