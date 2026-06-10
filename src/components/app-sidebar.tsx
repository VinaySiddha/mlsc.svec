'use client';

import * as React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Bell, 
  Shield, 
  BookOpen,
  Briefcase,
  Globe,
  Settings,
  HelpCircle,
  Megaphone
} from 'lucide-react';

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { ChapterSwitcher } from "@/components/chapter-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/roles";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: string;
  username: string;
  userEmail?: string;
  panelDomain?: string;
  adminChapter?: string;
  chapters?: string[];
}

// Roles that can see all admin nav items
const FULL_ACCESS_ROLES: string[] = [ROLES.SUPER_ADMIN];
// Roles that can see event-related nav
const EVENT_ACCESS_ROLES: string[] = [ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN];
// Roles that can see community/content nav
const CONTENT_ACCESS_ROLES: string[] = [ROLES.SUPER_ADMIN, ROLES.CONTENT_MANAGER, ROLES.COMMUNITY_MODERATOR];

export function AppSidebar({ userRole, username, userEmail, panelDomain, adminChapter = '3.0', chapters = ['3.0', '4.0'], ...props }: AppSidebarProps) {
  const isFullAdmin = FULL_ACCESS_ROLES.includes(userRole);
  const canSeeEvents = EVENT_ACCESS_ROLES.includes(userRole);
  const canSeeContent = CONTENT_ACCESS_ROLES.includes(userRole);

  // Main Platform Links — shown based on role
  const navMainItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: Briefcase,
      ...(isFullAdmin ? {
        items: [
          { title: "All Applications", url: "/admin/applications" },
          { title: "Hiring Settings", url: "/admin/hiring-settings" },
          { title: "Set Deadline", url: "/admin/deadline" },
        ]
      } : {})
    },
    ...(canSeeEvents ? [
      {
        title: "Events",
        url: "/admin/events",
        icon: Calendar,
      },
    ] : []),
    ...(isFullAdmin ? [
      {
        title: "Team",
        url: "/admin/team",
        icon: Users,
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: Shield,
      },
    ] : []),
    ...(canSeeContent ? [
      {
        title: "Announcement Ticker",
        url: "/admin/notifications",
        icon: Megaphone,
      },
    ] : []),
    ...(isFullAdmin ? [
      {
        title: "Platform Tools",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Bulk Update",
            url: "/admin/bulk-update",
          },
          {
            title: "Internal Reg.",
            url: "/admin/internal-registration",
          },
          {
            title: "Community",
            url: "/admin/community",
          },
          {
            title: "Home Page Config",
            url: "/admin/home",
          }
        ]
      }
    ] : [])
  ];

  const quickLinks = [
    {
      name: "Public Website",
      url: "/",
      icon: Globe,
    },
    {
      name: "Hiring Form",
      url: "/apply",
      icon: BookOpen,
    },
    {
      name: "Community Forum",
      url: "/community",
      icon: HelpCircle,
    }
  ];

  // Determine display email for sidebar user widget
  const roleLabel = ROLE_LABELS[userRole as Role] || userRole;
  const displayEmail = userEmail || `${roleLabel} Access`;

  const userData = {
    name: username,
    email: displayEmail,
    role: userRole,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ChapterSwitcher currentChapter={adminChapter} chapters={chapters} />
        <TeamSwitcher userRole={userRole} panelDomain={panelDomain} />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavProjects projects={quickLinks} />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
