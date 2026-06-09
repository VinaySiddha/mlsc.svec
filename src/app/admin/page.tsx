
import { getAnalyticsData } from "@/app/actions";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, BarChart2, AlertCircle, PencilRuler, UserCheck, Calendar, Group, UploadCloud, Database, Megaphone, Shield, MessageSquare } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { DeadlineSetter } from "@/components/deadline-setter";
import { AdminAnalyticsSection } from "@/components/admin-analytics-section";
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
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');
  const panelDomain = headersList.get('X-Panel-Domain') || undefined;

  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Development",
  };

  const title = panelDomain ? `${domainLabels[panelDomain] || 'Panel'} Dashboard` : "SUPERADMIN CONTROL";

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <header className="glass-nav h-20">
        <div className="container mx-auto flex h-full items-center justify-between px-6 md:px-12">
          <Link href="/admin" className="flex items-center gap-3 group">
            <MLSCLogo className="h-9 w-9 text-white transition-transform group-hover:scale-110" />
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              {title}
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <Menubar className="border-none bg-transparent shadow-none gap-4">
               {/* Simplified menus for high-contrast look */}
              <MenubarMenu>
                <MenubarTrigger className="text-[0.6rem] font-black uppercase tracking-[0.3em] cursor-pointer hover:text-[#4285F4] transition-colors">Navigation</MenubarTrigger>
                <MenubarContent className="bg-black border border-white/10 rounded-2xl p-2 mt-2">
                  <MenubarItem asChild className="rounded-xl focus:bg-[#4285F4] focus:text-white cursor-pointer">
                    <Link href="/">Public Home</Link>
                  </MenubarItem>
                  <MenubarItem asChild className="rounded-xl focus:bg-[#4285F4] focus:text-white cursor-pointer">
                    <Link href="/admin/applications">Applications</Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              {userRole === 'admin' && (
                <MenubarMenu>
                    <MenubarTrigger className="text-[0.6rem] font-black uppercase tracking-[0.3em] cursor-pointer hover:text-[#34A853] transition-colors">Management</MenubarTrigger>
                    <MenubarContent className="bg-black border border-white/10 rounded-2xl p-2 mt-2">
                         <MenubarItem asChild className="rounded-xl focus:bg-[#34A853] focus:text-white cursor-pointer">
                            <Link href="/admin/events">Events</Link>
                        </MenubarItem>
                        <MenubarItem asChild className="rounded-xl focus:bg-[#34A853] focus:text-white cursor-pointer">
                            <Link href="/admin/team">Team</Link>
                        </MenubarItem>
                        <MenubarSeparator className="bg-white/5 my-1" />
                        <MenubarItem asChild className="rounded-xl focus:bg-[#34A853] focus:text-white cursor-pointer">
                            <Link href="/admin/notifications">Notifications</Link>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
              )}
              <MenubarMenu>
                <MenubarTrigger className="text-[0.6rem] font-black uppercase tracking-[0.3em] cursor-pointer hover:text-[#EA4335] transition-colors">Session</MenubarTrigger>
                <MenubarContent className="bg-black border border-white/10 rounded-2xl p-2 mt-2">
                  <div className="p-1">
                    <LogoutButton />
                  </div>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 space-y-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bento-card group">
              <div className="absolute top-0 right-0 p-8">
                <Users className="h-8 w-8 text-[#4285F4]" />
              </div>
              <h3 className="text-xl font-black tracking-tighter mb-2 uppercase italic">Applicants.</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8">Management Hub</p>
              <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 px-6 w-full text-xs">
                <Link href="/admin/applications">View All</Link>
              </Button>
            </div>
            {userRole === 'admin' && (
              <>
                <div className="bento-card group border-[#34A853]/20">
                  <div className="absolute top-0 right-0 p-8">
                    <Calendar className="h-8 w-8 text-[#34A853]" />
                  </div>
                  <h3 className="text-xl font-black tracking-tighter mb-2 uppercase italic">Events.</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8">Global Schedule</p>
                  <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 px-6 w-full text-xs">
                    <Link href="/admin/events">Manage</Link>
                  </Button>
                </div>
                <div className="bento-card group border-[#FBBC04]/20">
                  <div className="absolute top-0 right-0 p-8">
                    <Group className="h-8 w-8 text-[#FBBC04]" />
                  </div>
                  <h3 className="text-xl font-black tracking-tighter mb-2 uppercase italic">Team.</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8">Core Directory</p>
                  <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 px-6 w-full text-xs">
                    <Link href="/admin/team">Curate</Link>
                  </Button>
                </div>
                <div className="bento-card group border-[#EA4335]/20">
                  <div className="absolute top-0 right-0 p-8">
                    <BarChart2 className="h-8 w-8 text-[#EA4335]" />
                  </div>
                  <h3 className="text-xl font-black tracking-tighter mb-2 uppercase italic">Analytics.</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8">Performance Data</p>
                  <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 px-6 w-full text-xs">
                    <Link href="/admin/analytics">Inspect</Link>
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bento-card p-12 !h-auto">
               <h2 className="text-4xl font-black tracking-tighter mb-12 uppercase italic">Live <span className="text-[#4285F4]">Metrics.</span></h2>
               <AdminAnalyticsSection panelDomain={panelDomain} />
            </div>
            <div className="space-y-8">
              {userRole === 'admin' && (
                <div className="bento-card p-12 !h-auto">
                   <h2 className="text-2xl font-black tracking-tighter mb-8 uppercase italic">Deadline.</h2>
                  <DeadlineSetter />
                </div>
              )}
              <div className="bento-card p-12 !h-auto bg-[#34A853]/5 border-[#34A853]/20">
                <h2 className="text-2xl font-black tracking-tighter mb-6 uppercase italic text-[#34A853]">Status.</h2>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-[#34A853] animate-pulse" />
                  <p className="font-black text-xs uppercase tracking-[0.2em]">Operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
