
import { getAnalyticsData } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, BarChart2, AlertCircle, PencilRuler, UserCheck, Calendar, Group, UploadCloud, Database, Megaphone } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { DeadlineSetter } from "@/components/deadline-setter";
import { AdminDashboardAnalytics } from "@/components/admin-dashboard-analytics";
import { headers } from "next/headers";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem
} from "@/components/ui/menubar"

export default async function AdminPage() {
  const headersList = headers();
  const userRole = headersList.get('X-User-Role');
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;
  
  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  const title = panelDomain ? `${domainLabels[panelDomain] || 'Panel'} Dashboard` : "MLSC Hub - Superadmin";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/admin" className="flex items-center gap-2">
            <MLSCLogo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              {title}
            </h1>
          </Link>
          <div className="flex items-center gap-4">
             <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem asChild>
                    <Link href="/">
                      Go to Home Page <MenubarShortcut>⌘H</MenubarShortcut>
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                     <Link href="/admin/applications">
                       View Applications <MenubarShortcut>⌘A</MenubarShortcut>
                    </Link>
                  </MenubarItem>
                  <MenubarSeparator />
                   <MenubarItem disabled>Print</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
               {userRole === 'admin' && (
                <>
                  <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                     <MenubarContent>
                      <MenubarSub>
                        <MenubarSubTrigger>Management</MenubarSubTrigger>
                        <MenubarSubContent>
                           <MenubarItem asChild>
                            <Link href="/admin/events">Manage Events</Link>
                          </MenubarItem>
                          <MenubarItem asChild>
                            <Link href="/admin/team">Manage Team</Link>
                          </MenubarItem>
                          <MenubarItem asChild>
                            <Link href="/admin/notifications">Manage Notifications</Link>
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarSub>
                        <MenubarSubTrigger>Data</MenubarSubTrigger>
                        <MenubarSubContent>
                           <MenubarItem asChild>
                            <Link href="/admin/internal-registration">Internal Registration</Link>
                          </MenubarItem>
                          <MenubarItem asChild>
                            <Link href="/admin/bulk-update">Bulk Status Update</Link>
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarSub>
                    </MenubarContent>
                  </MenubarMenu>
                   <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                       <MenubarCheckboxItem checked disabled>Always Show Full URLs</MenubarCheckboxItem>
                       <MenubarSeparator />
                       <MenubarItem asChild inset>
                         <Link href="/admin/analytics">Hiring Analytics</Link>
                      </MenubarItem>
                       <MenubarItem asChild inset>
                         <Link href="/admin/interview-analytics">Interview Analytics</Link>
                      </MenubarItem>
                       <MenubarItem asChild inset>
                         <Link href="/admin/visitors">Visitor Logs</Link>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                   <MenubarMenu>
                    <MenubarTrigger>Profiles</MenubarTrigger>
                    <MenubarContent>
                      <MenubarRadioGroup value="admin">
                        <MenubarRadioItem value="admin">Admin</MenubarRadioItem>
                        <MenubarRadioItem value="panel" disabled>Panel</MenubarRadioItem>
                      </MenubarRadioGroup>
                      <MenubarSeparator />
                      <MenubarItem inset>
                         <LogoutButton />
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </>
               )}
                {userRole === 'panel' && (
                  <MenubarMenu>
                    <MenubarTrigger>Profiles</MenubarTrigger>
                     <MenubarContent>
                       <MenubarRadioGroup value="panel">
                        <MenubarRadioItem value="admin" disabled>Admin</MenubarRadioItem>
                        <MenubarRadioItem value="panel">Panel</MenubarRadioItem>
                      </MenubarRadioGroup>
                      <MenubarSeparator />
                      <MenubarItem inset>
                         <LogoutButton />
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                )}
            </Menubar>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="container mx-auto space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users />
                  All Applications
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  View, filter, and manage all submitted applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="glass" size="sm">
                  <Link href="/admin/applications">Go to Applications</Link>
                </Button>
              </CardContent>
            </Card>
            {userRole === 'admin' && (
              <>
                <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar />
                      Event Management
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Create, update, and manage all club events.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="glass" size="sm">
                      <Link href="/admin/events">Manage Events</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Group />
                      Team Management
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Update the public team page members and categories.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="glass" size="sm">
                      <Link href="/admin/team">Manage Team</Link>
                    </Button>
                  </CardContent>
                </Card>
                 <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UploadCloud />
                      Bulk Status Update
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Update statuses by uploading a CSV of hired candidates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="glass" size="sm">
                      <Link href="/admin/bulk-update">Bulk Update</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart2 />
                      Hiring Analytics
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Visualize application data, trends, and statistics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="glass" size="sm">
                      <Link href="/admin/analytics">View Analytics</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="glass-card flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                        <UserCheck />
                        Interview Analytics
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                        Analytics for candidates who completed their interview.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="glass" size="sm">
                          <Link href="/admin/interview-analytics">View Interview Analytics</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <PencilRuler />
                      Internal Registration
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Manually register a candidate on their behalf.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="glass" size="sm">
                      <Link href="/admin/internal-registration">Register Candidate</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Database />
                      Visitor Logs
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      View recent visitor IP addresses and activity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="glass" size="sm">
                      <Link href="/admin/visitors">View Logs</Link>
                    </Button>
                  </CardContent>
                </Card>
                 <Card className="glass-card flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Megaphone />
                      Notifications
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Manage the scrolling ticker on the home page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="glass" size="sm">
                      <Link href="/admin/notifications">Manage Notifications</Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {userRole === 'admin' && (
            <div className="glass-card p-6">
              <DeadlineSetter />
            </div>
          )}
          
           {userRole === 'panel' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Domain Analytics</h2>
                <AdminDashboardAnalytics panelDomain={panelDomain} />
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

    