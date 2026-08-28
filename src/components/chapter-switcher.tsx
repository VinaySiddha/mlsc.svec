'use client';

import * as React from "react";
import { ChevronsUpDown, Layers, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { setAdminChapterAction } from "@/app/actions/settings-actions";
import { useToast } from "@/hooks/use-toast";

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

export function ChapterSwitcher({
  userRole,
  currentChapter,
  chapters = ['3.0', '4.0']
}: {
  userRole: string;
  currentChapter: string;
  chapters?: string[];
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();

  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

  const chaptersList = chapters.map(chap => ({
    name: `Chapter ${chap}`,
    plan: chap === currentChapter ? "Active Workspace" : "Switch Chapter",
    value: chap
  }));

  const activeChapter = chaptersList.find(c => c.value === currentChapter) || {
    name: `Chapter ${currentChapter}`,
    plan: "Active Workspace",
    value: currentChapter
  };

  const handleChapterChange = async (chapterValue: string) => {
    try {
      await setAdminChapterAction(chapterValue);
      toast({
        title: "Chapter Switched",
        description: `Now viewing resources for Chapter ${chapterValue}`,
      });
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Switch Failed",
        description: "Could not switch chapter.",
      });
    }
  };

  if (!isSuperAdmin) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="hover:bg-zinc-100 cursor-default border-2 border-black rounded-xl bg-white p-2 shadow-[2px_2px_0px_0px_#000000]">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#FFE600] text-black border-2 border-black">
              <Layers className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-black text-black text-xs uppercase">{activeChapter.name}</span>
              <span className="text-[10px] text-zinc-600 font-mono font-bold uppercase tracking-wider">Active View</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#FFE600]/30 border-2 border-black rounded-xl bg-white p-2 hover:bg-yellow-50 transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#FFE600] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]">
                <Layers className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-black text-xs uppercase">{activeChapter.name}</span>
                <span className="truncate text-[10px] font-mono font-bold text-zinc-500">{activeChapter.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-black" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-xl bg-white border-[3px] border-black text-black shadow-[6px_6px_0px_0px_#000000] p-1.5"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-[10px] font-mono uppercase font-black tracking-wider text-zinc-500 px-2.5 py-1.5 border-b-2 border-black/10">
              Select Club Chapter
            </DropdownMenuLabel>
            {chaptersList.map((chap) => (
              <DropdownMenuItem
                key={chap.value}
                onClick={() => handleChapterChange(chap.value)}
                className="gap-2.5 p-2 rounded-lg hover:bg-[#FFE600]/30 text-black cursor-pointer transition-colors border-2 border-transparent hover:border-black font-semibold mt-1"
              >
                <div className="flex size-6 items-center justify-center rounded-md border-2 border-black bg-[#FFE600]">
                  <Layers className="size-3.5 text-black" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-black block uppercase">{chap.name}</span>
                </div>
                {chap.value === currentChapter && (
                  <Check className="size-4 text-black font-black" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
