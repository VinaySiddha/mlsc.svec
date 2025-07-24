
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { InternalRegistrationForm } from "@/components/internal-registration-form";

export const dynamic = 'force-dynamic';

export default async function InternalRegistrationPage() {
  const headersList = headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== 'admin') {
    redirect('/admin');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Internal Registration
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto space-y-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Internal Candidate Registration</CardTitle>
                <CardDescription>
                  Use this form to manually register a candidate. A confirmation email will not be sent, but a reference ID will be generated.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <InternalRegistrationForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
