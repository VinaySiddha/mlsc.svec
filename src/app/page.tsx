import { ApplicationForm } from "@/components/application-form";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch, User } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="py-4 px-4 sm:px-6 md:px-8 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              MLSC Hub
            </h1>
          </Link>
          <div className="flex items-center gap-2">
             <Button asChild variant="outline">
              <Link href="/status">
                <FileSearch className="mr-2 h-4 w-4" />
                <span>Check Status</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon">
              <Link href="/admin">
                <User className="h-4 w-4" />
                <span className="sr-only">Admin Panel</span>
              </Link>
            </Button>
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
                    We are looking for passionate individuals to join our team. Fill out the application below to start your journey with the Machine Learning Student Club.
                  </p>
                </div>
              </div>
              <div className="w-full max-w-2xl mx-auto">
                  <img
                    src="https://placehold.co/600x400.png"
                    data-ai-hint="team collaboration"
                    alt="Team Collaboration"
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
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
          © {new Date().getFullYear()} MLSC Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
