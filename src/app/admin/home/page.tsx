import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MLSCLogo } from "@/components/icons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { HeroManager } from "@/components/admin/home/hero-manager";
import { AmbassadorManager } from "@/components/admin/home/ambassador-manager";
import { GalleryManager } from "@/components/admin/home/gallery-manager";
import { ChapterManager } from "@/components/admin/home/chapter-manager";
import { AlumniManager } from "@/components/admin/home/alumni-manager";

export default function HomeManagementPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-background/50 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/admin">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <MLSCLogo className="h-8 w-8 text-primary" />
                            <h1 className="text-xl font-bold tracking-tight">Home Page Management</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 container mx-auto space-y-6">
                <Tabs defaultValue="hero" className="w-full space-y-4">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
                        <TabsTrigger value="hero">Hero Section</TabsTrigger>
                        <TabsTrigger value="ambassadors">Ambassadors</TabsTrigger>
                        <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        <TabsTrigger value="chapters">Chapters</TabsTrigger>
                        <TabsTrigger value="alumni">Alumni Words</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Hero Image</CardTitle>
                                <CardDescription>Manage the sliding hero images on the home page.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HeroManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ambassadors">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Ambassadors</CardTitle>
                                <CardDescription>Add or remove ambassadors.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AmbassadorManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="gallery">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Gallery</CardTitle>
                                <CardDescription>Manage Moments and Milestones photos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <GalleryManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chapters">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Chapters</CardTitle>
                                <CardDescription>Manage chapters and their content cards.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChapterManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alumni">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Alumni Words & Testimonials</CardTitle>
                                <CardDescription>Review, approve, edit, feature, or add alumni testimonials displayed on the website.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlumniManager />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
