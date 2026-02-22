// Types copied from web app for consistency

export interface Application {
  firestoreId: string;
  id: string; // referenceId
  name: string;
  email: string;
  rollNo: string;
  rollNo_lowercase?: string;
  name_lowercase?: string;
  yearOfStudy: string;
  branch: string;
  section: string;
  phone: string;
  status: string;
  technicalDomain: string;
  nonTechnicalDomain: string;
  linkedin?: string;
  image?: string;
  resumeSummary?: string | null;
  isRecommended?: boolean;
  interviewAttended?: boolean;
  ratings?: {
    communication: number;
    technical: number;
    problemSolving: number;
    teamFit: number;
    overall: number;
  };
  suitability?: {
    technical?: string;
    nonTechnical?: string;
  };
  remarks?: string;
  joinReason?: string;
  aboutClub?: string;
  anythingElse?: string;
  submittedAt: string;
  cgpa?: string;
  backlogs?: string;
}

export interface TeamMember {
  id: string; // firestoreId
  name: string;
  email: string;
  role: string;
  categoryId: string;
  image?: string;
  linkedin?: string;
  status: string; // 'pending', 'active'
  onboardingToken?: string;
  tokenExpiresAt?: string;
}

export interface Panel {
  username: string;
  domain: string;
}

export interface TeamCategory {
  id: string;
  name: string;
  subDomain: string;
  order: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: any; // Firestore Timestamp
  time: string;
  venue: string;
  eventLink?: string;
  feedbackLink?: string;
  bannerImage?: string;
  listImage?: string;
  highlightImages?: string[];
  registrationOpen: boolean;
  registrationDeadline?: any; // Firestore Timestamp
  registrationLimit?: number;
  speakers?: Array<{
    name: string;
    title: string;
    image: string;
  }>;
  timeline?: Array<{
    time: string;
    description: string;
  }>;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  skills: string[];
  apply_link: string;
  posted_on: string;
}

export interface User {
  role: 'admin' | 'panel';
  username: string;
  domain?: string;
}
