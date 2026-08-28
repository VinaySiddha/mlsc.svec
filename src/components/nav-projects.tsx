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
      <SidebarGroupLabel className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500 px-3 mb-1">
        External Portals
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1 px-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton 
              asChild
              className="rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-700 hover:text-black hover:bg-zinc-100 border-2 border-transparent hover:border-black transition-all"
            >
              <Link href={item.url} target={item.url.startsWith('/') && item.url !== '/' ? undefined : '_blank'}>
                <item.icon className="size-4 shrink-0 text-zinc-600" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
