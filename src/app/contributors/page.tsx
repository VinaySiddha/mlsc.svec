'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Github, Award, ShieldCheck, Heart, Terminal, Compass, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OpenSourceButton } from '@/components/ui/open-source-button';

interface Contributor {
  id: string;
  name: string;
  github: string;
  department: string;
  skills: string;
}

const MOCK_CONTRIBUTORS: Contributor[] = [
  { id: 'mock-1', name: 'Vinay Siddha', github: 'VinaySiddha', department: 'Computer Science & Engineering', skills: 'Next.js, Firebase, Cloud architecture' },
  { id: 'mock-2', name: 'Rohit Kumar', github: 'rohit-kumar', department: 'Information Technology', skills: 'TailwindCSS, Framer Motion, UI/UX' },
  { id: 'mock-3', name: 'Sai Teja', github: 'saiteja', department: 'Electronics & Communication', skills: 'TypeScript, API integration, Backend' },
  { id: 'mock-4', name: 'Harika S.', github: 'harika-s', department: 'Computer Science & Engineering', skills: 'Database design, Firestore security' },
  { id: 'mock-5', name: 'Anusha P.', github: 'anusha-p', department: 'Information Technology', skills: 'Nodemailer SMTP, mailing worker scripts' },
  { id: 'mock-6', name: 'Kalyan C.', github: 'kalyan-c', department: 'Computer Science & Engineering', skills: 'Docker container, operations pipelines' },
  { id: 'mock-7', name: 'Devi Prasad', github: 'deviprasad', department: 'Electrical & Electronics', skills: 'Script automations, bash testing' },
  { id: 'mock-8', name: 'Manoj K.', github: 'manoj-k', department: 'Computer Science & Engineering', skills: 'Next.js Routing, SSR optimization' },
];

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'circle' | 'grid'>('circle');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'contributions'),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Contributor[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          github: data.github || '',
          department: data.department || '',
          skills: data.skills || '',
        });
      });
      setContributors(list);
      setLoading(false);
    }, (err) => {
      console.error("Contributors load error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const displayContributors = contributors.length > 0 ? contributors : MOCK_CONTRIBUTORS;
  const activeHovered = displayContributors.find(c => c.id === hoveredId);
  const N = displayContributors.length;

  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white flex flex-col justify-center items-center overflow-x-hidden">
      <div className="mx-auto max-w-5xl px-6 md:px-8 text-center space-y-10 w-full relative z-10">
        
        {/* Title / Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 text-[10px] font-black uppercase tracking-widest text-[#4285F4] italic mx-auto select-none">
            <Award className="h-3.5 w-3.5 animate-pulse" /> Developer Force
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Contributors of <span className="text-[#4285F4]">MLSC SVEC</span>
          </h1>
          <p className="text-white/40 font-medium text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Meet the talented student builders and developers who shape our community platform, build our portals, and maintain our open-source tools.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-[#050505] border border-white/5 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('circle')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                viewMode === 'circle' ? "bg-white text-black" : "text-white/50 hover:text-white"
              )}
            >
              <Compass className="h-3.5 w-3.5" /> Circle view
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                viewMode === 'grid' ? "bg-white text-black" : "text-white/50 hover:text-white"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grid view
            </button>
          </div>
        </div>

        {/* Contributors Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4] mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Streaming developer force...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {viewMode === 'circle' ? (
              /* CIRCLE VIEW */
              <div className="relative w-full max-w-[420px] md:max-w-[480px] aspect-square mx-auto flex items-center justify-center my-6">
                
                {/* SVG Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none select-none z-0" viewBox="0 0 500 500">
                  {displayContributors.map((c, i) => {
                    const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                    const x = 250 + 175 * Math.cos(angle);
                    const y = 250 + 175 * Math.sin(angle);
                    const isHovered = hoveredId === c.id;
                    return (
                      <line
                        key={c.id}
                        x1={250}
                        y1={250}
                        x2={x}
                        y2={y}
                        className={cn(
                          "transition-all duration-500",
                          isHovered 
                            ? "stroke-[#4285F4] stroke-[2px] opacity-80" 
                            : "stroke-white/10 stroke-[1px] opacity-30"
                        )}
                        style={{
                          strokeDasharray: isHovered ? "none" : "4,4"
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Central Info Hub (The GitHub Circle Center) */}
                <div className="absolute w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full bg-[#050505]/90 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-center p-4 shadow-[0_0_50px_rgba(66,133,244,0.1)] z-20 transition-all duration-300">
                  {activeHovered ? (
                    <div className="space-y-1.5 animate-in fade-in zoom-in duration-200">
                      <p className="text-xs font-black uppercase tracking-wide text-white">
                        {activeHovered.name}
                      </p>
                      {activeHovered.github && (
                        <a 
                          href={`https://github.com/${activeHovered.github}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-[#4285F4] hover:underline flex items-center justify-center gap-1"
                        >
                          <Github className="h-3 w-3" /> @{activeHovered.github}
                        </a>
                      )}
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-white/50 px-2 py-0.5 rounded-full bg-white/5">
                        {activeHovered.department.split(' ')[0]}
                      </p>
                      <p className="text-[9px] text-white/40 leading-tight font-medium max-w-[140px] mx-auto italic mt-1.5">
                        {activeHovered.skills}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 select-none animate-in fade-in duration-300">
                      <Terminal className="h-6 w-6 text-[#4285F4] mx-auto animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white italic">
                        MLSC Dev Force
                      </h4>
                      <p className="text-[9px] text-white/40 leading-relaxed max-w-[130px] mx-auto font-medium">
                        Hover or tap on developer nodes to inspect contributions
                      </p>
                      <div className="text-[10px] font-black text-[#4285F4] uppercase bg-[#4285F4]/10 border border-[#4285F4]/20 rounded-full px-2.5 py-0.5 inline-block">
                        {displayContributors.length} Builders
                      </div>
                    </div>
                  )}
                </div>

                {/* Contributor Circular Nodes */}
                {displayContributors.map((contrib, i) => {
                  const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                  const x = 250 + 175 * Math.cos(angle);
                  const y = 250 + 175 * Math.sin(angle);
                  const isHovered = hoveredId === contrib.id;
                  const avatarUrl = contrib.github 
                    ? `https://github.com/${contrib.github}.png`
                    : null;

                  return (
                    <div
                      key={contrib.id}
                      style={{
                        left: `${(x / 500) * 100}%`,
                        top: `${(y / 500) * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-transform duration-300"
                    >
                      <button
                        onMouseEnter={() => setHoveredId(contrib.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setHoveredId(contrib.id)}
                        className={cn(
                          "relative h-12 w-12 md:h-14 md:w-14 rounded-full p-[2px] transition-all duration-300 flex items-center justify-center overflow-hidden hover:scale-125 focus:outline-none shadow-lg",
                          isHovered 
                            ? "bg-[#4285F4] ring-4 ring-[#4285F4]/30" 
                            : "bg-gradient-to-tr from-white/10 to-[#4285F4]/20 border border-white/10"
                        )}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={contrib.name}
                            className="h-full w-full rounded-full object-cover select-none bg-black"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-xs text-[#4285F4]">
                            {contrib.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}

              </div>
            ) : (
              /* GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl py-6 animate-in fade-in duration-300">
                {displayContributors.map((contrib) => {
                  const avatarUrl = contrib.github 
                    ? `https://github.com/${contrib.github}.png`
                    : null;

                  return (
                    <div
                      key={contrib.id}
                      className="group relative flex flex-col items-center bg-[#050505] border border-white/5 hover:border-white/10 p-5 rounded-2xl hover:bg-[#070707] transition-all duration-300 text-center gap-3 shadow-lg"
                    >
                      <a
                        href={contrib.github ? `https://github.com/${contrib.github}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-white/10 to-[#4285F4]/30 group-hover:to-[#4285F4] transition-all duration-300 flex items-center justify-center overflow-hidden"
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={contrib.name}
                            className="h-full w-full rounded-full object-cover bg-black"
                          />
                        ) : (
                          <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-sm text-[#4285F4]">
                            {contrib.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </a>

                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-wide text-white truncate max-w-[130px]">
                          {contrib.name}
                        </p>
                        {contrib.github && (
                          <p className="text-[9px] font-bold text-[#4285F4] flex items-center justify-center gap-0.5">
                            <Github className="h-2.5 w-2.5" /> @{contrib.github}
                          </p>
                        )}
                        <Badge className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 border-none bg-white/5 text-white/50 mt-1">
                          {contrib.department.split(' ')[0]}
                        </Badge>
                      </div>

                      <p className="text-[8px] text-white/40 leading-relaxed font-semibold line-clamp-2 mt-1 italic border-t border-white/[0.03] pt-2 w-full">
                        {contrib.skills}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        {!loading && (
          <div className="flex flex-col items-center gap-2 pt-6">
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" /> Shaping Student Excellence
            </p>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed font-medium">
              Want your avatar here? Join the club open source initiative and help us build amazing student platforms.
            </p>
            <OpenSourceButton href="/contribute" className="mt-2 h-10 px-6">
              Contribute Now
            </OpenSourceButton>
          </div>
        )}

      </div>
    </div>
  );
}
