'use client';

import {
  ChevronsUpDown,
  LogOut,
  LayoutDashboard,
  Globe
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { logoutAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logoutAction();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    window.location.href = '/login';
  };

  const initials = user.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-zinc-100 border-2 border-black rounded-xl bg-white p-2 hover:bg-zinc-50 transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Avatar className="h-8 w-8 rounded-lg border-2 border-black bg-[#FFE600]">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="rounded-lg bg-[#FFE600] text-black font-black text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-black text-xs uppercase">{user.name}</span>
                <span className="truncate text-[10px] font-mono font-bold text-zinc-500">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-black" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-xl bg-white border-[3px] border-black text-black shadow-[6px_6px_0px_0px_#000000] p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left bg-zinc-50 rounded-lg border-2 border-black mb-1">
                <Avatar className="h-8 w-8 rounded-lg border-2 border-black bg-[#FFE600]">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="rounded-lg bg-[#FFE600] text-black font-black text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black text-black text-xs uppercase">{user.name}</span>
                  <span className="truncate text-[10px] font-mono text-zinc-500 font-bold">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem asChild className="hover:bg-[#4285F4]/20 rounded-lg cursor-pointer border-2 border-transparent hover:border-black font-bold">
                <Link href="/admin" className="w-full flex items-center gap-2 text-xs py-1.5">
                  <LayoutDashboard className="size-4 text-[#4285F4]" />
                  <span>Admin Console</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-[#00FF66]/20 rounded-lg cursor-pointer border-2 border-transparent hover:border-black font-bold">
                <Link href="/" target="_blank" className="w-full flex items-center gap-2 text-xs py-1.5">
                  <Globe className="size-4 text-[#00B347]" />
                  <span>Public Website [↗]</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-black/10 my-1" />
            
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-[#FF0055] hover:bg-[#FF0055]/10 rounded-lg cursor-pointer text-xs font-black py-1.5 border-2 border-transparent hover:border-[#FF0055]"
            >
              <LogOut className="size-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
