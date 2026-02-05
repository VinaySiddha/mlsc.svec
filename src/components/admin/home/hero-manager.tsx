"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

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
        const q = query(collection(db, "home_hero"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as HeroImage[];
            setImages(data);
        }, (error) => {
            console.error("Error fetching hero images:", error);
            toast({
                title: "Error",
                description: "Failed to load hero images.",
                variant: "destructive",
            });
        });

        return () => unsubscribe();
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        let storagePath = "";
        try {
            const storageRef = ref(storage, `home/hero/${Date.now()}_${file.name}`);
            storagePath = storageRef.fullPath;
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "home_hero"), {
                url: downloadURL,
                path: storagePath, // Save path for deletion
                createdAt: new Date().toISOString()
            });

            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            toast({
                title: "Success",
                description: "Hero image uploaded.",
            });
        } catch (error) {
            console.error("Upload error:", error);
            // Cleanup storage if firestore fails
            if (storagePath) {
                try {
                    const storageRef = ref(storage, storagePath);
                    await deleteObject(storageRef);
                } catch (cleanupError) {
                    console.error("Cleanup error:", cleanupError);
                }
            }
            toast({
                title: "Error",
                description: "Failed to upload image.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (image: HeroImage) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        setLoading(true);
        try {
            const storageRef = ref(storage, image.path);
            try {
                await deleteObject(storageRef);
            } catch (storageError) {
                console.error("Storage delete error (continuing):", storageError);
            }

            await deleteDoc(doc(db, "home_hero", image.id));

            toast({
                title: "Success",
                description: "Image deleted successfully.",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: "Failed to delete image.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="hero-image">Upload New Hero Image</Label>
                    <Input
                        id="hero-image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </div>
                <Button onClick={handleUpload} disabled={!file || loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                    <div key={image.id} className="relative group rounded-lg overflow-hidden border bg-background/50 aspect-video">
                        <Image
                            src={image.url}
                            alt="Hero Image"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(image)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
