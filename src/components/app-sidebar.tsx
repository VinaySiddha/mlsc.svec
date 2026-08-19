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
  Megaphone,
  Activity,
  Coins
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
const FULL_ACCESS_ROLES: string[] = [ROLES.SUPER_ADMIN, 'admin'];
// Roles that can see event-related nav
const EVENT_ACCESS_ROLES: string[] = [ROLES.SUPER_ADMIN, 'admin', ROLES.EVENT_ADMIN];
// Roles that can see community/content nav
const CONTENT_ACCESS_ROLES: string[] = [ROLES.SUPER_ADMIN, 'admin', ROLES.COMMUNITY_MODERATOR];

export function AppSidebar({ userRole, username, userEmail, panelDomain, adminChapter = '3.0', chapters = ['3.0', '4.0'], ...props }: AppSidebarProps) {
  const isFullAdmin = FULL_ACCESS_ROLES.includes(userRole);
  const canSeeEvents = EVENT_ACCESS_ROLES.includes(userRole);
  const canSeeContent = CONTENT_ACCESS_ROLES.includes(userRole);

  const canSeeApplications = userRole === 'super_admin' || userRole === 'admin' || userRole === 'panel';

  // Main Platform Links — shown based on role
  const navMainItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
    },
    ...(canSeeApplications ? [
      {
        title: "Applications",
        url: "/admin/applications",
        icon: Briefcase,
        items: isFullAdmin ? [
          { title: "All Applications", url: "/admin/applications" },
          { title: "Attendance Tracker", url: "/admin/attendance" },
          { title: "Hiring Settings", url: "/admin/hiring-settings" },
          { title: "Set Deadline", url: "/admin/deadline" },
        ] : [
          { title: "All Applications", url: "/admin/applications" },
          { title: "Attendance Tracker", url: "/admin/attendance" },
        ]
      }
    ] : []),
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
        title: "Payments",
        url: "/admin/payments",
        icon: Coins,
        items: [
          {
            title: "Overview & Reports",
            url: "/admin/payments",
          },
          {
            title: "Donation Ledger",
            url: "/admin/payments/ledger",
          }
        ]
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Operations Center",
        url: "/admin/operations",
        icon: Activity,
        items: [
          {
            title: "System Activity",
            url: "/admin/operations/activity",
          },
          {
            title: "Error Reports",
            url: "/admin/operations/errors",
          },
          {
            title: "Bug Feedback",
            url: "/admin/operations/bugs",
          },
          {
            title: "Community Flags",
            url: "/admin/operations/moderation",
          },
          {
            title: "Latest Users",
            url: "/admin/operations/users",
          },
          {
            title: "Contributor Requests",
            url: "/admin/operations/contributors",
          },
          {
            title: "PR Merge Requests",
            url: "/admin/operations/pull-requests",
          },
          {
            title: "ATS Payments",
            url: "/admin/operations/ats-payments",
          },
        ]
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
            title: "Quiz Manager",
            url: "/admin/quizzes",
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
        <ChapterSwitcher userRole={userRole} currentChapter={adminChapter} chapters={chapters} />
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
