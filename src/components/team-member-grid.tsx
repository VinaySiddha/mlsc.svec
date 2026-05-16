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
        "grid gap-6 md:gap-8",
        members.length > 1
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "flex justify-center"
    );

    return (
        <StaggerContainer className={containerClasses}>
            {sortMembers(members).map((member) => (
                <StaggerItem key={member.id}>
                    <div className="group relative w-full aspect-[3/4] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-white/5 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(66,133,244,0.15)] transition-all duration-500 bg-[#0A0A0A]">
                        {/* The Image - Grayscale by default, color on hover */}
                        <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-110"
                        />
                        
                        {/* Dark Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                        
                        {/* Decorative Top-Right Corner Accent */}
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/40 transition-all duration-700 rounded-tr-lg" />
                        
                        {/* Member Details (Overlaid at bottom) */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            <h4 className="font-bold text-lg md:text-xl tracking-tighter text-white group-hover:text-primary transition-colors duration-300">
                                {member.name}
                            </h4>
                            <p className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1 group-hover:text-white transition-colors duration-300">
                                {member.role}
                            </p>
                            
                            {/* Profile Link (Revealed on hover) */}
                            <div className="mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                <a 
                                    href={member.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-colors font-black"
                                >
                                    Connect <span className="hidden md:inline ml-1">on LinkedIn</span>
                                    <svg className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </StaggerItem>
            ))}
        </StaggerContainer>
    );
}
