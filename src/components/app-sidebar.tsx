import {
  LayoutDashboard,
  Box,
  KeyRound,
  Settings,
  LifeBuoy,
  LogOut,
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { CreateLicenseSheet } from "./CreateLicenseSheet";
const navItems = [
  { to: "/", icon: <LayoutDashboard />, label: "Dashboard" },
  { to: "/products", icon: <Box />, label: "Products" },
  { to: "/licenses", icon: <KeyRound />, label: "Licenses" },
];
const bottomNavItems = [
  { to: "#", icon: <Settings />, label: "Settings" },
  { to: "#", icon: <LifeBuoy />, label: "Support" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
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
                  isActive={location.pathname === item.to}
                  className="data-[active=true]:bg-slate-800 data-[active=true]:text-white hover:bg-slate-800/50 hover:text-white"
                >
                  <Link to={item.to}>
                    {item.icon} <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
        <div>
          <div className="px-4 mb-4">
            <CreateLicenseSheet />
          </div>
          <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild className="hover:bg-slate-800/50 hover:text-white">
                  <Link to={item.to}>
                    {item.icon} <span>{item.label}</span>
                  </Link>
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
              <AvatarFallback>AD</AvatarFallback>
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