import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Box,
  KeyRound,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Activity,
} from "lucide-react";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { LicenseTable } from "@/components/Dashboard/LicenseTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { User } from "@shared/types";
const stats = [
  { label: "Products", value: "12", icon: <Box className="h-5 w-5" />, delta: "+2 this month" },
  { label: "Licenses", value: "1,204", icon: <KeyRound className="h-5 w-5" />, delta: "+150 this month" },
  { label: "Active", value: "1,150", icon: <CheckCircle className="h-5 w-5" />, delta: "+5.2%", deltaColor: "text-green-500" },
  { label: "Expired", value: "50", icon: <XCircle className="h-5 w-5" />, delta: "-1.2%", deltaColor: "text-red-500" },
  { label: "Banned", value: "4", icon: <AlertTriangle className="h-5 w-5" /> },
  { label: "Devices", value: "2,350", icon: <Users className="h-5 w-5" /> },
];
const recentActivity = [
    { user: "Alex", action: "created a new license for 'Pro Plan'", time: "2m ago" },
    { user: "Jordan", action: "banned license key ending in ...4f3a", time: "1h ago" },
    { user: "Taylor", action: "updated the 'Enterprise' product", time: "3h ago" },
    { user: "Casey", action: "revoked 3 licenses", time: "1d ago" },
];
function RecentActivityCard() {
    return (
        <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl h-full">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://i.pravatar.cc/40?u=${activity.user}`} />
                                <AvatarFallback>{activity.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm">
                                    <span className="font-semibold text-foreground">{activity.user}</span>
                                    <span className="text-muted-foreground"> {activity.action}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<{ items: User[] }>("/api/users"),
  });
  const user = data?.items?.[0];
  return (
    <AppLayout container={false} className="bg-[#081028]">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {isLoading ? <div className="inline-block h-8 w-32 bg-slate-700 rounded animate-pulse" /> : user?.name || "Admin"}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's a snapshot of your products and licenses.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white">
                  <Box className="mr-2 h-4 w-4" />
                  New Product
                </Button>
                <Button className="bg-gradient-to-r from-[#FF7A18] to-[#0FB4D4] text-white hover:opacity-90 transition-opacity">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create License
                </Button>
                <ThemeToggle className="relative top-0 right-0" />
              </div>
            </header>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  delta={stat.delta}
                  deltaColor={stat.deltaColor as any}
                  isLoading={isLoading}
                />
              ))}
            </div>
            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <LicenseTable />
              </div>
              <div>
                <RecentActivityCard />
              </div>
            </div>
            {/* Quick Actions */}
            <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto">
                      <KeyRound className="mr-3 h-5 w-5 text-[#0FB4D4]" />
                      <div className="text-left">
                          <p className="font-semibold">Generate Key</p>
                          <p className="text-xs text-muted-foreground">Create a new license</p>
                      </div>
                  </Button>
                  <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto">
                      <Box className="mr-3 h-5 w-5 text-[#FF7A18]" />
                      <div className="text-left">
                          <p className="font-semibold">New Product</p>
                          <p className="text-xs text-muted-foreground">Add a new product</p>
                      </div>
                  </Button>
                  <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto">
                      <Users className="mr-3 h-5 w-5 text-slate-400" />
                      <div className="text-left">
                          <p className="font-semibold">Manage Users</p>
                          <p className="text-xs text-muted-foreground">Add or remove users</p>
                      </div>
                  </Button>
                  <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto">
                      <Activity className="mr-3 h-5 w-5 text-slate-400" />
                      <div className="text-left">
                          <p className="font-semibold">View Logs</p>
                          <p className="text-xs text-muted-foreground">Check activity logs</p>
                      </div>
                  </Button>
              </CardContent>
            </Card>
            <footer className="mt-12 text-center text-muted-foreground/60 text-sm">
                <p>Built with ❤️ at Cloudflare</p>
            </footer>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton theme="dark" />
    </AppLayout>
  );
}