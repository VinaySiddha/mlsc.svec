"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus, X, BookOpen, Layers } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { revalidateHomePageData } from "@/app/home-actions";

interface ChapterCard {
    title: string;
    content: string;
}

interface Chapter {
    id: string;
    name: string;
    description: string;
    cards: ChapterCard[];
    createdAt: any;
}

export function ChapterManager() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(false);

    // New Chapter State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [currentCards, setCurrentCards] = useState<ChapterCard[]>([]);

    // Temp Card State
    const [cardTitle, setCardTitle] = useState("");
    const [cardContent, setCardContent] = useState("");

    useEffect(() => {
        try {
            const q = query(collection(db, "home_chapters"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Chapter[];
                setChapters(data);
            }, (error: any) => {
                console.error("[ChapterManager] Firestore error:", error);
                toast({
                    title: "Error",
                    description: `Failed to load chapters: ${error.message}`,
                    variant: "destructive",
                });
            });

            return () => unsubscribe();
        } catch (error: any) {
            console.error("[ChapterManager] Listener error:", error);
        }
    }, []);

    const clearForm = () => {
        setName("");
        setDescription("");
        setCurrentCards([]);
        setCardTitle("");
        setCardContent("");
    };

    const addCardToDraft = () => {
        if (!cardTitle.trim() || !cardContent.trim()) return;
        setCurrentCards([...currentCards, { title: cardTitle.trim(), content: cardContent.trim() }]);
        setCardTitle("");
        setCardContent("");
    };

    const removeCardFromDraft = (index: number) => {
        const newCards = [...currentCards];
        newCards.splice(index, 1);
        setCurrentCards(newCards);
    };

    const handleCreateChapter = async () => {
        if (!name.trim() || !description.trim()) {
            toast({
                title: "Validation Error",
                description: "Chapter name and description are required.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "home_chapters"), {
                name: name.trim(),
                description: description.trim(),
                cards: currentCards,
                createdAt: serverTimestamp(),
            });

            await revalidateHomePageData();

            toast({
                title: "Chapter Created",
                description: "New chapter syllabus published.",
            });
            clearForm();
        } catch (error: any) {
            console.error("Create error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create chapter.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this chapter?")) return;
        try {
            await deleteDoc(doc(db, "home_chapters", id));
            await revalidateHomePageData();
            toast({
                title: "Deleted",
                description: "Chapter removed.",
            });
        } catch (error: any) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete chapter.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="grid gap-8 lg:grid-cols-2 font-sans">
            {/* Create Form */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#FF0055] text-white text-[10px] font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_#000000] mb-2">
                        [ NEW CHAPTER MODULE ]
                    </div>
                    <h4 className="text-xl font-display font-black uppercase italic text-black">
                        CREATE CHAPTER
                    </h4>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-wider text-black">Chapter Name / Track *</Label>
                        <Input 
                            id="name" 
                            placeholder="e.g. AI & Cloud Intelligence Track" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="bg-white border-2 border-black mt-1 text-xs font-semibold"
                        />
                    </div>

                    <div>
                        <Label htmlFor="desc" className="text-xs font-black uppercase tracking-wider text-black">Chapter Description *</Label>
                        <Textarea
                            id="desc"
                            placeholder="Detailed overview of technical objectives and cohort structure..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white border-2 border-black mt-1 min-h-20 text-xs font-medium"
                        />
                    </div>

                    {/* Sub-Cards */}
                    <div className="p-4 bg-zinc-50 border-2 border-black space-y-3">
                        <Label className="text-xs font-black uppercase tracking-wider text-black">
                            Add Sub-Cards / Milestones
                        </Label>
                        <Input 
                            placeholder="Module Title (e.g. Week 1: Azure Kubernetes)" 
                            value={cardTitle} 
                            onChange={(e) => setCardTitle(e.target.value)} 
                            className="bg-white border-2 border-black text-xs font-semibold"
                        />
                        <Textarea
                            placeholder="Module syllabus & deliverables..."
                            value={cardContent}
                            onChange={(e) => setCardContent(e.target.value)}
                            className="bg-white border-2 border-black min-h-16 text-xs font-medium"
                        />
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={addCardToDraft} 
                            type="button"
                            className="bg-white border-2 border-black font-black uppercase text-xs"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[3]" /> Add Sub-Card
                        </Button>

                        {currentCards.length > 0 && (
                            <div className="space-y-2 pt-2">
                                {currentCards.map((card, idx) => (
                                    <div key={idx} className="flex justify-between items-start bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs">
                                        <div>
                                            <span className="font-black uppercase text-black block">{card.title}</span>
                                            <span className="text-zinc-600 font-medium">{card.content}</span>
                                        </div>
                                        <button 
                                            onClick={() => removeCardFromDraft(idx)} 
                                            className="p-1 text-red-600 hover:bg-red-50 border border-black cursor-pointer"
                                        >
                                            <X className="h-3 w-3 stroke-[3]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button 
                        className="w-full bg-[#FF0055] text-white hover:bg-red-700 font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer" 
                        onClick={handleCreateChapter} 
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Chapter
                    </Button>
                </div>
            </div>

            {/* Existing Chapters List */}
            <div className="space-y-4">
                <h4 className="text-base font-display font-black uppercase italic text-black">
                    EXISTING CHAPTERS ({chapters.length})
                </h4>

                {chapters.length === 0 ? (
                    <div className="p-12 text-center border-4 border-dashed border-zinc-300 bg-zinc-50">
                        <p className="text-sm font-bold text-zinc-500">No chapters configured yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chapters.map((chapter) => (
                            <div key={chapter.id} className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000000] space-y-4">
                                <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
                                    <div>
                                        <h5 className="font-display font-black uppercase italic text-lg text-black">
                                            {chapter.name}
                                        </h5>
                                        <p className="text-xs font-semibold text-zinc-600 mt-1">
                                            {chapter.description}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={() => handleDelete(chapter.id)}
                                        className="bg-[#FF0055] text-white hover:bg-red-700 font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer shrink-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                        DELETE
                                    </Button>
                                </div>

                                {chapter.cards && chapter.cards.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {chapter.cards.map((card, idx) => (
                                            <div key={idx} className="p-3 bg-zinc-50 border-2 border-black">
                                                <div className="text-xs font-black uppercase text-black">{card.title}</div>
                                                <div className="text-[11px] font-medium text-zinc-600 mt-0.5">{card.content}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
