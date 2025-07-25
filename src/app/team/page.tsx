
'use client';

import { getTeamMembers } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin: string;
  categoryId: string;
}

interface TeamCategory {
  id: string;
  name: string;
  order: number;
  members: TeamMember[];
}


export default function TeamPage() {
  const [membersByCategory, setMembersByCategory] = useState<TeamCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getTeamMembers();
        if (result.error) {
          setError(result.error);
        } else if (result.membersByCategory) {
          setMembersByCategory(result.membersByCategory);
        }
      } catch (e) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold">Loading Team...</h2>
      </div>
     )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold text-destructive">Failed to load team members</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }
  
  const coreCategoryNames = ["Core Team", "Lead Advisors", "Core"];
  const technicalCategoryNames = [
    "Generative AI",
    "Data Science & Machine Learning",
    "Azure Cloud",
    "Web and APP Development",
    "Data Science and Machine Learning",
    "Microsoft 365 and PowerPlatform"
  ];
  
  const roleOrder: { [key: string]: number } = {
    'Lead': 1,
    'Lead Advisor': 2,
    'Faculty Advisor': 3,
    'Secretary': 4,
    'Technical Architect': 5,
    'Outreach Affairs Lead': 6,
    'Head': 7,
    'Associate': 8,
    'Subordinate': 9,
  };

  const sortMembers = (a: TeamMember, b: TeamMember) => {
    const roleA = roleOrder[a.role] || 99;
    const roleB = roleOrder[b.role] || 99;
    if (roleA !== roleB) {
        return roleA - roleB;
    }
    return a.name.localeCompare(b.name);
  };
  
  const coreTeams = membersByCategory
      .filter(category => coreCategoryNames.includes(category.name))
      .map(category => ({ ...category, members: [...category.members].sort(sortMembers) }))
      .sort((a, b) => a.order - b.order);

  const technicalTeams = membersByCategory
      .filter(category => technicalCategoryNames.includes(category.name))
      .map(category => ({ ...category, members: [...category.members].sort(sortMembers) }))
      .sort((a, b) => a.order - b.order);

  const nonTechnicalTeams = membersByCategory
      .filter(category => !coreCategoryNames.includes(category.name) && !technicalCategoryNames.includes(category.name))
      .map(category => ({ ...category, members: [...category.members].sort(sortMembers) }))
      .sort((a, b) => a.order - b.order);


  const renderTeamSection = (teams: TeamCategory[], showCategoryHeading: boolean = true) => {
    if (teams.length === 0 || teams.every(team => team.members.length === 0)) {
        return null;
    }
    
    return teams.map(category => {
       if (category.members.length === 0) return null;

        return (
            <div key={category.id} className="w-full">
                {showCategoryHeading && (
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
                        <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">{category.name}</h3>
                    </div>
                )}
                <div className="flex flex-wrap justify-center items-start gap-8">
                    {category.members.map((member: any) => (
                    <div key={member.id} className="flex flex-col items-center text-center group w-full max-w-[200px] sm:max-w-[220px]">
                        <Image 
                            src={member.image} 
                            alt={`Photo of ${member.name}`}
                            width={160} 
                            height={160} 
                            className="rounded-full mb-4 object-cover shadow-lg group-hover:scale-110 transition-transform duration-300 w-40 h-40"
                            data-ai-hint="person portrait"
                        />
                        <h4 className="font-semibold text-lg">{member.name}</h4>
                        <p className="text-primary">{member.role}</p>
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary mt-1">
                            LinkedIn
                        </a>
                    </div>
                    ))}
                </div>
            </div>
        )
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              MLSC SVEC
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
             <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
             <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
             <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">Events</Link>
             <Link href="/team" className="text-muted-foreground hover:text-foreground transition-colors">Team</Link>
             <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
             <Button asChild>
              <Link href="/apply">
                Apply
              </Link>
            </Button>
          </nav>
          <div className="sm:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="p-4">
                        <nav className="flex flex-col gap-4">
                            <SheetClose asChild>
                                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                                    <HomeIcon className="h-5 w-5" /> Home
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/about" className="flex items-center gap-2 text-lg font-semibold">
                                    <Users className="h-5 w-5" /> About
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/events" className="flex items-center gap-2 text-lg font-semibold">
                                    <Calendar className="h-5 w-5" /> Events
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/team" className="flex items-center gap-2 text-lg font-semibold">
                                    <Group className="h-5 w-5" /> Team
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/login" className="flex items-center gap-2 text-lg font-semibold">
                                    <LogIn className="h-5 w-5" /> Login
                                </Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/apply" className="flex items-center gap-2 text-lg font-semibold">
                                    <Send className="h-5 w-5" /> Apply
                                </Link>
                            </SheetClose>
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-28 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Meet Our Team</h1>
            <p className="max-w-[900px] mx-auto mt-4 text-muted-foreground md:text-xl">The leaders and members driving the MLSC community forward.</p>
        </section>
        
        <div className="space-y-16">
            {coreTeams.length > 0 && (
            <section className="w-full bg-card/10 py-16">
                <div className="container mx-auto px-4 md:px-6 space-y-12">
                <div className="w-full text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Core Team</h2>
                </div>
                {renderTeamSection(coreTeams, true)}
                </div>
            </section>
            )}
            
            {technicalTeams.length > 0 && (
            <section className="w-full bg-card/10 py-16">
                <div className="container mx-auto px-4 md:px-6 space-y-12">
                    <div className="w-full text-center">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Technical Teams</h2>
                    </div>
                    {renderTeamSection(technicalTeams, true)}
                </div>
            </section>
            )}

            {nonTechnicalTeams.length > 0 && (
            <section className="w-full bg-card/10 py-16">
                <div className="container mx-auto px-4 md:px-6 space-y-12">
                    <div className="w-full text-center">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Non-Technical Teams</h2>
                    </div>
                    {renderTeamSection(nonTechnicalTeams, true)}
                </div>
            </section>
            )}
        </div>
        
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t backdrop-blur-sm mt-16">
          <div className="container mx-auto py-12 px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                      <div className="flex items-center gap-2">
                          <MLSCLogo className="h-8 w-8" />
                          <h3 className="text-xl font-bold">MLSC SVEC</h3>
                      </div>
                      <p className="text-muted-foreground">Fostering innovation and learning in the tech community at Sri Vasavi Engineering College.</p>
                  </div>
                  <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Quick Links</h4>
                      <ul className="space-y-2">
                          <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                          <li><Link href="/events" className="text-muted-foreground hover:text-primary">Events</Link></li>
                          <li><Link href="/team" className="text-muted-foreground hover:text-primary">Team</Link></li>
                          <li><Link href="/apply" className="text-muted-foreground hover:text-primary">Apply</Link></li>
                      </ul>
                  </div>
                  <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Contact Us</h4>
                      <p className="text-muted-foreground">Tadepalligudem, Andhra Pradesh, 534101</p>
                      <p className="text-muted-foreground">Email: mlscsvec@gmail.com</p>
                  </div>
              </div>
              <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                  <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
              </div>
          </div>
      </footer>
    </div>
  );
}
