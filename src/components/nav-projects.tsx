'use client';

import Link from "next/link";
import { type LucideIcon, Globe, FileText, LifeBuoy } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  // If no projects provided, fallback to standard resources
  const items = projects && projects.length > 0 ? projects : [
    {
      name: "Public Home",
      url: "/",
      icon: Globe,
    },
    {
      name: "Hiring Program",
      url: "/apply",
      icon: FileText,
    },
    {
      name: "Support Desk",
      url: "/community",
      icon: LifeBuoy,
    }
  ];

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
