import { notFound } from "next/navigation";
import { DomainPageLayout } from "@/components/domains/domain-page-layout";
import type { Metadata } from "next";

interface DomainData {
  name: string;
  category: string;
  color: string;
  icon: string;
  description: string;
  roadmap: {
    phase: string;
    title: string;
    color: string;
    duration: string;
    topics: string[];
  }[];
  resources: {
    name: string;
    url: string;
    tag: string;
  }[];
}

const domainDataRegistry: Record<string, DomainData> = {
  "generative-ai": {
    name: "Generative AI & LLMs",
    category: "Technical Domain",
    color: "#4285F4",
    icon: "🤖",
    description: "Dive into the world of Large Language Models, prompt engineering, AI agents, and real-world GenAI deployments. Build the future with Microsoft Azure AI and Copilot.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Prompt Engineering & APIs",
        color: "#4285F4",
        duration: "Weeks 1-3",
        topics: [
          "System prompts, few-shot learning & chain-of-thought",
          "OpenAI, Anthropic & Google Gemini API integrations",
          "Temperature, top-p, and decoding parameters",
          "Structured JSON outputs and Schema definition"
        ]
      },
      {
        phase: "Phase 2",
        title: "RAG & Vector Databases",
        color: "#4285F4",
        duration: "Weeks 4-6",
        topics: [
          "Document loading, parsing, and chunking strategies",
          "Embedding models, vector space, and similarity metrics",
          "Vector databases: Pinecone, Qdrant, ChromaDB, and pgvector",
          "Retrieval enhancement: Hybrid search, reranking, and parent document retrieval"
        ]
      },
      {
        phase: "Phase 3",
        title: "AI Agents & Orchestration",
        color: "#4285F4",
        duration: "Weeks 7-9",
        topics: [
          "Building LLM pipelines with LangChain & LlamaIndex",
          "Tool calling, function execution, and mathematical reasoning",
          "Multi-agent frameworks: Autogen, CrewAI, and LangGraph",
          "State management and memory persistence in agent workflows"
        ]
      },
      {
        phase: "Phase 4",
        title: "Fine-Tuning & LLMOps",
        color: "#4285F4",
        duration: "Weeks 10-12",
        topics: [
          "Parameter-Efficient Fine-Tuning (PEFT): LoRA and QLoRA",
          "Dataset preparation, instruction tuning formats, and tokenization",
          "Evaluation benchmarks (MMLU, HumanEval) and custom evaluators",
          "Model hosting and fast inference: vLLM, Ollama, and Hugging Face TGI"
        ]
      }
    ],
    resources: [
      { name: "DeepLearning.AI Short Courses", url: "https://www.deeplearning.ai/short-courses/", tag: "Courses" },
      { name: "LangChain Academy", url: "https://academy.langchain.com/", tag: "Tutorials" },
      { name: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course", tag: "Guide" },
      { name: "LlamaIndex Documentation", url: "https://docs.llamaindex.ai/", tag: "Docs" }
    ]
  },
  "data-science": {
    name: "Data Science & ML",
    category: "Technical Domain",
    color: "#34A853",
    icon: "📊",
    description: "Master predictive analytics, neural networks, and machine learning pipelines. Work with real-world datasets and learn to build intelligent systems from scratch.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Foundations & Data Wrangling",
        color: "#34A853",
        duration: "Weeks 1-3",
        topics: [
          "Python programming, Jupyter Notebooks, and virtual environments",
          "Numerical operations with NumPy and data manipulation with Pandas",
          "Exploratory Data Analysis (EDA) and cleaning missing or corrupt data",
          "Data visualization: Matplotlib, Seaborn, and Plotly interactive plots"
        ]
      },
      {
        phase: "Phase 2",
        title: "Classical Machine Learning",
        color: "#34A853",
        duration: "Weeks 4-6",
        topics: [
          "Supervised learning: Linear & Logistic Regression, Decision Trees",
          "Ensemble methods: Random Forests, Gradient Boosting (XGBoost, LightGBM)",
          "Unsupervised learning: K-Means Clustering, PCA dimension reduction",
          "Model evaluation: Cross-validation, Precision-Recall, ROC-AUC curves"
        ]
      },
      {
        phase: "Phase 3",
        title: "Deep Learning Foundations",
        color: "#34A853",
        duration: "Weeks 7-9",
        topics: [
          "Artificial Neural Networks (ANN) and backpropagation basics",
          "Deep learning frameworks: PyTorch and TensorFlow",
          "Convolutional Neural Networks (CNNs) for image classification",
          "Recurrent Neural Networks (RNNs) & LSTMs for sequential data"
        ]
      },
      {
        phase: "Phase 4",
        title: "Advanced ML & Deployment",
        color: "#34A853",
        duration: "Weeks 10-12",
        topics: [
          "Feature engineering, selection, and hyperparameter tuning (Optuna)",
          "Time-series forecasting models (ARIMA, Prophet, and DeepAR)",
          "Model deployment: Packaging models with FastAPI and Docker",
          "MLOps: Experiment tracking with MLflow and model monitoring"
        ]
      }
    ],
    resources: [
      { name: "Kaggle Learn Courses", url: "https://www.kaggle.com/learn", tag: "Practice" },
      { name: "Scikit-Learn Getting Started", url: "https://scikit-learn.org/stable/getting_started.html", tag: "Docs" },
      { name: "PyTorch Deep Learning Tutorial", url: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", tag: "Guide" },
      { name: "Machine Learning by Andrew Ng", url: "https://www.coursera.org/specializations/machine-learning-introduction", tag: "Course" }
    ]
  },
  "cloud-devops": {
    name: "Cloud & DevOps",
    category: "Technical Domain",
    color: "#FBBC04",
    icon: "☁️",
    description: "Learn Azure cloud architecture, CI/CD pipelines, containerization with Docker & Kubernetes, and enterprise-grade DevOps workflows.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Linux, Shell & Git",
        color: "#FBBC04",
        duration: "Weeks 1-2",
        topics: [
          "Linux terminal commands, file system navigation, and permissions",
          "Writing utility Bash scripts for task automation",
          "Advanced Git workflows: rebasing, merge conflicts, and branching",
          "Networking basics: IP addressing, SSH, DNS, and HTTP protocols"
        ]
      },
      {
        phase: "Phase 2",
        title: "Cloud Infrastructure (Azure)",
        color: "#FBBC04",
        duration: "Weeks 3-5",
        topics: [
          "Deploying and managing Azure Virtual Machines",
          "Virtual Networks (VNets), subnets, and Network Security Groups (NSGs)",
          "Azure App Services, Serverless Functions, and Static Web Apps",
          "Azure SQL Database, CosmosDB, and Azure Blob Storage"
        ]
      },
      {
        phase: "Phase 3",
        title: "Containers & Orchestration",
        color: "#FBBC04",
        duration: "Weeks 6-9",
        topics: [
          "Creating efficient Dockerfiles and multi-stage builds",
          "Managing multi-container apps with Docker Compose",
          "Kubernetes architecture: Pods, Services, Deployments, and ConfigMaps",
          "Local Kubernetes testing with Minikube or Kind"
        ]
      },
      {
        phase: "Phase 4",
        title: "CI/CD & Infrastructure as Code",
        color: "#FBBC04",
        duration: "Weeks 10-12",
        topics: [
          "Automating tests and builds with GitHub Actions",
          "Provisioning cloud resources using Terraform (Infrastructure as Code)",
          "Monitoring and logging using Prometheus, Grafana, and ELK Stack",
          "Configuration management and automation with Ansible"
        ]
      }
    ],
    resources: [
      { name: "Microsoft Learn Azure Administrator", url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", tag: "Certification" },
      { name: "Docker Curriculum Tutorial", url: "https://docker-curriculum.com/", tag: "Tutorial" },
      { name: "Roadmap.sh DevOps Guide", url: "https://roadmap.sh/devops", tag: "Roadmap" },
      { name: "Terraform Get Started", url: "https://developer.hashicorp.com/terraform/tutorials", tag: "Docs" }
    ]
  },
  "web-development": {
    name: "Web & App Development",
    category: "Technical Domain",
    color: "#7c3aed",
    icon: "💻",
    description: "Build modern, scalable web applications using React, Next.js, and cutting-edge frontend and backend tooling. Learn from pixel-perfect UI creation to full-stack deployments.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Frontend Foundations",
        color: "#7c3aed",
        duration: "Weeks 1-3",
        topics: [
          "Semantic HTML5 structure and SEO fundamentals",
          "Responsive CSS layouts using Flexbox, CSS Grid, and TailwindCSS",
          "Modern JavaScript ES6+: Promises, Async/Await, and ES Modules",
          "DOM manipulation, Fetch API, and handling REST endpoints"
        ]
      },
      {
        phase: "Phase 2",
        title: "React.js Framework",
        color: "#7c3aed",
        duration: "Weeks 4-6",
        topics: [
          "Component-based architecture: Props, State, and JSX",
          "React Hooks: useState, useEffect, useMemo, and custom hooks",
          "Client-side state management: Zustand and Redux Toolkit",
          "Styling with CSS Modules, Tailwind CSS, and Framer Motion"
        ]
      },
      {
        phase: "Phase 3",
        title: "Next.js & Server-Side Web",
        color: "#7c3aed",
        duration: "Weeks 7-9",
        topics: [
          "Next.js App Router: Dynamic Routing, Server and Client Components",
          "Server Actions, API Routes, and route handlers",
          "Database integration with ORMs like Prisma, Drizzle, and Mongoose",
          "Stateful database engines: PostgreSQL, MongoDB, and Redis caching"
        ]
      },
      {
        phase: "Phase 4",
        title: "Security, Testing & Deployment",
        color: "#7c3aed",
        duration: "Weeks 10-12",
        topics: [
          "Authentication workflows using NextAuth.js (Auth.js) and Clerk",
          "Unit and integration testing using Vitest, Jest, and Testing Library",
          "End-to-End (E2E) browser testing with Playwright or Cypress",
          "Production builds, performance optimization, and hosting on Vercel"
        ]
      }
    ],
    resources: [
      { name: "Next.js Learn Hub", url: "https://nextjs.org/learn", tag: "Courses" },
      { name: "MDN Web Docs JS Section", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", tag: "Docs" },
      { name: "JavaScript Info Guide", url: "https://javascript.info/", tag: "Guide" },
      { name: "Framer Motion Animation docs", url: "https://www.framer.com/motion/", tag: "Docs" }
    ]
  },
  "media-marketing": {
    name: "Media & Marketing",
    category: "Non-Technical Domain",
    color: "#EA4335",
    icon: "📱",
    description: "Shape the MLSC brand through social media strategy, copywriting, video content creation, and digital campaigns that reach thousands of students.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Brand Strategy & Tone",
        color: "#EA4335",
        duration: "Weeks 1-3",
        topics: [
          "Understanding the MLSC SVEC brand voice, guidelines, and assets",
          "Audience segmentation: targeting developers, designers, and enthusiasts",
          "Principles of high-conversion copywriting for tech audiences",
          "Creating and maintaining a cohesive narrative across campaigns"
        ]
      },
      {
        phase: "Phase 2",
        title: "Content Creation & Scheduling",
        color: "#EA4335",
        duration: "Weeks 4-6",
        topics: [
          "Scriptwriting and video editing for Instagram Reels & YouTube Shorts",
          "Designing eye-catching social banners using Canva and Adobe Express",
          "Setting up content pipelines and automation with Buffer or Hootsuite",
          "Writing newsletters and event announcement copies"
        ]
      },
      {
        phase: "Phase 3",
        title: "Platform Algorithms & Growth",
        color: "#EA4335",
        duration: "Weeks 7-9",
        topics: [
          "LinkedIn organic growth: formatting articles, carousels, and posts",
          "Instagram analytics: tracking reach, impressions, and engagement rates",
          "SEO strategies for technical blog posts and event page listings",
          "Building active community engagement through Q&As and polls"
        ]
      },
      {
        phase: "Phase 4",
        title: "Campaign Orchestration & Ads",
        color: "#EA4335",
        duration: "Weeks 10-12",
        topics: [
          "Creating hype and distribution strategies for major hackathons",
          "Collaborating with student influencers and external societies",
          "Fundamentals of meta ads and organic funnel optimization",
          "Drafting campaign retrospective reports using analytical dashboards"
        ]
      }
    ],
    resources: [
      { name: "HubSpot Digital Marketing Academy", url: "https://academy.hubspot.com/courses/digital-marketing", tag: "Certification" },
      { name: "Buffer Social Media Marketing Library", url: "https://buffer.com/resources/", tag: "Guides" },
      { name: "Copyblogger Copywriting 101", url: "https://copyblogger.com/copywriting-101/", tag: "Tutorial" }
    ]
  },
  "events-operations": {
    name: "Events & Operations",
    category: "Non-Technical Domain",
    color: "#FF6D00",
    icon: "🎯",
    description: "Plan and execute world-class hackathons, workshops, coding contests, and guest speaker sessions. You will be the backbone of every successful club project.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Ideation & Scope Definition",
        color: "#FF6D00",
        duration: "Weeks 1-3",
        topics: [
          "Brainstorming event formats and establishing clear learning outcomes",
          "Creating master schedules, action items, and responsibility matrices",
          "Budgeting and financial forecasting for catering, swags, and prizes",
          "Setting up tools for collaboration: Notion, Slack, and Google Workspace"
        ]
      },
      {
        phase: "Phase 2",
        title: "Logistics & Vendor Management",
        color: "#FF6D00",
        duration: "Weeks 4-6",
        topics: [
          "Securing college auditoriums, labs, permissions, and booking equipment",
          "Sound, lighting, and projector checks with technical support staff",
          "Coordinating vendor orders for custom T-shirts, stickers, and printing",
          "Mapping emergency procedures, crowd control, and volunteer placement"
        ]
      },
      {
        phase: "Phase 3",
        title: "Event Day Execution",
        color: "#FF6D00",
        duration: "Weeks 7-9",
        topics: [
          "Managing check-in desks, badge distribution, and queue flows",
          "Speaker hospitality, schedule pacing, and handling slide decks",
          "Conducting fun icebreaker sessions, quizzes, and micro-contests",
          "Live issue tracking and quick troubleshooting during hackathons"
        ]
      },
      {
        phase: "Phase 4",
        title: "Feedback & Post-Mortem",
        color: "#FF6D00",
        duration: "Weeks 10-12",
        topics: [
          "Compiling attendee feedback and distributing certificates",
          "Finalizing financial accounts and settling expense reports",
          "Writing post-event outcome summaries for college authorities & sponsors",
          "Organizing team retrospective meetings to document lessons learned"
        ]
      }
    ],
    resources: [
      { name: "Eventbrite Event Management Blog", url: "https://www.eventbrite.com/blog/category/event-management/", tag: "Guides" },
      { name: "Project Management Institute (PMI) Basics", url: "https://www.pmi.org/about/learn-about-pm", tag: "Guides" },
      { name: "Notion Event Planning Templates", url: "https://www.notion.so/templates/event-planning", tag: "Templates" }
    ]
  },
  "public-relations": {
    name: "Public Relations",
    category: "Non-Technical Domain",
    color: "#FBBC05",
    icon: "🤝",
    description: "Manage collaborations, sponsorships, and external communication to build strong relations with other student clubs, industry experts, and companies.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Outreach & Professional Pitching",
        color: "#FBBC05",
        duration: "Weeks 1-3",
        topics: [
          "Drafting professional cold emails, proposals, and press releases",
          "Designing impressive club pitch decks and sponsorship brochures",
          "Techniques for reaching out to professionals and sponsors on LinkedIn",
          "Setting up and organizing CRM tracking lists in Notion or Sheets"
        ]
      },
      {
        phase: "Phase 2",
        title: "Sponsorship & Negotiation",
        color: "#FBBC05",
        duration: "Weeks 4-6",
        topics: [
          "Structuring sponsorship tiers (Gold, Silver, Platinum) and deliverables",
          "Negotiation strategies: aligned value, discounts, and in-kind services",
          "Drafting Memorandum of Understanding (MoU) templates for partners",
          "Coordinating guest speaker details, dates, and accommodation"
        ]
      },
      {
        phase: "Phase 3",
        title: "Outreach & Press Relations",
        color: "#FBBC05",
        duration: "Weeks 7-9",
        topics: [
          "Contacting local newspapers, media houses, and digital magazines",
          "Arranging cross-promotions with clubs in other colleges",
          "Managing club alumni networks for mentorship opportunities",
          "Procuring approvals and coordination with college administration"
        ]
      },
      {
        phase: "Phase 4",
        title: "Partner Relations & Wrap Up",
        color: "#FBBC05",
        duration: "Weeks 10-12",
        topics: [
          "Compiling post-event metrics and delivery reports for sponsors",
          "Issuing thank-you certificates, swags, and appreciation letters",
          "Maintaining long-term contact databases for future partnerships",
          "Fostering continuous dialogue with active corporate partners"
        ]
      }
    ],
    resources: [
      { name: "PRSA Official PR Guidelines", url: "https://www.prsa.org/", tag: "Resources" },
      { name: "University of Michigan Negotiation Course", url: "https://www.coursera.org/learn/negotiation-skills", tag: "Course" },
      { name: "Hunter.io Cold Outreach Guide", url: "https://hunter.io/cold-email-templates", tag: "Templates" }
    ]
  },
  "creativity-design": {
    name: "Creativity & Design",
    category: "Non-Technical Domain",
    color: "#EA4335",
    icon: "🎨",
    description: "Design stunning graphics, visual assets, and user interfaces that communicate MLSC's brand identity across all media, websites, and events.",
    roadmap: [
      {
        phase: "Phase 1",
        title: "Visual Design Foundations",
        color: "#EA4335",
        duration: "Weeks 1-3",
        topics: [
          "Basic principles of design: alignment, contrast, repetition, and proximity",
          "Typography fundamentals: choosing pairing fonts, hierarchy, and tracking",
          "Color theory: palettes, psychology, and contrast ratios",
          "Creating design styles according to brand guidelines"
        ]
      },
      {
        phase: "Phase 2",
        title: "Vector Art & Graphic Design",
        color: "#EA4335",
        duration: "Weeks 4-6",
        topics: [
          "Mastering vector manipulation in Adobe Illustrator or Figma",
          "Creating flat illustrations, icons, and custom logos",
          "Designing banners, posters, and ID cards for printing",
          "Optimizing graphic formats for digital upload and high-quality print"
        ]
      },
      {
        phase: "Phase 3",
        title: "UI/UX & Product Design",
        color: "#EA4335",
        duration: "Weeks 7-9",
        topics: [
          "User research, persona creation, and wireframing in Figma",
          "Figma Auto-layout, component variants, and library systems",
          "Interactive prototyping and micro-interaction transitions",
          "Heuristic analysis, user testing, and developer handoff"
        ]
      },
      {
        phase: "Phase 4",
        title: "Motion & 3D Assets",
        color: "#EA4335",
        duration: "Weeks 10-12",
        topics: [
          "Keyframe animation basics in Adobe After Effects",
          "Designing SVG animations and Lottie files for web developers",
          "Introduction to Blender: basic shapes, texturing, and 3D rendering",
          "Reviewing portfolios and compiling team behance listings"
        ]
      }
    ],
    resources: [
      { name: "Figma Design Academy Library", url: "https://www.figma.com/resource-library/learn-design/", tag: "Tutorials" },
      { name: "Refactoring UI (Design Tips)", url: "https://www.refactoringui.com/", tag: "Book" },
      { name: "Behance Creative Showcases", url: "https://www.behance.net/", tag: "Inspiration" },
      { name: "Dribbble UI Inspirations", url: "https://dribbble.com/", tag: "Inspiration" }
    ]
  }
};

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const domain = domainDataRegistry[slug];
  if (!domain) {
    return {
      title: "Domain Not Found — MLSC SVEC",
    };
  }
  return {
    title: `${domain.name} — Domains — MLSC SVEC`,
    description: domain.description,
  };
}

export async function generateStaticParams() {
  return [
    { slug: "generative-ai" },
    { slug: "data-science" },
    { slug: "cloud-devops" },
    { slug: "web-development" },
    { slug: "media-marketing" },
    { slug: "events-operations" },
    { slug: "public-relations" },
    { slug: "creativity-design" }
  ];
}

export default async function DomainPage({ params }: Props) {
  const { slug } = await params;
  const domain = domainDataRegistry[slug];

  if (!domain) {
    notFound();
  }

  return (
    <DomainPageLayout
      name={domain.name}
      color={domain.color}
      icon={domain.icon}
      category={domain.category}
      description={domain.description}
      roadmap={domain.roadmap}
      resources={domain.resources}
    />
  );
}
