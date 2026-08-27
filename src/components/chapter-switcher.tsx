'use client';

import * as React from "react";
import { ChevronsUpDown, FolderGit2 } from "lucide-react";
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

  const isSuperAdmin = userRole === 'super_admin';

  const chaptersList = chapters.map(chap => ({
    name: `Chapter ${chap}`,
    plan: chap === currentChapter ? "Active View" : "Change View",
    value: chap
  }));

  const activeChapter = chaptersList.find(c => c.value === currentChapter) || {
    name: `Chapter ${currentChapter}`,
    plan: "Active View",
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
          <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <FolderGit2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeChapter.name}</span>
              <span className="text-xs text-slate-500 uppercase font-black tracking-widest text-[9px] mt-0.5">Chapter View</span>
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FolderGit2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeChapter.name}</span>
                <span className="truncate text-xs">{activeChapter.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2.5 py-1.5">
              Select Club Chapter
            </DropdownMenuLabel>
            {chaptersList.map((chap) => (
              <DropdownMenuItem
                key={chap.value}
                onClick={() => handleChapterChange(chap.value)}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <FolderGit2 className="size-3.5 shrink-0" />
                </div>
                <span className="text-xs font-medium">{chap.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
