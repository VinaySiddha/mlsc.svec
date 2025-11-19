
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StatusPage() {
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
          <Button asChild variant="glass" size="sm">
              <Link href="/"><ArrowLeft/> Home</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto glass-card">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">Website Status</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Live uptime and performance monitoring for our services.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-[16/12] w-full rounded-lg overflow-hidden border border-border">
                        <iframe
                            src="https://stats.uptimerobot.com/uM9ROqrUmD"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            title="Website Status"
                        ></iframe>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
