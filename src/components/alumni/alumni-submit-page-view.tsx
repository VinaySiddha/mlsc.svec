"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Check, 
  Share2, 
  ArrowLeft, 
  Building2, 
  Upload, 
  Loader2, 
  Linkedin, 
  Github, 
  Twitter, 
  ExternalLink,
  MessageSquareQuote,
  Eye,
  Copy
} from "lucide-react";
import { AlumniCategoryType, AlumniTestimonial } from "@/schemas/alumni";
import { submitAlumniTestimonial } from "@/app/actions/alumni-actions";
import { toast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CATEGORIES: { key: AlumniCategoryType; label: string; icon: string; desc: string }[] = [
  { key: 'milestones', label: 'Milestones', icon: '🏆', desc: 'Hackathon wins, project launches, club milestones' },
  { key: 'moments', label: 'Memories', icon: '📸', desc: 'Late night code jams, events, core team bonds' },
  { key: 'leadership', label: 'Leadership', icon: '👑', desc: 'Club culture, mentoring teams, public speaking' },
  { key: 'career', label: 'Career Pathway', icon: '🚀', desc: 'Interviews, job offers, corporate/startup journey' },
  { key: 'advice', label: 'Advice', icon: '💡', desc: 'Direct tips & wisdom for 1st-4th year juniors' },
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

export function AlumniSubmitPageView() {
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [submittedItem, setSubmittedItem] = useState<AlumniTestimonial | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("2020 - 2024");
  const [role, setRole] = useState("Former President");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [quote, setQuote] = useState("");
  const [fullStory, setFullStory] = useState("");
  const [type, setType] = useState<AlumniCategoryType>("milestones");
  const [color, setColor] = useState("#4285F4");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const initials = name.trim().split(/\s+/).length > 1
    ? (name.trim().split(/\s+/)[0][0] + name.trim().split(/\s+/).slice(-1)[0][0]).toUpperCase()
    : (name.trim().substring(0, 2) || "AL").toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCopyShareLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/what-our-alumni-say/submit` : 'https://mlscsvec.com/what-our-alumni-say/submit';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({
      title: "Submission Form Link Copied! 📋",
      description: "You can send this link to other MLSC alumni.",
    });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim() || !batch.trim() || !role.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide your Name, Batch, MLSC Role, and Your Words.",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
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
        name: name.trim(),
        batch: batch.trim(),
        role: role.trim(),
        currentRole: currentRole.trim(),
        company: company.trim(),
        quote: quote.trim(),
        fullStory: fullStory.trim(),
        type,
        color,
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        twitterUrl: twitterUrl.trim(),
        email: email.trim(),
        photoUrl: finalPhotoUrl,
        photoPath: finalPhotoPath,
      };

      const res = await submitAlumniTestimonial(payload);

      if (!res.success) {
        throw new Error(res.error || "Failed to submit testimonial");
      }

      const createdObj: AlumniTestimonial = {
        id: res.id || `sub-${Date.now()}`,
        name: name.trim(),
        initials,
        role: role.trim(),
        currentRole: currentRole.trim(),
        company: company.trim(),
        batch: batch.trim(),
        quote: quote.trim(),
        fullStory: fullStory.trim(),
        photoUrl: finalPhotoUrl,
        photoPath: finalPhotoPath,
        color,
        type,
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        twitterUrl: twitterUrl.trim(),
        email: email.trim(),
        isApproved: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
      };

      setSubmittedItem(createdObj);
      setFormSuccess(true);
      toast({
        title: "Your Words are Live! 🎉",
        description: "Thank you for contributing to the MLSC SVEC Alumni Archive.",
      });
    } catch (err: any) {
      console.error("Submission failed:", err);
      toast({
        title: "Submission Error",
        description: err.message || "Could not publish your testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FFE600] selection:text-black font-sans pb-20">
      {/* ── Top Brutalist Marquee ── */}
      <div className="w-full bg-[#FFE600] text-black font-mono font-black uppercase text-xs tracking-[0.25em] py-2 border-b-2 border-black overflow-hidden select-none">
        <div className="animate-marquee-left whitespace-nowrap flex gap-8 items-center">
          <span>⚡ MLSC SVEC // ALUMNI WORDS & REFLECTIONS PORTAL</span>
          <span>✦ UNFILTERED CAREER PATHWAYS</span>
          <span>⚡ BATCH 2020 — 2026</span>
          <span>✦ INSPIRING THE NEXT GENERATION</span>
          <span>⚡ MLSC SVEC // ALUMNI WORDS & REFLECTIONS PORTAL</span>
          <span>✦ UNFILTERED CAREER PATHWAYS</span>
          <span>⚡ BATCH 2020 — 2026</span>
          <span>✦ INSPIRING THE NEXT GENERATION</span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-8 sm:pt-12">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/what-our-alumni-say"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-white/20 shadow-[3px_3px_0px_0px_#4285F4] transition-transform active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Words
          </Link>

          <button
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FFE600] text-black font-mono text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#FFFFFF] hover:bg-[#e6cf00] transition-transform active:scale-95"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            {copiedLink ? "Link Copied!" : "Share Form"}
          </button>
        </div>

        {/* Hero title */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white font-mono text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#FFFFFF] mb-4">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            OFFICIAL ALUMNI VOICES ARCHIVE
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight italic text-white leading-[0.95]">
            SHARE YOUR <span className="text-[#FFE600]">WORDS.</span> <br />
            INSPIRE THE <span className="text-[#00FF66]">NEXT WAVE.</span>
          </h1>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Take 2 minutes to share your memories, career lessons, or words of encouragement for students at Sri Vasavi Engineering College. Your words will be featured across the website.
          </p>
        </div>

        {formSuccess && submittedItem ? (
          /* ── SUCCESS SCREEN ── */
          <div className="bg-[#0E0E10] border-2 border-white/20 p-6 sm:p-10 shadow-[10px_10px_0px_0px_#00FF66] text-center space-y-8 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-[#00FF66] text-black rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-[4px_4px_0px_0px_#FFFFFF]">
              ✓
            </div>

            <div>
              <span className="px-3 py-1 bg-[#00FF66] text-black font-mono text-xs font-bold uppercase tracking-wider border border-black">
                PUBLISHED SUCCESSFULLY
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mt-4 italic">
                YOUR WORDS ARE NOW PART OF THE ARCHIVE!
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto mt-2">
                Thank you, <strong className="text-white">{submittedItem.name}</strong>. Your testimony has been recorded and will inspire current and upcoming batches.
              </p>
            </div>

            {/* Live Preview of Published Card */}
            <div className="max-w-md mx-auto text-left bg-[#141418] border-2 border-white/20 p-6 shadow-[6px_6px_0px_0px_#FFE600]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#FFE600] text-black">
                  BATCH {submittedItem.batch}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  {submittedItem.type}
                </span>
              </div>
              <p className="text-sm text-zinc-200 italic mb-4">
                "{submittedItem.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                <div
                  className="w-10 h-10 flex items-center justify-center text-black font-mono text-xs font-black shrink-0 border border-black"
                  style={{ backgroundColor: submittedItem.color || "#4285F4" }}
                >
                  {submittedItem.initials}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase">{submittedItem.name}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{submittedItem.role}</p>
                  {submittedItem.company && (
                    <p className="text-[11px] text-zinc-300 font-semibold mt-0.5">
                      {submittedItem.currentRole ? `${submittedItem.currentRole} @ ` : ''}{submittedItem.company}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/what-our-alumni-say"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#4285F4] text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:bg-[#3367D6] transition-transform active:scale-95 text-center"
              >
                View on Alumni Wall →
              </Link>
              <button
                onClick={handleCopyShareLink}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FFE600] text-black font-mono text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:bg-[#e6cf00] transition-transform active:scale-95"
              >
                {copiedLink ? "Link Copied!" : "Copy Link to Share with Peers"}
              </button>
            </div>
          </div>
        ) : (
          /* ── SUBMISSION FORM WITH LIVE PREVIEW ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-[#0E0E10] border-2 border-white/20 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#FFE600] space-y-6">
              
              {/* 1. Identity */}
              <div>
                <span className="text-[11px] font-mono font-bold text-[#FFE600] uppercase tracking-wider block mb-3">
                  01 // YOUR IDENTITY & LEGACY
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      Full Name <span className="text-[#FF0055]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chandu Neelam"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#FFE600] focus:outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      Graduation Batch <span className="text-[#FF0055]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2020 - 2024"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#FFE600] focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                    Role held at MLSC / SVEC <span className="text-[#FF0055]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Former President, Tech Lead, AI Domain Lead, Core Member"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#FFE600] focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* 2. Present Career */}
              <div className="pt-4 border-t border-zinc-800">
                <span className="text-[11px] font-mono font-bold text-[#00FF66] uppercase tracking-wider block mb-3">
                  02 // CURRENT CAREER & IMPACT
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      Current Company / University
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google, Microsoft, TCS, Masters at ASU"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#00FF66] focus:outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      Current Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer, AI Researcher"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#00FF66] focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 3. The Story & Theme */}
              <div className="pt-4 border-t border-zinc-800">
                <span className="text-[11px] font-mono font-bold text-[#4285F4] uppercase tracking-wider block mb-3">
                  03 // YOUR WORDS & ADVICE
                </span>

                {/* Category Pills */}
                <div className="mb-4">
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-2">
                    Select Story Theme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat.key}
                        onClick={() => setType(cat.key)}
                        className={`p-2 text-left border-2 transition-all cursor-pointer ${
                          type === cat.key
                            ? "bg-white text-black border-black shadow-[3px_3px_0px_0px_#4285F4]"
                            : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                        }`}
                      >
                        <span className="text-sm block">{cat.icon}</span>
                        <span className="text-xs font-mono font-bold uppercase block mt-1">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* The Quote / Words */}
                <div className="mb-4">
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                    Your Words / Testimonial <span className="text-[#FF0055]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share what MLSC meant to you, key takeaways, and memories that shaped your career..."
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#4285F4] focus:outline-none text-sm font-medium"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                    <span>Keep it punchy (appears on home marquee)</span>
                    <span>{quote.length} chars</span>
                  </div>
                </div>

                {/* Extended Story (Optional) */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                    Extended Story & Advice for Juniors (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Want to write more detailed paragraphs or lessons for future students?"
                    value={fullStory}
                    onChange={(e) => setFullStory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#4285F4] focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* 4. Photo & Color Customization */}
              <div className="pt-4 border-t border-zinc-800">
                <span className="text-[11px] font-mono font-bold text-[#A733FF] uppercase tracking-wider block mb-3">
                  04 // CARD CUSTOMIZATION & PHOTO
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/60 p-4 border border-zinc-800">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:border-2 file:border-black file:text-xs file:font-mono file:font-bold file:bg-[#FFE600] file:text-black cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      Accent Color
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ACCENT_COLORS.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setColor(col.value)}
                          className="w-6 h-6 border-2 border-black transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#FFFFFF]"
                          style={{ backgroundColor: col.value }}
                          title={col.name}
                        >
                          {color === col.value && <Check className="h-3 w-3 text-black font-black stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Social Links */}
              <div className="pt-4 border-t border-zinc-800">
                <span className="text-[11px] font-mono font-bold text-[#00F0FF] uppercase tracking-wider block mb-3">
                  05 // SOCIAL LINKS & CONTACT
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#00F0FF] focus:outline-none text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                      Email Address (Confidential)
                    </label>
                    <input
                      type="email"
                      placeholder="alumni@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black border-2 border-zinc-700 text-white rounded-none focus:border-[#00F0FF] focus:outline-none text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-4 bg-[#FFE600] text-black font-mono font-black uppercase tracking-wider text-sm border-2 border-black shadow-[6px_6px_0px_0px_#FFFFFF] hover:shadow-[2px_2px_0px_0px_#FFFFFF] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Publishing to Live Archive...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      SUBMIT MY WORDS TO LIVE ARCHIVE [↗]
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Card Preview Column */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 font-mono text-xs text-zinc-400">
                <Eye className="h-3.5 w-3.5 text-[#00FF66]" />
                <span>LIVE CARD PREVIEW</span>
              </div>

              {/* Card Preview */}
              <div
                className="bg-[#0E0E10] border-2 border-white/20 p-6 sm:p-7 relative transition-all duration-300"
                style={{
                  boxShadow: `8px 8px 0px 0px ${color}`,
                }}
              >
                {/* Header stamps */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                  <span 
                    className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase text-black border border-black"
                    style={{ backgroundColor: color }}
                  >
                    BATCH {batch || "2020-2024"}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 bg-white/5 px-2 py-0.5 border border-white/10">
                    {type}
                  </span>
                </div>

                {/* Quotation mark */}
                <span className="text-5xl font-serif font-black leading-none select-none block mb-2" style={{ color }}>
                  “
                </span>

                {/* Quote body */}
                <p className="text-sm text-zinc-200 leading-relaxed font-normal min-h-16">
                  {quote || "Your words will appear here in real-time as you type them into the form..."}
                </p>

                {fullStory && (
                  <div className="mt-3 pt-2 border-t border-zinc-800">
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {fullStory}
                    </p>
                  </div>
                )}

                {/* Author footer */}
                <div className="mt-6 pt-4 border-t-2 border-zinc-800 flex items-center gap-3">
                  {previewImage ? (
                    <div 
                      className="w-12 h-12 relative overflow-hidden border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_#FFFFFF]"
                      style={{ backgroundColor: color }}
                    >
                      <Image src={previewImage} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 flex items-center justify-center text-black font-mono text-xs font-black shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_#FFFFFF]"
                      style={{ backgroundColor: color }}
                    >
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white uppercase truncate">
                      {name || "Your Name"}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono truncate">
                      {role || "MLSC Role"}
                    </p>
                    {(company || currentRole) && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-zinc-500 shrink-0" />
                        <p className="text-[11px] text-zinc-300 font-semibold truncate font-mono">
                          {currentRole ? `${currentRole} ` : ''}
                          {company ? `@ ${company}` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 font-mono text-xs text-zinc-500 space-y-1">
                <p className="text-zinc-400 font-bold">✨ Instant Showcase</p>
                <p>Once submitted, this card is automatically placed into the public alumni wall and the homepage marquee.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
