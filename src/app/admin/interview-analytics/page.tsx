
import { getInterviewAnalyticsData } from "@/app/actions";
import { AdminDashboardAnalytics } from "@/components/admin-dashboard-analytics";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function InterviewAnalyticsPage() {
  const headersList = headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== 'admin') {
    redirect('/admin');
  }

  const analyticsData = await getInterviewAnalyticsData();

  if ('error' in analyticsData) {
      return (
        <div className="flex flex-col min-h-screen">
         <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <div className="container mx-auto flex items-center justify-between gap-4">
              <Link href="/admin" className="flex items-center gap-4">
                <MLSCLogo className="h-10 w-10 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Interview Analytics
                </h1>
              </Link>
              <Button asChild variant="outline">
                <Link href="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="container mx-auto space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-destructive">
                      {analyticsData.error || "Could not load interview analytics data."}
                    </p>
                  </CardContent>
                </Card>
            </div>
          </main>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Interview Analytics
            </h1>
          </Link>
          <Button asChild variant="outline">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto space-y-8">
           <AdminDashboardAnalytics data={analyticsData} />
        </div>
      </main>
    </div>
  );
}
