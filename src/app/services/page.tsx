"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowLeft,
  Rocket,
  Briefcase,
  Award,
  GraduationCap,
  ShieldAlert,
  Brain,
  Clock,
  Play,
  ArrowRight,
  Plus,
  Trash2,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Interfaces matching backend schema
interface Resource {
  name: string;
  url: string;
}

interface InterviewQuestion {
  question: string;
  answer: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string;
  commonQuestions?: InterviewQuestion[];
  resources?: Resource[];
  status: "pending" | "in_progress" | "completed";
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  milestones: Milestone[];
  createdAt: string;
  topicName: string;
}

interface SavedJobInfo {
  id: string;
  title: string;
  topicName: string;
  timeframe: string;
  progress: number;
  createdAt: string;
}

export default function ServicesPage() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<"dashboard" | "roadmap">("dashboard");
  const [isMounted, setIsMounted] = useState(false);

  // Form Inputs
  const [topicInput, setTopicInput] = useState("");
  const [timeframe, setTimeframe] = useState("24 hours");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hfToken, setHfToken] = useState("");

  // Saved Roadmaps List
  const [savedJobs, setSavedJobs] = useState<SavedJobInfo[]>([]);

  // Active Roadmap State
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);

  // Detail Drawer State
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Expanded Milestones in View
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  // Code Copy State
  const [copiedCode, setCopiedCode] = useState(false);

  // API Call / Polling State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-defined Quick Recommendations
  const quickPills = [
    { label: "JavaScript Prep", topic: "JavaScript Frontend Developer", time: "24 hours" },
    { label: "React & Next.js", topic: "React and Next.js Core Features", time: "3 days" },
    { label: "System Design", topic: "System Design and Scalability", time: "1 week" },
    { label: "Python Backend", topic: "Python Backend and API design", time: "48 hours" },
  ];

  // Hydration safety
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("mlsc_roadmap_jobs");
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load a saved roadmap on start if present
  useEffect(() => {
    if (isMounted && savedJobs.length > 0 && !activeRoadmap) {
      handleLoadSavedRoadmap(savedJobs[0].id);
    }
  }, [savedJobs, isMounted]);

  // Animate loading bar to simulate agent tasks
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return 95;
          const increment = prev < 30 ? 1.5 : prev < 70 ? 0.8 : 0.3;
          const nextVal = prev + increment;
          if (nextVal < 35) setLoadingStep(1);
          else if (nextVal < 75) setLoadingStep(2);
          else setLoadingStep(3);
          return nextVal;
        });
      }, 500);
    } else {
      setLoadingProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Polling hook to check background task status from FastAPI via Next.js Proxy
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (loading && currentJobId) {
      const checkStatus = async () => {
        try {
          const res = await fetch(`/api/roadmap?job_id=${currentJobId}`);
          if (!res.ok) return;
          const job = await res.json();
          
          if (job.status === "completed") {
            const roadmapResult = job.result as Roadmap;
            const fullRoadmap: Roadmap = {
              ...roadmapResult,
              id: job.id,
              topicName: job.topic,
              timeframe: job.timeframe,
              createdAt: new Date().toLocaleDateString(),
            };
            
            fullRoadmap.milestones.forEach((m) => {
              m.topics.forEach((t) => {
                if (!t.status) t.status = "pending";
              });
            });

            localStorage.setItem(`mlsc_roadmap_job_${job.id}`, JSON.stringify(fullRoadmap));
            
            const newJobInfo: SavedJobInfo = {
              id: job.id,
              title: fullRoadmap.title || `${job.topic} Roadmap`,
              topicName: job.topic,
              timeframe: job.timeframe,
              progress: 0,
              createdAt: fullRoadmap.createdAt,
            };

            const updatedList = [newJobInfo, ...savedJobs.filter(j => j.id !== job.id)];
            setSavedJobs(updatedList);
            localStorage.setItem("mlsc_roadmap_jobs", JSON.stringify(updatedList));

            setActiveRoadmap(fullRoadmap);
            setLoading(false);
            setCurrentJobId(null);
            
            const initialExpanded: Record<string, boolean> = {};
            fullRoadmap.milestones.forEach((m) => {
              initialExpanded[m.id] = true;
            });
            setExpandedMilestones(initialExpanded);
            setActiveTab("roadmap");
          } else if (job.status === "failed") {
            setErrorMessage(job.error || "The AI crew failed to assemble your roadmap. Please try again.");
            setLoading(false);
            setCurrentJobId(null);
          } else if (job.status === "running") {
            setLoadingStep(2);
          }
        } catch (e: any) {
          console.error("Polling error:", e);
        }
      };

      pollInterval = setInterval(checkStatus, 4000);
    }

    return () => clearInterval(pollInterval);
  }, [loading, currentJobId, savedJobs]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setLoading(true);
    setLoadingStep(1);
    setLoadingProgress(0);
    setErrorMessage(null);
    setCurrentJobId(null);

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topicInput,
          timeframe,
          hf_token: hfToken.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to trigger roadmap generation");
      }

      const data = await res.json();
      setCurrentJobId(data.job_id);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to connect to the roadmap service. Make sure the Python backend is running.");
      setLoading(false);
    }
  };

  const handleQuickSelect = (pill: typeof quickPills[0]) => {
    setTopicInput(pill.topic);
    setTimeframe(pill.time);
  };

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }));
  };

  const handleLoadSavedRoadmap = (jobId: string) => {
    const raw = localStorage.getItem(`mlsc_roadmap_job_${jobId}`);
    if (raw) {
      try {
        const roadmap = JSON.parse(raw) as Roadmap;
        setActiveRoadmap(roadmap);
        
        const expanded: Record<string, boolean> = {};
        roadmap.milestones.forEach((m) => {
          expanded[m.id] = true;
        });
        setExpandedMilestones(expanded);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteRoadmap = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedJobs.filter((job) => job.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem("mlsc_roadmap_jobs", JSON.stringify(updated));
    localStorage.removeItem(`mlsc_roadmap_job_${jobId}`);
    
    if (activeRoadmap?.id === jobId) {
      setActiveRoadmap(null);
      setActiveTab("dashboard");
    }
  };

  const handleStatusChange = (milestoneId: string, topicId: string, newStatus: Topic["status"]) => {
    if (!activeRoadmap) return;

    const updatedRoadmap = { ...activeRoadmap };
    updatedRoadmap.milestones = updatedRoadmap.milestones.map((m) => {
      if (m.id === milestoneId) {
        const updatedTopics = m.topics.map((t) => {
          if (t.id === topicId) {
            const updatedTopic = { ...t, status: newStatus };
            if (selectedTopic && selectedTopic.id === topicId) {
              setSelectedTopic(updatedTopic);
            }
            return updatedTopic;
          }
          return t;
        });
        return { ...m, topics: updatedTopics };
      }
      return m;
    });

    let totalTopics = 0;
    let completedTopics = 0;

    updatedRoadmap.milestones.forEach((m) => {
      m.topics.forEach((t) => {
        totalTopics++;
        if (t.status === "completed") completedTopics++;
      });
    });

    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    setActiveRoadmap(updatedRoadmap);
    localStorage.setItem(`mlsc_roadmap_job_${activeRoadmap.id}`, JSON.stringify(updatedRoadmap));

    const updatedJobsList = savedJobs.map((job) => {
      if (job.id === activeRoadmap.id) {
        return { ...job, progress: progressPercent };
      }
      return job;
    });
    setSavedJobs(updatedJobsList);
    localStorage.setItem("mlsc_roadmap_jobs", JSON.stringify(updatedJobsList));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRoadmapProgressMetrics = () => {
    if (!activeRoadmap) return { percent: 0, completed: 0, total: 0 };
    let total = 0;
    let completed = 0;
    activeRoadmap.milestones.forEach((m) => {
      m.topics.forEach((t) => {
        total++;
        if (t.status === "completed") completed++;
      });
    });
    return {
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    };
  };

  const activeMetrics = getRoadmapProgressMetrics();

  return (
    <div className="w-full bg-white min-h-screen py-16 md:py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 MLSC Student Services & Career Intelligence Engine
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-8 pt-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-black hover:text-[#4285F4] transition-colors text-xs font-black uppercase tracking-wider mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-black">
              Student Career <span className="bg-[#FFE600] px-2 py-0.5 border-2 border-black shadow-[3px_3px_0px_0px_#000000]">Services</span>
            </h1>
          </div>
          
          <div className="inline-flex items-center gap-2 border-2 border-black bg-[#00FF66] text-black px-4 py-1.5 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-widest self-start sm:self-auto">
            <Rocket className="h-4 w-4" /> Multi-Agent AI Engine
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-black gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "px-5 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-b-0 border-black transition-all",
              activeTab === "dashboard"
                ? "bg-[#FFE600] text-black shadow-[2px_-2px_0px_0px_#000000]"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            Service Launcher
          </button>
          
          <button
            disabled={!activeRoadmap}
            onClick={() => setActiveTab("roadmap")}
            className={cn(
              "px-5 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-b-0 border-black transition-all flex items-center gap-2",
              !activeRoadmap
                ? "bg-zinc-50 text-zinc-400 cursor-not-allowed"
                : activeTab === "roadmap"
                  ? "bg-[#FFE600] text-black shadow-[2px_-2px_0px_0px_#000000]"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            Interactive Roadmap
            {activeRoadmap && (
              <span className="px-1.5 py-0.5 border border-black bg-white text-[9px] font-black text-black">
                {activeMetrics.percent}%
              </span>
            )}
          </button>
        </div>

        {/* Tab Content 1: Dashboard Launcher */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Box: Configuration Form (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                
                <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                  <div className="p-3 bg-[#FFE600] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000]">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-black">AI Interview Roadmap Generator</h3>
                    <p className="text-xs text-zinc-600 font-bold">Multi-agent Hugging Face pipeline for technical interview prep.</p>
                  </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black block">What are you preparing for?</label>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. JavaScript Frontend Developer, Python Data Analyst, System Design..."
                      disabled={loading}
                      className="w-full h-11 px-3 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000] disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black block">Preparation Timeframe</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["24 hours", "48 hours", "3 days"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setTimeframe(time)}
                          disabled={loading}
                          className={cn(
                            'h-10 border-2 border-black text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]',
                            timeframe === time ? 'bg-[#FFE600] text-black' : 'bg-white text-black hover:bg-zinc-100'
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["1 week", "2 weeks"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setTimeframe(time)}
                          disabled={loading}
                          className={cn(
                            'h-10 border-2 border-black text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]',
                            timeframe === time ? 'bg-[#FFE600] text-black' : 'bg-white text-black hover:bg-zinc-100'
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Recommended Scenarios</label>
                    <div className="flex flex-wrap gap-2">
                      {quickPills.map((pill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickSelect(pill)}
                          disabled={loading}
                          className="px-3 py-1.5 border-2 border-black bg-zinc-50 hover:bg-[#FFE600] text-[10px] font-black uppercase transition-colors disabled:opacity-50 flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000]"
                        >
                          <Sparkles className="h-3 w-3 text-black" /> {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-black pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      disabled={loading}
                      className="text-xs font-black uppercase tracking-wider text-black hover:underline flex items-center gap-1.5 transition-colors"
                    >
                      Advanced API Configuration {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {showAdvanced && (
                      <div className="space-y-2 mt-3 p-4 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                          Hugging Face Access Token (Optional)
                        </label>
                        <input
                          type="password"
                          value={hfToken}
                          onChange={(e) => setHfToken(e.target.value)}
                          placeholder="hf_..."
                          disabled={loading}
                          className="w-full h-10 px-3 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !topicInput.trim()}
                    className="w-full h-12 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Running Agent Orchestration...
                      </>
                    ) : (
                      <>
                        Generate Roadmap Plan <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {loading && (
                  <div className="border-2 border-black bg-zinc-50 p-6 space-y-4 shadow-[4px_4px_0px_0px_#000000]">
                    <div className="space-y-1 text-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-black">Executing Multi-Agent Tasks</h4>
                      <p className="text-[10px] text-zinc-600 font-bold">Synthesizing curriculum from Qwen & Llama agents</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-black uppercase">
                        <span>Agent Pipeline</span>
                        <span>{Math.round(loadingProgress)}%</span>
                      </div>
                      <div className="h-2 border-2 border-black bg-white overflow-hidden">
                        <div className="h-full bg-[#FFE600] transition-all" style={{ width: `${loadingProgress}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-5 h-5 border border-black flex items-center justify-center text-[10px] font-black shrink-0',
                          loadingStep >= 1 ? 'bg-[#FFE600]' : 'bg-white'
                        )}>
                          {loadingStep > 1 ? '✓' : '1'}
                        </div>
                        <span className="font-bold text-black">Syllabus Planner Agent</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-5 h-5 border border-black flex items-center justify-center text-[10px] font-black shrink-0',
                          loadingStep >= 2 ? 'bg-[#FFE600]' : 'bg-white'
                        )}>
                          {loadingStep > 2 ? '✓' : '2'}
                        </div>
                        <span className="font-bold text-black">Subject Matter Detailer Agent</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-5 h-5 border border-black flex items-center justify-center text-[10px] font-black shrink-0',
                          loadingStep >= 3 ? 'bg-[#FFE600]' : 'bg-white'
                        )}>
                          3
                        </div>
                        <span className="font-bold text-black">Roadmap Synthesizer Agent</span>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="border-2 border-black bg-[#EA4335]/10 p-4 flex items-start gap-3 shadow-[2px_2px_0px_0px_#000000]">
                    <ShieldAlert className="h-5 w-5 text-[#EA4335] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black uppercase text-black">Service Alert</h5>
                      <p className="text-xs text-zinc-700 font-bold">{errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Saved / Tracked Roadmaps Dashboard (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              {isMounted && activeRoadmap && (
                <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase bg-[#FFE600] border border-black px-2 py-0.5">
                        Active Study Plan
                      </span>
                      <h4 className="text-sm font-black uppercase tracking-tight mt-2">{activeRoadmap.title}</h4>
                    </div>
                    <span className="text-xs font-mono font-black">{activeRoadmap.timeframe}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-2 border-black p-3 bg-zinc-50 text-center">
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase">Progress</p>
                      <p className="text-lg font-black text-black mt-0.5">{activeMetrics.percent}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase">Topics Completed</p>
                      <p className="text-lg font-black text-black mt-0.5">{activeMetrics.completed} / {activeMetrics.total}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveTab("roadmap")}
                    className="w-full h-11 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000]"
                  >
                    Open Roadmap Board <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black">Saved Study Plans</h4>
                  <span className="border border-black bg-[#FFE600] px-2 py-0.5 text-[10px] font-black text-black">
                    {savedJobs.length} Saved
                  </span>
                </div>

                {isMounted && savedJobs.length === 0 ? (
                  <div className="py-8 text-center text-zinc-400 space-y-2 border-2 border-dashed border-zinc-300 p-4">
                    <BookOpen className="h-6 w-6 mx-auto text-zinc-400" />
                    <p className="text-xs font-black uppercase text-black">No roadmaps generated yet</p>
                    <p className="text-[10px] text-zinc-500 font-bold max-w-xs mx-auto">
                      Use the generator on the left to spawn your personalized technical study timeline.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {isMounted && savedJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => handleLoadSavedRoadmap(job.id)}
                        className={cn(
                          'p-3 border-2 border-black transition-all cursor-pointer flex flex-col gap-2 relative shadow-[2px_2px_0px_0px_#000000]',
                          activeRoadmap?.id === job.id ? 'bg-[#FFE600]' : 'bg-white hover:bg-zinc-50'
                        )}
                      >
                        <div className="flex items-start justify-between pr-6">
                          <div>
                            <h5 className="text-xs font-black uppercase tracking-wide text-black">{job.title}</h5>
                            <p className="text-[10px] text-zinc-600 font-bold font-mono">Timeframe: {job.timeframe}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 border border-black bg-white overflow-hidden">
                            <div className="h-full bg-black" style={{ width: `${job.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-mono font-black text-black">
                            {job.progress}%
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteRoadmap(job.id, e)}
                          className="absolute right-2 top-2 p-1 text-black hover:text-[#EA4335] transition-colors"
                          title="Delete roadmap"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab Content 2: Interactive Roadmap View */}
        {activeTab === "roadmap" && activeRoadmap && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-[#FFE600] border border-black px-2.5 py-0.5">
                    Curriculum Roadmap
                  </span>
                  <span className="text-xs text-zinc-600 font-black font-mono">Timeframe: {activeRoadmap.timeframe}</span>
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-black">{activeRoadmap.title}</h2>
                <p className="text-xs text-zinc-700 font-bold leading-relaxed">{activeRoadmap.description}</p>
              </div>

              <div className="w-full md:w-64 p-4 border-2 border-black bg-zinc-50 flex flex-col gap-2 shrink-0 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex justify-between items-center text-xs font-black uppercase">
                  <span>Progress</span>
                  <span>{activeMetrics.percent}%</span>
                </div>
                
                <div className="h-2.5 border-2 border-black bg-white overflow-hidden">
                  <div className="h-full bg-[#00FF66]" style={{ width: `${activeMetrics.percent}%` }} />
                </div>
                
                <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase font-mono">
                  <span>Topics Finished</span>
                  <span>{activeMetrics.completed} / {activeMetrics.total}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {activeRoadmap.milestones.map((milestone, mIdx) => {
                const isExpanded = expandedMilestones[milestone.id] !== false;
                const totalT = milestone.topics.length;
                const completedT = milestone.topics.filter(t => t.status === "completed").length;

                return (
                  <div key={milestone.id} className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] space-y-4">
                    <div 
                      onClick={() => toggleMilestone(milestone.id)}
                      className="flex items-start justify-between cursor-pointer group border-b-2 border-black pb-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 border-2 border-black bg-[#FFE600] flex items-center justify-center font-black text-xs text-black">
                            {mIdx + 1}
                          </span>
                          <h3 className="text-base font-black uppercase tracking-tight text-black group-hover:text-[#4285F4]">
                            {milestone.title}
                          </h3>
                          <span className="text-[10px] font-black uppercase text-zinc-500 font-mono">
                            ({completedT}/{totalT} completed)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 font-bold">{milestone.description}</p>
                      </div>

                      <button className="p-1 border border-black bg-zinc-100 text-black">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {milestone.topics.map((topic) => {
                          return (
                            <div
                              key={topic.id}
                              onClick={() => {
                                setSelectedTopic(topic);
                                setSelectedMilestone(milestone);
                                setDrawerOpen(true);
                              }}
                              className="p-4 border-2 border-black bg-zinc-50 hover:bg-white transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-black uppercase tracking-wide text-black">
                                  {topic.title}
                                </h4>
                                
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStatusMap: Record<Topic["status"], Topic["status"]> = {
                                      "pending": "in_progress",
                                      "in_progress": "completed",
                                      "completed": "pending"
                                    };
                                    handleStatusChange(milestone.id, topic.id, nextStatusMap[topic.status || "pending"]);
                                  }}
                                  className={cn(
                                    'text-[9px] font-black uppercase px-2 py-0.5 border border-black cursor-pointer shrink-0',
                                    topic.status === "completed" ? 'bg-[#00FF66] text-black' :
                                    topic.status === "in_progress" ? 'bg-[#FFE600] text-black' :
                                    'bg-white text-zinc-600'
                                  )}
                                >
                                  {topic.status === "completed" ? "Completed" : topic.status === "in_progress" ? "In Progress" : "To Do"}
                                </span>
                              </div>

                              <p className="text-xs text-zinc-600 font-bold leading-normal line-clamp-2">
                                {topic.description}
                              </p>

                              <div className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase pt-2 border-t border-black">
                                <BookOpen className="h-3.5 w-3.5" /> View Notes & Code Snippets
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Details Side-Drawer Sheet */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-white border-l-2 border-black text-black overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
          {selectedTopic && selectedMilestone && (
            <>
              <div className="space-y-3 border-b-2 border-black pb-4">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500">
                  <span>{selectedMilestone.title}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>Topic Detail</span>
                </div>
                
                <h2 className="text-xl font-black uppercase italic tracking-tight text-black">
                  {selectedTopic.title}
                </h2>
                
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-black uppercase text-black">Status:</span>
                  <div className="flex gap-1.5">
                    {(["pending", "in_progress", "completed"] as Topic["status"][]).map((st) => {
                      const labelMap: Record<Topic["status"], string> = {
                        pending: "To Do",
                        in_progress: "In Progress",
                        completed: "Completed"
                      };
                      const isActive = selectedTopic.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedMilestone.id, selectedTopic.id, st)}
                          className={cn(
                            'px-2.5 h-7 text-[10px] font-black uppercase border border-black transition-all',
                            isActive ? (st === "completed" ? 'bg-[#00FF66] text-black' : st === "in_progress" ? 'bg-[#FFE600] text-black' : 'bg-black text-white') : 'bg-zinc-100 text-zinc-600'
                          )}
                        >
                          {labelMap[st]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#4285F4]" /> Technical Summary
                </h4>
                <div className="p-4 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                  <p className="text-xs text-black leading-relaxed font-bold whitespace-pre-line">
                    {selectedTopic.description}
                  </p>
                </div>
              </div>

              {selectedTopic.codeSnippet && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-black" /> Reference Code Sandbox
                  </h4>
                  <div className="border-2 border-black bg-white overflow-hidden shadow-[3px_3px_0px_0px_#000000]">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100 border-b border-black">
                      <span className="text-[10px] font-mono font-bold text-black">solution.js</span>
                      <button
                        onClick={() => copyToClipboard(selectedTopic.codeSnippet || "")}
                        className="p-1 text-black font-black uppercase text-[9px] flex items-center gap-1 hover:underline"
                      >
                        {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copiedCode ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-[11px] font-mono text-black leading-relaxed whitespace-pre bg-zinc-50">
                      <code>{selectedTopic.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              )}

              {selectedTopic.commonQuestions && selectedTopic.commonQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-[#EA4335]" /> Common Interview Questions
                  </h4>
                  <div className="space-y-2">
                    {selectedTopic.commonQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_0px_#000000] space-y-1">
                        <p className="text-xs font-black uppercase text-black">{q.question}</p>
                        <p className="text-xs text-zinc-700 font-bold leading-normal">{q.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTopic.resources && selectedTopic.resources.length > 0 && (
                <div className="space-y-2 pb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                    <ExternalLink className="h-4 w-4 text-[#00A844]" /> Study Resources & Links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTopic.resources.map((res, resIdx) => (
                      <a
                        key={resIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 border-2 border-black bg-white hover:bg-[#FFE600] text-xs font-black uppercase text-black flex items-center justify-between transition-colors shadow-[2px_2px_0px_0px_#000000]"
                      >
                        <span className="truncate pr-2">{res.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
