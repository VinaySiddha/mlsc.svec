'use client';

import * as React from "react";
import { ChevronsUpDown, Shield, Bot, BarChart3, Cloud, Code2, Calendar, Megaphone, Share2, Paintbrush } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  userRole,
  panelDomain
}: {
  userRole: string;
  panelDomain?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile } = useSidebar();

  const domains = [
    {
      name: "All Domains",
      logo: Shield,
      plan: "Chapter Admin View",
      value: "all"
    },
    // Technical Wings
    {
      name: "Generative AI",
      logo: Bot,
      plan: "Gen AI Panel",
      value: "gen_ai"
    },
    {
      name: "Data Science & ML",
      logo: BarChart3,
      plan: "DS & ML Panel",
      value: "ds_ml"
    },
    {
      name: "Azure Cloud",
      logo: Cloud,
      plan: "Cloud Panel",
      value: "azure"
    },
    {
      name: "Web & App Dev",
      logo: Code2,
      plan: "Web & App Panel",
      value: "web_app"
    },
    // Non-Technical Wings
    {
      name: "Event Management",
      logo: Calendar,
      plan: "Events Panel",
      value: "event_management"
    },
    {
      name: "Public Relations",
      logo: Megaphone,
      plan: "PR Panel",
      value: "public_relations"
    },
    {
      name: "Media & Marketing",
      logo: Share2,
      plan: "Media Panel",
      value: "media_marketing"
    },
    {
      name: "Creativity",
      logo: Paintbrush,
      plan: "Creativity Panel",
      value: "creativity"
    }
  ];

  const canSwitch = userRole === 'admin' || userRole === 'super_admin' || userRole === 'panel' || userRole === 'common_panel';

  // Everyone can see and switch domains
  const filteredDomains = domains;

  // Find currently active domain item
  const currentDomainValue = panelDomain || 'all';
  const activeDomain = filteredDomains.find(d => d.value === currentDomainValue) || filteredDomains[0] || domains[0];

  const handleDomainChange = (domainValue: string) => {
    // When switching domains, if we are on the applications page, update the domain query parameter
    if (pathname.includes('/admin/applications') || pathname.includes('/admin/analytics')) {
      const params = new URLSearchParams(searchParams.toString());
      if (domainValue === 'all') {
        params.delete('domain');
      } else {
        params.set('domain', domainValue);
      }
      router.push(pathname + '?' + params.toString());
    } else {
      // Otherwise, redirect to dashboard with search param or navigate
      if (domainValue === 'all') {
        router.push('/admin');
      } else {
        router.push(`/admin/applications?domain=${domainValue}`);
      }
    }
  };

  if (filteredDomains.length === 0) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeDomain.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeDomain.name}</span>
                <span className="truncate text-xs">{activeDomain.plan}</span>
              </div>
              {canSwitch && <ChevronsUpDown className="ml-auto size-4 text-slate-400" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {canSwitch && (
            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2.5 py-1.5">
                Switch Domains
              </DropdownMenuLabel>
              {filteredDomains.map((domain, index) => (
                <DropdownMenuItem
                  key={domain.name}
                  onClick={() => handleDomainChange(domain.value)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <domain.logo className="size-3.5 shrink-0" />
                  </div>
                  <span className="text-xs font-medium">{domain.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
