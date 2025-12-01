
import { fetchAndCacheJobs } from "@/app/actions";
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code, Briefcase, Activity } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

async function JobListings() {
    const { jobs, error } = await fetchAndCacheJobs();

    if (error) {
        return <div className="text-center text-destructive-foreground p-8 bg-destructive/20 rounded-lg">{error}</div>;
    }

    if (!jobs || jobs.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No job listings found.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
}

function JobListingsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default function JobsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Microsoft Learn Student Club
            </span>
          </Link>
          <nav className="navbar hidden lg:flex items-center gap-6 text-sm font-medium">
             {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
             ))}
             <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
             <Link href="/jobs" className="text-foreground hover:text-foreground transition-colors">Jobs</Link>
             <a href="https://mlscsvec.openstatus.dev/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Status</a>

          </nav>
          <div className="flex items-center gap-4">
             <Button asChild variant="glass" size="sm" className="hidden lg:flex">
                <Link href="/login"><LogIn/> Login</Link>
            </Button>
            <div className="lg:hidden">
              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-transparent border-border hover:bg-background/80">
                          <Menu />
                          <span className="sr-only">Open menu</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="glass-card">
                      <div className="p-4">
                          <nav className="flex flex-col gap-4">
                              {navLinks.map(link => (
                                  <SheetClose key={link.href} asChild>
                                      <Link href={link.href} className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                          <link.icon className="h-5 w-5" /> {link.label}
                                      </Link>
                                  </SheetClose>
                              ))}
                               <SheetClose asChild>
                                  <Link href="/projects" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                      <Code className="h-5 w-5" /> Projects
                                  </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                  <Link href="/jobs" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                      <Briefcase className="h-5 w-5" /> Jobs
                                  </Link>
                              </SheetClose>
                              <SheetClose asChild>
                                  <a href="https://mlscsvec.openstatus.dev/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                      <Activity className="h-5 w-5" /> Status
                                  </a>
                              </SheetClose>
                               <SheetClose asChild>
                                  <Link href="/apply" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                      <Send className="h-5 w-5" /> Apply
                                  </Link>
                              </SheetClose>
                               <SheetClose asChild>
                                <Link href="/login" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                  <LogIn className="h-5 w-5" /> Login
                                </Link>
                              </SheetClose>
                          </nav>
                      </div>
                  </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="jobs" className="w-full py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="relative w-full py-20 md:py-28 text-center bg-cover bg-center mb-12 rounded-lg" style={{backgroundImage: "url('/team1.jpg')"}}>
                    <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
                    <div className="relative z-10 container mx-auto px-4">
                        <div className="glass-card inline-block p-8">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl flex items-center gap-3">
                                <Briefcase className="h-8 w-8" />
                                <span>Latest Job <span className="text-primary">Openings</span></span>
                            </h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl mt-4">
                                Curated job listings for developers, fetched automatically.
                            </p>
                        </div>
                    </div>
                </div>
                
                <Suspense fallback={<JobListingsSkeleton />}>
                    <JobListings />
                </Suspense>
            </div>
        </section>
      </main>

    </div>
  );
}
