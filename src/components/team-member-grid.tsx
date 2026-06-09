'use client';

import { Image } from "@/components/image";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";
import { Scales } from "@/components/ui/scales";

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

export function TeamMemberGrid({ members }: { members: TeamMember[] }) {
    if (members.length === 0) return null;

    return (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-10">
            {sortMembers(members).map((member) => (
                <StaggerItem key={member.id}>
                    <a
                        href={member.linkedin || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                    >
                        {/* Outer wrapper — gives space for the Scales frames to overflow */}
                        <div className="relative mx-auto w-full">

                            {/* ── Scales border frames on all 4 sides ── */}

                            {/* Left strip */}
                            <div className="absolute -inset-y-[15%] -left-3 h-[130%] w-5 z-10"
                                style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}>
                                <Scales size={6} className="rounded-sm" color="rgba(255,255,255,0.25)" />
                            </div>

                            {/* Right strip */}
                            <div className="absolute -inset-y-[15%] -right-3 h-[130%] w-5 z-10"
                                style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}>
                                <Scales size={6} className="rounded-sm" color="rgba(255,255,255,0.25)" />
                            </div>

                            {/* Top strip */}
                            <div className="absolute -inset-x-[15%] -top-3 h-5 w-[130%] z-10"
                                style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)' }}>
                                <Scales size={6} className="rounded-sm" color="rgba(255,255,255,0.25)" />
                            </div>

                            {/* Bottom strip */}
                            <div className="absolute -inset-x-[15%] -bottom-3 h-5 w-[130%] z-10"
                                style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)' }}>
                                <Scales size={6} className="rounded-sm" color="rgba(255,255,255,0.25)" />
                            </div>

                            {/* ── Inner photo ── */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#111]">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Subtle bottom fade */}
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </div>

                        {/* Info below card */}
                        <div className="mt-5 px-1">
                            <h4 className="font-bold text-base md:text-[15px] text-white tracking-tight leading-snug group-hover:text-[#4285F4] transition-colors duration-300">
                                {member.name}
                            </h4>
                            <p className="text-white/40 text-xs mt-0.5 font-medium">
                                {member.role}
                            </p>
                        </div>
                    </a>
                </StaggerItem>
            ))}
        </StaggerContainer>
    );
}
