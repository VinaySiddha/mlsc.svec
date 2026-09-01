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
    <div className="space-y-8 font-sans">
      
      {/* Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border-2 border-black p-2 gap-3 shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-black",
              activeTab === "metrics"
                ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000] translate-x-[1px] translate-y-[1px]"
                : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]"
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
              "px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-black",
              activeTab === "interview"
                ? "bg-[#00FF66] text-black shadow-[3px_3px_0px_0px_#000000] translate-x-[1px] translate-y-[1px]"
                : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000]"
            )}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Live Interview Board
            </span>
          </button>
        </div>

        <div className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 bg-black text-white border border-black">
          ATS MODE: {activeTab === "metrics" ? "PROFILING" : "ASSESSING"}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left main area (Depends on active mode) */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === "metrics" ? (
            /* Mode 1: Evaluation Metrics & Candidate Profile */
            <Card className="border-2 border-black bg-white text-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden">
              
              {/* Profile Card Header */}
              <CardHeader className="border-b-2 border-black pb-6 bg-white p-6 md:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex aspect-square size-14 items-center justify-center bg-[#FFE600] border-2 border-black text-black text-xl font-display font-black tracking-tight shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                      {application.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-display font-black tracking-tight text-black uppercase italic">{application.name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-600 font-bold mt-1">
                        Submitted on {format(new Date(application.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex flex-wrap gap-2">
                      {isRecommended && (
                        <Badge variant="secondary" className="text-[10px] bg-[#FFE600] text-black border-2 border-black font-black uppercase tracking-wider px-3 py-1 shadow-[2px_2px_0px_0px_#000000]">
                          ★ Recommended
                        </Badge>
                      )}
                      <Badge variant={getStatusVariant(status)} className="text-[10px] font-black uppercase tracking-wider px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
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
                            className="h-8 text-xs border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000] font-black uppercase gap-1.5"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={isDeleting}
                            className="h-8 text-xs bg-[#FF0055] hover:bg-[#FF0055]/90 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black uppercase gap-1.5"
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
                            "px-3 py-1 border-2 border-black text-[10px] font-black uppercase tracking-wider transition-all h-8 flex items-center shadow-[2px_2px_0px_0px_#000000] cursor-pointer",
                            isRecommended 
                              ? "bg-[#FF0055] text-white hover:bg-[#FF0055]/90"
                              : "bg-[#FFE600] text-black hover:bg-[#FFE600]/90"
                          )}
                        >
                          {isTogglingRec ? "Wait..." : isRecommended ? "Un-Recommend" : "★ Recommend"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Short action buttons */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs pt-4 border-t-2 border-black">
                  <a href={`mailto:${application.email}`} className="flex items-center gap-1.5 text-black hover:text-[#4285F4] font-bold transition-colors">
                    <Mail className="size-3.5 stroke-[2.5]" />
                    {application.email}
                  </a>
                  <a href={`tel:${application.phone}`} className="flex items-center gap-1.5 text-black hover:text-[#4285F4] font-bold transition-colors">
                    <Phone className="size-3.5 stroke-[2.5]" />
                    {application.phone}
                  </a>
                  {application.linkedin && (
                    <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-black hover:text-[#4285F4] font-bold transition-colors">
                      <Linkedin className="size-3.5 stroke-[2.5]" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 pt-1 font-mono break-all font-bold">
                  REF_ID: {application.id}
                </div>
              </CardHeader>

              {/* Profile Card Body */}
              <CardContent className="p-6 md:p-8 space-y-8 text-sm">
                
                {/* Academic Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-50 border-2 border-black p-4 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Roll Number</span>
                    <p className="text-sm font-black mt-1 text-black">{application.rollNo}</p>
                  </div>
                  <div className="bg-zinc-50 border-2 border-black p-4 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Branch & Section</span>
                    <p className="text-sm font-black mt-1 text-black">{application.branch} - {application.section}</p>
                  </div>
                  <div className="bg-zinc-50 border-2 border-black p-4 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">CGPA</span>
                    <p className="text-sm font-black mt-1 text-black">{application.cgpa}</p>
                  </div>
                  <div className="bg-zinc-50 border-2 border-black p-4 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Backlogs</span>
                    <p className="text-sm font-black mt-1 text-black">{application.backlogs}</p>
                  </div>
                </div>

                {/* Domain Preference badges */}
                <div className="flex flex-col sm:flex-row gap-6 text-xs bg-zinc-50 border-2 border-black p-6 shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Technical Track Preference</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-[#4285F4] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                      {domainLabels[application.technicalDomain] || application.technicalDomain}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Non-Technical Track Preference</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                      {domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain}
                    </span>
                  </div>
                </div>

                {/* AI Resume Summary block */}
                {application.resumeSummary && (
                  <div className="bg-[#FFE600]/10 border-2 border-black p-6 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                    <h4 className="text-[10px] font-black text-black uppercase tracking-widest">AI-Generated Resume Summary</h4>
                    <blockquote className="text-xs text-black leading-relaxed border-l-4 border-black pl-4 font-medium italic">
                      {application.resumeSummary}
                    </blockquote>
                  </div>
                )}

                {/* Quantitative Evaluation Metrics Dashboard */}
                {application.ratings && application.ratings.overall > 0 && (
                  <div className="bg-zinc-50 border-2 border-black p-6 space-y-4 shadow-[3px_3px_0px_0px_#000000]">
                    <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Evaluation Metrics</h4>
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
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-zinc-700">{item.label}</span>
                              <span className="text-black font-black">{item.val.toFixed(1)} / 5.0</span>
                            </div>
                            <div className="w-full bg-zinc-200 border border-black h-2 overflow-hidden">
                              <div 
                                className="bg-[#4285F4] h-full transition-all" 
                                style={{ width: `${(item.val / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Big overall card */}
                      <div className="flex flex-col items-center justify-center bg-white border-2 border-black p-6 text-center shadow-[4px_4px_0px_0px_#000000]">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Overall Score</span>
                        <span className="text-5xl font-display font-black tracking-tighter text-[#4285F4] mt-2">
                          {application.ratings.overall.toFixed(2)}
                        </span>
                        <div className="flex gap-1 mt-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={cn(
                                "size-4", 
                                Math.round(application.ratings.overall) >= star 
                                  ? "text-[#FFE600] fill-[#FFE600] stroke-black stroke-[1.5]" 
                                  : "text-zinc-300 fill-zinc-100"
                              )} 
                            />
                          ))}
                        </div>
                        {application.isRecommended && (
                          <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-[#00FF66] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000]">
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
                    <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Why do you want to join this club?</h4>
                    <div className="bg-zinc-50 border-2 border-black p-5 text-xs text-black leading-relaxed whitespace-pre-wrap font-medium shadow-[2px_2px_0px_0px_#000000]">
                      {application.joinReason}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-black uppercase tracking-widest">What do you know about MLSC club?</h4>
                    <div className="bg-zinc-50 border-2 border-black p-5 text-xs text-black leading-relaxed whitespace-pre-wrap font-medium shadow-[2px_2px_0px_0px_#000000]">
                      {application.aboutClub}
                    </div>
                  </div>

                  {application.anythingElse && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Anything else?</h4>
                      <div className="bg-zinc-50 border-2 border-black p-5 text-xs text-black leading-relaxed whitespace-pre-wrap font-medium shadow-[2px_2px_0px_0px_#000000]">
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
              <Card className="border-2 border-black bg-white text-black shadow-[6px_6px_0px_0px_#000000]">
                <CardHeader className="border-b-2 border-black pb-4">
                  <div className="flex items-center gap-2 text-black">
                    <HelpCircle className="size-5 text-[#34A853] stroke-[2.5]" />
                    <CardTitle className="text-lg font-display font-black uppercase tracking-tight">Structured Screening Rubric</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-zinc-600 font-bold">
                    Suggested interview questions based on preferred candidate domains
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  
                  {/* General Core Questions */}
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                      General Icebreakers & Fit
                    </Badge>
                    <div className="space-y-2">
                      {generalQuestions.map((q, idx) => (
                        <div key={idx} className="flex gap-3 text-xs bg-zinc-50 border-2 border-black p-3 text-black font-medium shadow-[2px_2px_0px_0px_#000000]">
                          <span className="font-black text-[#4285F4]">{idx + 1}.</span>
                          <p>{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Preferred Domain Questions */}
                  <div className="space-y-3 pt-2">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-[#4285F4] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                      Technical: {domainLabels[application.technicalDomain] || application.technicalDomain} Track
                    </Badge>
                    <div className="space-y-2">
                      {techQuestions.map((q, idx) => (
                        <div key={idx} className="flex gap-3 text-xs bg-zinc-50 border-2 border-black p-3 text-black font-medium shadow-[2px_2px_0px_0px_#000000]">
                          <span className="font-black text-[#4285F4]">{idx + 1}.</span>
                          <p>{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Non-Technical Preferred Domain Questions */}
                  {application.nonTechnicalDomain && nonTechQuestions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                        Non-Technical: {domainLabels[application.nonTechnicalDomain] || application.nonTechnicalDomain} Track
                      </Badge>
                      <div className="space-y-2">
                        {nonTechQuestions.map((q, idx) => (
                          <div key={idx} className="flex gap-3 text-xs bg-zinc-50 border-2 border-black p-3 text-black font-medium shadow-[2px_2px_0px_0px_#000000]">
                            <span className="font-black text-black">{idx + 1}.</span>
                            <p>{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Interactive scratchpad card */}
              <Card className="border-2 border-black bg-white text-black shadow-[6px_6px_0px_0px_#000000]">
                <CardHeader className="border-b-2 border-black pb-4">
                  <div className="flex items-center gap-2 text-black">
                    <PenTool className="size-4.5 text-black stroke-[2.5]" />
                    <CardTitle className="text-sm font-display font-black uppercase tracking-tight">Interviewer Scratchpad</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-zinc-600 font-bold">
                    Draft thoughts or bullet points during conversation (not saved to database)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <textarea
                    placeholder="Type rough interview notes here... e.g. 'Strong in core React, showed good leadership story...'"
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    className="w-full min-h-36 bg-white border-2 border-black p-4 text-xs text-black placeholder:text-zinc-400 focus:outline-none shadow-[2px_2px_0px_0px_#000000] resize-y font-mono"
                  />
                </CardContent>
              </Card>

            </div>
          )}

        </div>

        {/* Right side review pane - stays persistent but receives active visual highlighting in assessing mode */}
        <div className="space-y-6">
          <div className={cn(
            "transition-all duration-200",
            activeTab === "interview" 
              ? "border-4 border-black shadow-[8px_8px_0px_0px_#00FF66]"
              : ""
          )}>
            <ApplicationReviewForm application={application} userRole={userRole} />
          </div>
        </div>

      </div>

      {/* Edit Applicant Modal */}
      {isEditOpen && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-xl bg-white border-4 border-black text-black shadow-[10px_10px_0px_0px_#000000] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-display font-black uppercase italic text-black">Edit Candidate Details</DialogTitle>
              <DialogDescription className="text-zinc-600 text-xs font-bold">
                Update application profile information for {application.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Full Name *</Label>
                  <Input 
                    value={editForm.name}
                    onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                    required
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Roll Number *</Label>
                  <Input 
                    value={editForm.rollNo}
                    onChange={(e) => setEditForm(p => ({ ...p, rollNo: e.target.value }))}
                    required
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Email Address *</Label>
                  <Input 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                    required
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Phone Number *</Label>
                  <Input 
                    value={editForm.phone}
                    onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    required
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Branch</Label>
                  <Input 
                    value={editForm.branch}
                    onChange={(e) => setEditForm(p => ({ ...p, branch: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Section</Label>
                  <Input 
                    value={editForm.section}
                    onChange={(e) => setEditForm(p => ({ ...p, section: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Year of Study</Label>
                  <Input 
                    value={editForm.yearOfStudy}
                    onChange={(e) => setEditForm(p => ({ ...p, yearOfStudy: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">CGPA</Label>
                  <Input 
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm(p => ({ ...p, cgpa: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Active Backlogs</Label>
                  <Input 
                    type="number"
                    value={editForm.backlogs}
                    onChange={(e) => setEditForm(p => ({ ...p, backlogs: Number(e.target.value) }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Technical Track</Label>
                  <Select 
                    value={editForm.technicalDomain} 
                    onValueChange={(val) => setEditForm(p => ({ ...p, technicalDomain: val }))}
                  >
                    <SelectTrigger className="bg-white border-2 border-black text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-black text-black">
                      {Object.entries(domainLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Non-Technical Track</Label>
                  <Select 
                    value={editForm.nonTechnicalDomain || 'none'} 
                    onValueChange={(val) => setEditForm(p => ({ ...p, nonTechnicalDomain: val === 'none' ? '' : val }))}
                  >
                    <SelectTrigger className="bg-white border-2 border-black text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-black text-black">
                      <SelectItem value="none" className="text-xs">None</SelectItem>
                      {Object.entries(domainLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-black">LinkedIn Profile</Label>
                <Input 
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm(p => ({ ...p, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="bg-white border-2 border-black text-black"
                />
              </div>

              <DialogFooter className="pt-4 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000] font-black uppercase">
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditLoading} className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase flex items-center gap-2">
                  {isEditLoading ? (
                    <>
                      <IosLoader size="xs" color="text-black" />
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
