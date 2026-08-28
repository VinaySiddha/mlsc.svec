"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Upload, Plus, Calendar, MapPin, Tag, Flame, Zap, Award, Film, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { revalidateHomePageData } from "@/app/home-actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  url: string;
  path: string;
  type: 'moments' | 'milestones' | 'hackathons' | 'workshops';
  title?: string;
  desc?: string;
  date?: string;
  location?: string;
  stats?: string;
  tag?: string;
  color?: string;
  createdAt?: any;
}

const CATEGORY_PRESETS = [
  { key: 'hackathons', label: '🔥 HACKATHON', color: '#FF0055' },
  { key: 'workshops', label: '⚡ BOOTCAMP / LAB', color: '#00AA44' },
  { key: 'milestones', label: '🏆 MILESTONE', color: '#4285F4' },
  { key: 'moments', label: '📸 CAMPUS MOMENT', color: '#FFE600' },
];

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'moments' | 'milestones' | 'hackathons' | 'workshops'>('hackathons');
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("2026");
  const [location, setLocation] = useState("SVEC INNOVATION HUB");
  const [stats, setStats] = useState("100+ BUILDERS");
  const [color, setColor] = useState("#FF0055");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, "home_gallery"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryImage[];
        setImages(data);
      }, (error: any) => {
        console.error("[GalleryManager] Firestore error:", error);
        toast({
          title: "Error",
          description: `Failed to load gallery images: ${error.message}`,
          variant: "destructive",
        });
      });

      return () => unsubscribe();
    } catch (error: any) {
      console.error("[GalleryManager] Error setting up listener:", error);
    }
  }, []);

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDesc("");
    setDate("2026");
    setLocation("SVEC INNOVATION HUB");
    setStats("100+ BUILDERS");
    setType("hackathons");
    setColor("#FF0055");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Photo Required",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const path = `home/gallery/${type}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);

      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "home_gallery"), {
        url,
        path,
        type,
        title: title.trim() || (type === 'milestones' ? 'Ecosystem Milestone' : 'Community Moment'),
        desc: desc.trim() || 'Live capture from our engineering hackathons and builder workshops.',
        date: date.trim() || '2026',
        location: location.trim() || 'SVEC CAMPUS',
        stats: stats.trim() || 'ACTIVE EVENT',
        tag: type.toUpperCase(),
        color,
        createdAt: serverTimestamp(),
      });

      await revalidateHomePageData();

      toast({
        title: "Memory Uploaded! 🎉",
        description: "Successfully added to the Moments & Memories live archive.",
      });
      
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Could not upload image.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm(`Are you sure you want to delete "${image.title || 'this memory'}"?`)) return;

    setLoading(true);
    try {
      if (image.path) {
        const storageRef = ref(storage, image.path);
        try {
          await deleteObject(storageRef);
        } catch (storageError: any) {
          console.warn("Storage deletion error (ignored):", storageError);
        }
      }
      
      await deleteDoc(doc(db, "home_gallery", image.id));
      await revalidateHomePageData();

      toast({
        title: "Deleted",
        description: "Gallery record removed from archive.",
      });
    } catch (error: any) {
      console.error("Delete operation failed:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-50 border-2 border-black">
        <div>
          <div className="text-xs font-black uppercase text-zinc-500 font-mono">// LIVE ARCHIVE METRICS</div>
          <div className="text-lg font-black text-black">
            {images.length} {images.length === 1 ? 'MEMORY FRAME' : 'MEMORY FRAMES'} RECORDED
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#00FF66] text-black hover:bg-[#00e65c] font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer">
              <Plus className="mr-1.5 h-4 w-4 stroke-[3]" />
              ADD NEW MEMORY / CAPTURE
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black text-black shadow-[12px_12px_0px_0px_#000000]">
            <DialogHeader>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_#000000] w-fit mb-2">
                [ NEW ARCHIVE FRAME ]
              </div>
              <DialogTitle className="text-2xl font-display font-black uppercase italic text-black">
                ADD TO MOMENTS & MEMORIES
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-zinc-600">
                Upload a high-resolution photo and configure archival metadata for the film reel projector.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Category Selector */}
              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                  Category Track
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORY_PRESETS.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setType(cat.key as any);
                        setColor(cat.color);
                      }}
                      className={`p-2.5 text-[11px] font-black uppercase border-2 border-black transition-all cursor-pointer text-center ${
                        type === cat.key
                          ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000] -translate-y-0.5"
                          : "bg-white text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Input */}
              <div className="p-3 bg-zinc-50 border-2 border-black space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-black">
                  Photo Upload (High Res JPEG/PNG) *
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-white border-2 border-black text-xs font-medium"
                />
              </div>

              {/* Title & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Event / Frame Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 24-Hour Overnight Code-a-Thon"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Stats / Impact Highlight</Label>
                  <Input
                    value={stats}
                    onChange={(e) => setStats(e.target.value)}
                    placeholder="e.g. 200+ HACKERS"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Date / Month</Label>
                  <Input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. NOVEMBER 2025"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Location / Venue</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. AUDITORIUM COMPLEX"
                    className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-black">Description & Story</Label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Detailed description of the event, workshop highlights, or milestone breakthrough..."
                  className="bg-white border-2 border-black mt-1 min-h-20 text-xs font-medium"
                />
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
                onClick={handleUpload} 
                disabled={!file || loading}
                className="bg-[#00FF66] text-black hover:bg-[#00e65c] font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000]"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Publish Frame
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Memories Grid */}
      <div className="space-y-4">
        <h4 className="text-base font-display font-black uppercase italic text-black">
          RECORDED CAPTURES & ARCHIVES
        </h4>

        {images.length === 0 ? (
          <div className="p-12 text-center border-4 border-dashed border-zinc-300 bg-zinc-50">
            <p className="text-sm font-bold text-zinc-500">
              No custom memories stored in Firestore yet. Falling back to default high-res curated scrapbook reels on the live website.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div 
                key={img.id}
                className="bg-white border-3 border-black p-3 shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between group relative"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full border-2 border-black overflow-hidden bg-black mb-3">
                  <Image
                    src={img.url}
                    alt={img.title || "Gallery"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-black uppercase text-black border border-black shadow-[1px_1px_0px_0px_#000000]" style={{ backgroundColor: img.color || '#FFE600' }}>
                    {img.type}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 mb-3">
                  <h5 className="font-display font-black uppercase italic text-sm text-black truncate">
                    {img.title || "Untitled Capture"}
                  </h5>
                  <p className="text-[11px] text-zinc-600 font-semibold line-clamp-2">
                    {img.desc || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 pt-1 border-t border-zinc-200">
                    <span>{img.date || '2026'}</span>
                    <span className="text-[#4285F4]">{img.stats}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(img)}
                  className="w-full bg-[#FF0055] text-white hover:bg-red-700 font-black uppercase text-[11px] border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  DELETE FRAME
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
