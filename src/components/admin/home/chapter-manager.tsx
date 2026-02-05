"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
        const q = query(collection(db, "home_chapters"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Chapter[];
            setChapters(data);
        });

        return () => unsubscribe();
    }, []);

    const clearForm = () => {
        setName("");
        setDescription("");
        setCurrentCards([]);
        setCardTitle("");
        setCardContent("");
    };

    const addCardToDraft = () => {
        if (!cardTitle || !cardContent) return;
        setCurrentCards([...currentCards, { title: cardTitle, content: cardContent }]);
        setCardTitle("");
        setCardContent("");
    };

    const removeCardFromDraft = (index: number) => {
        const newCards = [...currentCards];
        newCards.splice(index, 1);
        setCurrentCards(newCards);
    };

    const handleCreateChapter = async () => {
        if (!name || !description) {
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
                name,
                description,
                cards: currentCards,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Success",
                description: "Chapter created successfully.",
            });
            clearForm();
        } catch (error) {
            console.error("Create error:", error);
            toast({
                title: "Error",
                description: "Failed to create chapter.",
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
            toast({
                title: "Success",
                description: "Chapter deleted.",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: "Failed to delete chapter.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Chapter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Chapter Name</Label>
                            <Input id="name" placeholder="e.g. Chapter 1" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea id="desc" placeholder="Chapter description..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div className="border rounded-md p-4 space-y-4">
                            <h4 className="font-semibold text-sm">Add Card</h4>
                            <div className="space-y-2">
                                <Input placeholder="Card Title" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
                                <Textarea placeholder="Card Content" value={cardContent} onChange={(e) => setCardContent(e.target.value)} />
                                <Button variant="outline" size="sm" onClick={addCardToDraft} type="button">
                                    <Plus className="mr-2 h-4 w-4" /> Add Card
                                </Button>
                            </div>

                            {currentCards.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {currentCards.map((card, idx) => (
                                        <div key={idx} className="flex justify-between items-start bg-secondary p-2 rounded text-sm">
                                            <div>
                                                <span className="font-bold block">{card.title}</span>
                                                <span className="text-xs text-muted-foreground">{card.content}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeCardFromDraft(idx)} className="h-6 w-6">
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button className="w-full" onClick={handleCreateChapter} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Chapter
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Existing Chapters</h2>
                {chapters.length === 0 && <p className="text-muted-foreground">No chapters yet.</p>}

                <Accordion type="single" collapsible className="w-full">
                    {chapters.map((chapter) => (
                        <AccordionItem key={chapter.id} value={chapter.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex gap-4 items-center">
                                    <span className="font-semibold">{chapter.name}</span>
                                    <span className="text-xs text-muted-foreground font-normal">({chapter.cards.length} cards)</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    <p className="text-sm text-muted-foreground">{chapter.description}</p>

                                    <div className="grid grid-cols-1 gap-2">
                                        {chapter.cards.map((card, idx) => (
                                            <Card key={idx} className="bg-muted/50 border-none">
                                                <CardContent className="p-3">
                                                    <h5 className="font-bold text-sm">{card.title}</h5>
                                                    <p className="text-xs">{card.content}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(chapter.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Chapter
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
