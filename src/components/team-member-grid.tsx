'use client';

import { Image } from "@/components/image";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    linkedin: string;
    categoryId: string;
}

const roleOrder: { [key: string]: number } = {
    'Lead': 1,
    'Lead Advisor': 2,
    'Faculty Advisor': 3,
    'Secretary': 4,
    'Technical Architect': 5,
    'Outreach Affairs Lead': 6,
};

const sortMembers = (members: TeamMember[]) => {
    return [...members].sort((a, b) => {
        const aOrder = roleOrder[a.role] || (a.role.includes('Head') ? 7 : 99);
        const bOrder = roleOrder[b.role] || (b.role.includes('Head') ? 7 : 99);
        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }
        return a.name.localeCompare(b.name);
    });
};

export function TeamMemberGrid({ members }: { members: TeamMember[] }) {
    if (members.length === 0) return null;

    const containerClasses = cn(
        "gap-8",
        members.length > 1
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "flex justify-center"
    );

    return (
        <StaggerContainer className={containerClasses}>
            {sortMembers(members).map((member) => (
                <StaggerItem key={member.id}>
                    <div className="glass-card-hover p-4 flex flex-col items-center text-center group h-full">
                        <div className="relative mb-4">
                            <div className="rounded-full ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300 overflow-hidden w-40 h-40">
                                {member.image ? (
                                    <Image
                                        src={member.image}
                                        alt={`Photo of ${member.name}`}
                                        width={160}
                                        height={160}
                                        className="rounded-full object-cover group-hover:scale-110 transition-transform duration-300 w-40 h-40"
                                    />
                                ) : (
                                    <div className="w-40 h-40 rounded-full bg-muted flex items-center justify-center">
                                        <span className="text-4xl font-bold text-muted-foreground">
                                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <h4 className="font-semibold text-lg">{member.name}</h4>
                        <p className="text-primary text-sm">{member.role}</p>
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary mt-1 transition-colors">
                            LinkedIn
                        </a>
                    </div>
                </StaggerItem>
            ))}
        </StaggerContainer>
    );
}
