'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Github, Award, Heart, Terminal, Compass, LayoutGrid, Code, GitPullRequest, Users, Sparkles, ArrowUpRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Contributor {
  id: string;
  name: string;
  github: string;
  avatarUrl?: string;
  contributionsCount?: number;
  department?: string;
  skills?: string;
  type?: string;
}

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'circle' | 'grid'>('circle');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAllContributors() {
      try {
        // 1. Fetch real GitHub contributors from the repository
        let ghContributors: Contributor[] = [];
        try {
          const res = await fetch('https://api.github.com/repos/VinaySiddha/mlsc.svec/contributors');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              ghContributors = data
                .filter((item: any) => item.type !== 'Bot' || item.login === 'Copilot')
                .map((item: any) => ({
                  id: `gh-${item.id}`,
                  name: item.login,
                  github: item.login,
                  avatarUrl: item.avatar_url,
                  contributionsCount: item.contributions || 1,
                  department: 'Open Source Contributor',
                  skills: `${item.contributions} commit${item.contributions > 1 ? 's' : ''} pushed to repository`,
                  type: item.type,
                }));
            }
          }
        } catch (e) {
          console.error("Error fetching GitHub contributors:", e);
        }

        // 2. Fetch approved community contributions from Firestore
        const q = query(
          collection(db, 'contributions'),
          where('status', '==', 'approved')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const firestoreList: Contributor[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            firestoreList.push({
              id: doc.id,
              name: data.name || data.github || 'Contributor',
              github: data.github || '',
              avatarUrl: data.github ? `https://github.com/${data.github}.png` : undefined,
              department: data.department || 'Community Member',
              skills: data.skills || 'Platform Contributor',
            });
          });

          if (isMounted) {
            // Merge unique by github handle
            const mergedMap = new Map<string, Contributor>();
            ghContributors.forEach((c) => mergedMap.set(c.github.toLowerCase(), c));
            firestoreList.forEach((c) => {
              const key = (c.github || c.name).toLowerCase();
              if (mergedMap.has(key)) {
                mergedMap.set(key, { ...mergedMap.get(key)!, ...c });
              } else {
                mergedMap.set(key, c);
              }
            });

            setContributors(Array.from(mergedMap.values()));
            setLoading(false);
          }
        }, (err) => {
          console.error("Firestore contributions load error:", err);
          if (isMounted) {
            setContributors(ghContributors);
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Contributors initialization error:", err);
        if (isMounted) setLoading(false);
      }
    }

    fetchAllContributors();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeHovered = contributors.find(c => c.id === hoveredId);
  const N = contributors.length;
  const totalCommits = contributors.reduce((acc, c) => acc + (c.contributionsCount || 0), 0);

  return (
    <div className="w-full bg-white min-h-screen py-16 md:py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Banner */}
        <div className="space-y-4 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-1.5 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-widest text-black select-none">
            <Award className="h-4 w-4" /> [ OPEN-SOURCE COMMUNITY // CHAPTER 4 BUILDERS ]
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.95] text-black">
            Contributors & <br />
            <span className="text-[#4285F4]">Developers.</span>
          </h1>
          
          <p className="text-zinc-700 font-bold text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Real-time verified developers, students, and engineers contributing directly to the open-source MLSC SVEC codebase.
          </p>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Active Builders', value: contributors.length.toString(), bg: 'bg-[#FFE600]', icon: <Users className="h-4 w-4" /> },
            { label: 'Total Commits', value: totalCommits > 0 ? totalCommits.toString() : '460+', bg: 'bg-[#00FF66]', icon: <GitPullRequest className="h-4 w-4" /> },
            { label: 'Repository', value: 'mlsc.svec', bg: 'bg-[#4285F4] text-white', icon: <Code className="h-4 w-4" /> },
            { label: 'Live Chapter', value: '4.0', bg: 'bg-[#FF0055] text-white', icon: <Sparkles className="h-4 w-4" /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{stat.label}</span>
                <span className={cn("p-1.5 border-2 border-black", stat.bg)}>
                  {stat.icon}
                </span>
              </div>
              <p className="text-3xl font-black tracking-tighter font-mono">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* View Mode Switcher */}
        {contributors.length > 0 && (
          <div className="flex justify-center">
            <div className="border-2 border-black bg-zinc-100 p-1.5 shadow-[4px_4px_0px_0px_#000000] inline-flex items-center gap-2">
              <button
                onClick={() => setViewMode('circle')}
                className={cn(
                  "px-5 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-2",
                  viewMode === 'circle'
                    ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_#FFE600]"
                    : "bg-transparent text-black border-transparent hover:bg-zinc-200"
                )}
              >
                <Compass className="h-4 w-4" /> Interactive Circle
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "px-5 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-2",
                  viewMode === 'grid'
                    ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_#FFE600]"
                    : "bg-transparent text-black border-transparent hover:bg-zinc-200"
                )}
              >
                <LayoutGrid className="h-4 w-4" /> Directory Grid
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Display Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-black">
            <Loader2 className="h-10 w-10 animate-spin text-black mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Streaming live repository contributors...</p>
          </div>
        ) : contributors.length === 0 ? (
          <div className="border-2 border-black bg-zinc-50 p-12 text-center max-w-xl mx-auto shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <Terminal className="h-10 w-10 text-black mx-auto" />
            <h3 className="text-xl font-black uppercase italic">No Contributors Found</h3>
            <p className="text-xs font-bold text-zinc-600">Be the first developer to contribute to Chapter 4!</p>
            <Button asChild className="bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs">
              <Link href="/contribute">Contribute Now</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {viewMode === 'circle' && N > 0 ? (
              /* CIRCLE VIEW */
              <div className="relative w-full max-w-[440px] md:max-w-[520px] aspect-square mx-auto flex items-center justify-center my-8">
                
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none select-none z-0" viewBox="0 0 500 500">
                  {contributors.map((c, i) => {
                    const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                    const x = 250 + 180 * Math.cos(angle);
                    const y = 250 + 180 * Math.sin(angle);
                    const isHovered = hoveredId === c.id;
                    return (
                      <line
                        key={c.id}
                        x1={250}
                        y1={250}
                        x2={x}
                        y2={y}
                        className={cn(
                          "transition-all duration-300",
                          isHovered 
                            ? "stroke-black stroke-[3px] opacity-100" 
                            : "stroke-zinc-300 stroke-[2px] opacity-60"
                        )}
                        style={{
                          strokeDasharray: isHovered ? "none" : "6,6"
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Central Info Hub */}
                <div className="absolute w-[200px] h-[200px] md:w-[230px] md:h-[230px] rounded-full bg-white border-4 border-black flex flex-col items-center justify-center text-center p-4 shadow-[8px_8px_0px_0px_#FFE600] z-20 transition-all duration-300">
                  {activeHovered ? (
                    <div className="space-y-1.5 animate-in fade-in zoom-in duration-200">
                      <p className="text-sm font-black uppercase tracking-tight text-black line-clamp-1">
                        {activeHovered.name}
                      </p>
                      {activeHovered.github && (
                        <a 
                          href={`https://github.com/${activeHovered.github}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-black text-[#4285F4] hover:underline flex items-center justify-center gap-1"
                        >
                          <Github className="h-3.5 w-3.5" /> @{activeHovered.github}
                        </a>
                      )}
                      {activeHovered.department && (
                        <p className="text-[10px] uppercase tracking-wider font-black text-black px-2 py-0.5 border border-black bg-[#FFE600] inline-block">
                          {activeHovered.department.split(' ')[0]}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-700 leading-tight font-bold max-w-[150px] mx-auto italic mt-1 line-clamp-2">
                        {activeHovered.skills}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 select-none animate-in fade-in duration-300">
                      <div className="w-10 h-10 border-2 border-black bg-[#FFE600] flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000000]">
                        <Terminal className="h-5 w-5 text-black" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-black">
                        Dev Network
                      </h4>
                      <p className="text-[10px] text-zinc-600 leading-tight max-w-[140px] mx-auto font-bold">
                        Hover or tap on contributor nodes to view commits
                      </p>
                      <div className="text-[10px] font-black text-black uppercase bg-[#00FF66] border border-black px-2 py-0.5 inline-block shadow-[2px_2px_0px_0px_#000000]">
                        {contributors.length} Developers
                      </div>
                    </div>
                  )}
                </div>

                {/* Contributor Circular Nodes */}
                {contributors.map((contrib, i) => {
                  const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
                  const x = 250 + 180 * Math.cos(angle);
                  const y = 250 + 180 * Math.sin(angle);
                  const isHovered = hoveredId === contrib.id;
                  const avatarUrl = contrib.avatarUrl || (contrib.github ? `https://github.com/${contrib.github}.png` : null);

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
                          "relative h-12 w-12 md:h-14 md:w-14 border-2 border-black transition-all duration-300 flex items-center justify-center overflow-hidden focus:outline-none",
                          isHovered 
                            ? "bg-[#FFE600] scale-125 shadow-[4px_4px_0px_0px_#000000] z-40" 
                            : "bg-white shadow-[3px_3px_0px_0px_#000000] hover:scale-110"
                        )}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={contrib.name}
                            className="h-full w-full object-cover select-none bg-zinc-100"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-zinc-100 flex items-center justify-center font-black text-xs text-black">
                            {contrib.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}

              </div>
            ) : (
              /* DIRECTORY GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl w-full py-4 animate-in fade-in duration-300">
                {contributors.map((contrib) => {
                  const avatarUrl = contrib.avatarUrl || (contrib.github ? `https://github.com/${contrib.github}.png` : null);

                  return (
                    <div
                      key={contrib.id}
                      className="group relative flex flex-col bg-white border-2 border-black p-5 shadow-[5px_5px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#FFE600] transition-all duration-200"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative h-14 w-14 border-2 border-black bg-zinc-100 shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_#000000]">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={contrib.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-zinc-200 flex items-center justify-center font-black text-sm text-black">
                              {contrib.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black uppercase tracking-tight text-black truncate">
                            {contrib.name}
                          </p>
                          {contrib.github && (
                            <a
                              href={`https://github.com/${contrib.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-[#4285F4] hover:underline flex items-center gap-1 mt-0.5 truncate"
                            >
                              <Github className="h-3 w-3 shrink-0" /> @{contrib.github}
                            </a>
                          )}
                          {contrib.department && (
                            <span className="inline-block text-[9px] uppercase tracking-wider font-black px-2 py-0.5 border border-black bg-[#FFE600] text-black mt-1">
                              {contrib.department.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="border-t-2 border-black pt-3 mt-auto">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1">Contributions</p>
                        <p className="text-xs text-zinc-800 font-bold leading-relaxed line-clamp-2">
                          {contrib.skills || 'Active contributor to MLSC codebase'}
                        </p>
                      </div>

                      {contrib.github && (
                        <div className="pt-3 mt-3 border-t border-zinc-200 flex justify-end">
                          <a
                            href={`https://github.com/${contrib.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black hover:text-[#4285F4] transition-colors"
                          >
                            GitHub Profile <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA Box */}
        <div className="border-2 border-black bg-[#FFE600] p-8 sm:p-10 shadow-[8px_8px_0px_0px_#000000] text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0px_0px_#000000] text-xs font-black uppercase tracking-widest text-black">
            <Heart className="h-3.5 w-3.5 text-[#EA4335] fill-[#EA4335]" /> Join The Dev Force
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight text-black">
            Want to Build Next-Gen Student Tools?
          </h2>

          <p className="text-zinc-800 text-xs sm:text-sm font-bold max-w-lg mx-auto leading-relaxed">
            Contribute features, fix platform issues, or propose new tools. All student contributions are recognized and credited on the official Chapter 4 leaderboard.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              className="bg-black text-white hover:bg-zinc-800 border-2 border-black shadow-[4px_4px_0px_0px_#ffffff] font-black uppercase tracking-wider text-xs px-8 h-12"
            >
              <Link href="/contribute">
                Submit Contribution <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white text-black hover:bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_#000000] font-black uppercase tracking-wider text-xs px-8 h-12"
            >
              <Link href="/issue-tracker">
                Browse Open Issues
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
