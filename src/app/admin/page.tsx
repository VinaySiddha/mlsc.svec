
import { getAnalyticsData } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, BarChart2, AlertCircle, PencilRuler, UserCheck, Calendar, Group } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { DeadlineSetter } from "@/components/deadline-setter";
import { AdminDashboardAnalytics } from "@/components/admin-dashboard-analytics";

export default async function AdminPage() {
  const headersList = headers();
  const userRole = headersList.get('X-User-Role');
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;

  if (!userRole) {
    redirect('/login');
  }

  const analyticsData = userRole === 'panel' ? await getAnalyticsData(panelDomain) : null;

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  const title = panelDomain ? `${domainLabels[panelDomain] || 'Panel'} Dashboard` : "MLSC Hub - Superadmin";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <>
                 <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-primary" />
                      Event Management
                    </CardTitle>
                    <CardDescription>
                      Create, update, and manage all club events.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/admin/events">Manage Events</Link>
                    </Button>
                  </CardContent>
                </Card>
                 <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Group className="h-6 w-6 text-primary" />
                      Team Management
                    </CardTitle>
                    <CardDescription>
                      Update the public team page members and categories.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/admin/team">Manage Team</Link>
                    </Button>
                  </CardContent>
                </Card>
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
                 <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-6 w-6 text-primary" />
                        Interview Analytics
                        </CardTitle>
                        <CardDescription>
                        Analytics for candidates who completed their interview.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                        <Link href="/admin/interview-analytics">View Interview Analytics</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PencilRuler className="h-6 w-6 text-primary" />
                      Internal Registration
                    </CardTitle>
                    <CardDescription>
                      Manually register a candidate on their behalf.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/admin/internal-registration">Register Candidate</Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {userRole === 'admin' && (
            <DeadlineSetter />
          )}

          {userRole === 'panel' && analyticsData && !('error' in analyticsData) && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Domain Analytics</h2>
              <AdminDashboardAnalytics data={analyticsData} />
            </div>
          )}
          {userRole === 'panel' && analyticsData && 'error' in analyticsData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Analytics Error
                </Title>
              </CardHeader>
              <CardContent>
                <p className="text-destructive">
                  {analyticsData.error || "Could not load analytics data for your panel."}
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
