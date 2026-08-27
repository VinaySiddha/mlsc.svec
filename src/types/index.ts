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
