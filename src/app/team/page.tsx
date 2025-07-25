
import { getTeamMembers } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  subDomain: string;
  order: number;
  members: TeamMember[];
}

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

const roleOrder: { [key: string]: number } = {
    'Lead': 1,
    'Lead Advisor': 2,
    'Faculty Advisor': 3,
    'Secretary': 4,
    'Technical Architect': 5,
    'Outreach Affairs Lead': 6,
};

const sortMembers = (members: TeamMember[]) => {
    return [...members].sort((a, b) => {
        const aOrder = roleOrder[a.role] || (a.role.includes('Head') ? 7 : 99);
        const bOrder = roleOrder[b.role] || (b.role.includes('Head') ? 7 : 99);
        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }
        return a.name.localeCompare(b.name);
    });
};

const renderMembers = (members: TeamMember[]) => {
    if (members.length === 0) return null;
    
    const containerClasses = cn(
        "gap-8",
        members.length > 1 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
          : "flex justify-center"
    );

    return (
         <div className={containerClasses}>
            {sortMembers(members).map((member: any) => (
            <div key={member.id} className="flex flex-col items-center text-center group">
                <Image 
                    src={member.image} 
                    alt={`Photo of ${member.name}`}
                    width={160} 
                    height={160} 
                    className="rounded-full mb-4 object-cover shadow-lg group-hover:scale-110 transition-transform duration-300 w-40 h-40"
                    data-ai-hint="person portrait"
                />
                <h4 className="font-semibold text-lg">{member.name}</h4>
                <p className="text-blue-400">{member.role}</p>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-400 mt-1">
                    LinkedIn
                </a>
            </div>
            ))}
        </div>
    )
}

const renderTeamSection = (teams: TeamCategory[], title: string) => {
  if (teams.length === 0 || teams.every(team => team.members.length === 0)) {
      return null;
  }
  
  return (
      <section className="w-full bg-gray-800/50 py-16">
          <div className="container mx-auto px-4 md:px-6 space-y-12">
              <div className="w-full text-center">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{title}</h2>
              </div>
              {teams.map(category => {
                  if (category.members.length === 0) return null;
                  return (
                      <div key={category.id} className="w-full">
                          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
                              <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl text-blue-400">{category.subDomain}</h3>
                          </div>
                          {renderMembers(category.members)}
                      </div>
                  )
              })}
          </div>
      </section>
  );
};


export default async function TeamPage() {
    const { membersByCategory, error } = await getTeamMembers();

    if (error || !membersByCategory) {
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
  
  const allCategories = membersByCategory as TeamCategory[];
  const coreTeam = allCategories.filter(c => c.name === 'Core Team');
  const technicalTeam = allCategories.filter(c => c.name === 'Technical Team');
  const nonTechnicalTeam = allCategories.filter(c => c.name === 'Non-Technical Team');
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold tracking-tight">
              Microsoft Learn Student Club
            </span>
          </Link>
          <nav className="navbar hidden lg:flex items-center gap-6 text-sm font-medium">
             {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors">{link.label}</Link>
             ))}
             <a href="#" className="text-gray-300 hover:text-white transition-colors">Projects</a>
          </nav>
          <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-transparent border-gray-400 hover:bg-white/10">
                        <Menu />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-gray-900/90 border-r-gray-700/50 text-white">
                    <div className="p-4">
                        <nav className="flex flex-col gap-4">
                            {navLinks.map(link => (
                                <SheetClose key={link.href} asChild>
                                    <Link href={link.href} className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                        <link.icon className="h-5 w-5" /> {link.label}
                                    </Link>
                                </SheetClose>
                            ))}
                            <SheetClose asChild>
                                <a href="#" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Code className="h-5 w-5" /> Projects
                                </a>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/apply" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
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
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Meet Our <span className="text-blue-400">Team</span></h1>
            <p className="max-w-[900px] mx-auto mt-4 text-gray-300 md:text-xl">The leaders and members driving the MLSC community forward.</p>
        </section>
        
        <div className="space-y-16">
            {renderTeamSection(coreTeam, "Core Team")}
            {renderTeamSection(technicalTeam, "Technical Teams")}
            {renderTeamSection(nonTechnicalTeam, "Non-Technical Teams")}
        </div>
        
      </main>

      {/* Footer */}
      <footer className="bg-background/60 backdrop-blur-sm border-t border-border/50 py-6 mt-16">
          <div className="container mx-auto text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
