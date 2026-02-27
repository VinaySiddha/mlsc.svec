
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Image } from "@/components/image";

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <main className="flex-1">
        <section id="blogs" className="w-full py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="relative w-full py-20 md:py-28 text-center bg-cover bg-center mb-12 rounded-lg" style={{backgroundImage: "url('/team1.jpg')"}}>
                    <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
                    <div className="relative z-10 container mx-auto px-4">
                        <div className="glass-card inline-block p-8">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our <span className="text-primary">Blogs</span></h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl mt-4">
                                Read our latest articles and updates.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid gap-8 lg:gap-12">
                    <Card className="glass-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col lg:flex-row">
                        <div className="lg:w-2/5">
                            <Image
                                src="/blog1.jpg"
                                alt="Blog Post Image"
                                width={600}
                                height={400}
                                className="rounded-t-lg lg:rounded-l-lg lg:rounded-t-none object-cover h-full w-full"
                                data-ai-hint="tech event photo"
                            />
                        </div>
                        <div className="p-6 flex flex-col flex-1 lg:w-3/5">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <BookOpen className="h-6 w-6" />
                                <span className="font-semibold">Medium</span>
                            </div>
                            <CardTitle className="pt-2 text-2xl">
                                Unveiling Excellence: The Inauguration of the Microsoft Learn Student Club at Sri Vasavi Engineering College
                            </CardTitle>
                            <div className="mt-auto pt-4">
                               <Button asChild variant="glass">
                                <a href="https://link.medium.com/4aHNce3OlEb" target="_blank" rel="noopener noreferrer">Read More</a>
                               </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
      </main>

    </div>
  );
}
