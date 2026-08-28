import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MLSCLogo } from "@/components/icons";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, Sparkles, Image as ImageIcon, Users, Film, BookOpen, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";

import { HeroManager } from "@/components/admin/home/hero-manager";
import { AmbassadorManager } from "@/components/admin/home/ambassador-manager";
import { GalleryManager } from "@/components/admin/home/gallery-manager";
import { ChapterManager } from "@/components/admin/home/chapter-manager";
import { AlumniManager } from "@/components/admin/home/alumni-manager";

export default function HomeManagementPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F9F9FB] text-black font-sans">
            {/* Neo-Brutalist Admin Header Dock */}
            <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white shadow-[0px_4px_0px_0px_#000000]">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm" className="bg-white border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer">
                            <Link href="/admin">
                                <ArrowLeft className="h-4 w-4 mr-1 stroke-[2.5]" />
                                ADMIN HUB
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2.5">
                            <MLSCLogo className="h-7 w-7 text-[#4285F4]" />
                            <h1 className="text-lg sm:text-xl font-display font-black tracking-tight uppercase italic text-black">
                                HOMEPAGE <span className="text-[#4285F4]">CONTROL DECK</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF66] text-black text-[11px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                            LIVE SYNC ACTIVE
                        </div>

                        <a 
                            href="/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFE600] hover:bg-[#ffe600]/90 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                        >
                            VIEW LIVE SITE <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-8 container mx-auto max-w-7xl space-y-8">
                
                {/* Control Panel Introduction Banner */}
                <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-3">
                            <Sparkles className="h-3 w-3" />
                            // CONTENT MANAGEMENT SYSTEM
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-display font-black uppercase italic text-black">
                            FULL HOMEPAGE ARCHITECTURE
                        </h2>
                        <p className="text-sm font-semibold text-zinc-700 mt-2 max-w-2xl">
                            Manage every dynamic module on the homepage in real-time. Changes are instantly saved to Firestore and automatically revalidate the live site.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] font-mono font-black">
                        <span className="bg-[#EBF3FF] text-[#4285F4] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                            NEXT.JS 15 CACHING
                        </span>
                        <span className="bg-[#E8F8EE] text-[#00AA44] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                            FIRESTORE REALTIME
                        </span>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="gallery" className="w-full space-y-6">
                    <TabsList className="flex flex-wrap h-auto bg-transparent gap-2 p-0 border-none">
                        <TabsTrigger 
                            value="gallery"
                            className="px-5 py-3 bg-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] data-[state=active]:bg-[#00FF66] data-[state=active]:text-black data-[state=active]:shadow-[1px_1px_0px_0px_#000000] data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
                        >
                            <Film className="h-4 w-4" />
                            01. MOMENTS & MEMORIES
                        </TabsTrigger>

                        <TabsTrigger 
                            value="ambassadors"
                            className="px-5 py-3 bg-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] data-[state=active]:bg-[#4285F4] data-[state=active]:text-white data-[state=active]:shadow-[1px_1px_0px_0px_#000000] data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
                        >
                            <Users className="h-4 w-4" />
                            02. AMBASSADORS
                        </TabsTrigger>

                        <TabsTrigger 
                            value="alumni"
                            className="px-5 py-3 bg-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] data-[state=active]:bg-[#FFE600] data-[state=active]:text-black data-[state=active]:shadow-[1px_1px_0px_0px_#000000] data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
                        >
                            <MessageSquareQuote className="h-4 w-4" />
                            03. ALUMNI WORDS
                        </TabsTrigger>

                        <TabsTrigger 
                            value="hero"
                            className="px-5 py-3 bg-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[1px_1px_0px_0px_#000000] data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
                        >
                            <ImageIcon className="h-4 w-4" />
                            04. HERO SECTION
                        </TabsTrigger>

                        <TabsTrigger 
                            value="chapters"
                            className="px-5 py-3 bg-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] data-[state=active]:bg-[#FF0055] data-[state=active]:text-white data-[state=active]:shadow-[1px_1px_0px_0px_#000000] data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] transition-all cursor-pointer flex items-center gap-2"
                        >
                            <BookOpen className="h-4 w-4" />
                            05. CHAPTERS
                        </TabsTrigger>
                    </TabsList>

                    {/* Moments & Memories Panel */}
                    <TabsContent value="gallery" className="mt-6">
                        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                            <div className="border-b-2 border-black pb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-2">
                                    [ MODULE 01 // FILM REEL & ARCHIVES ]
                                </div>
                                <h3 className="text-2xl font-display font-black uppercase italic text-black">
                                    MOMENTS & MEMORIES MANAGER
                                </h3>
                                <p className="text-sm font-semibold text-zinc-600">
                                    Add, tag, categorize, and curate images for the film reel projector, hackathon albums, and bootcamp captures.
                                </p>
                            </div>
                            <GalleryManager />
                        </div>
                    </TabsContent>

                    {/* Ambassadors Panel */}
                    <TabsContent value="ambassadors" className="mt-6">
                        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                            <div className="border-b-2 border-black pb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4285F4] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-2">
                                    [ MODULE 02 // STUDENT LEADERSHIP ]
                                </div>
                                <h3 className="text-2xl font-display font-black uppercase italic text-black">
                                    STUDENT AMBASSADORS MANAGER
                                </h3>
                                <p className="text-sm font-semibold text-zinc-600">
                                    Manage official Microsoft Learn Student Ambassadors, bios, achievement tiers, and portfolio links.
                                </p>
                            </div>
                            <AmbassadorManager />
                        </div>
                    </TabsContent>

                    {/* Alumni Words Panel */}
                    <TabsContent value="alumni" className="mt-6">
                        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                            <div className="border-b-2 border-black pb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-2">
                                    [ MODULE 03 // ALUMNI TESTIMONIALS & MARQUEE ]
                                </div>
                                <h3 className="text-2xl font-display font-black uppercase italic text-black">
                                    ALUMNI WORDS & TESTIMONIALS
                                </h3>
                                <p className="text-sm font-semibold text-zinc-600">
                                    Review submitted stories, approve for live display, toggle homepage featured status, and edit alumni career cards.
                                </p>
                            </div>
                            <AlumniManager />
                        </div>
                    </TabsContent>

                    {/* Hero Section Panel */}
                    <TabsContent value="hero" className="mt-6">
                        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                            <div className="border-b-2 border-black pb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_#FFE600] mb-2">
                                    [ MODULE 04 // HERO ASSETS & BACKGROUNDS ]
                                </div>
                                <h3 className="text-2xl font-display font-black uppercase italic text-black">
                                    HERO SECTION ASSET MANAGER
                                </h3>
                                <p className="text-sm font-semibold text-zinc-600">
                                    Upload and manage visual assets for the interactive builder hero section.
                                </p>
                            </div>
                            <HeroManager />
                        </div>
                    </TabsContent>

                    {/* Chapters Panel */}
                    <TabsContent value="chapters" className="mt-6">
                        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
                            <div className="border-b-2 border-black pb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF0055] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-2">
                                    [ MODULE 05 // CHAPTERS & ROADMAP ]
                                </div>
                                <h3 className="text-2xl font-display font-black uppercase italic text-black">
                                    CHAPTERS & ROADMAP MANAGER
                                </h3>
                                <p className="text-sm font-semibold text-zinc-600">
                                    Create and configure chapter modules, syllabi, and technical pillar cards.
                                </p>
                            </div>
                            <ChapterManager />
                        </div>
                    </TabsContent>

                </Tabs>
            </main>
        </div>
    );
}
