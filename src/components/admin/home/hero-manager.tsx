"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Upload, Sparkles, Terminal, Code } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { revalidateHomePageData } from "@/app/home-actions";

interface HeroImage {
    id: string;
    url: string;
    path: string;
    createdAt: any;
}

export function HeroManager() {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const q = query(collection(db, "home_hero"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as HeroImage[];
                setImages(data);
            }, (error: any) => {
                console.error("[HeroManager] Firestore error:", error);
                toast({
                    title: "Error",
                    description: `Failed to load hero images: ${error.message}`,
                    variant: "destructive",
                });
            });

            return () => unsubscribe();
        } catch (error: any) {
            console.error("[HeroManager] Error setting up listener:", error);
        }
    }, []);

    const handleUpload = async () => {
        if (!file) {
            toast({
                title: "File Required",
                description: "Please select an image to upload.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const storagePath = `home/hero/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);
            
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "home_hero"), {
                url: downloadURL,
                path: storagePath,
                createdAt: serverTimestamp()
            });

            await revalidateHomePageData();

            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            toast({
                title: "Hero Image Uploaded",
                description: "New hero asset successfully published.",
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to upload image.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (image: HeroImage) => {
        if (!confirm("Are you sure you want to delete this hero asset?")) return;
    
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
    
            await deleteDoc(doc(db, "home_hero", image.id));
            await revalidateHomePageData();
    
            toast({
                title: "Deleted",
                description: "Hero asset removed.",
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
            
            {/* Live Interactive Studio Hero Summary Card */}
            <div className="p-5 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000000] space-y-3">
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#FFE600] text-black font-black text-xs uppercase border border-black shadow-[1px_1px_0px_0px_#000000]">
                        HERO DECK 3.0
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">// CYBER INTERACTIVE HUD</span>
                </div>
                <p className="text-sm font-semibold text-zinc-800 leading-relaxed">
                    The homepage hero is currently powered by our dynamic split-screen layout: live recruitment alert ticker, dynamic flip-words headline (<code className="bg-zinc-100 px-1 border border-black font-bold">WE SHIP AUTONOMOUS AI / CLOUD PLATFORMS / EDGE APPS</code>), interactive command terminal, capability radar, and real-time audio soundwave engine.
                </p>
            </div>

            {/* Upload Area */}
            <div className="p-6 bg-zinc-50 border-3 border-black space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-zinc-600">
                    <Upload className="h-4 w-4 text-black" />
                    UPLOAD CUSTOM HERO GRAPHIC ASSETS
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1 w-full space-y-1.5">
                        <Label htmlFor="hero-image" className="text-xs font-black uppercase text-black">
                            Select High-Resolution Wallpaper / Asset
                        </Label>
                        <Input
                            id="hero-image"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="bg-white border-2 border-black text-xs font-semibold"
                        />
                    </div>
                    <Button 
                        onClick={handleUpload} 
                        disabled={!file || loading}
                        className="w-full sm:w-auto bg-black text-[#FFE600] hover:bg-zinc-800 font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
                        UPLOAD HERO ASSET
                    </Button>
                </div>
            </div>

            {/* Asset Grid */}
            <div className="space-y-4">
                <h4 className="text-base font-display font-black uppercase italic text-black">
                    STORED HERO ASSETS ({images.length})
                </h4>

                {images.length === 0 ? (
                  <div className="p-8 text-center border-4 border-dashed border-zinc-300 bg-zinc-50">
                    <p className="text-xs font-bold text-zinc-500">
                      No custom hero images uploaded. The hero section uses procedural canvas grid graphics.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image) => (
                        <div key={image.id} className="bg-white border-3 border-black p-3 shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between">
                            <div className="relative aspect-video w-full border-2 border-black overflow-hidden bg-black mb-3">
                                <Image
                                    src={image.url}
                                    alt="Hero Image"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDelete(image)}
                                className="w-full bg-[#FF0055] text-white hover:bg-red-700 font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                DELETE ASSET
                            </Button>
                        </div>
                    ))}
                  </div>
                )}
            </div>

        </div>
    );
}
