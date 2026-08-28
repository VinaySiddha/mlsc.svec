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
  EyeOff,
  UserCheck,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
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
  '#4285F4', // Blue
  '#00AA44', // Green
  '#FFE600', // Yellow
  '#FF0055', // Red
  '#8B5CF6', // Purple
  '#FF6600', // Orange
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
    <div className="space-y-8 font-sans">
      {/* ── Top Shareable Link Banner ── */}
      <div className="p-5 bg-[#FFE600] border-4 border-black shadow-[6px_6px_0px_0px_#000000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-black text-[#FFE600] text-[10px] font-black uppercase tracking-wider">
              SHAREABLE OUTREACH LINK
            </span>
          </div>
          <p className="text-xs text-black font-bold">
            Share this dedicated standalone form link with alumni to collect their memories. Submissions instantly appear here for moderation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button 
            onClick={handleCopyPublicLink}
            className="bg-black text-[#FFE600] hover:bg-zinc-800 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#FFFFFF] cursor-pointer"
          >
            {copiedLink ? <Check className="h-4 w-4 mr-1 text-[#FFE600]" /> : <Copy className="h-4 w-4 mr-1" />}
            {copiedLink ? "COPIED FORM LINK!" : "COPY PUBLIC LINK"}
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-white text-black border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]">
            <a href="/what-our-alumni-say/submit" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              OPEN FORM
            </a>
          </Button>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
          <span className="text-[10px] text-zinc-500 font-black uppercase block tracking-wider">TOTAL STORIES</span>
          <span className="text-3xl font-display font-black text-black">{stats.total}</span>
        </div>
        <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#00AA44]">
          <span className="text-[10px] text-zinc-500 font-black uppercase block tracking-wider">APPROVED / LIVE</span>
          <span className="text-3xl font-display font-black text-[#00AA44]">{stats.approved}</span>
        </div>
        <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#FFE600]">
          <span className="text-[10px] text-zinc-500 font-black uppercase block tracking-wider">PENDING REVIEW</span>
          <span className="text-3xl font-display font-black text-[#FF6600]">{stats.pending}</span>
        </div>
        <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#4285F4]">
          <span className="text-[10px] text-zinc-500 font-black uppercase block tracking-wider">HOME MARQUEE</span>
          <span className="text-3xl font-display font-black text-[#4285F4]">{stats.featured} ⭐</span>
        </div>
      </div>

      {/* ── Action Bar: Search, Filters, Add Button ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-zinc-50 border-2 border-black">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by name, company, quote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-2 border-black text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 border-2 border-black text-xs">
            {(['all', 'approved', 'pending', 'featured'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 text-[10px] font-black uppercase transition-colors cursor-pointer ${
                  filterStatus === st ? 'bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000000]' : 'text-zinc-600 hover:text-black'
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
              className="bg-white border-2 border-black font-black text-xs uppercase"
            >
              <Database className="h-3.5 w-3.5 mr-1" />
              Seed 5 Founding Alumni
            </Button>
          )}

          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#FFE600] text-black hover:bg-[#ffe600]/90 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer">
                <Plus className="mr-1.5 h-4 w-4 stroke-[3]" /> Add Testimonial
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black text-black shadow-[14px_14px_0px_0px_#000000]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display font-black uppercase italic text-black">
                  {editingItem ? "Edit Alumni Testimonial" : "Add Alumni Testimonial"}
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-zinc-600">
                  Manage alumni details, testimonials, current careers, and homepage marquee settings.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-black uppercase text-black">Full Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chandu Neelam"
                      className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase text-black">Batch / Graduation Year *</Label>
                    <Input
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. 2020 - 2024"
                      className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase text-black">MLSC Role *</Label>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Former President, MLSC"
                      className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase text-black">Current Company</Label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google / Microsoft"
                      className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase text-black">Current Role</Label>
                    <Input
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase text-black">Theme / Category</Label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as AlumniCategoryType)}
                      className="w-full h-10 px-3 bg-white border-2 border-black rounded-none text-xs font-bold text-black focus:outline-none mt-1"
                    >
                      <option value="milestones">Milestones</option>
                      <option value="moments">Moments</option>
                      <option value="leadership">Leadership</option>
                      <option value="career">Career</option>
                      <option value="advice">Advice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-black uppercase text-black">Testimonial Quote (Homepage Marquee) *</Label>
                  <Textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Short punchy testimonial displayed on homepage marquee..."
                    className="bg-white border-2 border-black min-h-24 mt-1 text-xs font-medium"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black uppercase text-black">Extended Story (Optional)</Label>
                  <Textarea
                    value={fullStory}
                    onChange={(e) => setFullStory(e.target.value)}
                    placeholder="Extended journey reflections..."
                    className="bg-white border-2 border-black min-h-20 mt-1 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-zinc-50 border-2 border-black">
                  <div>
                    <Label className="text-xs font-black uppercase text-black">Photo Upload</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                      className="bg-white border-2 border-black text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase text-black">Accent Color</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-7 h-7 border-2 border-black flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: c }}
                        >
                          {color === c && <Check className="h-4 w-4 text-black font-black" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-black uppercase text-black">LinkedIn URL</Label>
                    <Input
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="bg-white border-2 border-black mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase text-black">Email Address</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alumni@email.com"
                      className="bg-white border-2 border-black mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-3 border-t-2 border-black">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isApproved}
                      onChange={(e) => setIsApproved(e.target.checked)}
                      className="border-2 border-black h-4 w-4 text-black focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-black uppercase text-black">Approved & Visible</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="border-2 border-black h-4 w-4 text-black focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-black uppercase text-[#4285F4]">Feature on Homepage Marquee ⭐</span>
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)} className="bg-white border-2 border-black font-black uppercase text-xs">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="bg-[#FFE600] text-black hover:bg-[#ffe600]/90 font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? "Update Testimonial" : "Save Testimonial"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Testimonials Grid ── */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center border-4 border-dashed border-zinc-300 bg-zinc-50">
          <p className="text-sm font-bold text-zinc-500">No alumni testimonials found matching your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => (
            <div key={item.id} className="bg-white border-4 border-black p-5 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    {item.photoUrl ? (
                      <div className="w-12 h-12 border-2 border-black overflow-hidden relative shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                        <Image src={item.photoUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 border-2 border-black flex items-center justify-center text-white text-sm font-black shrink-0 shadow-[2px_2px_0px_0px_#000000]"
                        style={{ backgroundColor: item.color || "#4285F4" }}
                      >
                        {item.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="text-sm font-display font-black uppercase italic text-black truncate">
                        {item.name}
                      </h5>
                      <p className="text-xs text-zinc-600 font-bold truncate">
                        {item.role} ({item.batch})
                      </p>
                      {item.company && (
                        <span className="inline-block text-[10px] text-black font-black uppercase tracking-wider truncate mt-0.5 bg-[#F4F4F5] px-1.5 py-0.5 border border-black">
                          {item.currentRole ? `${item.currentRole} @ ` : ''}{item.company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 border border-black hover:bg-zinc-100 cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 border border-black hover:bg-red-50 text-red-600 cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-semibold text-zinc-800 leading-relaxed line-clamp-3 bg-zinc-50 p-2.5 border border-black mb-4">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(item, 'isApproved')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black cursor-pointer ${
                      item.isApproved
                        ? "bg-[#00FF66] text-black shadow-[1px_1px_0px_0px_#000000]"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {item.isApproved ? "Approved" : "Pending"}
                  </button>

                  <button
                    onClick={() => handleToggle(item, 'isFeatured')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black cursor-pointer ${
                      item.isFeatured
                        ? "bg-[#FFE600] text-black shadow-[1px_1px_0px_0px_#000000]"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {item.isFeatured ? "Home ⭐" : "Hidden"}
                  </button>
                </div>

                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
