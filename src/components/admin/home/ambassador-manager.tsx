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
import { Loader2, Trash2, Pencil, Plus, ShieldCheck, Flame, ExternalLink, Linkedin, Github } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { revalidateHomePageData } from "@/app/home-actions";

interface Ambassador {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  photoPath?: string;
  tagline?: string;
  badge?: string;
  badgeColor?: string;
  skills?: string[];
  level?: string;
  linkedin?: string;
  github?: string;
  createdAt?: any;
}

export function AmbassadorManager() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ambassador | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("Microsoft Learn Student Ambassador");
  const [badge, setBadge] = useState("MLSA LEAD");
  const [badgeColor, setBadgeColor] = useState("#4285F4");
  const [level, setLevel] = useState("TIER 03");
  const [skillsStr, setSkillsStr] = useState("Azure Cloud, GenAI, Full-Stack, Mentorship");
  const [linkedin, setLinkedin] = useState("https://linkedin.com");
  const [github, setGithub] = useState("https://github.com");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, "home_ambassadors"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const raw = docSnap.data();
          return {
            id: docSnap.id,
            ...raw,
          } as Ambassador;
        }).filter(item => item.name && item.photoUrl);
        setAmbassadors(data);
      }, (error: any) => {
        console.error("[AmbassadorManager] Firestore error:", error);
        toast({
          title: "Error",
          description: `Failed to load ambassadors: ${error.message}`,
          variant: "destructive",
        });
      });

      return () => unsubscribe();
    } catch (error: any) {
      console.error("[AmbassadorManager] Listener error:", error);
    }
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTagline("Microsoft Learn Student Ambassador");
    setBadge("MLSA LEAD");
    setBadgeColor("#4285F4");
    setLevel("TIER 03");
    setSkillsStr("Azure Cloud, GenAI, Full-Stack, Mentorship");
    setLinkedin("https://linkedin.com");
    setGithub("https://github.com");
    setPhotoUrl("");
    setPhotoPath("");
    setFile(null);
    setEditingItem(null);
  };

  const openEditModal = (item: Ambassador) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setTagline(item.tagline || "Microsoft Learn Student Ambassador");
    setBadge(item.badge || "MLSA LEAD");
    setBadgeColor(item.badgeColor || "#4285F4");
    setLevel(item.level || "TIER 03");
    setSkillsStr(Array.isArray(item.skills) ? item.skills.join(", ") : "Azure Cloud, GenAI, Community");
    setLinkedin(item.linkedin || "https://linkedin.com");
    setGithub(item.github || "https://github.com");
    setPhotoUrl(item.photoUrl || "");
    setPhotoPath(item.photoPath || "");
    setFile(null);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please provide both a Name and Bio Description.",
        variant: "destructive",
      });
      return;
    }

    if (!editingItem && !file && !photoUrl) {
      toast({
        title: "Photo Required",
        description: "Please select an ambassador photo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalPhotoUrl = photoUrl;
      let finalPhotoPath = photoPath;

      if (file) {
        const path = `home/ambassadors/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        finalPhotoUrl = await getDownloadURL(snapshot.ref);
        finalPhotoPath = path;
      }

      const skillsArray = skillsStr
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        tagline: tagline.trim(),
        badge: badge.trim(),
        badgeColor,
        level: level.trim(),
        skills: skillsArray,
        linkedin: linkedin.trim(),
        github: github.trim(),
        photoUrl: finalPhotoUrl,
        photoPath: finalPhotoPath,
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, "home_ambassadors", editingItem.id), payload);
        toast({ title: "Updated", description: "Ambassador profile updated." });
      } else {
        await addDoc(collection(db, "home_ambassadors"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Created", description: "New student ambassador added to homepage." });
      }

      await revalidateHomePageData();
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Save ambassador error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save ambassador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ambassador: Ambassador) => {
    if (!confirm(`Are you sure you want to delete ambassador "${ambassador.name}"?`)) return;

    setLoading(true);
    try {
      if (ambassador.photoPath) {
        const storageRef = ref(storage, ambassador.photoPath);
        try {
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn("Storage deletion error (ignored):", storageError);
        }
      }

      await deleteDoc(doc(db, "home_ambassadors", ambassador.id));
      await revalidateHomePageData();

      toast({ title: "Deleted", description: "Ambassador removed." });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Could not delete ambassador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-50 border-2 border-black">
        <div>
          <div className="text-xs font-black uppercase text-zinc-500 font-mono">// AMBASSADOR DOSSIER ACTIVE</div>
          <div className="text-lg font-black text-black">
            {ambassadors.length} {ambassadors.length === 1 ? 'LEADERSHIP RECORD' : 'LEADERSHIP RECORDS'}
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#4285F4] text-white hover:bg-[#3367d6] font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer">
              <Plus className="mr-1.5 h-4 w-4 stroke-[3]" />
              ADD NEW AMBASSADOR
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black text-black shadow-[12px_12px_0px_0px_#000000]">
            <DialogHeader>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_#000000] w-fit mb-2">
                [ {editingItem ? 'EDIT DOSSIER' : 'NEW DOSSIER'} ]
              </div>
              <DialogTitle className="text-2xl font-display font-black uppercase italic text-black">
                {editingItem ? "EDIT AMBASSADOR PROFILE" : "ADD STUDENT AMBASSADOR"}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-zinc-600">
                Configure official leadership attributes, technical skills, and badge tiers for the homepage dossier deck.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Ambassador Full Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chandu Neelam"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Official Tagline / Role</Label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Microsoft Learn Student Ambassador Lead"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Badge Title</Label>
                  <Input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. MLSA LEAD"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Badge Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="w-10 h-9 border-2 border-black cursor-pointer"
                    />
                    <Input
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="bg-white border-2 border-black text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Level / Tier</Label>
                  <Input
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="e.g. TIER 03"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Photo Input */}
              <div className="p-3 bg-zinc-50 border-2 border-black space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-black">
                  Photo Upload (High Res Portrait) *
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-white border-2 border-black text-xs font-medium"
                />
                {photoUrl && !file && (
                  <p className="text-[11px] font-mono text-zinc-500 truncate">Current URL: {photoUrl}</p>
                )}
              </div>

              {/* Bio Description */}
              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-black">Bio / Leadership Statement *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pioneering MLSA Lead driving campus-wide AI workshops, Azure developer camps, and multi-domain engineering..."
                  className="bg-white border-2 border-black mt-1 min-h-24 text-xs font-medium"
                />
              </div>

              {/* Skills */}
              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-black">
                  Technical Specialties (Comma Separated)
                </Label>
                <Input
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="Azure Cloud, GenAI, Full-Stack, Mentorship"
                  className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">LinkedIn Profile URL</Label>
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">GitHub Profile URL</Label>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="bg-white border-2 border-black font-black uppercase text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-[#4285F4] text-white hover:bg-[#3367d6] font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000]"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? "Update Dossier" : "Publish Ambassador"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Ambassadors */}
      <div className="space-y-4">
        <h4 className="text-base font-display font-black uppercase italic text-black">
          ACTIVE STUDENT AMBASSADORS
        </h4>

        {ambassadors.length === 0 ? (
          <div className="p-12 text-center border-4 border-dashed border-zinc-300 bg-zinc-50">
            <p className="text-sm font-bold text-zinc-500">
              No custom ambassadors stored in Firestore yet. Defaulting to curated founding lead cards on the live homepage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambassadors.map((amb) => (
              <div 
                key={amb.id}
                className="bg-white border-4 border-black p-5 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-16 border-2 border-black overflow-hidden relative bg-zinc-100 shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                        <Image
                          src={amb.photoUrl}
                          alt={amb.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span 
                          className="text-[9px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000000] inline-block mb-1 text-black"
                          style={{ backgroundColor: amb.badgeColor || '#4285F4' }}
                        >
                          {amb.badge || 'MLSA LEAD'}
                        </span>
                        <h5 className="font-display font-black uppercase italic text-base text-black truncate">
                          {amb.name}
                        </h5>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase truncate">
                          {amb.level || 'TIER 03'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(amb)}
                        className="p-1.5 border border-black hover:bg-zinc-100 cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                        title="Edit Ambassador"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(amb)}
                        className="p-1.5 border border-black hover:bg-red-50 text-red-600 cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                        title="Delete Ambassador"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-zinc-700 line-clamp-3 leading-relaxed mb-4 bg-zinc-50 p-2.5 border border-black">
                    "{amb.description}"
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {amb.linkedin && (
                      <a href={amb.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 bg-white border border-black hover:bg-[#4285F4] hover:text-white">
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {amb.github && (
                      <a href={amb.github} target="_blank" rel="noopener noreferrer" className="p-1 bg-white border border-black hover:bg-black hover:text-white">
                        <Github className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    ID // {amb.id.slice(0, 6)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
