'use client';

import * as React from "react";
import { ChevronsUpDown, Shield, Bot, BarChart3, Cloud, Code2, Calendar, Megaphone, Share2, Paintbrush, Check } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
      plan: "All Wings Roster",
      value: "all"
    },
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

  const filteredDomains = domains;
  const currentDomainValue = panelDomain || 'all';
  const activeDomain = filteredDomains.find(d => d.value === currentDomainValue) || filteredDomains[0] || domains[0];

  const handleDomainChange = (domainValue: string) => {
    if (pathname.includes('/admin/applications') || pathname.includes('/admin/analytics')) {
      const params = new URLSearchParams(searchParams.toString());
      if (domainValue === 'all') {
        params.delete('domain');
      } else {
        params.set('domain', domainValue);
      }
      router.push(pathname + '?' + params.toString());
    } else {
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
              className="data-[state=open]:bg-[#4285F4]/20 border-2 border-black rounded-xl bg-white p-2 hover:bg-blue-50 transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#4285F4] text-white border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                <activeDomain.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-black text-xs uppercase">{activeDomain.name}</span>
                <span className="truncate text-[10px] font-mono font-bold text-zinc-500">{activeDomain.plan}</span>
              </div>
              {canSwitch && <ChevronsUpDown className="ml-auto size-4 text-black" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {canSwitch && (
            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-xl bg-white border-[3px] border-black text-black shadow-[6px_6px_0px_0px_#000000] p-1.5"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={6}
            >
              <DropdownMenuLabel className="text-[10px] font-mono uppercase font-black tracking-wider text-zinc-500 px-2.5 py-1.5 border-b-2 border-black/10">
                Filter Domain Panel
              </DropdownMenuLabel>
              {filteredDomains.map((domain) => (
                <DropdownMenuItem
                  key={domain.name}
                  onClick={() => handleDomainChange(domain.value)}
                  className="gap-2.5 p-2 rounded-lg hover:bg-[#4285F4]/20 text-black cursor-pointer transition-colors border-2 border-transparent hover:border-black font-semibold mt-1"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border-2 border-black bg-[#4285F4] text-white">
                    <domain.logo className="size-3.5" />
                  </div>
                  <span className="text-xs font-black flex-1 uppercase">{domain.name}</span>
                  {domain.value === currentDomainValue && (
                    <Check className="size-4 text-black font-black" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
