"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Sparkles, 
  Quote, 
  ExternalLink, 
  Building2, 
  Linkedin, 
  Github, 
  Twitter, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  SlidersHorizontal,
  Send,
  Loader2,
  HeartHandshake,
  MessageSquareQuote,
  Flame,
  Globe
} from "lucide-react";
import { 
  AlumniTestimonial, 
  AlumniCategoryType, 
  SEED_ALUMNI_TESTIMONIALS 
} from "@/schemas/alumni";
import { submitAlumniTestimonial } from "@/app/actions/alumni-actions";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface AlumniBrutalistViewProps {
  initialTestimonials?: AlumniTestimonial[];
}

const CATEGORY_TAGS: { key: AlumniCategoryType | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All Stories', icon: '⚡' },
  { key: 'milestones', label: 'Milestones', icon: '🏆' },
  { key: 'moments', label: 'Memories', icon: '📸' },
  { key: 'leadership', label: 'Leadership', icon: '👑' },
  { key: 'career', label: 'Career', icon: '🚀' },
  { key: 'advice', label: 'Advice', icon: '💡' },
];

const ACCENT_COLORS = [
  { name: 'Google Blue', value: '#4285F4' },
  { name: 'Google Green', value: '#34A853' },
  { name: 'Electric Yellow', value: '#FFE600' },
  { name: 'Coral Red', value: '#EA4335' },
  { name: 'Cyber Purple', value: '#A733FF' },
  { name: 'Cyan Neon', value: '#00F0FF' },
  { name: 'Acid Lime', value: '#00FF66' },
  { name: 'Hot Pink', value: '#FF0055' },
];

export function AlumniBrutalistView({ initialTestimonials }: AlumniBrutalistViewProps) {
  const testimonials = useMemo(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      return initialTestimonials;
    }
    return SEED_ALUMNI_TESTIMONIALS;
  }, [initialTestimonials]);

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<AlumniCategoryType | 'all'>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick submission dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    batch: "2020 - 2024",
    role: "Former President",
    currentRole: "",
    company: "",
    quote: "",
    fullStory: "",
    type: "milestones" as AlumniCategoryType,
    color: "#4285F4",
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
    email: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Extract unique batches
  const availableBatches = useMemo(() => {
    const batches = new Set<string>();
    testimonials.forEach((t) => {
      if (t.batch) batches.add(t.batch);
    });
    return Array.from(batches);
  }, [testimonials]);

  // Filtered List
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.type !== selectedCategory) {
        return false;
      }
      // Batch filter
      if (selectedBatch !== 'all' && item.batch !== selectedBatch) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesQuote = item.quote.toLowerCase().includes(query);
        const matchesCompany = (item.company || '').toLowerCase().includes(query);
        const matchesRole = item.role.toLowerCase().includes(query);
        const matchesCurrentRole = (item.currentRole || '').toLowerCase().includes(query);
        const matchesBatch = item.batch.toLowerCase().includes(query);
        const matchesStory = (item.fullStory || '').toLowerCase().includes(query);

        return (
          matchesName ||
          matchesQuote ||
          matchesCompany ||
          matchesRole ||
          matchesCurrentRole ||
          matchesBatch ||
          matchesStory
        );
      }
      return true;
    });
  }, [testimonials, selectedCategory, selectedBatch, searchQuery]);

  const toggleStoryExpand = (id: string) => {
    setExpandedStories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuote = (item: AlumniTestimonial) => {
    const text = `"${item.quote}" — ${item.name} (${item.role}, MLSC SVEC)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast({
      title: "Quote Copied! 📋",
      description: `Copied words from ${item.name} to your clipboard.`,
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyShareLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/what-our-alumni-say/submit` : 'https://mlscsvec.com/what-our-alumni-say/submit';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({
      title: "Share Link Copied! 🚀",
      description: "Direct standalone submission form link is ready to paste in your groups.",
    });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim() || !formData.batch.trim() || !formData.role.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill out your Name, Batch, MLSC Role, and Your Words.",
        variant: "destructive",
      });
      return;
    }

    setFormSubmitting(true);
    try {
      let finalPhotoUrl = "";
      let finalPhotoPath = "";

      if (imageFile) {
        const path = `home/alumni/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, path);
        const uploadRes = await uploadBytes(storageRef, imageFile);
        finalPhotoUrl = await getDownloadURL(uploadRes.ref);
        finalPhotoPath = path;
      }

      const payload = {
        ...formData,
        name: formData.name.trim(),
        role: formData.role.trim(),
        quote: formData.quote.trim(),
        batch: formData.batch.trim(),
        company: formData.company.trim(),
        currentRole: formData.currentRole.trim(),
        fullStory: formData.fullStory.trim(),
        photoUrl: finalPhotoUrl,
        photoPath: finalPhotoPath,
      };

      const result = await submitAlumniTestimonial(payload);
      if (!result.success) {
        throw new Error(result.error || "Failed to submit testimonial");
      }

      setFormSuccess(true);
      toast({
        title: "Words Submitted Successfully! 🎉",
        description: "Your testimony has been published and added to the MLSC SVEC alumni wall.",
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
        setFormData({
          name: "",
          batch: "2020 - 2024",
          role: "Former President",
          currentRole: "",
          company: "",
          quote: "",
          fullStory: "",
          type: "milestones",
          color: "#4285F4",
          linkedinUrl: "",
          githubUrl: "",
          twitterUrl: "",
          email: "",
        });
        setImageFile(null);
        setPreviewImage(null);
      }, 2500);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Submission Error",
        description: err.message || "Could not publish your testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#FFE600] selection:text-black font-sans pb-28">
      {/* ══════════════════════════════════════════════════════════
          TOP MARQUEE TICKER (NEO-BRUTALIST)
          ══════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#FFE600] text-black font-sans font-black uppercase text-xs tracking-[0.25em] py-2 border-b-2 border-black overflow-hidden select-none">
        <div className="animate-marquee-left whitespace-nowrap flex gap-8 items-center font-bold">
          <span>⚡ MLSC SVEC ALUMNI ARCHIVE // UNFILTERED PERSPECTIVES</span>
          <span>✦ BATCH 2020 — 2026</span>
          <span>⚡ SHARING WORDS • MENTORSHIP • CAREER PATHWAYS</span>
          <span>✦ JOIN THE LEGACY</span>
          <span>⚡ MLSC SVEC ALUMNI ARCHIVE // UNFILTERED PERSPECTIVES</span>
          <span>✦ BATCH 2020 — 2026</span>
          <span>⚡ SHARING WORDS • MENTORSHIP • CAREER PATHWAYS</span>
          <span>✦ JOIN THE LEGACY</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER (NEO-BRUTALIST)
          ══════════════════════════════════════════════════════════ */}
      <section className="relative pt-16 md:pt-24 pb-12 border-b-2 border-black overflow-hidden bg-white">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            {/* Main Headline */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 bg-[#FFE600] text-black font-sans text-[11px] font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_#000000] border-2 border-black">
                <MessageSquareQuote className="h-3.5 w-3.5 text-black" />
                MLSC_ALUMNI_VOICES // VERIFIED
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter italic leading-[0.85] text-black">
                WHAT OUR <br />
                <span className="text-[#4285F4]">
                  ALUMNI SAY.
                </span>
              </h1>

              <p className="mt-6 text-zinc-700 text-sm md:text-lg font-semibold leading-relaxed max-w-2xl">
                The unfiltered thoughts, career transitions, and memories of the builders and leaders who formed the bedrock of MLSC SVEC.
              </p>
            </div>

            {/* Quick Action Matrix */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              {/* Standalone Fullscreen Form Link */}
              <Link
                href="/what-our-alumni-say/submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFE600] text-black font-sans font-black uppercase tracking-wider text-xs sm:text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95 text-center cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Fill Submission Form [↗]
              </Link>

              {/* Quick Submit Modal Trigger */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-zinc-100 text-black font-sans font-black uppercase tracking-wider text-xs border-2 border-black shadow-[4px_4px_0px_0px_#4285F4] transition-all active:scale-95 cursor-pointer"
                  >
                    Quick Submit Modal [✦]
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black text-black p-6 sm:p-8 rounded-none shadow-[10px_10px_0px_0px_#4285F4] font-sans">
                  <DialogHeader className="mb-4 text-left border-b-2 border-black pb-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#4285F4] text-white font-sans text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] w-fit mb-2">
                      SUBMISSION_PORTAL // 2026
                    </div>
                    <DialogTitle className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight italic text-black">
                      Leave Your Mark on the <span className="text-[#4285F4]">MLSC Archive</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-700 text-xs sm:text-sm font-semibold">
                      Share your experience, advice for juniors, or favorite memories. It will appear live on the website.
                    </DialogDescription>
                  </DialogHeader>

                  {formSuccess ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-[#00FF66] text-black border-2 border-black flex items-center justify-center mx-auto text-3xl font-black shadow-[4px_4px_0px_0px_#000000]">
                        ✓
                      </div>
                      <h3 className="text-2xl font-display font-black uppercase tracking-tight text-black">
                        Your Words Have Been Recorded!
                      </h3>
                      <p className="text-zinc-700 text-sm max-w-md mx-auto font-medium">
                        Thank you for contributing to the MLSC SVEC legacy. Your story is now part of the permanent alumni showcase.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Full Name <span className="text-[#FF0055]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Chandu Neelam"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                          />
                        </div>

                        {/* Graduating Batch */}
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Graduating Batch <span className="text-[#FF0055]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2020 - 2024 or 2024"
                            value={formData.batch}
                            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                          />
                        </div>

                        {/* MLSC Role */}
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Role at MLSC / SVEC <span className="text-[#FF0055]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Former President, Tech Lead, Member"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                          />
                        </div>

                        {/* Current Company / Uni */}
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Current Company / University
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Google, Microsoft, Higher Studies"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                          />
                        </div>

                        {/* Current Role/Title */}
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Current Designation
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Software Development Engineer"
                            value={formData.currentRole}
                            onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Story Theme <span className="text-[#FF0055]">*</span>
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as AlumniCategoryType })}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans cursor-pointer"
                          >
                            <option value="milestones">🏆 Milestones & Achievements</option>
                            <option value="moments">📸 Core Memories & Fun</option>
                            <option value="leadership">👑 Leadership & Community</option>
                            <option value="career">🚀 Career Pathways</option>
                            <option value="advice">💡 Advice for Juniors</option>
                          </select>
                        </div>
                      </div>

                      {/* The Quote */}
                      <div>
                        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                          Your Words / Reflection <span className="text-[#FF0055]">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="What did MLSC mean to you? Share a punchy quote or reflection that juniors will remember..."
                          value={formData.quote}
                          onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                        />
                      </div>

                      {/* Full Story (Optional) */}
                      <div>
                        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                          Detailed Journey / Advice (Optional)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Want to go deeper? Share stories about late night coding, placement prep, or mentorship..."
                          value={formData.fullStory}
                          onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                        />
                      </div>

                      {/* Photo & Color Accent */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Profile Picture
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-xs text-zinc-700 file:mr-3 file:py-1.5 file:px-3 file:border-2 file:border-black file:text-xs file:font-sans file:font-bold file:bg-[#FFE600] file:text-black cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Card Accent Color
                          </label>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {ACCENT_COLORS.map((col) => (
                              <button
                                key={col.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: col.value })}
                                className="w-6 h-6 border-2 border-black transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
                                style={{ backgroundColor: col.value }}
                              >
                                {formData.color === col.value && <Check className="h-3 w-3 text-black font-black stroke-[3]" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Socials */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            LinkedIn Profile URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            className="w-full px-3.5 py-2 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-xs font-medium font-sans placeholder-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-black mb-1.5">
                            Email (Confidential)
                          </label>
                          <input
                            type="email"
                            placeholder="alumni@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3.5 py-2 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-xs font-medium font-sans placeholder-zinc-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="w-full py-4 bg-[#4285F4] text-white font-sans font-black uppercase tracking-wider text-sm border-2 border-black shadow-[6px_6px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {formSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Recording Your Words...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Words to Live Archive [✦]
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              {/* Copy Shareable Link Button */}
              <button
                onClick={handleCopyShareLink}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-black font-sans font-bold uppercase tracking-wider text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000000] transition-all active:scale-95 cursor-pointer text-center"
              >
                {copiedLink ? <Check className="h-4 w-4 text-[#00A844]" /> : <Copy className="h-4 w-4" />}
                {copiedLink ? "Form Link Copied!" : "Copy Share Link"}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 pt-8 border-t-2 border-black font-sans">
            <div className="p-4 bg-[#F9F9FB] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-zinc-600 block text-[10px] uppercase font-bold tracking-wider">TOTAL VOICES</span>
              <span className="text-xl font-black text-black">{testimonials.length}+ STORIES</span>
            </div>
            <div className="p-4 bg-[#F9F9FB] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-zinc-600 block text-[10px] uppercase font-bold tracking-wider">BATCH SPAN</span>
              <span className="text-xl font-black text-[#4285F4]">2020 - 2026</span>
            </div>
            <div className="p-4 bg-[#F9F9FB] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-zinc-600 block text-[10px] uppercase font-bold tracking-wider">COMMUNITY IMPACT</span>
              <span className="text-xl font-black text-[#00A844]">100% BUILDERS</span>
            </div>
            <div className="p-4 bg-[#F9F9FB] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-zinc-600 block text-[10px] uppercase font-bold tracking-wider">ARCHIVE STATUS</span>
              <span className="text-xl font-black text-[#FFE600] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">PUBLIC & LIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          INTERACTIVE SEARCH & FILTER MATRIX
          ══════════════════════════════════════════════════════════ */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b-2 border-black py-4 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search alumni, company, role, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4] focus:outline-none text-xs font-sans font-medium placeholder-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              {CATEGORY_TAGS.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3 py-1.5 text-[11px] font-sans font-black uppercase tracking-wider border-2 border-black transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                        : "bg-white text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Batch Filter Dropdown / Pills */}
            {availableBatches.length > 0 && (
              <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                <span className="text-[10px] font-sans font-black uppercase text-black">BATCH:</span>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="px-3 py-1.5 bg-white border-2 border-black text-black font-sans text-xs font-black uppercase focus:border-[#4285F4] focus:shadow-[2px_2px_0px_0px_#4285F4] focus:outline-none cursor-pointer"
                >
                  <option value="all">ALL BATCHES</option>
                  {availableBatches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BRUTALIST CARDS GRID
          ══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 sm:px-6 max-w-7xl pt-12">
        {filteredTestimonials.length === 0 ? (
          <div className="p-16 text-center border-2 border-black bg-[#F9F9FB] shadow-[4px_4px_0px_0px_#000000]">
            <MessageSquareQuote className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-xl font-display font-black uppercase tracking-wider text-black">
              No matching stories found
            </h3>
            <p className="text-zinc-600 text-sm mt-1 max-w-md mx-auto font-medium">
              Try adjusting your search terms or filters to view more alumni reflections.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedBatch("all");
              }}
              className="mt-6 px-4 py-2 bg-[#FFE600] text-black font-sans text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((item, index) => {
              const isExpanded = !!expandedStories[item.id];
              const cardAccentColor = item.color || "#4285F4";

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between bg-white border-2 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-300 p-6 md:p-8"
                  style={{
                    boxShadow: `6px 6px 0px 0px ${cardAccentColor}`,
                  }}
                >
                  {/* Top Accent Strip & Tags */}
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b-2 border-black">
                      {/* Batch & Index Stamp */}
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2.5 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                          style={{ backgroundColor: cardAccentColor }}
                        >
                          {item.batch ? `BATCH ${item.batch.replace('Batch', '').trim()}` : 'ALUMNUS'}
                        </span>
                        <span className="text-[10px] font-sans font-bold text-zinc-500">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <span className="text-[10px] font-sans font-black uppercase tracking-wider text-black bg-zinc-100 px-2 py-0.5 border-2 border-black">
                        {item.type}
                      </span>
                    </div>

                    {/* Massive Brutalist Quotation Mark */}
                    <div className="relative mb-3">
                      <span 
                        className="text-6xl font-serif font-black leading-none select-none opacity-40 group-hover:opacity-100 transition-opacity"
                        style={{ color: cardAccentColor }}
                      >
                        “
                      </span>
                    </div>

                    {/* The Quote Body */}
                    <p className="text-sm md:text-base text-zinc-800 leading-relaxed font-semibold">
                      {item.quote}
                    </p>

                    {/* Extended Story Accordion */}
                    {item.fullStory && (
                      <div className="mt-4 pt-3 border-t-2 border-black">
                        {isExpanded && (
                          <p className="text-xs md:text-sm text-zinc-700 leading-relaxed font-medium mb-3 whitespace-pre-line animate-in fade-in duration-200">
                            {item.fullStory}
                          </p>
                        )}
                        <button
                          onClick={() => toggleStoryExpand(item.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-sans font-black uppercase tracking-wider text-[#4285F4] hover:underline cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Collapse Extended Story <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Read Full Journey <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Author Box & Action Bar */}
                  <div className="mt-8 pt-5 border-t-2 border-black">
                    <div className="flex items-start justify-between gap-3">
                      {/* Avatar & Name Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {item.photoUrl ? (
                          <div 
                            className="w-12 h-12 relative overflow-hidden border-2 border-black shrink-0 shadow-[3px_3px_0px_0px_#000000]"
                            style={{ backgroundColor: cardAccentColor }}
                          >
                            <Image
                              src={item.photoUrl}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-12 h-12 flex items-center justify-center text-black font-sans text-sm font-black shrink-0 border-2 border-black shadow-[3px_3px_0px_0px_#000000]"
                            style={{ backgroundColor: cardAccentColor }}
                          >
                            {item.initials || item.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-base font-display font-black text-black uppercase tracking-tight truncate group-hover:text-[#4285F4] transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-zinc-600 font-sans font-bold truncate">
                            {item.role}
                          </p>
                          {(item.company || item.currentRole) && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Building2 className="h-3 w-3 text-zinc-500 shrink-0" />
                              <span className="text-[11px] font-sans text-zinc-800 font-bold truncate">
                                {item.currentRole ? `${item.currentRole} ` : ''}
                                {item.company ? `@ ${item.company}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Share / Copy Quote Button */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopyQuote(item)}
                          title="Copy Quote"
                          className="p-2 bg-zinc-100 hover:bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-4 w-4 text-[#00A844]" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Social links row if available */}
                    {(item.linkedinUrl || item.githubUrl || item.twitterUrl) && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t-2 border-black">
                        {item.linkedinUrl && (
                          <a
                            href={item.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-700 hover:text-[#4285F4] flex items-center gap-1 font-sans font-bold transition-colors"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {item.githubUrl && (
                          <a
                            href={item.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-700 hover:text-black flex items-center gap-1 font-sans font-bold transition-colors"
                          >
                            <Github className="h-3.5 w-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {item.twitterUrl && (
                          <a
                            href={item.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-700 hover:text-[#00F0FF] flex items-center gap-1 font-sans font-bold transition-colors"
                          >
                            <Twitter className="h-3.5 w-3.5" />
                            <span>Twitter</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          ON-PAGE SUBMISSION SECTION (#submit)
          ══════════════════════════════════════════════════════════ */}
      <section id="submit" className="container mx-auto px-4 sm:px-6 max-w-5xl pt-24 mt-20 border-t-2 border-black">
        <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[10px_10px_0px_0px_#FFE600] relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black font-sans text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <HeartHandshake className="h-4 w-4" />
              CONTRIBUTE TO THE ARCHIVE
            </div>

            <Link
              href="/what-our-alumni-say/submit"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#4285F4] hover:underline uppercase"
            >
              Open dedicated full-screen form ↗
            </Link>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight italic text-black mb-3">
            ARE YOU AN <span className="text-[#4285F4]">MLSC ALUMNUS?</span>
          </h2>
          <p className="text-zinc-700 text-sm md:text-base mb-8 max-w-2xl leading-relaxed font-semibold">
            Your journey inspires hundreds of aspiring developers and students across Andhra Pradesh. Drop your words, advice, and memories below to be featured.
          </p>

          {formSuccess ? (
            <div className="py-12 text-center space-y-4 bg-[#F9F9FB] border-2 border-black p-8 shadow-[6px_6px_0px_0px_#00FF66]">
              <div className="w-16 h-16 bg-[#00FF66] text-black border-2 border-black flex items-center justify-center mx-auto text-3xl font-black shadow-[4px_4px_0px_0px_#000000]">
                ✓
              </div>
              <h3 className="text-2xl font-display font-black uppercase text-black">
                Words Received & Published!
              </h3>
              <p className="text-zinc-700 text-sm max-w-md mx-auto font-medium">
                Your testimonial has been recorded and is live on the MLSC SVEC website.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                    Your Name <span className="text-[#FF0055]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chandu Neelam"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                  />
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                    Graduation Batch <span className="text-[#FF0055]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2020 - 2024"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                  />
                </div>

                {/* MLSC Role */}
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                    MLSC Role Held <span className="text-[#FF0055]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Former President, Tech Lead"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Company */}
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                    Current Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft, TCS, Startup"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                  />
                </div>

                {/* Current Role */}
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                    Current Designation / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer, AI Researcher"
                    value={formData.currentRole}
                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                  />
                </div>
              </div>

              {/* Story Theme Selector */}
              <div>
                <label className="block text-xs font-sans font-bold uppercase text-black mb-2">
                  Select Theme of your Words
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CATEGORY_TAGS.filter(c => c.key !== 'all').map((cat) => (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => setFormData({ ...formData, type: cat.key as AlumniCategoryType })}
                      className={`p-2.5 text-center border-2 border-black transition-all cursor-pointer font-sans ${
                        formData.type === cat.key
                          ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                          : "bg-white text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <span className="text-base block mb-0.5">{cat.icon}</span>
                      <span className="text-xs font-black uppercase">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div>
                <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                  Your Words / Quote <span className="text-[#FF0055]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share a key thought, memorable experience, or advice for juniors..."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                />
              </div>

              {/* Extended Story */}
              <div>
                <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                  Full Story & Advice for Students (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Want to elaborate further? Add your detailed story, placement journey, or advice for first-year to final-year students..."
                  value={formData.fullStory}
                  onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-black text-black rounded-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] focus:outline-none text-sm font-medium font-sans placeholder-zinc-400"
                />
              </div>

              {/* Photo & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                    Profile Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-zinc-700 file:mr-2 file:py-1.5 file:px-3 file:border-2 file:border-black file:text-xs file:font-sans file:font-bold file:bg-[#FFE600] file:text-black cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-black mb-1">
                    Card Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ACCENT_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: col.value })}
                        className="w-6 h-6 border-2 border-black transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
                        style={{ backgroundColor: col.value }}
                      >
                        {formData.color === col.value && <Check className="h-3 w-3 text-black font-black stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full py-4 bg-[#FFE600] text-black font-sans font-black uppercase tracking-wider text-sm border-2 border-black shadow-[6px_6px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording Your Words...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Publish My Words to the Live Wall [↗]
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
