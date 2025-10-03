
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VisitorsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MLSCLogo className="h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Visitor Logs
                        </h1>
                    </div>
                     <Button asChild variant="glass">
                        <Link href="/admin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="container mx-auto space-y-8">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Feature Removed</CardTitle>
                            <CardDescription>
                                The visitor logging feature has been temporarily removed due to a technical issue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p>This feature was causing server instability and has been disabled to ensure the application remains operational. We apologize for the inconvenience.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
