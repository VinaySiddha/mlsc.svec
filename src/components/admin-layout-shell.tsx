'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { AppSidebar } from './app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  userRole: string;
  username: string;
  userEmail?: string;
  panelDomain?: string;
  adminChapter?: string;
  chapters?: string[];
}

export function AdminLayoutShell({
  children,
  userRole,
  username,
  userEmail,
  panelDomain,
  adminChapter = '3.0',
  chapters = ['3.0', '4.0']
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [theme] = useState<'light' | 'dark'>('dark');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Force dark mode for administrative dashboard
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Dynamic domain label
  const domainLabels: Record<string, string> = {
    gen_ai: "Generative AI",
    ds_ml: "Data Science & ML",
    azure: "Azure Cloud",
    web_app: "Web & App Dev",
    event_management: "Event Management",
    public_relations: "Public Relations",
    media_marketing: "Media Marketing",
    creativity: "Creativity",
  };

  const domainName = panelDomain ? domainLabels[panelDomain] || panelDomain : 'Superadmin';

  // Calculate breadcrumbs dynamically based on path

  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbLabels: Record<string, string> = {
    admin: "Admin",
    applications: "Applications",
    application: "Applications",
    attendance: "Attendance Tracker",
    "hiring-settings": "Hiring Settings",
    deadline: "Deadline",
    events: "Events",
    team: "Team",
    analytics: "Analytics",
    payments: "Payments",
    users: "Users",
    operations: "Operations Center",
    notifications: "Notifications",
    "bulk-update": "Bulk Update",
    "internal-registration": "Internal Registration",
    quizzes: "Quiz Manager",
    community: "Community",
    home: "Home Page Config",
    new: "Create New",
    edit: "Modify"
  };

  return (
    <SidebarProvider>
      {/* CSS Overrides to keep things completely consistent and clean */}
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background-color: transparent !important;
        }
        
        /* Premium dark glassmorphism for admin cards, matching client side */
        .dark .apple-card, .dark .glass-card, .dark .bento-card {
          background: rgba(10, 10, 10, 0.7) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
          color: #ffffff !important;
        }

        .dark aside {
          background: rgba(8, 8, 8, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border-right-color: rgba(255, 255, 255, 0.08) !important;
        }

        .dark header {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(20px) !important;
          border-bottom-color: rgba(255, 255, 255, 0.08) !important;
        }
        
        /* Style standard subpage wrapper tables, select inputs, cards inside our light/dark mode */
        .light .apple-card, .light .glass-card {
          background: #ffffff !important;
          border-color: #e2e8f0 !important;
          color: #1e293b !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
        }
        .light .bento-card {
          background: #ffffff !important;
          border-color: #e2e8f0 !important;
          color: #1e293b !important;
        }
        .light .text-white {
          color: #0f172a !important;
        }
        .light .text-white\\/90, .light .text-white\\/80, .light .text-white\\/70 {
          color: #1e293b !important;
        }
        .light .text-white\\/60, .light .text-white\\/50, .light .text-white\\/40 {
          color: #475569 !important;
        }
        .light .text-white\\/30, .light .text-white\\/20, .light .text-white\\/10 {
          color: #94a3b8 !important;
        }
        .light .bg-white\\/5 {
          background-color: #f1f5f9 !important;
        }
        .light .border-white\\/10 {
          border-color: #e2e8f0 !important;
        }

        /* Fix table texts in light mode */
        .light table, .light th, .light td {
          color: #334155 !important;
        }
        .light th {
          background-color: #f8fafc !important;
          color: #475569 !important;
        }

        /* Fix table texts in dark mode for premium transparency */
        .dark table {
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .dark th {
          background-color: rgba(255, 255, 255, 0.02) !important;
          color: rgba(255, 255, 255, 0.6) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .dark td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .dark tr:hover {
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
        
        /* Style headers of subpages to fit the theme */
        .admin-layout-content header {
          position: static !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          height: auto !important;
          padding: 1.5rem 0 !important;
          width: 100% !important;
        }
        /* Hide the logo and branding link in subpage headers */
        .admin-layout-content header a[href="/admin"],
        .admin-layout-content header a[href="/"] {
          display: none !important;
        }
        .admin-layout-content header .container {
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
        }
        .admin-layout-content header .flex {
          justify-content: flex-end !important;
          gap: 1rem !important;
        }
        .admin-layout-content .min-h-screen {
          min-height: auto !important;
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
        }
        .admin-layout-content main {
          padding: 0 !important;
          background-color: transparent !important;
        }
      `}} />

      {/* App Sidebar from Shadcn Primitives */}
      <AppSidebar 
        userRole={userRole} 
        username={username} 
        userEmail={userEmail}
        panelDomain={panelDomain} 
        adminChapter={adminChapter}
        chapters={chapters}
      />

      {/* Sidebar Inset Content Area */}
      <SidebarInset className="flex flex-col min-h-screen bg-slate-50 dark:bg-black overflow-hidden transition-all duration-300">
        {/* Top Header Row containing triggers and toggles */}
        <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-md px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 z-50">
          <div className="flex items-center gap-2 px-2">
            <SidebarTrigger className="-ml-1 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4 bg-slate-200 dark:bg-zinc-800/80"
            />
            {/* Dynamic Breadcrumbs */}
            <Breadcrumb>
              <BreadcrumbList className="flex items-center gap-1.5 sm:gap-2.5">
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin" className="text-xs font-semibold text-slate-400 dark:text-zinc-500 hover:text-[#4285F4] dark:hover:text-[#4285F4]">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathParts.length > 1 && <BreadcrumbSeparator className="hidden md:block text-slate-300 dark:text-zinc-700" />}
                {pathParts.slice(1).map((part, index, arr) => {
                  const label = breadcrumbLabels[part] || part;
                  const isLast = index === arr.length - 1;
                  const intermediatePath = '/admin/' + pathParts.slice(1, index + 2).join('/');
                  
                  return (
                    <React.Fragment key={part}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider select-none">
                            {label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            href={intermediatePath} 
                            className="text-xs font-semibold text-slate-400 dark:text-zinc-500 hover:text-[#4285F4] dark:hover:text-[#4285F4] select-none"
                          >
                            {label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator className="text-slate-300 dark:text-zinc-700" />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right Action Icons (Notifications Only) */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-full text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50 h-9 w-9 shrink-0"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 border border-white dark:border-zinc-950 rounded-full animate-pulse" />
              </Button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                    <span className="text-[10px] font-bold text-[#4285F4] uppercase cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto px-2 py-1">
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-xl cursor-pointer transition-colors">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">New applications received</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">5 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-xl cursor-pointer transition-colors border-t border-slate-100 dark:border-zinc-800/50">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Recruitment cycle closing tomorrow</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </header>

        {/* Scrollable Page Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 admin-layout-content">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
