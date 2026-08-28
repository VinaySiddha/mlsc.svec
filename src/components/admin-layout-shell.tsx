'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bell, 
  Globe, 
  Activity,
  Layers,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

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
    alumni: "Alumni Words",
    new: "Create New",
    edit: "Modify"
  };

  return (
    <SidebarProvider>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Unified clean Neo-Brutalist base */
        body {
          background-color: #FAFAFA !important;
          color: #000000 !important;
        }

        /* Sidebar Styling */
        [data-sidebar="sidebar"] {
          background-color: #FFFFFF !important;
          border-right: 3px solid #000000 !important;
        }

        [data-sidebar="header"], [data-sidebar="content"], [data-sidebar="footer"] {
          background-color: #FFFFFF !important;
        }

        .admin-neo-card {
          background-color: #FFFFFF !important;
          border: 3px solid #000000 !important;
          box-shadow: 4px 4px 0px 0px #000000 !important;
          border-radius: 1rem !important;
        }

        .admin-neo-card-lg {
          background-color: #FFFFFF !important;
          border: 3px solid #000000 !important;
          box-shadow: 6px 6px 0px 0px #000000 !important;
          border-radius: 1.25rem !important;
        }

        .admin-neo-btn {
          background-color: #FFE600 !important;
          color: #000000 !important;
          border: 2px solid #000000 !important;
          box-shadow: 3px 3px 0px 0px #000000 !important;
          font-weight: 800 !important;
          transition: all 0.15s ease-in-out !important;
        }
        .admin-neo-btn:hover {
          transform: translate(2px, 2px) !important;
          box-shadow: 1px 1px 0px 0px #000000 !important;
        }

        table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
        }
        th {
          background-color: #F4F4F5 !important;
          color: #000000 !important;
          font-weight: 800 !important;
          border-bottom: 2px solid #000000 !important;
        }
        td {
          border-bottom: 1px solid #E4E4E7 !important;
          color: #18181B !important;
        }
        tr:hover td {
          background-color: #FEF08A15 !important;
        }
      `}} />

      {/* App Sidebar */}
      <AppSidebar 
        userRole={userRole} 
        username={username} 
        userEmail={userEmail}
        panelDomain={panelDomain} 
        adminChapter={adminChapter}
        chapters={chapters}
      />

      {/* Sidebar Inset Main Area */}
      <SidebarInset className="flex flex-col min-h-screen bg-[#FAFAFA] text-black overflow-hidden transition-all duration-300">
        
        {/* ── Top Header Menu Bar ── */}
        <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-4 border-b-[3px] border-black bg-white px-4 sm:px-6 z-40 shadow-[0_2px_0px_0px_#000000]">
          
          {/* Left: Sidebar Trigger & Clean Breadcrumbs */}
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-black bg-white hover:bg-[#FFE600] p-2 rounded-lg transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none" />
            
            <Separator
              orientation="vertical"
              className="h-6 w-[2px] bg-black"
            />

            {/* Dynamic Breadcrumbs */}
            <Breadcrumb>
              <BreadcrumbList className="flex items-center gap-1.5 sm:gap-2">
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink href="/admin" className="text-xs font-mono font-black text-black hover:text-[#4285F4] uppercase tracking-wider">
                    ADMIN
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {pathParts.length > 1 && <BreadcrumbSeparator className="hidden sm:block text-black font-black" />}
                
                {pathParts.slice(1).map((part, index, arr) => {
                  const label = breadcrumbLabels[part] || part;
                  const isLast = index === arr.length - 1;
                  const intermediatePath = '/admin/' + pathParts.slice(1, index + 2).join('/');
                  
                  return (
                    <React.Fragment key={part}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="text-xs font-mono font-black text-black uppercase tracking-wider px-2 py-0.5 bg-[#FFE600] rounded border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                            {label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            href={intermediatePath} 
                            className="text-xs font-mono font-bold text-zinc-600 hover:text-black uppercase tracking-wider select-none"
                          >
                            {label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator className="text-black font-black" />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Chapter Badge, System Status, Public Site Shortcut & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Chapter Badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-[#4285F4] text-white border-2 border-black rounded-lg font-mono text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
              <Layers className="h-3.5 w-3.5 text-[#FFE600]" />
              <span>CHAPTER {adminChapter}</span>
            </div>

            {/* Live Status Pill */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00FF66] text-black border-2 border-black rounded-lg font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              ONLINE
            </div>

            {/* Public Site Quick Link Button */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black border-2 border-black rounded-lg text-xs font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000] transition-all"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Public Site</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative bg-white text-black hover:bg-zinc-100 h-9 w-9 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF0055] border-2 border-black rounded-full" />
              </Button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border-[3px] border-black rounded-xl shadow-[6px_6px_0px_0px_#000000] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b-2 border-black flex justify-between items-center bg-[#FFE600]/30">
                    <span className="font-black text-xs uppercase tracking-wider text-black font-mono">System Live Feed</span>
                    <span className="text-[10px] font-black text-[#4285F4] uppercase cursor-pointer hover:underline">Mark read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto px-2 py-1 space-y-1">
                    <div className="p-3 bg-zinc-50 hover:bg-[#FFE600]/20 rounded-lg cursor-pointer transition-colors border-2 border-black">
                      <p className="text-xs font-bold text-black">New applications submitted for review</p>
                      <p className="text-[10px] text-zinc-500 font-mono font-bold mt-1">Live Feed • Active</p>
                    </div>
                    <div className="p-3 bg-zinc-50 hover:bg-[#FFE600]/20 rounded-lg cursor-pointer transition-colors border-2 border-black">
                      <p className="text-xs font-bold text-black">Active Workspace: Chapter {adminChapter}</p>
                      <p className="text-[10px] text-zinc-500 font-mono font-bold mt-1">Settings Synced</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 admin-layout-content">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
