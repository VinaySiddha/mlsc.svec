'use client';

import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserStudyProgress, getStudyLeaderboard } from '@/lib/user-service';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowRight, BookOpen, AlertCircle, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { courses, Course } from '@/lib/study-data';
import { Separator } from '@/components/ui/separator';

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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1">

        {/* ── Hero section ── */}
        <section className="relative w-full pt-36 pb-12 overflow-hidden">
          <div className="glow-sphere top-[-5%] right-[-5%] w-[45%] h-[45%] bg-[#7C3AED]/15" />
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-xs font-semibold tracking-wider text-white/50 mb-6 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" /> Smart Progress Hub
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                Study <span className="text-[#7C3AED]">Roadmaps.</span>
              </h1>
              <p className="mt-8 text-white/40 text-lg font-medium max-w-2xl leading-relaxed">
                Unlock structured curriculums designed to elevate your technical prowess. Track your learning progress, reference recommended materials, and solve curated interview challenges.
              </p>
              
              {/* Beta Warning Banner */}
              <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.02] text-yellow-500/90 text-sm font-medium leading-relaxed max-w-2xl backdrop-blur-xl">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-extrabold uppercase tracking-wider text-[10px] bg-yellow-500/20 px-2 py-0.5 rounded mr-2">Beta Testing</span>
                  This feature is currently under active beta testing. Soon, the full version with tracking and curated challenges will be officially out!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Anonymous Warning ── */}
        {!user && (
          <div className="container mx-auto px-6 mb-12">
            <div className="max-w-6xl mx-auto rounded-3xl border border-yellow-500/15 bg-yellow-500/03 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                <p className="text-sm text-white/80 font-medium leading-relaxed">
                  You are tracking your study paths anonymously. <span className="text-yellow-500 font-bold">Sign in now</span> to back up your achievements and synchronize progress across all of your devices.
                </p>
              </div>
              <Button asChild size="sm" className="rounded-xl tracking-wide uppercase text-xs h-9 px-5 shrink-0">
                <Link href="/auth/login?redirect=/study">Sign In</Link>
              </Button>
            </div>
          </div>
        )}

        {/* ── Main content layout grid ── */}
        <section className="container mx-auto px-6 pb-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Area: Progress Banner & Learning Paths (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Overall Progress Banner */}
              <div className="bento-card border-white/5 bg-[#0e0e0e]/50 backdrop-blur-xl p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="glow-sphere bottom-[-50%] left-[-10%] w-[50%] h-[150%] bg-[#7C3AED]/10 pointer-events-none" />
                <div className="space-y-2 relative z-10 max-w-md">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#7C3AED]">Aggregated Learning</h3>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">Your Master Progress</h2>
                  <p className="text-white/40 text-sm">
                    This metrics dashboard tracks your progress combined across the entire suite of structured curriculums.
                  </p>
                </div>
                <div className="flex-1 md:max-w-md relative z-10 space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black tracking-tighter text-white">{overallPercentage}%</span>
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{totalCompletedAll} / {totalTopicsAll} Topics Done</span>
                  </div>
                  <Progress value={overallPercentage} className="h-3 bg-white/5" />
                </div>
              </div>

              {/* Course Grid */}
              <div className="space-y-6">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 px-2">Structured Learning Paths</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => {
                    const completed = getCourseCompletedCount(course);
                    const total = getCourseTopicCount(course);
                    const percent = getCoursePercent(course);
                    
                    return (
                      <div 
                        key={course.id}
                        className="bento-card border border-white/5 bg-[#080808]/70 backdrop-blur-xl p-8 rounded-3xl flex flex-col justify-between h-full group hover:border-white/10 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Top highlight glow */}
                        <div 
                          className="absolute top-0 left-0 w-full h-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: course.color }}
                        />
                        
                        <div className="space-y-6">
                          {/* Title and Badge row */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl bg-white/[0.02] border border-white/5 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {course.icon}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
                                  {course.title}
                                </h3>
                                <p className="text-xs text-white/30 font-bold uppercase tracking-wider mt-1">{total} curriculum topics</p>
                              </div>
                            </div>
                            
                            <Badge
                              variant="outline"
                              className="border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                              style={{ color: course.color, borderColor: `${course.color}25`, backgroundColor: `${course.color}05` }}
                            >
                              {percent}% Complete
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-white/50 text-sm leading-relaxed min-h-[48px]">
                            {course.description}
                          </p>
                        </div>

                        {/* Bottom Section: Progress bar and CTA button */}
                        <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-wider">
                              <span>Syllabus Progress</span>
                              <span>{completed} / {total} Topics</span>
                            </div>
                            <Progress value={percent} className="h-2 bg-white/5" />
                          </div>

                          <Button 
                            asChild
                            className="w-full rounded-2xl font-bold uppercase text-xs tracking-wider h-12"
                          >
                            <Link href={`/study/${course.id}`} className="flex items-center justify-center gap-2">
                              Enter Study Path <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Area: Study Leaderboard (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bento-card border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 rounded-3xl space-y-6 relative overflow-hidden">
                <div className="glow-sphere top-[-20%] right-[-20%] w-[50%] h-[50%] bg-yellow-500/10 pointer-events-none" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-tight text-white">Leaderboard</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Top Solvers Performance</p>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Loading solvers...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-xs font-bold uppercase tracking-widest">
                    No solved problems yet.
                  </div>
                ) : (
                  <div className="space-y-4 relative z-10">
                    {leaderboard.map((leader, index) => {
                      const isCurrentUser = user && leader.uid === user.uid;
                      const rankColors = [
                        'text-yellow-500', // Gold
                        'text-zinc-300',   // Silver
                        'text-amber-700',  // Bronze
                      ];

                      return (
                        <div 
                          key={leader.uid}
                          className={`p-3 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                            isCurrentUser 
                              ? 'border-[#7C3AED]/30 bg-[#7C3AED]/05'
                              : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10'
                          }`}
                        >
                          {leader.username ? (
                            <Link 
                              href={`/profile/${leader.username}`} 
                              className="flex items-center gap-3.5 min-w-0 group hover:opacity-80 transition-opacity"
                            >
                              {/* Rank Badge */}
                              <span className={`text-sm font-black w-5 shrink-0 text-center ${rankColors[index] || 'text-white/40'}`}>
                                {index + 1}
                              </span>
                              
                              {/* Avatar or Initial */}
                              <Avatar className="h-9 w-9 shrink-0 border border-white/10">
                                <AvatarImage src={leader.photoURL || undefined} alt={leader.displayName} className="object-cover h-full w-full" />
                                <AvatarFallback className="text-xs font-black uppercase text-white/40 bg-white/5 flex items-center justify-center h-full w-full">
                                  {leader.displayName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>

                              {/* User details */}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate max-w-[130px] leading-tight group-hover:underline">
                                  {leader.displayName}
                                </h4>
                                <p className="text-[10px] text-white/30 truncate leading-none mt-0.5">
                                  @{leader.username}
                                </p>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Rank Badge */}
                              <span className={`text-sm font-black w-5 shrink-0 text-center ${rankColors[index] || 'text-white/40'}`}>
                                {index + 1}
                              </span>
                              
                              {/* Avatar or Initial */}
                              <Avatar className="h-9 w-9 shrink-0 border border-white/10">
                                <AvatarImage src={leader.photoURL || undefined} alt={leader.displayName} className="object-cover h-full w-full" />
                                <AvatarFallback className="text-xs font-black uppercase text-white/40 bg-white/5 flex items-center justify-center h-full w-full">
                                  {leader.displayName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>

                              {/* User details */}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate max-w-[130px] leading-tight">
                                  {leader.displayName}
                                </h4>
                              </div>
                            </div>
                          )}

                          {/* Problems Solved Badge */}
                          <div className="text-right shrink-0 pl-2">
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-white/10 bg-white/5 ${
                                index === 0 ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/03' : 'text-white/60'
                              }`}
                            >
                              {leader.studyProblemsSolved} solved
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2 text-center relative z-10">
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-wider leading-relaxed">
                    Check off problems inside sheets to level up your status on the global ranking board!
                  </p>
                </div>

              </div>

            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
