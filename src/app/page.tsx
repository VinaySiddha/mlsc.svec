import { ApplicationForm } from "@/components/application-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileSearch, LogIn, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="py-4 px-4 sm:px-6 md:px-8 border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              MLSC 3.0 Hiring Program
            </h1>
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
             <Button asChild variant="outline">
              <Link href="/status">
                <FileSearch />
                <span>Check Status</span>
              </Link>
            </Button>
            <Button asChild>
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
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-card/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Join the Future of Tech with MLSC 3.0
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    We are looking for passionate individuals to join our team. Fill out the application below to start your journey with the Microsoft Learn Student Club.
                  </p>
                </div>
              </div>
              <div className="w-full max-w-2xl mx-auto">
                  <Image
                    src="/logo.png"
                    data-ai-hint="logo"
                    width="600"
                    height="600"
                    alt="MLSC Logo"
                    className="mx-auto aspect-square overflow-hidden rounded-xl object-contain"
                  />
              </div>
            </div>
          </div>
        </section>
        <section id="apply" className="w-full py-12 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl">Application Form</CardTitle>
                <CardDescription>
                  Complete the form to apply for a role at MLSC.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationForm />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MLSC X SVEC. All rights reserved.@VinaySiddha
        </div>
      </footer>
    </div>
  );
}
