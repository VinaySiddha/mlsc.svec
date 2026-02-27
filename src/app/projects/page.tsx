
export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <main className="flex-1">
         <section id="projects" className="relative w-full py-20 md:py-28 text-center bg-cover bg-center" style={{backgroundImage: "url('/team1.jpg')"}}>
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                 <div className="glass-card inline-block p-8 md:p-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our <span className="text-primary">Projects</span></h2>
                    <p className="max-w-[900px] mx-auto mt-4 text-muted-foreground md:text-xl">
                        This page is under construction. Check back soon to see our projects!
                    </p>
                </div>
            </div>
        </section>
      </main>

    </div>
  );
}
