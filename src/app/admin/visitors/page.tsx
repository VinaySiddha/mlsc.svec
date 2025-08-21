
import { getVisitors } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function VisitorsPage() {
    const headersList = headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'admin') {
        redirect('/admin');
    }
    
    const { visitors, error } = await getVisitors();

    if (error) {
        return <div>Error loading visitor data: {error}</div>
    }

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
                            <CardTitle>Recent Visitors</CardTitle>
                            <CardDescription>
                                This log shows the most recent 100 visitors to the website for security monitoring purposes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>IP Address</TableHead>
                                            <TableHead>Path Visited</TableHead>
                                            <TableHead>User Agent</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visitors.length > 0 ? (
                                            visitors.map(visitor => (
                                                <TableRow key={visitor.id}>
                                                    <TableCell className="font-medium whitespace-nowrap">{format(new Date(visitor.timestamp), "PPP p")}</TableCell>
                                                    <TableCell className="font-mono">{visitor.ip}</TableCell>
                                                    <TableCell>{visitor.path}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground truncate max-w-xs">{visitor.userAgent}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    No visitor data yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
