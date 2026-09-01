export interface RatingDetails {
    communication: number;
    technical: number;
    problemSolving: number;
    teamFit: number;
    confidence?: number;
    growthMindset?: number;
    leadership?: number;
    overall: number;
}

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
    isRecommended?: boolean; // Manual interview / Admin recommendation
    isAiRecommended?: boolean; // AI screening recommendation
    isManualSelected?: boolean; // Manual interview selection indicator
    interviewAttended?: boolean;
    ratings?: RatingDetails;
    aiRatings?: RatingDetails;
    manualRatings?: RatingDetails;
    suitability?: {
        technical?: string;
        nonTechnical?: string;
    };
    aiSuitability?: {
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
    chapter?: string;
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
    chapter?: string;
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

export interface ChapterConfig {
    isHiringOpen: boolean;
    isTeamVisible: boolean;
    registrationLimit?: number;
}

export interface GlobalSettings {
    activeChapter: string;
    chapters: Record<string, ChapterConfig>;
    deadline?: string;
}
