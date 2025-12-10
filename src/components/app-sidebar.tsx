import {
  LayoutDashboard,
  Box,
  KeyRound,
  PlusCircle,
  Settings,
  LifeBuoy,
  LogOut,
  UserCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
const navItems = [
  { href: "#", icon: <LayoutDashboard />, label: "Dashboard", active: true },
  { href: "#", icon: <Box />, label: "Products" },
  { href: "#", icon: <KeyRound />, label: "License Management" },
];
const bottomNavItems = [
  { href: "#", icon: <Settings />, label: "Settings" },
  { href: "#", icon: <LifeBuoy />, label: "Support" },
];
export function AppSidebar(): JSX.Element {
  return (
    <Sidebar className="bg-[#081028] border-r border-slate-800 text-slate-300">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7A18] to-[#0FB4D4]" />
          <span className="text-lg font-display font-semibold text-white">SeverKey</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <div className="flex-grow">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={item.active}
                  className="data-[active=true]:bg-slate-800 data-[active=true]:text-white hover:bg-slate-800/50 hover:text-white"
                >
                  <a href={item.href}>
                    {item.icon} <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
        <div>
          <div className="px-4 mb-4">
            <Button className="w-full bg-gradient-to-r from-[#FF7A18] to-[#0FB4D4] text-white hover:opacity-90 transition-opacity">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create License
            </Button>
          </div>
          <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild className="hover:bg-slate-800/50 hover:text-white">
                  <a href={item.href}>
                    {item.icon} <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="bg-slate-700" />
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Admin</span>
              <span className="text-xs text-slate-400">admin@severkey.com</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}