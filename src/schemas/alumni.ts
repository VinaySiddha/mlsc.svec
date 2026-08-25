import { z } from 'zod';

export type AlumniCategoryType = 'milestones' | 'moments' | 'leadership' | 'career' | 'advice';

export interface AlumniTestimonial {
  id: string;
  name: string;
  initials: string;
  role: string;
  currentRole?: string;
  company?: string;
  batch: string;
  quote: string;
  fullStory?: string;
  photoUrl?: string;
  photoPath?: string;
  color: string;
  type: AlumniCategoryType;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  email?: string;
  isApproved: boolean;
  isFeatured: boolean;
  displayOrder?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const alumniTestimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(2, "Role at MLSC/College is required."),
  currentRole: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  batch: z.string().min(2, "Batch/Year is required (e.g. 2024 or 2020-2024)."),
  quote: z.string().min(10, "Testimonial must be at least 10 characters.").max(1200, "Testimonial is too long."),
  fullStory: z.string().optional().or(z.literal("")),
  photoUrl: z.string().url("Please provide a valid URL.").optional().or(z.literal("")),
  photoPath: z.string().optional().or(z.literal("")),
  initials: z.string().optional().or(z.literal("")),
  color: z.string().optional().default("#4285F4"),
  type: z.enum(['milestones', 'moments', 'leadership', 'career', 'advice']).default('milestones'),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal("")),
  githubUrl: z.string().url("Please enter a valid GitHub URL.").optional().or(z.literal("")),
  twitterUrl: z.string().url("Please enter a valid Twitter/X URL.").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
  isApproved: z.boolean().default(true),
  isFeatured: z.boolean().default(true),
  displayOrder: z.number().optional().default(0),
});

export const publicAlumniSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(2, "Role at MLSC or college is required."),
  currentRole: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  batch: z.string().min(2, "Batch/Year is required (e.g. 2024 or 2020-2024)."),
  quote: z.string().min(10, "Your words must be at least 10 characters.").max(1200, "Your message is too long."),
  fullStory: z.string().optional().or(z.literal("")),
  photoUrl: z.string().url("Please provide a valid image URL.").optional().or(z.literal("")),
  photoPath: z.string().optional().or(z.literal("")),
  color: z.string().optional().default("#4285F4"),
  type: z.enum(['milestones', 'moments', 'leadership', 'career', 'advice']).default('milestones'),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal("")),
  githubUrl: z.string().url("Please enter a valid GitHub URL.").optional().or(z.literal("")),
  twitterUrl: z.string().url("Please enter a valid Twitter/X URL.").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
});

export const SEED_ALUMNI_TESTIMONIALS: AlumniTestimonial[] = [
  {
    id: "seed-1",
    name: "Chandu Neelam",
    initials: "CN",
    role: "Former President, MLSC",
    currentRole: "Software Engineer",
    company: "Tech Innovator",
    batch: "2020 - 2024",
    quote: "Being part of MLSC was a turning point in my college life. The projects we built, the hackathons we organized, and the mentorship we received established a foundation that changed the course of our careers.",
    fullStory: "Leading the chapter from its foundational phase taught me how to scale teams, handle high-stakes hackathons, and build technical architectures that serve hundreds of students. The culture we built at MLSC SVEC is something I carry into my professional engineering career every single day.",
    color: "#4285F4", // Google Blue
    type: "milestones",
    linkedinUrl: "https://linkedin.com",
    isApproved: true,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    id: "seed-2",
    name: "Kasyap Vadapalli",
    initials: "KV",
    role: "Former Vice President, MLSC",
    currentRole: "AI / ML Engineer",
    company: "Cloud Scale Systems",
    batch: "2020 - 2024",
    quote: "The collaborative environment at MLSC is unmatched. Working on cutting-edge technologies with passionate peers helped me hone my skills and build things I never thought possible.",
    fullStory: "When you surround yourself with builders who refuse to settle for the curriculum, you accelerate at 10x speed. MLSC provided the sandbox, the compute, and the community to turn raw curiosity into scalable production systems.",
    color: "#34A853", // Google Green
    type: "moments",
    linkedinUrl: "https://linkedin.com",
    isApproved: true,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    id: "seed-3",
    name: "Sri Satya Satti",
    initials: "SS",
    role: "Former Technical Lead, MLSC",
    currentRole: "Full Stack Engineer",
    company: "Global Enterprise",
    batch: "2020 - 2024",
    quote: "MLSC is not just a student club; it is an incubator for innovation. The platform gave me real-world development experience, team leadership opportunities, and memories to cherish.",
    fullStory: "From designing database schemas at 2 AM for recruitment portals to mentoring juniors on Next.js and Firebase, MLSC gave me the confidence to write code that matters.",
    color: "#FBBC05", // Google Yellow
    type: "milestones",
    linkedinUrl: "https://linkedin.com",
    isApproved: true,
    isFeatured: true,
    displayOrder: 3,
  },
  {
    id: "seed-4",
    name: "Hemanth Patcha",
    initials: "HP",
    role: "Former Secretary, MLSC",
    currentRole: "Cloud & DevOps Specialist",
    company: "Distributed Tech Corp",
    batch: "2020 - 2024",
    quote: "From organizing large-scale workshops to handling complex technical stacks, MLSC developed both my engineering and leadership capabilities. It was a life-changing experience.",
    fullStory: "We learned how to communicate with faculty, sponsor partners, and hundreds of eager freshmen. Building club systems and maintaining high-quality events turned student developers into leaders.",
    color: "#EA4335", // Google Red
    type: "moments",
    linkedinUrl: "https://linkedin.com",
    isApproved: true,
    isFeatured: true,
    displayOrder: 4,
  },
  {
    id: "seed-5",
    name: "Akash Pydipala",
    initials: "AP",
    role: "Former Treasurer, MLSC",
    currentRole: "Data Analyst",
    company: "FinTech Solutions",
    batch: "2020 - 2024",
    quote: "The exposure, resources, and community mentorship at MLSC are top-tier. It is the absolute best environment for any student developer looking to build, scale, and learn.",
    fullStory: "Managing budgets, hackathon prize pools, and cloud credit distributions gave me an early taste of project finance and tech ops. MLSC is an ecosystem where everyone wins.",
    color: "#A733FF", // Purple
    type: "milestones",
    linkedinUrl: "https://linkedin.com",
    isApproved: true,
    isFeatured: true,
    displayOrder: 5,
  }
];
