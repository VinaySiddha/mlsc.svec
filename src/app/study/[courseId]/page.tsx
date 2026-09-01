'use client';

import { use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserStudyProgress, updateUserStudyProgress, getStudyLeaderboard } from '@/lib/user-service';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, ExternalLink, BookOpen, AlertCircle, CheckCircle2, Play, Search, Filter, Trophy, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { courses, Course, Topic } from '@/lib/study-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
          <p className="text-xs font-black uppercase tracking-widest">Loading Syllabus Workspace...</p>
        </div>
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
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Interactive Learning Portals — Curated Technical Roadmaps
      </div>

      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl">
          
          {/* Header Navigation Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000000]">
            <Link 
              href="/study" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black hover:text-[#4285F4] transition-colors border-2 border-black bg-zinc-100 hover:bg-white px-4 py-2 shadow-[2px_2px_0px_0px_#000000]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Roadmaps Hub
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 border-2 border-black bg-[#FFE600] shadow-[2px_2px_0px_0px_#000000]">
                {course.icon}
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-black">
                  {course.title}
                </h1>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  Chapter 4 Curated Curriculum
                </p>
              </div>
            </div>
          </div>

          {/* Anonymous Warning Banner */}
          {!user && (
            <div className="border-2 border-black bg-[#FFE600]/20 p-4 shadow-[4px_4px_0px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-black shrink-0" />
                <p className="text-xs font-bold text-black">
                  Saving progress locally on this browser. <span className="underline font-black">Sign in</span> to permanently back up your score.
                </p>
              </div>
              <Button asChild size="sm" className="bg-black text-white hover:bg-zinc-800 border-2 border-black shadow-[2px_2px_0px_0px_#FFE600] font-black uppercase text-xs h-8 px-4 shrink-0">
                <Link href="/auth/login?redirect=/study">Sign In</Link>
              </Button>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Progress & Workspace Filters (3 Cols) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
              
              {/* Progress Box */}
              <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] space-y-4">
                <div className="flex justify-between items-end border-b-2 border-black pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#4285F4]">Roadmap Progress</h3>
                  <span className="text-[10px] font-black font-mono">{completedCount}/{totalCount}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter font-mono text-black">
                    {percent}%
                  </span>
                  <span className="text-[10px] font-black uppercase text-zinc-500">Done</span>
                </div>
                
                <div className="w-full h-3 border-2 border-black bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-[#00FF66] border-r border-black transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Filters Box */}
              <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000000] space-y-5">
                <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2 border-b-2 border-black pb-2">
                  <Filter className="h-3.5 w-3.5" /> Workspace Filters
                </h4>
                
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 border-2 border-black text-xs font-bold py-2 pl-9 pr-3 text-black placeholder:text-zinc-400 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Difficulty</p>
                  <div className="grid grid-cols-4 gap-1 border-2 border-black p-1 bg-zinc-50">
                    {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={cn(
                          "py-1 text-[9px] font-black uppercase tracking-wider transition-all",
                          selectedDifficulty === diff
                            ? "bg-black text-white"
                            : "text-zinc-600 hover:text-black hover:bg-zinc-200"
                        )}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Completion Status</p>
                  <div className="grid grid-cols-3 gap-1 border-2 border-black p-1 bg-zinc-50">
                    {(['All', 'Completed', 'Uncompleted'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "py-1 text-[9px] font-black uppercase tracking-wider transition-all",
                          selectedStatus === status
                            ? "bg-black text-white"
                            : "text-zinc-600 hover:text-black hover:bg-zinc-200"
                        )}
                      >
                        {status === 'Uncompleted' ? 'Todo' : status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Syllabus Index */}
              <div className="border-2 border-black bg-zinc-50 p-4 shadow-[4px_4px_0px_0px_#000000] hidden lg:block max-h-[300px] overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Syllabus Modules</p>
                <div className="space-y-1">
                  {course.modules.map((m) => {
                    const mTotal = m.topics.length;
                    const mCompleted = m.topics.filter(t => completedTopics.includes(t.id)).length;
                    const isModuleCompleted = mTotal > 0 && mCompleted === mTotal;

                    return (
                      <a
                        key={m.id}
                        href={`#${m.id}`}
                        className="w-full text-left px-2 py-1.5 border border-transparent hover:border-black hover:bg-white flex items-center justify-between text-[11px] font-bold text-zinc-700 hover:text-black transition-all"
                      >
                        <span className="truncate max-w-[150px]">{m.title}</span>
                        {isModuleCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-black shrink-0" />
                        ) : (
                          <span className="text-[9px] font-mono text-zinc-400">{mCompleted}/{mTotal}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Center Column: Modules & Topics Checklist (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              {course.modules.map((module) => {
                const matchingTopics = filterTopics(module.topics);
                if (matchingTopics.length === 0) return null;

                const mTotal = module.topics.length;
                const mCompleted = module.topics.filter(t => completedTopics.includes(t.id)).length;
                const isModuleCompleted = mTotal > 0 && mCompleted === mTotal;

                return (
                  <div
                    key={module.id}
                    id={module.id}
                    className={cn(
                      "border-2 border-black p-6 space-y-5 scroll-mt-24 transition-all",
                      isModuleCompleted
                        ? "bg-[#00FF66]/10 shadow-[4px_4px_0px_0px_#00FF66]"
                        : "bg-white shadow-[5px_5px_0px_0px_#000000]"
                    )}
                  >
                    {/* Module Title Header */}
                    <div className="flex justify-between items-center pb-3 border-b-2 border-black">
                      <h3 className="text-sm font-black uppercase italic tracking-tight text-black">
                        {module.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 px-2 py-0.5 border border-black font-mono">
                          {mCompleted} / {mTotal} Done
                        </span>
                        {isModuleCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-black" />
                        )}
                      </div>
                    </div>

                    {/* Topics listing */}
                    <div className="space-y-3">
                      {matchingTopics.map((topic) => {
                        const isCompleted = completedTopics.includes(topic.id);

                        return (
                          <div
                            key={topic.id}
                            className={cn(
                              "p-4 border-2 border-black flex flex-col gap-3 transition-all",
                              isCompleted
                                ? "bg-zinc-50 border-black/60 opacity-80"
                                : "bg-white shadow-[2px_2px_0px_0px_#000000]"
                            )}
                          >
                            {/* Topic Title Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={topic.id}
                                  checked={isCompleted}
                                  onCheckedChange={(checked) =>
                                    handleTopicToggle(course.id, topic.id, !!checked)
                                  }
                                  className="h-5 w-5 rounded-none mt-0.5 border-2 border-black data-[state=checked]:bg-[#00FF66] data-[state=checked]:text-black cursor-pointer"
                                />
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <label
                                      htmlFor={topic.id}
                                      className={cn(
                                        "text-xs sm:text-sm font-black uppercase tracking-tight cursor-pointer",
                                        isCompleted ? "line-through text-zinc-500" : "text-black"
                                      )}
                                    >
                                      {topic.title}
                                    </label>
                                    <span
                                      className={cn(
                                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.2 border border-black",
                                        topic.difficulty === 'Easy'
                                          ? "bg-[#00FF66]/40 text-black"
                                          : topic.difficulty === 'Medium'
                                          ? "bg-[#FFE600] text-black"
                                          : "bg-[#EA4335] text-white"
                                      )}
                                    >
                                      {topic.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                    Est: {topic.duration}
                                  </p>
                                </div>
                              </div>
                              {isCompleted && (
                                <CheckCircle2 className="h-4 w-4 text-black shrink-0" />
                              )}
                            </div>

                            {/* Resource Links & Video Solutions */}
                            <div className="pl-8 flex flex-wrap gap-2 items-center">
                              {topic.leetcodeUrl && (
                                <a
                                  href={topic.leetcodeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black bg-[#FFA116]/20 border border-black px-2.5 py-1 hover:bg-[#FFA116]/40 transition-all shadow-[1px_1px_0px_0px_#000000]"
                                >
                                  <span>LeetCode</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {topic.codingNinjasUrl && (
                                <a
                                  href={topic.codingNinjasUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black bg-orange-100 border border-black px-2.5 py-1 hover:bg-orange-200 transition-all shadow-[1px_1px_0px_0px_#000000]"
                                >
                                  <span>Coding Ninjas</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {topic.gfgUrl && (
                                <a
                                  href={topic.gfgUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black bg-green-100 border border-black px-2.5 py-1 hover:bg-green-200 transition-all shadow-[1px_1px_0px_0px_#000000]"
                                >
                                  <span>GFG</span>
                                  <ExternalLink className="h-3 w-3" />
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
                                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-[#EA4335] border border-black px-2.5 py-1 hover:bg-[#EA4335]/90 transition-all shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                                >
                                  <Play className="h-3 w-3 fill-current" />
                                  <span>Video Tutorial</span>
                                </button>
                              )}
                            </div>

                            {/* Additional documentation links */}
                            {topic.resources && topic.resources.length > 0 && (
                              <div className="pl-8 border-l-2 border-zinc-200 ml-2 pt-1">
                                <div className="flex flex-wrap gap-2">
                                  {topic.resources.map((res, i) => (
                                    <a
                                      key={i}
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 hover:text-black border border-zinc-300 bg-zinc-50 px-2 py-0.5 hover:bg-zinc-100 transition-all"
                                    >
                                      {res.name} <ExternalLink className="h-2.5 w-2.5" />
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

            {/* Right Column: Real Solvers Leaderboard (3 Cols) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
              <div className="border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_#FFE600] space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                  <Trophy className="h-4 w-4 text-black" />
                  <h3 className="text-xs font-black uppercase italic tracking-tight">Leaderboard</h3>
                </div>

                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-black" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Loading...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-4 text-xs font-bold text-zinc-500">
                    No solved problems yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {leaderboard.map((leader, index) => {
                      const isCurrentUser = user && leader.uid === user.uid;

                      return (
                        <div
                          key={leader.uid}
                          className={cn(
                            "p-2 border-2 border-black flex items-center justify-between text-xs transition-all",
                            isCurrentUser ? "bg-[#FFE600]/40" : "bg-zinc-50"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-black text-xs w-4 shrink-0 text-center font-mono">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-black uppercase truncate text-[11px] text-black">
                                {leader.displayName}
                              </p>
                              {leader.username && (
                                <p className="text-[9px] text-zinc-500 truncate">@{leader.username}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5 border border-black shrink-0 font-mono">
                            {leader.studyProblemsSolved || 0}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Video Player Modal */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="bg-white border-4 border-black text-black p-6 max-w-3xl w-[95vw] shadow-[8px_8px_0px_0px_#000000] rounded-none">
          <DialogHeader className="border-b-2 border-black pb-3 mb-4">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2 text-black">
              <span className="w-3 h-3 rounded-full bg-[#EA4335] animate-ping" /> Video Solution & Lecture
            </DialogTitle>
            <DialogDescription className="text-zinc-700 text-xs font-bold mt-1">
              {activeVideo?.title}
            </DialogDescription>
          </DialogHeader>

          {activeVideo && (
            <div className="relative aspect-video w-full border-2 border-black bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-none"
              ></iframe>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setActiveVideo(null)}
              className="bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-9 px-5"
            >
              Close Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
