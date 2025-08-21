import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Home as HomeIcon, Users, Calendar, Group, LogIn, Send, Menu, Book, Code, ArrowLeft } from "lucide-react";
import Link from "next/link";

const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
    { href: "/blog", label: "Blog", icon: Book },
];

export default function TermsAndConditionsPage() {
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
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="glass" size="sm" className="hidden lg:flex">
                <Link href="/"><ArrowLeft/> Home</Link>
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
                                <Link href="/" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-muted/50">
                                  <HomeIcon className="h-5 w-5" /> Home
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

      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto glass-card">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 prose prose-invert max-w-none">
                    <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <h3 className="text-xl font-bold">1. Agreement to Terms</h3>
                    <p>By accessing this website, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.</p>

                    <h3 className="text-xl font-bold">2. Intellectual Property</h3>
                    <p>The Service and its original content, features, and functionality are and will remain the exclusive property of MLSC SVEC. The content on this website is protected by copyright and other intellectual property laws.</p>
                    
                    <h3 className="text-xl font-bold">3. User Conduct and Site Usage Restrictions</h3>
                    <p>You agree not to use the website in a way that:</p>
                    <ul>
                        <li>Is illegal, fraudulent, or harmful.</li>
                        <li>Attempts to harvest, collect, or copy any data or content from the website. To enforce this, we have disabled text selection, right-clicking, and other methods of content copying.</li>
                        <li>Attempts to bypass our security features. This includes, but is not limited to, taking screenshots, which we actively deter.</li>
                    </ul>
                    
                    <h3 className="text-xl font-bold">4. Termination and Access Restriction</h3>
                    <p>We reserve the right to terminate or suspend your access to our website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    <p>Any user or automated system found to be engaging in malicious activities, such as repeated attempts to copy content, bypass security, or take screenshots, will be subject to an immediate and permanent IP block.</p>
                    
                    <h3 className="text-xl font-bold">5. Limitation of Liability</h3>
                    <p>In no event shall MLSC SVEC, nor its members, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                    
                    <h3 className="text-xl font-bold">6. Governing Law</h3>
                    <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                    
                    <h3 className="text-xl font-bold">7. Changes to Terms</h3>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
