
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { revalidateHomePageData } from "@/app/home-actions";

interface GalleryImage {
    id: string;
    url: string;
    path: string;
    type: 'moments' | 'milestones';
    createdAt: any;
}

export function GalleryManager() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<'moments' | 'milestones'>('moments');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("[GalleryManager] Setting up Firestore listener for home_gallery");
        
        try {
            const q = query(collection(db, "home_gallery"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                console.log("[GalleryManager] Successfully received data:", snapshot.docs.length, "documents");
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as GalleryImage[];
                setImages(data);
            }, (error: any) => {
                console.error("[GalleryManager] Firestore error details:", {
                    code: error.code,
                    message: error.message,
                    customData: error.customData,
                    fullError: error
                });
                toast({
                    title: "Error",
                    description: `Failed to load gallery images. Error: ${error.code} - ${error.message}`,
                    variant: "destructive",
                });
            });

            return () => unsubscribe();
        } catch (error: any) {
            console.error("[GalleryManager] Error setting up listener:", error);
            toast({
                title: "Error",
                description: "Failed to initialize data listener.",
                variant: "destructive",
            });
        }
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
            const path = `home/gallery/${type}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, path);

            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "home_gallery"), {
                url,
                path,
                type,
                createdAt: serverTimestamp(),
            });

            await revalidateHomePageData();

            toast({
                title: "Success",
                description: "Image uploaded successfully.",
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset file input
            }
            setFile(null);
        } catch (error: any) {
            console.error("Upload error:", error);
            if (error.code === 'storage/unauthorized') {
                 toast({
                    title: "Permission Error",
                    description: "You do not have permission to upload files. Please grant the 'Storage Object Admin' role.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to upload image.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (image: GalleryImage) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
    
        setLoading(true);
        try {
            if (image.path) {
                const storageRef = ref(storage, image.path);
                try {
                    await deleteObject(storageRef);
                } catch (storageError: any) {
                    if (storageError.code === 'storage/unauthorized') {
                        throw new Error("Permission denied in Firebase Storage. Please grant the 'Storage Object Admin' role to your service account.");
                    }
                    console.warn(`Could not delete storage file, but proceeding. Reason: ${storageError.code}`);
                }
            }
            
            await deleteDoc(doc(db, "home_gallery", image.id));
            await revalidateHomePageData();
    
            toast({
                title: "Success",
                description: "Gallery image record deleted.",
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
        <div className="space-y-6">
            <div className="grid w-full max-w-sm gap-4">
                <div>
                    <Label className="block mb-2">Category</Label>
                    <RadioGroup defaultValue="moments" value={type} onValueChange={(v) => setType(v as 'moments' | 'milestones')} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="moments" id="r1" />
                            <Label htmlFor="r1">Moments</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="milestones" id="r2" />
                            <Label htmlFor="r2">Milestones</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div>
                    <Label htmlFor="gallery-image">Upload Photo</Label>
                    <div className="flex gap-2 mt-1">
                        <Input id="gallery-image" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                        <Button onClick={handeUpload} disabled={!file || loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Moments</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.filter(img => img.type === 'moments').map((image) => (
                            <div key={image.id} className="relative group rounded-lg overflow-hidden border bg-background/50 aspect-square">
                                <Image
                                    src={image.url}
                                    alt="Gallery Image"
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
                        {images.filter(img => img.type === 'moments').length === 0 && <p className="text-muted-foreground text-sm col-span-full">No moments yet.</p>}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Milestones</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.filter(img => img.type === 'milestones').map((image) => (
                            <div key={image.id} className="relative group rounded-lg overflow-hidden border bg-background/50 aspect-square">
                                <Image
                                    src={image.url}
                                    alt="Gallery Image"
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
                        {images.filter(img => img.type === 'milestones').length === 0 && <p className="text-muted-foreground text-sm col-span-full">No milestones yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
