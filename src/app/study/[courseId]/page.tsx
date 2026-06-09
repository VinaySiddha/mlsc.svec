'use client';

import { use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserStudyProgress, updateUserStudyProgress, getStudyLeaderboard } from '@/lib/user-service';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, ExternalLink, BookOpen, AlertCircle, CheckCircle, Play, Search, Filter, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { courses, Course, Topic } from '@/lib/study-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CourseDetailPage({ params }: Props) {
  const { courseId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [activeVideo, setActiveVideo] = useState<{ title: string; youtubeId: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Completed' | 'Uncompleted'>('All');

  // Find the selected course
  const course = courses.find((c) => c.id === courseId);

  // Load progress and leaderboard
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      setLoadingProgress(true);
      if (user) {
        const dbProgress = await getUserStudyProgress(user.uid);
        setProgress(dbProgress);
      } else {
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

  // Handle back nav if invalid course ID
  useEffect(() => {
    if (!authLoading && !course) {
      toast({ variant: 'destructive', title: 'Course Not Found', description: 'Redirecting to roadmaps hub...' });
      router.push('/study');
    }
  }, [course, authLoading, router, toast]);

  if (authLoading || loadingProgress || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  // Toggle topic completion
  const handleTopicToggle = async (courseId: string, topicId: string, checked: boolean) => {
    const courseProgress = progress[courseId] || [];
    let updatedTopics: string[] = [];

    if (checked) {
      if (!courseProgress.includes(topicId)) {
        updatedTopics = [...courseProgress, topicId];
      } else {
        updatedTopics = courseProgress;
      }
    } else {
      updatedTopics = courseProgress.filter(id => id !== topicId);
    }

    const updatedProgress = { ...progress, [courseId]: updatedTopics };
    setProgress(updatedProgress);

    if (user) {
      const res = await updateUserStudyProgress(user.uid, courseId, topicId, checked);
      if (!res.success) {
        toast({ variant: 'destructive', title: 'Sync Failed', description: 'Could not sync progress to database.' });
      } else {
        // Immediately fetch the updated leaderboard
        const data = await getStudyLeaderboard(5);
        setLeaderboard(data);
      }
    } else {
      localStorage.setItem('mlsc_study_progress', JSON.stringify(updatedProgress));
    }
  };

  // Helper: Count topics
  const getCourseTopicCount = (c: Course) => {
    let count = 0;
    c.modules.forEach(m => {
      count += m.topics.length;
    });
    return count;
  };

  const getCourseCompletedCount = (c: Course) => {
    const completedList = progress[c.id] || [];
    let count = 0;
    c.modules.forEach(m => {
      m.topics.forEach(t => {
        if (completedList.includes(t.id)) count++;
      });
    });
    return count;
  };

  const getCoursePercent = (c: Course) => {
    const total = getCourseTopicCount(c);
    if (total === 0) return 0;
    const completed = getCourseCompletedCount(c);
    return Math.round((completed / total) * 100);
  };

  const completedCount = getCourseCompletedCount(course);
  const totalCount = getCourseTopicCount(course);
  const percent = getCoursePercent(course);
  const completedTopics = progress[course.id] || [];

  // Filter Topics logic
  const filterTopics = (topics: Topic[]) => {
    return topics.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = selectedDifficulty === 'All' || t.difficulty === selectedDifficulty;
      const isCompleted = completedTopics.includes(t.id);
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Completed' && isCompleted) ||
        (selectedStatus === 'Uncompleted' && !isCompleted);

      return matchesSearch && matchesDiff && matchesStatus;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1 pt-32 pb-32">
        <div className="container mx-auto px-6">
          
          {/* Header navigation bar */}
          <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Link 
              href="/study" 
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Roadmaps Hub
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-3xl">{course.icon}</span>
              <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">{course.title}</h1>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Interactive Study Roadmap</p>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          {!user && (
            <div className="max-w-6xl mx-auto mb-10 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                <p className="text-sm text-white/80 font-medium">
                  Saving progress locally. <span className="text-yellow-500 font-bold">Sign in</span> to permanently back up your progress.
                </p>
              </div>
              <Button asChild size="sm" className="rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-500/90 tracking-wide uppercase text-xs h-9 px-4 shrink-0">
                <Link href="/auth/login?redirect=/study">Sign In</Link>
              </Button>
            </div>
          )}

          {/* Main Workspace layout */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Sticky Control Panel & Index Sidebar */}
            <div className="lg:col-span-3 lg:sticky lg:top-28 space-y-6">
              
              {/* Course Progress metrics */}
              <div className="bento-card border border-white/5 bg-[#0e0e0e]/50 backdrop-blur-xl p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#7C3AED]">Roadmap Progress</h3>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{completedCount} / {totalCount} completed</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter" style={{ color: course.color }}>{percent}%</span>
                  <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Completed</span>
                </div>
                <Progress value={percent} className="h-2 bg-white/5" />
              </div>

              {/* Filters Panel */}
              <div className="bento-card border border-white/5 bg-[#0e0e0e]/50 backdrop-blur-xl p-6 rounded-3xl space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5" /> Workspace Filters
                </h4>
                
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-white/20 focus:bg-white/[0.04] outline-none text-sm font-semibold rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/20 transition-all"
                  />
                </div>

                {/* Difficulty Filter Selector */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/30">Difficulty</p>
                  <div className="grid grid-cols-4 gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                    {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedDifficulty === diff
                            ? 'bg-white text-black font-extrabold shadow-lg'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter Selector */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/30">Completion Status</p>
                  <div className="grid grid-cols-3 gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                    {(['All', 'Completed', 'Uncompleted'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedStatus === status
                            ? 'bg-white text-black font-extrabold shadow-lg'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {status === 'Uncompleted' ? 'Todo' : status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Syllabus quick list */}
              <div className="bento-card border border-white/5 bg-[#0e0e0e]/50 backdrop-blur-xl p-6 rounded-3xl hidden lg:block max-h-[300px] overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 px-1 mb-4">Syllabus Index</p>
                <div className="space-y-1.5">
                  {course.modules.map((m) => {
                    const mTotal = m.topics.length;
                    const mCompleted = m.topics.filter(t => completedTopics.includes(t.id)).length;
                    const isModuleCompleted = mTotal > 0 && mCompleted === mTotal;
                    const matchingTopics = filterTopics(m.topics);
                    const isHidden = matchingTopics.length === 0;

                    if (isHidden) return null;

                    return (
                      <a
                        key={m.id}
                        href={`#${m.id}`}
                        className="w-full text-left px-3 py-2 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] flex items-center justify-between transition-all group/sidebar"
                      >
                        <span className="text-[11px] text-white/50 group-hover/sidebar:text-white font-semibold truncate max-w-[190px]">
                          {m.title}
                        </span>
                        {isModuleCompleted ? (
                          <CheckCircle className="h-3.5 w-3.5 text-[#34A853] shrink-0" />
                        ) : (
                          <span className="text-[9px] font-bold text-white/20 group-hover/sidebar:text-white/40 shrink-0">
                            {mCompleted}/{mTotal}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Center Column: Syllabus Detail and Cards */}
            <div className="lg:col-span-6 space-y-8">
              {course.modules.map((module) => {
                const matchingTopics = filterTopics(module.topics);
                
                // Hide day module card entirely if filters remove all topics
                if (matchingTopics.length === 0) return null;

                const mTotal = module.topics.length;
                const mCompleted = module.topics.filter(t => completedTopics.includes(t.id)).length;
                const isModuleCompleted = mTotal > 0 && mCompleted === mTotal;

                return (
                  <div 
                    key={module.id} 
                    id={module.id} 
                    className={`bento-card border bg-[#0e0e0e]/40 p-6 md:p-8 rounded-3xl space-y-6 scroll-mt-28 transition-all duration-300 ${
                      isModuleCompleted 
                        ? 'border-[#34A853]/20 bg-[#34A853]/01' 
                        : 'border-white/5'
                    }`}
                  >
                    {/* Module Title Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                        {module.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{mCompleted} / {mTotal} Done</span>
                        {isModuleCompleted && (
                          <CheckCircle className="h-4 w-4 text-[#34A853]" />
                        )}
                      </div>
                    </div>

                    {/* Topics listing */}
                    <div className="space-y-4">
                      {matchingTopics.map((topic) => {
                        const isCompleted = completedTopics.includes(topic.id);

                        return (
                          <div
                            key={topic.id}
                            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-4 ${
                              isCompleted
                                ? 'border-[#34A853]/15 bg-[#34A853]/03'
                                : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                            }`}
                          >
                            {/* Topic title row */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <Checkbox
                                  id={topic.id}
                                  checked={isCompleted}
                                  onCheckedChange={(checked) =>
                                    handleTopicToggle(course.id, topic.id, !!checked)
                                  }
                                  className="h-5 w-5 rounded-md mt-0.5 border-white/20 data-[state=checked]:bg-[#34A853] data-[state=checked]:border-none cursor-pointer"
                                />
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <label
                                      htmlFor={topic.id}
                                      className={`text-sm font-bold cursor-pointer transition-colors ${
                                        isCompleted ? 'text-white/40 line-through' : 'text-white hover:text-white/90'
                                      }`}
                                    >
                                      {topic.title}
                                    </label>
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                        topic.difficulty === 'Easy'
                                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                          : topic.difficulty === 'Medium'
                                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                          : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                                      }`}
                                    >
                                      {topic.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                                    Estimate: {topic.duration}
                                  </p>
                                </div>
                              </div>
                              {isCompleted && (
                                <CheckCircle className="h-5 w-5 text-[#34A853] shrink-0 mt-0.5" />
                              )}
                            </div>

                            {/* Resource Links & Video Solutions */}
                            <div className="pl-9 flex flex-wrap gap-2 items-center">
                              {topic.leetcodeUrl && (
                                <a
                                  href={topic.leetcodeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#FFA116] bg-[#FFA116]/5 border border-[#FFA116]/20 hover:border-[#FFA116]/40 px-3 py-1.5 rounded-xl transition-all font-semibold"
                                >
                                  <span>LeetCode</span>
                                  <ExternalLink className="h-3 w-3 opacity-60" />
                                </a>
                              )}
                              {topic.codingNinjasUrl && (
                                <a
                                  href={topic.codingNinjasUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#F37A20] bg-[#F37A20]/5 border border-[#F37A20]/20 hover:border-[#F37A20]/40 px-3 py-1.5 rounded-xl transition-all font-semibold"
                                >
                                  <span>Coding Ninjas</span>
                                  <ExternalLink className="h-3 w-3 opacity-60" />
                                </a>
                              )}
                              {topic.gfgUrl && (
                                <a
                                  href={topic.gfgUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#2F8D46] bg-[#2F8D46]/5 border border-[#2F8D46]/20 hover:border-[#2F8D46]/40 px-3 py-1.5 rounded-xl transition-all font-semibold"
                                >
                                  <span>GeeksforGeeks</span>
                                  <ExternalLink className="h-3 w-3 opacity-60" />
                                </a>
                              )}
                              {topic.youtubeId && (
                                <button
                                  onClick={() =>
                                    setActiveVideo({
                                      title: topic.title,
                                      youtubeId: topic.youtubeId!,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600/25 hover:border-rose-500/40 px-3 py-1.5 rounded-xl transition-all font-bold cursor-pointer"
                                >
                                  <Play className="h-3 w-3 fill-current text-rose-500 animate-pulse" />
                                  <span>Watch Video</span>
                                </button>
                              )}
                            </div>

                            {/* Additional Resources */}
                            {topic.resources && topic.resources.length > 0 && (
                              <div className="pl-9 border-l border-white/5 ml-2.5">
                                <div className="flex flex-wrap gap-2">
                                  {topic.resources.map((res, i) => (
                                    <a
                                      key={i}
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 px-3 py-1 rounded-xl transition-all"
                                    >
                                      {res.name} <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Leaderboard (lg:col-span-3) */}
            <div className="lg:col-span-3 lg:sticky lg:top-28 space-y-6">
              <div className="bento-card border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl p-5 rounded-3xl space-y-5 relative overflow-hidden">
                <div className="glow-sphere top-[-20%] right-[-20%] w-[50%] h-[50%] bg-yellow-500/10 pointer-events-none" />
                
                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-white">Leaderboard</h3>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Top Solvers Performance</p>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Loading solvers...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                    No solved problems yet.
                  </div>
                ) : (
                  <div className="space-y-3 relative z-10">
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
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                            isCurrentUser 
                              ? 'border-[#7C3AED]/30 bg-[#7C3AED]/05'
                              : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Rank Badge */}
                            <span className={`text-xs font-black w-4 shrink-0 text-center ${rankColors[index] || 'text-white/40'}`}>
                              {index + 1}
                            </span>
                            
                            {/* Avatar or Initial */}
                            <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {leader.photoURL ? (
                                <img src={leader.photoURL} alt={leader.displayName} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-black uppercase text-white/40">
                                  {leader.displayName.substring(0, 2)}
                                </span>
                              )}
                            </div>

                            {/* User details */}
                            <div className="min-w-0">
                              <h4 className="text-[11px] font-bold text-white truncate max-w-[90px] leading-tight">
                                {leader.displayName}
                              </h4>
                              {leader.username && (
                                <p className="text-[9px] text-white/30 truncate leading-none mt-0.5">
                                  @{leader.username}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Problems Solved Badge */}
                          <div className="text-right shrink-0 pl-1">
                            <Badge 
                              variant="outline" 
                              className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border-white/10 bg-white/5 ${
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

                <div className="pt-1 text-center relative z-10">
                  <p className="text-[8px] text-white/20 font-bold uppercase tracking-wider leading-relaxed">
                    Check off problems to level up!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Premium Video Player Dialog ── */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="bg-[#0c0c0c] border border-white/10 text-white rounded-3xl p-6 md:p-8 max-w-4xl w-[90vw] overflow-hidden">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
              <span className="text-[#FF0000] animate-pulse">●</span> Video Tutorial
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm font-semibold mt-1">
              {activeVideo?.title}
            </DialogDescription>
          </DialogHeader>

          {activeVideo && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-none rounded-2xl"
              ></iframe>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setActiveVideo(null)}
              className="rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 tracking-wide uppercase text-xs h-9 px-4 shrink-0 transition-transform active:scale-95"
            >
              Close Player
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
