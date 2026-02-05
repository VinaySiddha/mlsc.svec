"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Pencil, Save, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast"; // Assuming hooks path, will adjust if search result differs
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Ambassador {
    id: string;
    name: string;
    description: string;
    photoUrl: string;
    photoPath: string;
    createdAt: any;
}

export function AmbassadorManager() {
    const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const q = query(collection(db, "home_ambassadors"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Ambassador[];
            setAmbassadors(data);
        });

        return () => unsubscribe();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handeAddAmbassador = async () => {
        if (!file || !name || !description) {
            toast({
                title: "Missing fields",
                description: "Please fill in all fields and upload a photo.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const path = `home/ambassadors/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, path);

            const snapshot = await uploadBytes(storageRef, file);
            const photoUrl = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "home_ambassadors"), {
                name,
                description,
                photoUrl,
                photoPath: path,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Success",
                description: "Ambassador added successfully.",
            });
            resetForm();
            setIsOpen(false);
        } catch (error) {
            console.error("Add error:", error);
            toast({
                title: "Error",
                description: "Failed to add ambassador.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (ambassador: Ambassador) => {
        if (!confirm("Are you sure you want to delete this ambassador?")) return;

        try {
            const storageRef = ref(storage, ambassador.photoPath);
            await deleteObject(storageRef);
            await deleteDoc(doc(db, "home_ambassadors", ambassador.id));

            toast({
                title: "Success",
                description: "Ambassador deleted successfully.",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: "Failed to delete ambassador.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Ambassador
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Ambassador</DialogTitle>
                            <DialogDescription>
                                Add a new ambassador to the home page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="photo" className="text-right">
                                    Photo
                                </Label>
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handeAddAmbassador} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ambassadors.map((ambassador) => (
                    <Card key={ambassador.id} className="overflow-hidden">
                        <div className="relative aspect-square w-full">
                            <Image
                                src={ambassador.photoUrl}
                                alt={ambassador.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg">{ambassador.name}</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(ambassador)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">{ambassador.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
