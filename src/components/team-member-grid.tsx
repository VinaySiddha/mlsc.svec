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
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortMembers(members).map((member, idx) => {
                const shadow = shadowColors[idx % shadowColors.length];
                return (
                    <StaggerItem key={member.id}>
                        <a
                            href={member.linkedin || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-white border-2 border-black p-3 transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] shadow-[5px_5px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000]"
                        >
                            {/* Inner photo with 2px border */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-100 border-2 border-black">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                {member.linkedin && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#4285F4] text-white border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                                            <Linkedin className="h-3.5 w-3.5 stroke-[2.5]" />
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info below card */}
                            <div className="mt-3">
                                <h4 className="font-display font-black text-sm md:text-base text-black tracking-tight uppercase group-hover:text-[#4285F4] transition-colors duration-200 truncate">
                                    {member.name}
                                </h4>
                                <div className="mt-1">
                                    <span className="inline-block px-2 py-0.5 bg-[#FFE600] border-2 border-black text-[10px] font-mono font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_#000000]">
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        </a>
                    </StaggerItem>
                );
            })}
        </StaggerContainer>
    );
}
