'use client';

import React, { useState, useMemo } from 'react';
import { Image } from '@/components/image';
import { Linkedin, X, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin: string;
  categoryId: string;
  categoryName?: string;
  email?: string;
  chapter?: string;
}

export interface TeamCategoryGroup {
  id: string;
  name: string;
  order: number;
  members: TeamMemberItem[];
}

interface TeamContributorViewProps {
  categories: TeamCategoryGroup[];
  activeChapter?: string;
}

const rolePriority: { [key: string]: number } = {
  'Club Lead': 1,
  'Lead': 1,
  'President': 1,
  'Lead Advisor': 2,
  'Faculty Advisor': 3,
  'Vice President': 4,
  'Secretary': 5,
  'Technical Architect': 6,
  'Tech Lead': 6,
  'Technical Head': 7,
  'Outreach Affairs Lead': 8,
  'Operations Head': 9,
  'Design Head': 10,
  'Media Head': 11,
  'Events Head': 12,
};

const getRoleRank = (role: string) => {
  if (rolePriority[role]) return rolePriority[role];
  if (role.toLowerCase().includes('lead')) return 15;
  if (role.toLowerCase().includes('head')) return 20;
  if (role.toLowerCase().includes('architect')) return 25;
  if (role.toLowerCase().includes('core')) return 30;
  return 50;
};

export function TeamContributorView({
  categories,
  activeChapter = '3.0',
}: TeamContributorViewProps) {
  const [activeModalMember, setActiveModalMember] = useState<TeamMemberItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Flatten and sort members
  const allMembers = useMemo(() => {
    const list: TeamMemberItem[] = [];
    categories.forEach((cat) => {
      cat.members.forEach((m) => {
        list.push({
          ...m,
          categoryName: cat.name,
        });
      });
    });

    return list.sort((a, b) => {
      const rankA = getRoleRank(a.role);
      const rankB = getRoleRank(b.role);
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  const handleCopyProfile = (member: TeamMemberItem) => {
    const url = member.linkedin || (typeof window !== 'undefined' ? window.location.href : '');
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* ── Pure Circles Face Wall ── */}
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {allMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setActiveModalMember(member)}
              className="relative group cursor-pointer focus:outline-none w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-[3px] border-black bg-zinc-100 overflow-hidden shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#FFE600] hover:scale-110 active:scale-95 transition-all duration-200"
              title={member.name}
            >
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="120px"
                className="object-cover object-top"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Member Profile Popup Modal ── */}
      <Dialog open={!!activeModalMember} onOpenChange={(open) => !open && setActiveModalMember(null)}>
        <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden border-[3px] border-black bg-white shadow-[10px_10px_0px_0px_#000000] rounded-none">
          {activeModalMember && (
            <div>
              {/* Header bar */}
              <div className="bg-[#FFE600] border-b-2 border-black p-3.5 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-black text-xs font-mono font-black uppercase tracking-widest">
                  <Terminal className="h-4 w-4" /> [ MEMBER INFO ]
                </div>
                <button
                  onClick={() => setActiveModalMember(null)}
                  className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                >
                  <X className="h-4 w-4 stroke-[3]" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
                {/* Large Circle Avatar */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3px] border-black overflow-hidden bg-zinc-100 shadow-[5px_5px_0px_0px_#4285F4] shrink-0">
                  <Image
                    src={activeModalMember.image}
                    alt={activeModalMember.name}
                    fill
                    sizes="150px"
                    className="object-cover object-top"
                  />
                </div>

                {/* Name & Role */}
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight uppercase italic text-black">
                    {activeModalMember.name}
                  </h3>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-[#FFE600] text-black border-2 border-black font-mono font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
                      {activeModalMember.role}
                    </span>
                    <span className="px-3 py-1 bg-[#00FF66] text-black border-2 border-black font-mono font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
                      CHAPTER {activeChapter}
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="w-full pt-3 flex flex-col sm:flex-row gap-2.5">
                  {activeModalMember.linkedin ? (
                    <a
                      href={activeModalMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0077B5] hover:bg-[#005E93] text-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                    >
                      <Linkedin className="h-4 w-4 fill-white" />
                      VIEW LINKEDIN [↗]
                    </a>
                  ) : (
                    <span className="flex-1 py-3 text-xs font-mono font-bold text-zinc-500 border-2 border-dashed border-black">
                      No LinkedIn Profile
                    </span>
                  )}

                  <button
                    onClick={() => handleCopyProfile(activeModalMember)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-zinc-100 text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copiedLink ? "COPIED" : "SHARE"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
