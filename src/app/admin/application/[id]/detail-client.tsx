"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Star, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  PenTool,
  Edit2,
  Trash2,
  UserCheck,
  Bot,
  Brain,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Flame,
  GraduationCap,
  Award,
  Zap,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationReviewForm } from "@/components/application-review-form";
import { cn } from "@/lib/utils";
import { 
  toggleRecommendation, 
  deleteApplicationAction, 
  updateApplicantDetailsAction,
  generateCandidateInsightsAction
} from "@/app/actions/application-actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IosLoader } from "@/components/ui/ios-loader";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicationDetailClientProps {
  application: any;
  userRole: string;
}

const domainLabels: Record<string, string> = {
  gen_ai: "Generative AI",
  ds_ml: "Data Science & ML",
  azure: "Azure Cloud",
  web_app: "Web & App Development",
  event_management: "Event Management",
  public_relations: "Public Relations",
  media_marketing: "Media Marketing",
  creativity: "Creativity",
};

const domainQuestions: Record<string, string[]> = {
  gen_ai: [
    "Explain the difference between Fine-Tuning and RAG (Retrieval-Augmented Generation).",
    "What are embeddings and vector databases? How do they help LLMs search context?",
    "How do you handle/mitigate hallucinations in large language model outputs?"
  ],
  ds_ml: [
    "What is the difference between supervised, unsupervised, and reinforcement learning?",
    "Explain the bias-variance tradeoff in Machine Learning models.",
    "How do you clean data and handle missing variables or imbalanced classes?"
  ],
  azure: [
    "What is serverless computing? Give examples of serverless services in Azure.",
    "Explain Azure Virtual Networks (VNets) and security groups.",
    "What is Infrastructure as Code (IaC) and why is it useful?"
  ],
  web_app: [
    "Explain Server-Side Rendering (SSR) vs Client-Side Rendering (CSR) in Next.js.",
    "How does React's virtual DOM reconciliation work? What are state hooks?",
    "What is the difference between Tailwind CSS and standard custom stylesheets?"
  ],
  event_management: [
    "If the main venue projector fails 10 minutes before the event start, what is your plan?",
    "How do you coordinate logistics and seating templates for 300+ attendees?",
    "Describe your method of allocating tasks to volunteers during a live coding workshop."
  ],
  public_relations: [
    "How do you handle a student complaining about a club decision on public channels?",
    "Pitch MLSC SVEC to a college sophomore who has never coded before.",
    "How do you secure sponsorships from local tech startups or businesses?"
  ],
  media_marketing: [
    "How do you design a social media campaign to get 500+ registrations in 3 days?",
    "What makes a good thumbnail or poster design stand out on Instagram/LinkedIn?",
    "Describe your video editing process and tools (Premiere, Resolve, CapCut)."
  ],
  creativity: [
    "Showcase a creative project (design, writing, artwork) you are proudest of.",
    "How do you handle writer's block or creative fatigue under tight timelines?",
    "How do you translate a dry, complex technical topic into an engaging visual layout?"
  ],
  general: [
    "Tell us about yourself and what motivated you to apply for MLSC SVEC.",
    "How do you balance club work, academics, and personal projects?",
    "Give an example of a team conflict you experienced and how you resolved it."
  ]
};

const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'hired':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'under processing':
    case 'interviewing':
    case 'interviewed':
    case 'interview done':
    case 'thank you for attending':
    case 'recommended':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function ApplicationDetailClient({ application, userRole }: ApplicationDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "ai_copilot" | "interview">("metrics");
  const [scratchpadText, setScratchpadText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const status = application.status || "Received";
  
  // Collect relevant domain questions
  const techQuestions = domainQuestions[application.technicalDomain] || [];
  const nonTechQuestions = application.nonTechnicalDomain ? (domainQuestions[application.nonTechnicalDomain] || []) : [];
  const generalQuestions = domainQuestions.general;

  const { toast } = useToast();
  const router = useRouter();
  
  const [isRecommended, setIsRecommended] = useState<boolean>(
    application.isManualSelected ?? application.isRecommended ?? false
  );
  const [isTogglingRec, setIsTogglingRec] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit Applicant Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: application.name || '',
    email: application.email || '',
    phone: application.phone || '',
    rollNo: application.rollNo || '',
    branch: application.branch || '',
    section: application.section || '',
    yearOfStudy: application.yearOfStudy || '',
    cgpa: application.cgpa || '',
    backlogs: application.backlogs || 0,
    technicalDomain: application.technicalDomain || 'gen_ai',
    nonTechnicalDomain: application.nonTechnicalDomain || '',
    linkedin: application.linkedin || '',
    remarks: application.remarks || '',
  });

  // AI & Manual ratings resolution
  const aiRatings = application.aiRatings || (!application.manualRatings && application.ratings ? application.ratings : null);
  const aiScore = aiRatings?.overall ?? 0;
  const isAiSelected = application.isAiRecommended !== undefined
    ? application.isAiRecommended
    : (aiRatings ? aiRatings.overall >= 3.5 : (aiScore >= 3.5 && !application.manualRatings));

  const manualRatings = application.manualRatings || (
    application.ratings && application.aiRatings && application.ratings.overall !== application.aiRatings.overall
      ? application.ratings
      : (application.status !== 'Received' ? application.ratings : null)
  );
  const isSuperAdmin = userRole === 'super_admin';
  const canAccessAiCopilot = userRole === 'super_admin' || userRole === 'admin' || userRole === 'panel' || userRole === 'support' || userRole === 'support_panel';
  const humanScore = manualRatings?.overall ?? 0;
  const hasHumanScore = humanScore > 0;
  const isManualSelected = isRecommended;

  // ── AI COPILOT STATE ──
  const [aiInsights, setAiInsights] = useState<{
    persona?: string;
    headline?: string;
    matchScore?: number;
    confidenceLevel?: string;
    strengths?: string[];
    areasToProbe?: string[];
    tailoredQuestions?: Array<{ question: string; context: string; whatToLookFor: string }>;
  } | null>(() => {
    // Initial fallback insights based on stored data
    if (application.resumeSummary || application.suitability) {
      return {
        persona: application.technicalDomain === 'gen_ai' ? 'GenAI Pioneer'
          : application.technicalDomain === 'ds_ml' ? 'ML Data Strategist'
          : application.technicalDomain === 'azure' ? 'Cloud Systems Specialist'
          : application.technicalDomain === 'web_app' ? 'Full-Stack Developer'
          : 'Creative Technical Lead',
        headline: application.resumeSummary?.slice(0, 180) || "Candidate submitted screening responses for review.",
        matchScore: Math.round((aiScore / 5) * 100) || 75,
        confidenceLevel: aiScore >= 4.0 ? "High Match" : aiScore >= 3.5 ? "Promising" : "Needs Assessment",
        strengths: [
          application.suitability?.technical || `Strong background in ${domainLabels[application.technicalDomain] || application.technicalDomain}`,
          application.suitability?.nonTechnical || "Active team engagement and clear communication",
          `Academic discipline with CGPA ${application.cgpa}`
        ].filter(Boolean),
        areasToProbe: [
          "Verify practical hands-on projects beyond classroom curriculum",
          "Assess bandwidth and commitment during peak club events"
        ],
        tailoredQuestions: []
      };
    }
    return null;
  });

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAiInsights = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await generateCandidateInsightsAction({
        name: application.name,
        domain: domainLabels[application.technicalDomain] || application.technicalDomain,
        cgpa: application.cgpa,
        resumeSummary: application.resumeSummary,
        joinReason: application.joinReason,
        aboutClub: application.aboutClub,
        anythingElse: application.anythingElse,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      if (res.insights) {
        setAiInsights(res.insights);
        toast({
          title: "AI Analysis Generated",
          description: "Candidate persona, fit metrics, and tailored questions generated.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "AI Generation Error",
        description: err.message || "Failed to generate AI insights.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setScratchpadText((prev) => prev ? `${prev}\n\n• Q: ${text}` : `• Q: ${text}`);
    toast({
      title: "Question Copied",
      description: "Appended to scratchpad and copied to clipboard.",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleToggleRec = async () => {
    setIsTogglingRec(true);
    const newStatus = !isRecommended;
    setIsRecommended(newStatus);
    try {
      const res = await toggleRecommendation(application.firestoreId || application.id, newStatus);
      if (res.error) {
        setIsRecommended(!newStatus);
        throw new Error(res.error);
      }
      toast({
        title: newStatus ? "Candidate Manually Selected" : "Manual Selection Removed",
        description: `Candidate is ${newStatus ? 'now' : 'no longer'} manually selected for the final round.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update selection status.",
      });
    } finally {
      setIsTogglingRec(false);
    }
  };

  const handleDeleteApplication = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteApplicationAction(application.firestoreId || application.id);
      if (res.error) {
        throw new Error(res.error);
      }
      toast({
        title: "Application Deleted",
        description: `Application for ${application.name} was permanently removed.`,
      });
      router.push("/admin/applications");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "Could not delete application.",
      });
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditLoading(true);
    try {
      const res = await updateApplicantDetailsAction(application.firestoreId || application.id, editForm);
      if (res.error) {
        throw new Error(res.error);
      }
      toast({
        title: "Profile Updated",
        description: "Candidate details successfully saved.",
      });
      setIsEditOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Could not update applicant.",
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* ── TOP ACTION BAR: TABS & CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/40 border border-white/10 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "metrics"
                ? "bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/20"
                : "text-white/60 hover:text-white"
            )}
          >
            <FileText className="size-3.5" />
            <span>Dossier & Rubric</span>
          </button>

          {canAccessAiCopilot && (
            <button
              onClick={() => setActiveTab("ai_copilot")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative",
                activeTab === "ai_copilot"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-white/60 hover:text-white"
              )}
            >
              <Brain className="size-3.5 text-purple-300" />
              <span>AI Copilot</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            </button>
          )}

          <button
            onClick={() => setActiveTab("interview")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "interview"
                ? "bg-[#34A853] text-white shadow-md shadow-[#34A853]/20"
                : "text-white/60 hover:text-white"
            )}
          >
            <PenTool className="size-3.5" />
            <span>Live Interview</span>
          </button>
        </div>

        {/* Action Buttons: Edit, Manual Select, Delete */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* 1-Click High-Visibility Manual Select Toggle */}
          <button
            onClick={handleToggleRec}
            disabled={isTogglingRec}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md active:scale-95",
              isManualSelected 
                ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,0.4)] hover:brightness-110"
                : "bg-yellow-500/10 border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400"
            )}
          >
            <Star className={cn("size-4", isManualSelected ? "fill-black text-black" : "text-yellow-400")} />
            <span>{isTogglingRec ? "Saving..." : isManualSelected ? "★ Manually Selected" : "☆ Select Candidate"}</span>
          </button>

          {(userRole === 'admin' || userRole === 'super_admin') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="h-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold gap-1.5"
              >
                <Edit2 className="size-3.5" />
                <span>Edit</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 rounded-xl border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold gap-1.5"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </Button>
            </>
          )}
        </div>

      </div>

      {/* ── MAIN CONTENT GRID: 2 COLUMNS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Selected Tab View */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ══════════ TAB 1: DOSSIER & RUBRIC ══════════ */}
          {activeTab === "metrics" && (
            <Card className="bg-white/[0.02] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {application.name}
                      </CardTitle>
                      <Badge variant={getStatusVariant(status)} className="uppercase text-[10px] font-bold px-2.5 py-0.5">
                        {status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-white/40 mt-1">
                      Submitted on {format(new Date(application.submittedAt || Date.now()), "PPP 'at' p")}
                    </CardDescription>
                  </div>

                  {/* Dual Selection Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isSuperAdmin && isAiSelected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                        <Bot className="size-3 text-purple-400" />
                        🤖 AI Selected
                      </span>
                    )}
                    {isManualSelected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
                        <Star className="size-3 text-yellow-400 fill-yellow-400" />
                        ★ Manual Selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Links */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs pt-4 mt-4 border-t border-white/5">
                  <a href={`mailto:${application.email}`} className="flex items-center gap-1.5 text-white/50 hover:text-[#4285F4] transition-colors">
                    <Mail className="size-3.5" />
                    {application.email}
                  </a>
                  <a href={`tel:${application.phone}`} className="flex items-center gap-1.5 text-white/50 hover:text-[#4285F4] transition-colors">
                    <Phone className="size-3.5" />
                    {application.phone}
                  </a>
                  {application.linkedin && (
                    <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/50 hover:text-[#4285F4] transition-colors">
                      <Linkedin className="size-3.5" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
                <div className="text-[10px] text-white/20 pt-2 font-mono break-all">
                  REF_ID: {application.id}
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8 space-y-8 text-sm">
                
                {/* Academic Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Roll Number</span>
                    <p className="text-sm font-semibold mt-1 text-white">{application.rollNo}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Branch & Section</span>
                    <p className="text-sm font-semibold mt-1 text-white">{application.branch} - {application.section}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">CGPA</span>
                    <p className="text-sm font-semibold mt-1 text-white">{application.cgpa}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Backlogs</span>
                    <p className="text-sm font-semibold mt-1 text-white">{application.backlogs}</p>
                  </div>
                </div>

                {/* Domain Preference Badges */}
                <div className="flex flex-col sm:flex-row gap-4 text-xs bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Technical Preference</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]">
                      {domainLabels[application.technicalDomain] || application.technicalDomain}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Non-Technical Preference</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                      {domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain || 'None'}
                    </span>
                  </div>
                </div>

                {/* ── SIDE-BY-SIDE RATING & EVALUATION CARDS (AI vs HUMAN) ── */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/60">
                      {isSuperAdmin 
                        ? "Evaluation Breakdown (AI Screening vs Manual Interview)" 
                        : "Manual Interview Evaluation & Rubric"}
                    </h3>
                  </div>

                  <div className={cn("grid gap-6", isSuperAdmin ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                    
                    {/* Card 1: 🤖 AI Resume & Screening Rubric - Only visible to Super Admin */}
                    {isSuperAdmin && (
                      <div className="bg-white/[0.02] border border-purple-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <Bot className="size-4 text-purple-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-purple-400">
                              AI Screening Rating
                            </span>
                          </div>
                          {isAiSelected ? (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                              🤖 AI Selected
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/40">Not Recommended</span>
                          )}
                        </div>

                        {/* AI Big Score */}
                        <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Overall Score</span>
                            <div className="text-3xl font-black text-purple-400">
                              {aiScore > 0 ? aiScore.toFixed(2) : 'N/A'}
                              <span className="text-xs text-white/40 font-normal ml-1">/ 5.0</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={cn(
                                  "size-4", 
                                  Math.round(aiScore) >= star ? "text-purple-400 fill-purple-400" : "text-white/10"
                                )} 
                              />
                            ))}
                          </div>
                        </div>

                        {/* AI Dimension Progress Bars */}
                        <div className="space-y-2.5 pt-1">
                          {[
                            { label: "Communication", val: aiRatings?.communication ?? 0 },
                            { label: "Technical Skills", val: aiRatings?.technical ?? 0 },
                            { label: "Problem Solving", val: aiRatings?.problemSolving ?? 0 },
                            { label: "Team Fit", val: aiRatings?.teamFit ?? 0 },
                            { label: "Confidence & Attitude", val: (aiRatings as any)?.confidence ?? 0 },
                            { label: "Growth Mindset", val: (aiRatings as any)?.growthMindset ?? 0 },
                            { label: "Leadership & Initiative", val: (aiRatings as any)?.leadership ?? 0 },
                          ].map((item) => (
                            <div key={item.label} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-white/60">{item.label}</span>
                                <span className="font-semibold text-purple-300">{item.val.toFixed(1)}</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-purple-500 h-full rounded-full transition-all" 
                                  style={{ width: `${(item.val / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* AI Summary Quote */}
                        {application.resumeSummary && (
                          <div className="pt-3 border-t border-white/5 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/80">AI Resume Summary</span>
                            <p className="text-[11px] text-white/60 italic leading-relaxed line-clamp-4">
                              "{application.resumeSummary}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card 2: 👤 Live Panel Interview Evaluation */}
                    <div className="bg-white/[0.02] border border-[#34A853]/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <UserCheck className="size-4 text-[#34A853]" />
                          <span className="text-xs font-black uppercase tracking-wider text-[#34A853]">
                            Human Interview Rating
                          </span>
                        </div>
                        {isManualSelected ? (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                            ★ Selected
                          </span>
                        ) : hasHumanScore && status !== 'Received' ? (
                          <span className="text-[9px] text-white/40">Evaluated</span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 font-semibold">
                            Received
                          </span>
                        )}
                      </div>

                      {hasHumanScore && (application.interviewAttended || status !== 'Received') ? (
                        <>
                          {/* Human Big Score */}
                          <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Overall Score</span>
                              <div className="text-3xl font-black text-[#34A853]">
                                {humanScore.toFixed(2)}
                                <span className="text-xs text-white/40 font-normal ml-1">/ 5.0</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={cn(
                                    "size-4", 
                                    Math.round(humanScore) >= star ? "text-[#34A853] fill-[#34A853]" : "text-white/10"
                                  )} 
                                />
                              ))}
                            </div>
                          </div>

                          {/* Human Dimension Progress Bars */}
                          <div className="space-y-2.5 pt-1">
                            {[
                              { label: "Communication", val: manualRatings?.communication ?? 0 },
                              { label: "Technical Skills", val: manualRatings?.technical ?? 0 },
                              { label: "Problem Solving", val: manualRatings?.problemSolving ?? 0 },
                              { label: "Team Fit", val: manualRatings?.teamFit ?? 0 },
                              { label: "Confidence & Attitude", val: (manualRatings as any)?.confidence ?? 0 },
                              { label: "Growth Mindset", val: (manualRatings as any)?.growthMindset ?? 0 },
                              { label: "Leadership & Initiative", val: (manualRatings as any)?.leadership ?? 0 },
                            ].map((item) => (
                              <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-white/60">{item.label}</span>
                                  <span className="font-semibold text-emerald-300">{item.val.toFixed(1)}</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-[#34A853] h-full rounded-full transition-all" 
                                    style={{ width: `${(item.val / 5) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Human Interviewer Remarks Quote */}
                          <div className="pt-3 border-t border-white/5 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#34A853]">Interviewer Remarks</span>
                            {application.remarks ? (
                              <p className="text-[11px] text-white/80 italic leading-relaxed">
                                "{application.remarks}"
                              </p>
                            ) : (
                              <p className="text-[11px] text-white/30 italic">No interviewer remarks submitted yet.</p>
                            )}
                          </div>
                        </>
                      ) : (
                        /* Clean Awaiting Interview State */
                        <div className="py-10 px-4 text-center space-y-3 bg-black/20 rounded-2xl border border-white/5">
                          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <UserCheck className="size-6" />
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-bold tracking-tight text-white/90">
                              Awaiting Manual Interview
                            </h4>
                            <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                              This candidate is in <span className="font-semibold text-white/70">Received</span> status. Human ratings and rubric breakdown will appear here after the panel interview is evaluated.
                            </p>
                          </div>
                          <div className="pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-white/50">
                              <span className="size-2 rounded-full bg-emerald-400/80 animate-pulse" />
                              Use the evaluation panel on the right to grade
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Candidate Essays / Written Statements */}
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Why do you want to join this club?</h4>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                      {application.joinReason}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">What do you know about MLSC club?</h4>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                      {application.aboutClub}
                    </div>
                  </div>

                  {application.anythingElse && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Anything else?</h4>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                        {application.anythingElse}
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          )}

          {/* ══════════ TAB 2: AI COPILOT INTELLIGENCE HUB ══════════ */}
          {activeTab === "ai_copilot" && canAccessAiCopilot && (
            <div className="space-y-6">
              
              {/* Top AI Briefing Card */}
              <Card className="bg-gradient-to-br from-purple-950/30 via-black/40 to-black/60 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Brain className="size-5 text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                        AI Candidate Intelligence Report
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      {aiInsights?.persona || "Talent Archetype Analysis"}
                    </h3>
                  </div>

                  {/* Run / Regenerate AI Button */}
                  <Button
                    onClick={handleGenerateAiInsights}
                    disabled={isGeneratingAi}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 h-9 px-4"
                  >
                    <RefreshCw className={cn("size-3.5", isGeneratingAi && "animate-spin")} />
                    <span>{isGeneratingAi ? "Analyzing with Gemini..." : "✨ Run Deep AI Analysis"}</span>
                  </Button>
                </div>

                {/* Persona & Headline */}
                <div className="py-6 space-y-4">
                  {aiInsights?.headline ? (
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium italic">
                      "{aiInsights.headline}"
                    </p>
                  ) : (
                    <p className="text-xs text-white/40 italic">
                      Click "Run Deep AI Analysis" above to generate a comprehensive Gemini AI report.
                    </p>
                  )}

                  {/* AI Fit Metrics Badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
                      <Target className="size-3.5 text-purple-400" />
                      <span className="text-white/60">Match Score:</span>
                      <span className="font-black text-purple-300">{aiInsights?.matchScore || Math.round((aiScore/5)*100)}%</span>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
                      <Zap className="size-3.5 text-emerald-400" />
                      <span className="text-white/60">AI Confidence:</span>
                      <span className="font-black text-emerald-300">{aiInsights?.confidenceLevel || "Promising"}</span>
                    </div>

                    <div className="bg-[#4285F4]/10 border border-[#4285F4]/20 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
                      <GraduationCap className="size-3.5 text-[#4285F4]" />
                      <span className="text-white/60">Domain Alignment:</span>
                      <span className="font-black text-[#4285F4]">{domainLabels[application.technicalDomain] || application.technicalDomain}</span>
                    </div>
                  </div>
                </div>

                {/* Key Strengths & Potential Blindspots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {/* Strengths */}
                  <div className="bg-black/30 border border-emerald-500/20 rounded-2xl p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                      <Flame className="size-4" />
                      <span>Observed Strengths</span>
                    </div>
                    <ul className="space-y-2 text-xs text-white/80">
                      {aiInsights?.strengths?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{s}</span>
                        </li>
                      )) || (
                        <li className="text-white/40 italic">Run AI analysis to extract strengths.</li>
                      )}
                    </ul>
                  </div>

                  {/* Potential Blindspots / Areas to Probe */}
                  <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                      <AlertTriangle className="size-4" />
                      <span>Interviewer Focus Areas</span>
                    </div>
                    <ul className="space-y-2 text-xs text-white/80">
                      {aiInsights?.areasToProbe?.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">⚠</span>
                          <span>{p}</span>
                        </li>
                      )) || (
                        <li className="text-white/40 italic">Run AI analysis to detect focus areas.</li>
                      )}
                    </ul>
                  </div>
                </div>

              </Card>

              {/* Dynamic Tailored AI Interview Questions Card */}
              <Card className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Sparkles className="size-4" />
                      <span className="text-xs font-black uppercase tracking-wider">Dynamic Question Generator</span>
                    </div>
                    <h4 className="text-lg font-black text-white">
                      Custom AI Questions for {application.name}
                    </h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateAiInsights}
                    disabled={isGeneratingAi}
                    className="h-8 rounded-xl border-white/10 bg-white/5 text-xs text-white font-bold"
                  >
                    {isGeneratingAi ? "Generating..." : "Generate Fresh Questions"}
                  </Button>
                </div>

                {aiInsights?.tailoredQuestions && aiInsights.tailoredQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {aiInsights.tailoredQuestions.map((qObj, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white/[0.02] border border-purple-500/20 hover:border-purple-500/40 transition-all rounded-2xl p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="size-6 rounded-full bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-semibold text-white leading-relaxed">
                              {qObj.question}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopyQuestion(qObj.question, idx)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                            title="Copy to scratchpad & clipboard"
                          >
                            {copiedIndex === idx ? (
                              <Check className="size-4 text-emerald-400" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </div>

                        {qObj.context && (
                          <div className="text-[11px] text-white/50 bg-white/[0.01] rounded-xl p-2.5 border border-white/5">
                            <span className="font-bold text-purple-400">Context: </span>
                            {qObj.context}
                          </div>
                        )}

                        {qObj.whatToLookFor && (
                          <div className="text-[11px] text-emerald-400/90 bg-emerald-500/5 rounded-xl p-2.5 border border-emerald-500/10">
                            <span className="font-bold">What to Look For: </span>
                            {qObj.whatToLookFor}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-6">
                    <Bot className="size-8 text-purple-400 mx-auto opacity-50" />
                    <p className="text-xs text-white/60">
                      No customized questions generated yet for this applicant.
                    </p>
                    <Button
                      onClick={handleGenerateAiInsights}
                      disabled={isGeneratingAi}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      {isGeneratingAi ? "Generating Questions..." : "✨ Generate AI Questions Now"}
                    </Button>
                  </div>
                )}
              </Card>

            </div>
          )}

          {/* ══════════ TAB 3: LIVE INTERVIEW BOARD ══════════ */}
          {activeTab === "interview" && (
            <div className="space-y-6">
              
              {/* Structured Rubric Card */}
              <Card className="bg-white/[0.01] border border-white/5 rounded-3xl shadow-2xl">
                <CardHeader className="border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-white">
                    <HelpCircle className="size-5 text-[#34A853]" />
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Structured Screening Rubric</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-white/40">
                    Suggested interview questions based on preferred candidate domains
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  
                  {/* General Core Questions */}
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider border-[#4285F4]/30 text-[#4285F4]">
                      General Icebreakers & Fit
                    </Badge>
                    <div className="space-y-2">
                      {generalQuestions.map((q, idx) => (
                        <div key={idx} className="flex gap-3 text-xs bg-white/[0.01] border border-white/5 rounded-xl p-3 text-white/80">
                          <span className="font-bold text-[#4285F4]">{idx + 1}.</span>
                          <p>{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Preferred Domain Questions */}
                  <div className="space-y-3 pt-2">
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider border-[#34A853]/30 text-[#34A853]">
                      Technical: {domainLabels[application.technicalDomain] || application.technicalDomain} Track
                    </Badge>
                    <div className="space-y-2">
                      {techQuestions.map((q, idx) => (
                        <div key={idx} className="flex gap-3 text-xs bg-white/[0.01] border border-white/5 rounded-xl p-3 text-white/80">
                          <span className="font-bold text-[#34A853]">{idx + 1}.</span>
                          <p>{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Non-Technical Preferred Domain Questions */}
                  {application.nonTechnicalDomain && nonTechQuestions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider border-[#FBBC05]/30 text-[#FBBC05]">
                        Non-Technical: {domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain} Track
                      </Badge>
                      <div className="space-y-2">
                        {nonTechQuestions.map((q, idx) => (
                          <div key={idx} className="flex gap-3 text-xs bg-white/[0.01] border border-white/5 rounded-xl p-3 text-white/80">
                            <span className="font-bold text-[#FBBC05]">{idx + 1}.</span>
                            <p>{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Interactive Scratchpad Card */}
              <Card className="bg-white/[0.01] border border-white/5 rounded-3xl shadow-2xl">
                <CardHeader className="border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-white">
                    <PenTool className="size-4 text-[#34A853]" />
                    <CardTitle className="text-sm font-black uppercase tracking-tight">Interviewer Scratchpad</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-white/40">
                    Draft thoughts or bullet points during conversation (not saved to database)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <textarea
                    placeholder="Type rough interview notes here... e.g. 'Strong in core Next.js, showed good initiative in club projects...'"
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    className="w-full min-h-36 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:border-[#34A853] focus:ring-0 transition-colors resize-y"
                  />
                </CardContent>
              </Card>

            </div>
          )}

        </div>

        {/* Right 1 Column: Persistent Evaluation Review Form */}
        <div className="space-y-6">
          <div className={cn(
            "rounded-3xl transition-all duration-300",
            activeTab === "interview" 
              ? "ring-2 ring-[#34A853]/30 shadow-[0_0_24px_rgba(52,168,83,0.1)]"
              : ""
          )}>
            <ApplicationReviewForm application={application} userRole={userRole} />
          </div>
        </div>

      </div>

      {/* ── EDIT APPLICANT MODAL ── */}
      {isEditOpen && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-xl bg-zinc-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Candidate Details</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Update application profile information for {application.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name *</Label>
                  <Input 
                    value={editForm.name}
                    onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                    required
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Roll Number *</Label>
                  <Input 
                    value={editForm.rollNo}
                    onChange={(e) => setEditForm(p => ({ ...p, rollNo: e.target.value }))}
                    required
                    className="bg-black/40 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Email Address *</Label>
                  <Input 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                    required
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone Number *</Label>
                  <Input 
                    value={editForm.phone}
                    onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    required
                    className="bg-black/40 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Branch</Label>
                  <Input 
                    value={editForm.branch}
                    onChange={(e) => setEditForm(p => ({ ...p, branch: e.target.value }))}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Section</Label>
                  <Input 
                    value={editForm.section}
                    onChange={(e) => setEditForm(p => ({ ...p, section: e.target.value }))}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Year</Label>
                  <Input 
                    value={editForm.yearOfStudy}
                    onChange={(e) => setEditForm(p => ({ ...p, yearOfStudy: e.target.value }))}
                    className="bg-black/40 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">CGPA</Label>
                  <Input 
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm(p => ({ ...p, cgpa: e.target.value }))}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Backlogs Count</Label>
                  <Input 
                    type="number"
                    value={editForm.backlogs}
                    onChange={(e) => setEditForm(p => ({ ...p, backlogs: Number(e.target.value) }))}
                    className="bg-black/40 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Technical Track</Label>
                  <Select 
                    value={editForm.technicalDomain} 
                    onValueChange={(val) => setEditForm(p => ({ ...p, technicalDomain: val }))}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.entries(domainLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Non-Technical Track</Label>
                  <Select 
                    value={editForm.nonTechnicalDomain} 
                    onValueChange={(val) => setEditForm(p => ({ ...p, nonTechnicalDomain: val }))}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.entries(domainLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">LinkedIn URL</Label>
                <Input 
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm(p => ({ ...p, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="bg-black/40 border-white/10"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditOpen(false)}
                  disabled={isEditLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isEditLoading}
                  className="bg-[#4285F4] hover:bg-[#3367D6]"
                >
                  {isEditLoading ? <IosLoader size="sm" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteApplication}
        isLoading={isDeleting}
        title="Delete Candidate Application"
        itemName={`${application.name} (${application.rollNo})`}
      />

    </div>
  );
}
