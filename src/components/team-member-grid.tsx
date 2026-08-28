'use client';

import { Image } from "@/components/image";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";
import { Linkedin } from "lucide-react";

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
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
    });
};

const shadowColors = [
    "shadow-[5px_5px_0px_0px_#4285F4] group-hover:shadow-[2px_2px_0px_0px_#4285F4]",
    "shadow-[5px_5px_0px_0px_#FFE600] group-hover:shadow-[2px_2px_0px_0px_#FFE600]",
    "shadow-[5px_5px_0px_0px_#00FF66] group-hover:shadow-[2px_2px_0px_0px_#00FF66]",
    "shadow-[5px_5px_0px_0px_#FF0055] group-hover:shadow-[2px_2px_0px_0px_#FF0055]"
];

export function TeamMemberGrid({ members }: { members: TeamMember[] }) {
    if (members.length === 0) return null;

    return (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {sortMembers(members).map((member, idx) => {
                const shadow = shadowColors[idx % shadowColors.length];
                return (
                    <StaggerItem key={member.id}>
                        <a
                            href={member.linkedin || '#'}
                            target={member.linkedin ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="group relative bg-white border-2 border-black p-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:translate-x-1 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#FFE600] cursor-pointer"
                        >
                            {/* Circular photo with 2.5px border */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-zinc-100 border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000000] group-hover:shadow-[4px_4px_0px_0px_#FFE600] group-hover:scale-105 transition-all mb-3 shrink-0">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    sizes="100px"
                                    className="object-cover object-top"
                                />
                            </div>

                            {/* Info below circular photo */}
                            <div className="w-full space-y-1">
                                <h4 className="font-display font-black text-xs sm:text-sm text-black tracking-tight uppercase group-hover:text-[#4285F4] transition-colors truncate">
                                    {member.name}
                                </h4>
                                <div>
                                    <span className="inline-block px-2 py-0.5 bg-[#FFE600] border border-black text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_#000000] truncate max-w-full">
                                        {member.role}
                                    </span>
                                </div>
                            </div>

                            {/* Quick LinkedIn Link */}
                            {member.linkedin && (
                                <div className="mt-3">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-black group-hover:bg-[#4285F4] group-hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition-all">
                                        <Linkedin className="h-3.5 w-3.5 stroke-[2.5]" />
                                    </span>
                                </div>
                            )}
                        </a>
                    </StaggerItem>
                );
            })}
        </StaggerContainer>
    );
}
