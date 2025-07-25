
import { getDeadline } from "@/app/actions";
import { ApplicationForm } from "@/components/application-form";
import { CountdownTimer } from "@/components/countdown-timer";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileSearch, Home, LogIn, Menu, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const { deadlineTimestamp } = await getDeadline();
  const isClosed = deadlineTimestamp ? new Date() > new Date(deadlineTimestamp) : false;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              MLSC SVEC
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
             <Button asChild variant="outline">
              <Link href="/">
                <Home />
                <span>Home</span>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/status">
                <FileSearch />
                <span>Check Status</span>
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogIn />
                <span>Admin Login</span>
              </Link>
            </Button>
          </nav>
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                   <Link href="/">
                    <Home className="mr-2" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/status">
                    <FileSearch className="mr-2" />
                    <span>Check Status</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogIn className="mr-2" />
                    <span>Admin Login</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-12 md:py-20">
        {/* Application Form Section */}
        <section id="apply" className="w-full">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl">Application Form</CardTitle>
                <CardDescription>
                  {isClosed
                    ? "Submissions are now closed. Thank you for your interest."
                    : "Complete the form to apply for a role at MLSC."}
                </CardDescription>
                {deadlineTimestamp && !isClosed && <CountdownTimer deadline={deadlineTimestamp} />}
              </CardHeader>
              <CardContent>
                {isClosed ? (
                   <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg">
                      <Clock className="h-16 w-16 text-primary mb-4" />
                      <h3 className="text-xl font-semibold">Registrations are closed</h3>
                      <p className="text-muted-foreground mt-2">
                        We are no longer accepting applications. Follow us for future announcements.
                      </p>
                    </div>
                ) : (
                   <ApplicationForm />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t">
          <div className="container mx-auto py-8 px-4 md:px-6 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved. Developed by Vinay Siddha.</p>
          </div>
      </footer>
    </div>
  );
}
