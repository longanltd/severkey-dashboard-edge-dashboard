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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { User } from "@shared/types";
import { MOCK_LICENSE_TRENDS, MOCK_ACTIVITY_DATA } from "@shared/mock-data";
import { ActivityTimeline } from "@/components/Dashboard/ActivityTimeline";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import { motion } from "framer-motion";
const stats = [
  { label: "Products", value: "12", icon: <Box className="h-5 w-5" />, delta: "+2 this month" },
  { label: "Licenses", value: "1,204", icon: <KeyRound className="h-5 w-5" />, delta: "+150 this month" },
  { label: "Active", value: "1,150", icon: <CheckCircle className="h-5 w-5" />, delta: "+5.2%", deltaColor: "text-green-500" },
  { label: "Expired", value: "50", icon: <XCircle className="h-5 w-5" />, delta: "-1.2%", deltaColor: "text-red-500" },
  { label: "Banned", value: "4", icon: <AlertTriangle className="h-5 w-5" /> },
  { label: "Devices", value: "2,350", icon: <Users className="h-5 w-5" /> },
];
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
function RecentActivityCard() {
    return (
        <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl h-full">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>License creations and revocations over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ActivityTimeline data={MOCK_ACTIVITY_DATA} />
            </CardContent>
        </Card>
    );
}
export function HomePage() {
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<{ items: User[] }>("/api/users"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: licensesData } = useQuery({
    queryKey: ["licenses"],
    queryFn: () => api<{ items: any[] }>("/api/licenses"),
    staleTime: 5 * 60 * 1000,
  });
  const user = userData?.items?.[0];
  return (
    <AppLayout container={false} className="bg-[#081028]">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {isLoadingUser ? <div className="inline-block h-8 w-32 bg-slate-700 rounded animate-pulse" /> : user?.name || "Admin"}!
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
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  delta={stat.delta}
                  deltaColor={stat.deltaColor as any}
                  isLoading={isLoadingUser}
                  chartData={MOCK_LICENSE_TRENDS}
                />
              ))}
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <LicenseTable />
              </div>
              <div>
                <RecentActivityCard />
              </div>
            </div>
            <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto" aria-label="Generate a new license key">
                      <KeyRound className="mr-3 h-5 w-5 text-[#0FB4D4]" />
                      <div className="text-left">
                          <p className="font-semibold">Generate Key</p>
                          <p className="text-xs text-muted-foreground">Create a new license</p>
                      </div>
                  </Button>
                  <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto" aria-label="Add a new product">
                      <Box className="mr-3 h-5 w-5 text-[#FF7A18]" />
                      <div className="text-left">
                          <p className="font-semibold">New Product</p>
                          <p className="text-xs text-muted-foreground">Add a new product</p>
                      </div>
                  </Button>
                  <ExportCSVButton data={licensesData?.items ?? []} filename="licenses_export.csv" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto text-left" />
                  <Button variant="outline" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white justify-start p-4 h-auto" aria-label="View activity logs">
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