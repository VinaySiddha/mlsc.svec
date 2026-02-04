"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        const q = query(collection(db, "home_hero"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as HeroImage[];
            setImages(data);
        });

        return () => unsubscribe();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handeUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const path = `home/hero/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, path);

            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "home_hero"), {
                url,
                path,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Success",
                description: "Hero image uploaded successfully.",
            });
            setFile(null);
            // Reset input manually if needed, or rely on state trigger
        } catch (error) {
            console.error("Upload error:", error);
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
        try {
            const storageRef = ref(storage, image.path);
            await deleteObject(storageRef);
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
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="hero-image">Upload New Image</Label>
                <div className="flex gap-2">
                    <Input id="hero-image" type="file" accept="image/*" onChange={handleFileChange} />
                    <Button onClick={handeUpload} disabled={!file || loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                </div>
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
