import { getAnalyticsData } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, BarChart2 } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { DeadlineSetter } from "@/components/deadline-setter";
import { AdminDashboardAnalytics } from "@/components/admin-dashboard-analytics";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const headersList = headers();
  const userRole = headersList.get('X-User-Role');
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;

  if (!userRole) {
    redirect('/login');
  }

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  const title = panelDomain ? `${domainLabels[panelDomain] || 'Panel'} Dashboard` : "MLSC Hub - Superadmin";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  All Applications
                </CardTitle>
                <CardDescription>
                  View, filter, and manage all submitted applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin/applications">Go to Applications</Link>
                </Button>
              </CardContent>
            </Card>
            {userRole === 'admin' && (
              <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-primary" />
                    Hiring Analytics
                  </CardTitle>
                  <CardDescription>
                    Visualize application data, trends, and statistics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/admin/analytics">View Analytics</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {userRole === 'admin' && (
            <DeadlineSetter />
          )}
        </div>
      </main>
    </div>
  );
}
