'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500 px-3 mb-1">
        Navigation Platform
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1 px-1">
        {items.map((item) => {
          const isExactActive = pathname === item.url;
          const isParentActive = isExactActive || (item.items && item.items.some(sub => pathname === sub.url));
          const hasChildren = item.items && item.items.length > 0;

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  className={cn(
                    "rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                    isExactActive 
                      ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-yellow-300 font-black" 
                      : "text-zinc-800 hover:bg-zinc-100 hover:text-black border-2 border-transparent hover:border-black"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-2.5 px-3 py-2">
                    {item.icon && <item.icon className={cn("size-4 shrink-0", isExactActive ? "text-black" : "text-zinc-600")} />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={cn(
                      "rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                      isParentActive 
                        ? "bg-zinc-100 text-black border-2 border-black font-black" 
                        : "text-zinc-800 hover:bg-zinc-100 hover:text-black border-2 border-transparent hover:border-black"
                    )}
                  >
                    {item.icon && <item.icon className="size-4 shrink-0 text-zinc-600" />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 size-4" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="border-l-2 border-black ml-4 my-1 space-y-1 pl-2">
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            className={cn(
                              "rounded-lg text-xs font-bold transition-all px-2.5 py-1.5",
                              isSubActive 
                                ? "bg-[#FFE600] text-black border-2 border-black font-black shadow-[1px_1px_0px_0px_#000000]" 
                                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
                            )}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
