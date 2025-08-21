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

export default function PrivacyPolicyPage() {
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
                    <CardTitle className="text-3xl text-center">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 prose prose-invert max-w-none">
                    <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <h3 className="text-xl font-bold">1. Introduction</h3>
                    <p>Welcome to the MLSC SVEC website. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, including any other media form, media channel, mobile website, or mobile application related or connected thereto.</p>

                    <h3 className="text-xl font-bold">2. Information We Collect</h3>
                    <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                    <ul>
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, roll number, and phone number, that you voluntarily give to us when you register for an event or submit a hiring application.</li>
                        <li><strong>Application Data:</strong> Information related to your academic and professional profile, such as your resume, CGPA, branch, and domain interests, collected through our application forms. All application data is stored securely in Firebase.</li>
                    </ul>

                    <h3 className="text-xl font-bold">3. Use of Your Information</h3>
                    <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                    <ul>
                        <li>Process your application for the MLSC Hiring Program.</li>
                        <li>Register you for events and workshops.</li>
                        <li>Send you email notifications regarding your application status or event details.</li>
                        <li>Maintain the security and integrity of our website.</li>
                    </ul>

                    <h3 className="text-xl font-bold">4. Content Protection and Site Security</h3>
                    <p>To protect our intellectual property and maintain the security of our platform, we have implemented several security measures:</p>
                    <ul>
                        <li><strong>No-Copy Policy:</strong> Text and other content on this website cannot be copied. All content is protected by `user-select: none;` CSS properties, and JavaScript listeners prevent copy events.</li>
                        <li><strong>Right-Click Disabled:</strong> The context menu (right-click menu) is disabled sitewide to prevent easy access to developer tools or content saving options.</li>
                        <li><strong>Screenshot Deterrents:</strong> While we cannot completely block screenshots, we employ technical measures to detect and deter them. Attempting to take a screenshot may result in a warning and the temporary blurring of on-screen content.</li>
                        <li><strong>Monitoring for Malicious Activity:</strong> We monitor site activity to prevent unauthorized access and other malicious actions. Any user found engaging in such activities will have their access and IP address permanently blocked from our services.</li>
                    </ul>

                    <h3 className="text-xl font-bold">5. Contact Us</h3>
                    <p>If you have questions or comments about this Privacy Policy, please contact us through the channels provided on our main page.</p>

                </CardContent>
            </Card>
        </div>
      </main>

    </div>
  );
}
