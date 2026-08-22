"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Star, 
  Award, 
  BookOpen, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  PenTool,
  ToggleLeft,
  Edit2,
  Trash2,
  Loader2,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationReviewForm } from "@/components/application-review-form";
import { cn } from "@/lib/utils";
import { toggleRecommendation, deleteApplicationAction, updateApplicantDetailsAction } from "@/app/actions/application-actions";
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
    case 'recommended':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function ApplicationDetailClient({ application, userRole }: ApplicationDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "interview">("metrics");
  const [scratchpadText, setScratchpadText] = useState("");

  const status = application.status || "Received";
  
  // Collect relevant domain questions
  const techQuestions = domainQuestions[application.technicalDomain] || [];
  const nonTechQuestions = application.nonTechnicalDomain ? (domainQuestions[application.nonTechnicalDomain] || []) : [];
  const generalQuestions = domainQuestions.general;

  const { toast } = useToast();
  const router = useRouter();
  const [isRecommended, setIsRecommended] = useState<boolean>(application.isRecommended || false);
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

  const handleToggleRec = async () => {
    setIsTogglingRec(true);
    const newStatus = !isRecommended;
    setIsRecommended(newStatus); // Optimistic UI update
    try {
      const res = await toggleRecommendation(application.firestoreId || application.id, newStatus);
      if (res.error) {
        setIsRecommended(!newStatus); // Rollback
        throw new Error(res.error);
      }
      toast({
        title: newStatus ? "Candidate Recommended" : "Recommendation Removed",
        description: `Candidate is ${newStatus ? 'now' : 'no longer'} recommended for the final round.`,
      });
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to toggle recommendation.",
      });
    } finally {
      setIsTogglingRec(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteApplicationAction(application.firestoreId || application.id);
      if (res.error) throw new Error(res.error);
      toast({
        title: "Application Deleted",
        description: `Application for ${application.name} has been permanently removed.`,
      });
      setIsDeleteDialogOpen(false);
      router.push("/admin/applications");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "Failed to delete application.",
      });
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditLoading(true);
    try {
      const res = await updateApplicantDetailsAction(application.firestoreId || application.id, editForm);
      if (res.error) throw new Error(res.error);
      toast({
        title: "Applicant Updated",
        description: "Candidate information updated successfully.",
      });
      setIsEditOpen(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Failed to update details.",
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ── Apple-style Mode Selector Tabs ── */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "metrics"
                ? "bg-[#4285F4] text-white shadow-[0_0_12px_rgba(66,133,244,0.2)]"
                : "text-white/40 hover:text-white"
            )}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Metrics & Responses
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("interview")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "interview"
                ? "bg-[#34A853] text-white shadow-[0_0_12px_rgba(52,168,83,0.2)]"
                : "text-white/40 hover:text-white"
            )}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Live Interview Board
            </span>
          </button>
        </div>

        <div className="hidden sm:block text-[10px] font-black text-white/20 uppercase tracking-widest px-4">
          ATS MODE: {activeTab === "metrics" ? "PROFILING" : "ASSESSING"}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left main area (Depends on active mode) */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === "metrics" ? (
            /* Mode 1: Evaluation Metrics & Candidate Profile */
            <Card className="bg-white/[0.01] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
              
              {/* Profile Card Header */}
              <CardHeader className="border-b border-white/5 pb-6 bg-white/[0.01] p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex aspect-square size-14 items-center justify-center rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] text-xl font-black tracking-tight shrink-0">
                      {application.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight text-white uppercase">{application.name}</CardTitle>
                      <CardDescription className="text-xs text-white/40 mt-1">
                        Submitted on {format(new Date(application.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </div>
                                     <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-2">
                      {isRecommended && (
                        <Badge variant="secondary" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black uppercase tracking-wider px-3 py-1">
                          ★ Recommended
                        </Badge>
                      )}
                      <Badge variant={getStatusVariant(status)} className="text-[10px] font-black uppercase tracking-wider px-3 py-1">
                        {status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {(userRole === "admin" || userRole === "super_admin") && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditOpen(true)}
                            className="h-7 text-xs border-white/10 bg-white/5 hover:bg-white/10 text-white gap-1.5"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit Info
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={isDeleting}
                            className="h-7 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 gap-1.5"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </>
                      )}

                      {(userRole === "admin" || userRole === "super_admin" || userRole === "panel" || userRole === "common_panel") && (
                        <button
                          onClick={handleToggleRec}
                          disabled={isTogglingRec}
                          className={cn(
                            "px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all h-7 flex items-center",
                            isRecommended 
                              ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                              : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20"
                          )}
                        >
                          {isTogglingRec ? "Wait..." : isRecommended ? "Un-Recommend" : "★ Recommend"}
                        </button>
                      )}
                    </div>
                  </div>      </div>
                </div>
                
                {/* Short action buttons */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs pt-4 mt-2 border-t border-white/5">
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

              {/* Profile Card Body */}
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

                {/* Domain Preference badges */}
                <div className="flex flex-col sm:flex-row gap-6 text-xs bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Technical Track Preference</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4]">
                      {domainLabels[application.technicalDomain] || application.technicalDomain}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Non-Technical Track Preference</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                      {domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain}
                    </span>
                  </div>
                </div>

                {/* AI Resume Summary block */}
                {application.resumeSummary && (
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-2">
                    <h4 className="text-[10px] font-black text-[#4285F4] uppercase tracking-widest">AI-Generated Resume Summary</h4>
                    <blockquote className="text-xs text-white/60 leading-relaxed border-l-2 border-[#4285F4] pl-4 italic">
                      {application.resumeSummary}
                    </blockquote>
                  </div>
                )}

                {/* Quantitative Evaluation Metrics Dashboard */}
                {application.ratings && application.ratings.overall > 0 && (
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-[#4285F4] uppercase tracking-widest">Evaluation Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Left: Score list with progress bars */}
                      <div className="space-y-3">
                        {[
                          { label: "Communication", val: application.ratings.communication },
                          { label: "Technical Skills", val: application.ratings.technical },
                          { label: "Problem Solving", val: application.ratings.problemSolving },
                          { label: "Team Fit", val: application.ratings.teamFit },
                          { label: "Confidence & Attitude", val: (application.ratings as any).confidence ?? 0 },
                          { label: "Growth Mindset", val: (application.ratings as any).growthMindset ?? 0 },
                          { label: "Leadership & Initiative", val: (application.ratings as any).leadership ?? 0 },
                        ].map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-white/50">{item.label}</span>
                              <span className="text-white">{item.val.toFixed(1)} / 5.0</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#4285F4] h-full rounded-full transition-all" 
                                style={{ width: `${(item.val / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Big overall card */}
                      <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Overall Score</span>
                        <span className="text-5xl font-black tracking-tighter text-[#4285F4] mt-2">
                          {application.ratings.overall.toFixed(2)}
                        </span>
                        <div className="flex gap-1 mt-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={cn(
                                "size-4", 
                                Math.round(application.ratings.overall) >= star 
                                  ? "text-[#4285F4] fill-[#4285F4]" 
                                  : "text-white/10"
                              )} 
                            />
                          ))}
                        </div>
                        {application.isRecommended && (
                          <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
                            Recommended
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* Candidate Essays / Statements */}
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
          ) : (
            /* Mode 2: Live Interview Board */
            <div className="space-y-8">
              
              {/* Domain Specific Suggested Questions card */}
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

              {/* Interactive scratchpad card */}
              <Card className="bg-white/[0.01] border border-white/5 rounded-3xl shadow-2xl">
                <CardHeader className="border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-white">
                    <PenTool className="size-4.5 text-[#34A853]" />
                    <CardTitle className="text-sm font-black uppercase tracking-tight">Interviewer Scratchpad</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-white/40">
                    Draft thoughts or bullet points during conversation (not saved to database)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <textarea
                    placeholder="Type rough interview notes here... e.g. 'Strong in core React, showed good leadership story...'"
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    className="w-full min-h-36 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:border-[#34A853] focus:ring-0 transition-colors resize-y"
                  />
                </CardContent>
              </Card>

            </div>
          )}

        </div>

        {/* Right side review pane - stays persistent but receives active visual highlighting in assessing mode */}
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

      {/* Edit Applicant Modal */}
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
                  <Label className="text-xs">Year of Study</Label>
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
                  <Label className="text-xs">Active Backlogs</Label>
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(domainLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Non-Technical Track</Label>
                  <Select 
                    value={editForm.nonTechnicalDomain || 'none'} 
                    onValueChange={(val) => setEditForm(p => ({ ...p, nonTechnicalDomain: val === 'none' ? '' : val }))}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">None</SelectItem>
                      {Object.entries(domainLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">LinkedIn Profile</Label>
                <Input 
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm(p => ({ ...p, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="bg-black/40 border-white/10"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditLoading} className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold flex items-center gap-2">
                  {isEditLoading ? (
                    <>
                      <IosLoader size="xs" color="text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dedicated Delete Applicant Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Candidate Application"
        description="This will permanently delete this applicant's submission, resume data, and live interview ratings."
        itemName={application.name}
        itemDetails={application.rollNo ? `Roll No: ${application.rollNo} • ID: ${application.id}` : `ID: ${application.id}`}
        isLoading={isDeleting}
      />

    </div>
  );
}
