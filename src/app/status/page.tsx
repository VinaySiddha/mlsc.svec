import { MLSCLogo } from "@/components/icons";
import { StatusCheckForm } from "@/components/status-check-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, User } from "lucide-react";
import Link from "next/link";

export default function StatusPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              MLSC 3.0 Hiring Program
            </h1>
          </Link>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2" />
              <span>Home</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Check Application Status</CardTitle>
            <CardDescription>
              Enter your reference ID to see the current status of your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusCheckForm />
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MLSC Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
