"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Trash2, 
  Pencil, 
  Plus, 
  Check, 
  Star, 
  StarOff, 
  Search, 
  ExternalLink, 
  Copy, 
  Share2, 
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { revalidateHomePageData } from "@/app/home-actions";
import { AlumniTestimonial, AlumniCategoryType, SEED_ALUMNI_TESTIMONIALS } from "@/schemas/alumni";

const ACCENT_COLORS = [
  '#4285F4', // Google Blue
  '#34A853', // Google Green
  '#FBBC05', // Google Yellow
  '#EA4335', // Google Red
  '#A733FF', // Electric Purple
  '#00F0FF', // Cyan Neon
  '#00FF66', // Acid Lime
  '#FF0055', // Neo Magenta
];

export function AlumniManager() {
  const [testimonials, setTestimonials] = useState<AlumniTestimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'featured'>('all');
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlumniTestimonial | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("2020 - 2024");
  const [role, setRole] = useState("Former President, MLSC");
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
  const [isApproved, setIsApproved] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, "alumni_testimonials"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const raw = docSnap.data();
          return {
            id: docSnap.id,
            name: raw.name || "Anonymous",
            initials: raw.initials || raw.name?.substring(0, 2).toUpperCase() || "AL",
            role: raw.role || "Alumnus",
            currentRole: raw.currentRole || "",
            company: raw.company || "",
            batch: raw.batch || "2024",
            quote: raw.quote || "",
            fullStory: raw.fullStory || "",
            photoUrl: raw.photoUrl || "",
            photoPath: raw.photoPath || "",
            color: raw.color || "#4285F4",
            type: raw.type || "milestones",
            linkedinUrl: raw.linkedinUrl || "",
            githubUrl: raw.githubUrl || "",
            twitterUrl: raw.twitterUrl || "",
            email: raw.email || "",
            isApproved: typeof raw.isApproved === "boolean" ? raw.isApproved : true,
            isFeatured: typeof raw.isFeatured === "boolean" ? raw.isFeatured : true,
            displayOrder: raw.displayOrder ?? 0,
            createdAt: raw.createdAt,
          } as AlumniTestimonial;
        });
        setTestimonials(data);
      }, (error) => {
        console.error("Firestore error loading alumni_testimonials:", error);
        toast({
          title: "Error",
          description: "Failed to load real-time alumni testimonials.",
          variant: "destructive",
        });
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Listener setup error:", err);
    }
  }, []);

  const resetForm = () => {
    setName("");
    setBatch("2020 - 2024");
    setRole("Former President, MLSC");
    setCurrentRole("");
    setCompany("");
    setQuote("");
    setFullStory("");
    setType("milestones");
    setColor("#4285F4");
    setLinkedinUrl("");
    setGithubUrl("");
    setTwitterUrl("");
    setEmail("");
    setIsApproved(true);
    setIsFeatured(true);
    setPhotoUrl("");
    setPhotoPath("");
    setFile(null);
    setEditingItem(null);
  };

  const openEditModal = (item: AlumniTestimonial) => {
    setEditingItem(item);
    setName(item.name);
    setBatch(item.batch);
    setRole(item.role);
    setCurrentRole(item.currentRole || "");
    setCompany(item.company || "");
    setQuote(item.quote);
    setFullStory(item.fullStory || "");
    setType(item.type);
    setColor(item.color || "#4285F4");
    setLinkedinUrl(item.linkedinUrl || "");
    setGithubUrl(item.githubUrl || "");
    setTwitterUrl(item.twitterUrl || "");
    setEmail(item.email || "");
    setIsApproved(item.isApproved);
    setIsFeatured(item.isFeatured);
    setPhotoUrl(item.photoUrl || "");
    setPhotoPath(item.photoPath || "");
    setFile(null);
    setIsAddOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !quote.trim() || !batch.trim() || !role.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields (Name, Batch, Role, Quote).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalPhotoUrl = photoUrl.trim();
      let finalPhotoPath = photoPath;

      if (file) {
        const path = `home/alumni/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        finalPhotoUrl = await getDownloadURL(snapshot.ref);
        finalPhotoPath = path;
      }

      const initials = name.trim().split(/\s+/).length > 1
        ? (name.trim().split(/\s+/)[0][0] + name.trim().split(/\s+/).slice(-1)[0][0]).toUpperCase()
        : name.trim().substring(0, 2).toUpperCase();

      const docPayload = {
        name: name.trim(),
        initials,
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
        isApproved,
        isFeatured,
        photoUrl: finalPhotoUrl,
        photoPath: finalPhotoPath,
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, "alumni_testimonials", editingItem.id), docPayload);
        toast({ title: "Updated", description: "Alumni testimonial updated successfully." });
      } else {
        await addDoc(collection(db, "alumni_testimonials"), {
          ...docPayload,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Created", description: "New alumni testimonial added successfully." });
      }

      await revalidateHomePageData();
      setIsAddOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Save error:", err);
      toast({
        title: "Error saving testimonial",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: AlumniTestimonial) => {
    if (!confirm(`Are you sure you want to delete the testimonial for ${item.name}?`)) return;

    setLoading(true);
    try {
      if (item.photoPath) {
        try {
          const storageRef = ref(storage, item.photoPath);
          await deleteObject(storageRef);
        } catch (e) {
          console.warn("Storage deletion error (ignored):", e);
        }
      }

      await deleteDoc(doc(db, "alumni_testimonials", item.id));
      await revalidateHomePageData();
      toast({ title: "Deleted", description: "Alumni testimonial removed." });
    } catch (err: any) {
      console.error("Delete error:", err);
      toast({
        title: "Deletion Failed",
        description: err.message || "Could not delete testimonial.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item: AlumniTestimonial, field: 'isApproved' | 'isFeatured') => {
    try {
      const newVal = !item[field];
      await updateDoc(doc(db, "alumni_testimonials", item.id), {
        [field]: newVal,
        updatedAt: serverTimestamp(),
      });
      await revalidateHomePageData();
      toast({
        title: "Status Updated",
        description: `${item.name}'s testimonial ${field === 'isFeatured' ? (newVal ? 'featured on homepage ⭐' : 'removed from homepage') : (newVal ? 'approved & visible ✅' : 'hidden/unapproved 🔒')}.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update status", variant: "destructive" });
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Populate Firestore with initial 5 founding alumni testimonials?")) return;
    setLoading(true);
    try {
      for (const item of SEED_ALUMNI_TESTIMONIALS) {
        const { id, ...rest } = item;
        await addDoc(collection(db, "alumni_testimonials"), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await revalidateHomePageData();
      toast({ title: "Success", description: "Default alumni testimonials seeded to Firestore!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to seed data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPublicLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/what-our-alumni-say/submit` : 'https://mlscsvec.com/what-our-alumni-say/submit';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({
      title: "Alumni Form Link Copied! 📋",
      description: "Direct standalone form link is copied. Paste it in alumni WhatsApp/Telegram groups.",
    });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filtered list
  const filteredList = testimonials.filter((t) => {
    if (filterStatus === 'approved' && !t.isApproved) return false;
    if (filterStatus === 'pending' && t.isApproved) return false;
    if (filterStatus === 'featured' && !t.isFeatured) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        (t.company || '').toLowerCase().includes(q) ||
        (t.currentRole || '').toLowerCase().includes(q) ||
        t.batch.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter(t => t.isApproved).length,
    pending: testimonials.filter(t => !t.isApproved).length,
    featured: testimonials.filter(t => t.isFeatured).length,
  };

  return (
    <div className="space-y-6">
      {/* ── Top Shareable Link Banner ── */}
      <div className="p-4 bg-gradient-to-r from-[#4285F4]/10 via-[#FFE600]/10 to-[#00FF66]/10 border-2 border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#4285F4] text-white text-[10px] font-mono font-bold uppercase">
              SHAREABLE OUTREACH LINK
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-medium">
            Share this dedicated standalone form link with all alumni to collect their words. Submissions will appear in this dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button 
            onClick={handleCopyPublicLink}
            className="bg-[#FFE600] text-black hover:bg-[#e6cf00] font-bold text-xs font-mono uppercase tracking-wider"
          >
            {copiedLink ? <Check className="h-4 w-4 mr-1 text-black" /> : <Copy className="h-4 w-4 mr-1" />}
            {copiedLink ? "Copied Form Link!" : "Copy Alumni Form Link"}
          </Button>
          <Button asChild variant="outline" size="sm" className="border-white/20 text-xs font-mono">
            <a href="/what-our-alumni-say/submit" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1 text-[#FFE600]" />
              Open Form
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs font-mono">
            <a href="/what-our-alumni-say" target="_blank" rel="noopener noreferrer">
              View Wall
            </a>
          </Button>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-bold block uppercase">TOTAL STORIES</span>
          <span className="text-2xl font-black text-white">{stats.total}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-bold block uppercase">APPROVED / LIVE</span>
          <span className="text-2xl font-black text-[#00FF66]">{stats.approved}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-bold block uppercase">PENDING REVIEW</span>
          <span className="text-2xl font-black text-[#FFE600]">{stats.pending}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-bold block uppercase">HOME FEATURED</span>
          <span className="text-2xl font-black text-[#4285F4]">{stats.featured} ⭐</span>
        </div>
      </div>

      {/* ── Action Bar: Search, Filters, Add Button ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by name, company, quote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 font-mono text-xs">
            {(['all', 'approved', 'pending', 'featured'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors ${
                  filterStatus === st ? 'bg-[#4285F4] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {testimonials.length === 0 && (
            <Button
              onClick={handleSeedData}
              variant="outline"
              disabled={loading}
              className="border-dashed border-white/20 text-xs font-mono"
            >
              <Database className="h-3.5 w-3.5 mr-1" />
              Seed 5 Founding Alumni
            </Button>
          )}

          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs font-mono uppercase">
                <Plus className="mr-1.5 h-4 w-4" /> Add Testimonial
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121214] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingItem ? "Edit Alumni Testimonial" : "Add Alumni Testimonial"}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Manage alumni details, testimonials, current careers, and homepage display settings.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Full Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chandu Neelam"
                      className="bg-white/5 border-white/10 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Batch / Graduation Year *</Label>
                    <Input
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. 2020 - 2024"
                      className="bg-white/5 border-white/10 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">MLSC Role *</Label>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Former President, MLSC"
                      className="bg-white/5 border-white/10 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Current Organization / Company</Label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google / Microsoft"
                      className="bg-white/5 border-white/10 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Current Role / Designation</Label>
                    <Input
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="bg-white/5 border-white/10 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Theme / Category</Label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as AlumniCategoryType)}
                      className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none mt-1"
                    >
                      <option value="milestones" className="bg-zinc-900">Milestones</option>
                      <option value="moments" className="bg-zinc-900">Moments</option>
                      <option value="leadership" className="bg-zinc-900">Leadership</option>
                      <option value="career" className="bg-zinc-900">Career</option>
                      <option value="advice" className="bg-zinc-900">Advice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase text-zinc-400">Testimonial / Quote *</Label>
                  <Textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Short punchy testimonial displayed on homepage marquee & card..."
                    className="bg-white/5 border-white/10 min-h-24 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase text-zinc-400">Extended Story / Journey (Optional)</Label>
                  <Textarea
                    value={fullStory}
                    onChange={(e) => setFullStory(e.target.value)}
                    placeholder="Long form reflections or advice for juniors..."
                    className="bg-white/5 border-white/10 min-h-20 mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg bg-black/40 border border-white/10">
                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Photo Upload</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                      className="bg-white/5 border-white/10 text-xs mt-1"
                    />
                    {photoUrl && !file && (
                      <p className="text-[11px] text-zinc-400 mt-1 truncate">Current: {photoUrl}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Accent Color</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-6 h-6 rounded-md border border-white/20 flex items-center justify-center transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        >
                          {color === c && <Check className="h-3 w-3 text-black font-black" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">LinkedIn URL</Label>
                    <Input
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="bg-white/5 border-white/10 mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase text-zinc-400">Email Address</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alumni@email.com"
                      className="bg-white/5 border-white/10 mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isApproved}
                      onChange={(e) => setIsApproved(e.target.checked)}
                      className="rounded border-zinc-700 h-4 w-4 text-[#00FF66] focus:ring-0"
                    />
                    <span className="text-xs font-bold uppercase text-zinc-300">Approved & Visible</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-zinc-700 h-4 w-4 text-[#4285F4] focus:ring-0"
                    />
                    <span className="text-xs font-bold uppercase text-zinc-300">Featured on Homepage ⭐</span>
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="bg-[#4285F4] hover:bg-[#3367D6] text-white">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? "Update Testimonial" : "Save Testimonial"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Testimonials Table / Grid ── */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <p className="text-sm font-mono text-zinc-400">No alumni testimonials found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <Card key={item.id} className="bg-[#111114] border-white/10 overflow-hidden flex flex-col justify-between group">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {item.photoUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white/20 shrink-0">
                        <Image src={item.photoUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md"
                        style={{ backgroundColor: item.color || "#4285F4" }}
                      >
                        {item.initials}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-sm font-bold text-white group-hover:text-[#4285F4] transition-colors truncate">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-400 truncate">
                        {item.role} ({item.batch})
                      </CardDescription>
                      {item.company && (
                        <p className="text-[11px] text-zinc-300 font-semibold truncate mt-0.5">
                          {item.currentRole ? `${item.currentRole} @ ` : ''}{item.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between">
                <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed mb-4 italic">
                  "{item.quote}"
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {/* Approved Toggle */}
                    <button
                      onClick={() => handleToggle(item, 'isApproved')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 ${
                        item.isApproved
                          ? "bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                      title={item.isApproved ? "Click to unapprove" : "Click to approve"}
                    >
                      {item.isApproved ? <UserCheck className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {item.isApproved ? "Approved" : "Pending"}
                    </button>

                    {/* Featured on Home Toggle */}
                    <button
                      onClick={() => handleToggle(item, 'isFeatured')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 ${
                        item.isFeatured
                          ? "bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                      title={item.isFeatured ? "Featured on Home (Click to unfeature)" : "Not featured (Click to feature on home)"}
                    >
                      {item.isFeatured ? <Star className="h-3 w-3 fill-[#FFE600]" /> : <StarOff className="h-3 w-3" />}
                      {item.isFeatured ? "Home ⭐" : "Hidden"}
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {item.type}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
