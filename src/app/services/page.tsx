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
  topicName: string; // original input
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
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 space-y-12">
        {/* Breadcrumb / Return Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-[#4285F4] italic">
            <Rocket className="h-3.5 w-3.5 animate-pulse" /> Active Student Services
          </div>
        </div>

        {/* Title Block */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Next-Gen student <span className="text-[#4285F4]">services</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs md:text-sm">
            Harnessing CrewAI multi-agent crews for accelerated career growth
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] gap-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === "dashboard" ? "text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            Service Launcher
            {activeTab === "dashboard" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4285F4]" />
            )}
          </button>
          <button
            disabled={!activeRoadmap}
            onClick={() => setActiveTab("roadmap")}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 ${
              activeRoadmap ? "text-white" : "text-white/20 cursor-not-allowed"
            } ${activeTab === "roadmap" ? "text-white" : "text-white/40 hover:text-white/60"}`}
          >
            Interactive Roadmap
            {activeRoadmap && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[10px] font-black text-[#4285F4]">
                {activeMetrics.percent}%
              </span>
            )}
            {activeTab === "roadmap" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4285F4]" />
            )}
          </button>
        </div>

        {/* Tab Content 1: Dashboard Launcher */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Box: Configuration Form (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-[#4285F4] rounded-2xl">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider">AI Interview Roadmap Generator</h3>
                    <p className="text-xs text-white/40">Enter your target stack and timeline to let our AI multi-agent crew structure your preparation.</p>
                  </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest">What are you preparing for?</label>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. JavaScript Junior Interview, Python Data Analyst, React & Next.js Senior Role"
                      disabled={loading}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white focus:outline-none focus:border-[#4285F4] transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Preparation Timeframe</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["24 hours", "48 hours", "3 days"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setTimeframe(time)}
                          disabled={loading}
                          className={`h-11 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            timeframe === time
                              ? "bg-white text-black border-white"
                              : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05]"
                          } disabled:opacity-50`}
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
                          className={`h-11 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            timeframe === time
                              ? "bg-white text-black border-white"
                              : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05]"
                          } disabled:opacity-50`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider block">Recommended Scenarios</label>
                    <div className="flex flex-wrap gap-2">
                      {quickPills.map((pill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickSelect(pill)}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-[10px] text-white/70 font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-[#4285F4]" /> {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !topicInput.trim()}
                    className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Generating Roadmap via Multi-Agent Crew...
                      </>
                    ) : (
                      <>
                        Generate Roadmap Plan <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                {loading && (
                  <div className="p-6 mt-4 rounded-2xl border border-white/10 bg-black/80 flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-300">
                    <div className="space-y-2 text-center">
                      <h4 className="text-sm font-black uppercase tracking-wider text-[#4285F4] animate-pulse">Running CrewAI Agents</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Synthesizing personalized AI learning roadmap</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-white/40 font-bold">
                        <span>Agent Orchestration</span>
                        <span>{Math.round(loadingProgress)}%</span>
                      </div>
                      <Progress value={loadingProgress} className="h-1 bg-white/[0.08]" />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          loadingStep === 1 
                            ? "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse" 
                            : loadingStep > 1 
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                              : "bg-white/5 border-white/10 text-white/30"
                        }`}>
                          {loadingStep > 1 ? <Check className="h-3 w-3" /> : "1"}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${loadingStep >= 1 ? "text-white" : "text-white/30"}`}>Syllabus Planner Agent</p>
                          <p className="text-[9px] text-white/35">Structuring roadmap milestones and time allocations.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          loadingStep === 2 
                            ? "bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse" 
                            : loadingStep > 2 
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                              : "bg-white/5 border-white/10 text-white/30"
                        }`}>
                          {loadingStep > 2 ? <Check className="h-3 w-3" /> : "2"}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${loadingStep >= 2 ? "text-white" : "text-white/30"}`}>Subject Matter Detailer Agent</p>
                          <p className="text-[9px] text-white/35">Generating technical notes, interview questions, and code snippets.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          loadingStep === 3 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse" 
                            : "bg-white/5 border-white/10 text-white/30"
                        }`}>
                          "3"
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${loadingStep >= 3 ? "text-white" : "text-white/30"}`}>Roadmap Synthesizer Agent</p>
                          <p className="text-[9px] text-white/35">Validating data structure and compiling target JSON outputs.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-start gap-2">
                      <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-white/45 leading-normal">
                        This workflow triggers multiple sequential steps across Qwen 2.5 Coder, Llama 3 8B, and Qwen 2.5 72B. The total duration can take between 60 to 90 seconds. Please keep this browser tab active.
                      </p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider">Service Error</h5>
                      <p className="text-[10px] text-white/70 leading-normal">{errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Saved / Tracked Roadmaps Dashboard (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              {isMounted && activeRoadmap && (
                <div className="p-6 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl relative overflow-hidden shadow-xl space-y-4">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#4285F4] bg-[#4285F4]/10 border border-[#4285F4]/20 px-2 py-0.5 rounded-full">Active Focus</span>
                      <h4 className="text-sm font-bold uppercase tracking-wide mt-2">{activeRoadmap.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-white/40">{activeRoadmap.timeframe}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl">
                    <div className="text-center border-r border-white/[0.06]">
                      <p className="text-[9px] font-bold text-white/40 uppercase">Completion</p>
                      <p className="text-lg font-black text-emerald-400 mt-1">{activeMetrics.percent}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-white/40 uppercase">Topics</p>
                      <p className="text-lg font-black text-white mt-1">{activeMetrics.completed} / {activeMetrics.total}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveTab("roadmap")}
                    className="w-full h-10 rounded-xl bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    Open Roadmap Board <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="p-6 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">My Saved Roadmaps</h4>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-white/40">{savedJobs.length} total</span>
                </div>

                {isMounted && savedJobs.length === 0 ? (
                  <div className="py-12 text-center text-white/20 space-y-2">
                    <BookOpen className="h-8 w-8 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-wider">No roadmaps generated yet</p>
                    <p className="text-[10px] max-w-[200px] mx-auto leading-normal">
                      Fill out the generator inputs on the left to spawn your first trackable timeline.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {isMounted && savedJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => handleLoadSavedRoadmap(job.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative group ${
                          activeRoadmap?.id === job.id
                            ? "bg-blue-500/5 border-blue-500/40"
                            : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between pr-6">
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wide leading-tight group-hover:text-[#4285F4] transition-colors">{job.title}</h5>
                            <p className="text-[10px] text-white/35 mt-1 font-semibold">Prep time: {job.timeframe}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                          <Progress value={job.progress} className="h-1 bg-white/[0.08]" />
                          <span className={`text-[10px] font-bold shrink-0 ${
                            job.progress === 100 ? "text-emerald-400" : "text-white/60"
                          }`}>
                            {job.progress}%
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteRoadmap(job.id, e)}
                          className="absolute right-4 top-4 p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 rounded-3xl border border-white/5 bg-[#050505]/40 text-white/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Additional Services</h4>
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Scheduled Revamp</span>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.03] bg-[#020202]/40 relative overflow-hidden flex gap-3 items-center">
                  <div className="p-2 bg-white/5 rounded-xl text-white/30 border border-white/5">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white/50">Recruiter Pipeline Matcher</h5>
                    <p className="text-[9px] text-white/30">Connect your verified skill credentials with active openings.</p>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-white/20 shrink-0" />
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.03] bg-[#020202]/40 relative overflow-hidden flex gap-3 items-center">
                  <div className="p-2 bg-white/5 rounded-xl text-white/30 border border-white/5">
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white/50">AI Resume ATS Evaluator</h5>
                    <p className="text-[9px] text-white/30">Match resume keywords dynamically against target JD frameworks.</p>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-white/20 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Interactive Roadmap View */}
        {activeTab === "roadmap" && activeRoadmap && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#4285F4] bg-[#4285F4]/10 border border-[#4285F4]/20 px-2.5 py-0.5 rounded-full">
                    Roadmap
                  </span>
                  <span className="text-xs text-white/40 font-bold uppercase">Timeframe: {activeRoadmap.timeframe}</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-wide leading-tight">{activeRoadmap.title}</h2>
                <p className="text-xs text-white/50 leading-relaxed font-medium">{activeRoadmap.description}</p>
              </div>

              <div className="w-full md:w-64 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-white/40">Tracking Progress</span>
                  <span className="text-emerald-400 font-black">{activeMetrics.percent}%</span>
                </div>
                
                <Progress value={activeMetrics.percent} className="h-1.5 bg-white/[0.08]" />
                
                <div className="flex justify-between text-[10px] text-white/35 font-bold uppercase">
                  <span>Completed</span>
                  <span>{activeMetrics.completed} / {activeMetrics.total} Topics</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-[2px] border-l border-dashed border-white/[0.15] hidden sm:block" />

              <div className="space-y-10 relative z-10">
                {activeRoadmap.milestones.map((milestone, mIdx) => {
                  const isExpanded = expandedMilestones[milestone.id] !== false;
                  const totalT = milestone.topics.length;
                  const completedT = milestone.topics.filter(t => t.status === "completed").length;
                  const percentT = totalT > 0 ? Math.round((completedT / totalT) * 100) : 0;

                  return (
                    <div key={milestone.id} className="relative sm:pl-16">
                      <div 
                        onClick={() => toggleMilestone(milestone.id)}
                        className={`absolute left-2.5 top-2 w-7 h-7 rounded-full border-2 cursor-pointer flex items-center justify-center text-[10px] font-black z-20 transition-all hidden sm:flex ${
                          percentT === 100
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : completedT > 0
                              ? "bg-blue-500/20 border-blue-500 text-[#4285F4]"
                              : "bg-black border-white/20 text-white/40 hover:border-white/50"
                        }`}
                      >
                        {mIdx + 1}
                      </div>

                      <div className="p-6 rounded-3xl border border-white/5 bg-[#050505]/40 backdrop-blur-xl space-y-4 transition-all">
                        <div 
                          onClick={() => toggleMilestone(milestone.id)}
                          className="flex items-start justify-between cursor-pointer group"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black uppercase tracking-wide text-white group-hover:text-[#4285F4] transition-colors">
                                {milestone.title}
                              </h3>
                              <span className="text-[10px] font-bold text-white/30 uppercase shrink-0">
                                ({completedT}/{totalT} done)
                              </span>
                            </div>
                            <p className="text-xs text-white/40 max-w-4xl font-medium">{milestone.description}</p>
                          </div>

                          <button className="p-1 rounded bg-white/5 text-white/50 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] animate-in fade-in duration-300">
                            {milestone.topics.map((topic) => {
                              return (
                                <div
                                  key={topic.id}
                                  onClick={() => {
                                    setSelectedTopic(topic);
                                    setSelectedMilestone(milestone);
                                    setDrawerOpen(true);
                                  }}
                                  className="p-5 rounded-2xl border border-white/5 bg-[#0a0a0a]/50 hover:bg-[#0c0c0c]/80 hover:border-white/10 transition-all cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-tr from-[#4285F4]/0 to-[#4285F4]/0 group-hover:from-[#4285F4]/[0.01] group-hover:to-purple-500/[0.02] transition-colors pointer-events-none" />

                                  <div className="flex items-start justify-between gap-3 relative z-10">
                                    <h4 className="text-xs font-bold uppercase tracking-wider group-hover:text-[#4285F4] transition-colors pr-10">
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
                                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border cursor-pointer select-none shrink-0 transition-all ${
                                        topic.status === "completed"
                                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                          : topic.status === "in_progress"
                                            ? "bg-blue-500/10 border-blue-500/20 text-[#4285F4] hover:bg-blue-500/20"
                                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                                      }`}
                                    >
                                      {topic.status === "completed" ? "Done" : topic.status === "in_progress" ? "In Progress" : "To Do"}
                                    </span>
                                  </div>

                                  <p className="text-[10px] text-white/40 leading-normal line-clamp-2 pr-6 font-medium relative z-10">
                                    {topic.description}
                                  </p>

                                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase group-hover:text-white/60 transition-colors pt-1 border-t border-white/[0.04] mt-auto relative z-10">
                                    <BookOpen className="h-3.5 w-3.5" /> View study resources & tasks
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Side-Drawer Sheet (for detailed topic preview) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-zinc-950 border-zinc-800 text-white overflow-y-auto p-8 shadow-2xl flex flex-col gap-6">
          {selectedTopic && selectedMilestone && (
            <>
              <div className="space-y-4 border-b border-white/[0.08] pb-6">
                <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                  <span>Roadmap Plan</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>{selectedMilestone.title}</span>
                </div>
                
                <h2 className="text-xl font-black uppercase tracking-wide text-white leading-tight">
                  {selectedTopic.title}
                </h2>
                
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Preparation Status:</span>
                  <div className="flex gap-2">
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
                          className={`px-3 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            isActive
                              ? st === "completed"
                                ? "bg-emerald-500 border-emerald-500 text-black font-black"
                                : st === "in_progress"
                                  ? "bg-[#4285F4] border-[#4285F4] text-white"
                                  : "bg-white border-white text-black"
                              : "bg-transparent border-white/10 text-white/40 hover:bg-white/5"
                          }`}
                        >
                          {labelMap[st]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> Conceptual Preparation Guide
                </h4>
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                  <p className="text-xs text-white/70 leading-relaxed font-medium whitespace-pre-line">
                    {selectedTopic.description}
                  </p>
                </div>
              </div>

              {selectedTopic.codeSnippet && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                    <Terminal className="h-4 w-4" /> Demonstration Sandbox Snippet
                  </h4>
                  <div className="rounded-2xl border border-white/10 bg-[#020202] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                      <span className="text-[10px] font-mono text-white/40">snippet.js</span>
                      <button
                        onClick={() => copyToClipboard(selectedTopic.codeSnippet || "")}
                        className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-5 overflow-x-auto text-[10px] font-mono text-white/80 leading-relaxed whitespace-pre bg-black/60">
                      <code>{selectedTopic.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              )}

              {selectedTopic.commonQuestions && selectedTopic.commonQuestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" /> Common Interview Questions
                  </h4>
                  <Accordion type="single" collapsible className="w-full space-y-2 border-none">
                    {selectedTopic.commonQuestions.map((q, qIdx) => (
                      <AccordionItem 
                        key={qIdx} 
                        value={`q-${qIdx}`} 
                        className="border border-white/5 bg-[#030303] rounded-2xl overflow-hidden px-4"
                      >
                        <AccordionTrigger className="text-xs font-bold text-white hover:text-[#4285F4] text-left leading-normal py-3 border-none hover:no-underline">
                          {q.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[10px] text-white/60 leading-relaxed font-medium pb-4 border-t border-white/[0.04] pt-3">
                          {q.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {selectedTopic.resources && selectedTopic.resources.length > 0 && (
                <div className="space-y-3 pb-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#4285F4] flex items-center gap-1.5">
                    <ExternalLink className="h-4 w-4" /> Suggested Study Resources
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTopic.resources.map((res, resIdx) => (
                      <a
                        key={resIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-[10px] font-bold text-white/70 hover:text-white flex items-center justify-between transition-all"
                      >
                        <span className="truncate pr-4">{res.name}</span>
                        <ChevronRight className="h-3 w-3 text-[#4285F4] shrink-0" />
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
