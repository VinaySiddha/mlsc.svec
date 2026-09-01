import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface DocMeta {
  title: string;
  slug: string;
  category: string;
  categoryTitle: string;
  description: string;
  publishedAt?: string;
  readingTime: number;
  path: string;
}

export interface DocContent extends DocMeta {
  content: string;
  toc: { id: string; text: string; level: number }[];
}

export interface DocCategory {
  id: string;
  title: string;
  number: string;
  iconName: string;
  description: string;
  docs: DocMeta[];
}

const CATEGORY_MAP: Record<string, { title: string; number: string; icon: string; description: string }> = {
  "01-introduction": {
    title: "Introduction",
    number: "01",
    icon: "BookOpen",
    description: "About MLSC SVEC, vision, mission, and how the club operates.",
  },
  "02-getting-started": {
    title: "Getting Started",
    number: "02",
    icon: "Compass",
    description: "Onboarding guides for new members, volunteers, leads, and admins.",
  },
  "03-membership": {
    title: "Membership",
    number: "03",
    icon: "Users",
    description: "Eligibility, recruitment, selection process, and member perks.",
  },
  "04-teams-and-roles": {
    title: "Teams & Roles",
    number: "04",
    icon: "Shield",
    description: "Functional divisions, lead responsibilities, and the RACI matrix.",
  },
  "05-events": {
    title: "Events & Hackathons",
    number: "05",
    icon: "Calendar",
    description: "Event planning, QR ticketing, approval workflows, and post-event SOPs.",
  },
  "06-administration": {
    title: "Administration",
    number: "06",
    icon: "Settings",
    description: "Admin portal usage, 2FA security, group moderation, and PII privacy.",
  },
  "07-technical-documentation": {
    title: "Technical Systems",
    number: "07",
    icon: "Code2",
    description: "Next.js architecture, Firestore schemas, APIs, CI/CD, and troubleshooting.",
  },
  "08-projects": {
    title: "Projects & Architecture",
    number: "08",
    icon: "Cpu",
    description: "Flagship portals, Study Hub, 500-peer WebRTC SFU, and project templates.",
  },
  "09-guidelines-and-policies": {
    title: "Guidelines & Policies",
    number: "09",
    icon: "FileText",
    description: "Code of conduct, branding colors, social media rules, and resource quotas.",
  },
  "10-faqs": {
    title: "Frequently Asked Questions",
    number: "10",
    icon: "HelpCircle",
    description: "Answers to common general, technical, event, and recruitment queries.",
  },
  "11-handover-and-continuity": {
    title: "Handover & Continuity",
    number: "11",
    icon: "RefreshCw",
    description: "The Zero-Knowledge-Loss doctrine, account transfers, and master checklist.",
  },
};

const DOCS_DIRECTORY = path.join(process.cwd(), "docs");

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/g).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function extractToc(markdown: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    // Clean markdown formatting like **bold** or [links]
    const cleanText = rawText.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\[(.*?)\]\(.*?\)/g, "$1");
    const id = cleanText
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    toc.push({ id, text: cleanText, level });
  }

  return toc;
}

export function getAllDocCategories(): DocCategory[] {
  if (!fs.existsSync(DOCS_DIRECTORY)) return [];

  const entries = fs.readdirSync(DOCS_DIRECTORY, { withFileTypes: true });
  const categoryDirs = entries
    .filter((entry) => entry.isDirectory() && CATEGORY_MAP[entry.name])
    .sort((a, b) => a.name.localeCompare(b.name));

  const categories: DocCategory[] = [];

  for (const catDir of categoryDirs) {
    const catConfig = CATEGORY_MAP[catDir.name];
    const catPath = path.join(DOCS_DIRECTORY, catDir.name);
    const files = fs
      .readdirSync(catPath)
      .filter((f) => f.endsWith(".md"))
      .sort();

    const docs: DocMeta[] = [];

    for (const file of files) {
      const filePath = path.join(catPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const slug = file.replace(/\.md$/, "");
      const title = data.title || slug;
      const description = data.description || "";
      const readingTime = calculateReadingTime(content);

      docs.push({
        title,
        slug,
        category: catDir.name,
        categoryTitle: catConfig.title,
        description,
        publishedAt: data.publishedAt,
        readingTime,
        path: `/docs/${catDir.name}/${slug}`,
      });
    }

    categories.push({
      id: catDir.name,
      title: catConfig.title,
      number: catConfig.number,
      iconName: catConfig.icon,
      description: catConfig.description,
      docs,
    });
  }

  return categories;
}

export function getAllDocsList(): DocMeta[] {
  const categories = getAllDocCategories();
  return categories.flatMap((cat) => cat.docs);
}

export function getDocBySlug(category: string, slug: string): DocContent | null {
  const filePath = path.join(DOCS_DIRECTORY, category, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const catConfig = CATEGORY_MAP[category] || { title: category, number: "00", icon: "FileText", description: "" };

  const readingTime = calculateReadingTime(content);
  const toc = extractToc(content);

  return {
    title: data.title || slug,
    slug,
    category,
    categoryTitle: catConfig.title,
    description: data.description || "",
    publishedAt: data.publishedAt,
    readingTime,
    path: `/docs/${category}/${slug}`,
    content,
    toc,
  };
}

export function getPrevNextDocs(currentCategory: string, currentSlug: string): {
  prev: DocMeta | null;
  next: DocMeta | null;
} {
  const allDocs = getAllDocsList();
  const currentIndex = allDocs.findIndex(
    (doc) => doc.category === currentCategory && doc.slug === currentSlug
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const next = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return { prev, next };
}
