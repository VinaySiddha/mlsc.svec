'use client';

import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserStudyProgress, getStudyLeaderboard } from '@/lib/user-service';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowRight, BookOpen, AlertCircle, Sparkles, Trophy, CheckCircle2, Flame, Layers } from 'lucide-react';
import Link from 'next/link';
import { courses, Course } from '@/lib/study-data';
import { cn } from '@/lib/utils';

export default function StudyTrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Load progress and leaderboard
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      setLoadingProgress(true);
      if (user) {
        // Fetch from Firestore
        const dbProgress = await getUserStudyProgress(user.uid);
        setProgress(dbProgress);
      } else {
        // Fallback to localStorage
        const localData = localStorage.getItem('mlsc_study_progress');
        if (localData) {
          try {
            setProgress(JSON.parse(localData));
          } catch {
            setProgress({});
          }
        } else {
          setProgress({});
        }
      }
      setLoadingProgress(false);
    })();

    (async () => {
      setLoadingLeaderboard(true);
      const data = await getStudyLeaderboard(5);
      setLeaderboard(data);
      setLoadingLeaderboard(false);
    })();
  }, [user, authLoading]);

  // Helper: Count topics
  const getCourseTopicCount = (course: Course) => {
    let count = 0;
    course.modules.forEach(m => {
      count += m.topics.length;
    });
    return count;
  };

  const getCourseCompletedCount = (course: Course) => {
    const completedList = progress[course.id] || [];
    let count = 0;
    course.modules.forEach(m => {
      m.topics.forEach(t => {
        if (completedList.includes(t.id)) count++;
      });
    });
    return count;
  };

  const getCoursePercent = (course: Course) => {
    const total = getCourseTopicCount(course);
    if (total === 0) return 0;
    const completed = getCourseCompletedCount(course);
    return Math.round((completed / total) * 100);
  };

  // Calculate Overall Tracker stats
  const totalTopicsAll = courses.reduce((acc, c) => acc + getCourseTopicCount(c), 0);
  const totalCompletedAll = courses.reduce((acc, c) => acc + getCourseCompletedCount(c), 0);
  const overallPercentage = totalTopicsAll === 0 ? 0 : Math.round((totalCompletedAll / totalTopicsAll) * 100);

  if (authLoading || loadingProgress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
          <p className="text-xs font-black uppercase tracking-widest">Loading Study Portals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Notification Bar */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Interactive Learning Portals — Curated Technical Roadmaps
      </div>

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl">
          
          {/* Hero Section */}
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-1.5 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-widest text-black">
              <Sparkles className="h-4 w-4" /> [ SMART PROGRESS HUB // CURATED CURRICULUM ]
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.95] text-black">
              Study <br />
              <span className="text-[#4285F4]">Roadmaps.</span>
            </h1>

            <p className="text-zinc-700 text-sm sm:text-base font-bold max-w-2xl leading-relaxed">
              Unlock industry-grade structured learning tracks. Master Data Structures, System Design, Full Stack Architecture, and interview-proven problems with real-time progress syncing.
            </p>
          </div>

          {/* Anonymous Warning Banner (if not logged in) */}
          {!user && (
            <div className="border-2 border-black bg-[#FFE600]/20 p-5 shadow-[4px_4px_0px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-black shrink-0" />
                <p className="text-xs sm:text-sm font-bold text-black leading-relaxed">
                  You are tracking your study progress locally. <span className="underline font-black">Sign in</span> to sync your achievements across all your devices and appear on the official leaderboard.
                </p>
              </div>
              <Button
                asChild
                className="bg-black text-white hover:bg-zinc-800 border-2 border-black shadow-[3px_3px_0px_0px_#FFE600] font-black uppercase text-xs h-10 px-6 shrink-0"
              >
                <Link href="/auth/login?redirect=/study">Sign In</Link>
              </Button>
            </div>
          )}

          {/* Main Layout Grid (Course Cards + Leaderboard Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content Area (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Master Progress Bento Card */}
              <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 border-2 border-black bg-[#00FF66]">
                      <CheckCircle2 className="h-4 w-4 text-black" />
                    </span>
                    <h2 className="text-lg sm:text-xl font-black uppercase italic tracking-tight">
                      Master Completion Metric
                    </h2>
                  </div>
                  <span className="text-xs font-black font-mono bg-zinc-100 px-2.5 py-1 border border-black">
                    {totalCompletedAll} of {totalTopicsAll} Modules Completed
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black tracking-tighter text-[#4285F4] font-mono">
                    {overallPercentage}%
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    Aggregate Curriculum Progress
                  </span>
                </div>

                {/* Brutalist Progress Bar */}
                <div className="w-full h-4 border-2 border-black bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-[#00FF66] border-r-2 border-black transition-all duration-500"
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
              </div>

              {/* Course Tracks Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                    <Layers className="h-4 w-4" /> Available Learning Tracks
                  </h3>
                  <span className="text-xs font-bold text-zinc-500 font-mono">
                    {courses.length} Specializations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {courses.map((course) => {
                    const cTopics = getCourseTopicCount(course);
                    const cCompleted = getCourseCompletedCount(course);
                    const cPercent = getCoursePercent(course);

                    return (
                      <div
                        key={course.id}
                        className="group flex flex-col justify-between border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#FFE600] transition-all"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-3xl p-2 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                              {course.icon}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 border border-black bg-[#FFE600] font-mono">
                              {cPercent}% DONE
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xl font-black uppercase italic tracking-tight group-hover:text-[#4285F4] transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-xs text-zinc-600 font-bold leading-relaxed line-clamp-2 mt-1">
                              {course.description}
                            </p>
                          </div>

                          {/* Progress bar inside card */}
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-[10px] font-black uppercase text-zinc-600">
                              <span>Progress</span>
                              <span>{cCompleted} / {cTopics} Topics</span>
                            </div>
                            <div className="w-full h-2.5 border-2 border-black bg-zinc-100 overflow-hidden">
                              <div
                                className="h-full bg-[#FFE600] border-r border-black transition-all duration-300"
                                style={{ width: `${cPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 mt-4 border-t-2 border-black">
                          <Button
                            asChild
                            className="w-full bg-black text-white hover:bg-zinc-800 border-2 border-black shadow-[3px_3px_0px_0px_#FFE600] font-black uppercase tracking-wider text-xs h-10"
                          >
                            <Link href={`/study/${course.id}`} className="flex items-center justify-center gap-2">
                              Open Roadmap <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Sidebar: Real Leaderboard (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#FFE600] space-y-5">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 border-2 border-black bg-[#FFE600]">
                      <Trophy className="h-4 w-4 text-black" />
                    </span>
                    <h3 className="text-sm font-black uppercase italic tracking-tight">
                      Top Solvers
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
                    Live Board
                  </span>
                </div>

                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-black" />
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                      Loading leaderboard...
                    </p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-black bg-zinc-50 p-4">
                    <p className="text-xs font-bold text-zinc-600">No solved problems recorded yet. Solve your first problem to rank #1!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((leader, index) => {
                      const isCurrentUser = user && leader.uid === user.uid;
                      const rankBadges = [
                        'bg-[#FFE600] text-black', // 1st
                        'bg-zinc-200 text-black',   // 2nd
                        'bg-amber-200 text-black',  // 3rd
                      ];

                      return (
                        <div
                          key={leader.uid}
                          className={cn(
                            "p-3 border-2 border-black flex items-center justify-between transition-all",
                            isCurrentUser
                              ? "bg-[#00FF66]/20 shadow-[3px_3px_0px_0px_#000000]"
                              : "bg-zinc-50 hover:bg-white shadow-[2px_2px_0px_0px_#000000]"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Rank Number */}
                            <span className={cn(
                              "w-6 h-6 border-2 border-black flex items-center justify-center text-xs font-black shrink-0",
                              rankBadges[index] || 'bg-white text-zinc-600'
                            )}>
                              {index + 1}
                            </span>

                            {/* User details */}
                            {leader.username ? (
                              <Link
                                href={`/profile/${leader.username}`}
                                className="min-w-0 group hover:opacity-80"
                              >
                                <h4 className="text-xs font-black uppercase tracking-tight text-black truncate group-hover:underline">
                                  {leader.displayName}
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-bold truncate">
                                  @{leader.username}
                                </p>
                              </Link>
                            ) : (
                              <div className="min-w-0">
                                <h4 className="text-xs font-black uppercase tracking-tight text-black truncate">
                                  {leader.displayName}
                                </h4>
                              </div>
                            )}
                          </div>

                          {/* Solved Count Badge */}
                          <div className="shrink-0 pl-2">
                            <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black">
                              {leader.studyProblemsSolved || 0} Solved
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-t-2 border-black pt-3 text-center">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    Check off syllabus topics to earn points and climb the board.
                  </p>
                </div>
              </div>

              {/* Motivational Brutalist Quote */}
              <div className="border-2 border-black bg-[#00FF66]/20 p-5 shadow-[4px_4px_0px_0px_#000000] space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-black" />
                  <span className="text-xs font-black uppercase tracking-widest text-black">Consistency First</span>
                </div>
                <p className="text-xs font-bold text-zinc-800 leading-relaxed">
                  Completing just 1 topic per day builds unstoppable momentum for high-impact campus and industry placements.
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
