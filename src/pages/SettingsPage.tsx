import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from "@/components/ui/sonner";
import { api } from "@/lib/api-client";
import type { ApiKey, User } from "@shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Palette, PlusCircle, Settings, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
const MotionTabsContent = motion(TabsContent);
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
function ProfileSettings() {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => api<{ items: User[] }>("/api/users?limit=1"),
  });
  const user = userData?.items[0];
  return (
    <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <Input defaultValue={user?.name} className="bg-slate-900 border-slate-700" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input type="email" defaultValue="admin@severkey.com" disabled className="bg-slate-900/50 border-slate-700" />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t border-muted-foreground/30 px-6 py-4">
        <Button className="ml-auto">Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
function ApiKeysSettings() {
  const queryClient = useQueryClient();
  const { data: apiKeysData, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => api<ApiKey[]>("/api/api-keys"),
  });
  const createMutation = useMutation({
    mutationFn: () => api<ApiKey>("/api/api-keys", { method: "POST" }),
    onSuccess: (newKey) => {
      toast.success("API Key generated successfully!");
      queryClient.setQueryData(["api-keys"], (oldData: ApiKey[] | undefined) => [...(oldData || []), newKey]);
    },
    onError: () => toast.error("Failed to generate API key."),
  });
  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard!");
  };
  return (
    <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft">
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Manage your API keys for programmatic access.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key Prefix</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : (
              apiKeysData?.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-mono text-sm">{apiKey.key.substring(0, 12)}...</TableCell>
                  <TableCell>{format(new Date(apiKey.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(apiKey.key)}><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="border-t border-muted-foreground/30 px-6 py-4">
        <Button className="ml-auto" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Generate New Key
        </Button>
      </CardFooter>
    </Card>
  );
}
export function SettingsPage() {
  return (
    <AppLayout container={false} className="bg-[#081028]">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Settings className="h-8 w-8 text-slate-400" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">Manage your account and application settings.</p>
            </header>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/40 border border-muted-foreground/30 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                <TabsTrigger value="branding" disabled>Branding</TabsTrigger>
                <TabsTrigger value="team" disabled>Team</TabsTrigger>
              </TabsList>
              <MotionTabsContent value="profile" variants={tabContentVariants} initial="hidden" animate="visible">
                <ProfileSettings />
              </MotionTabsContent>
              <MotionTabsContent value="api-keys" variants={tabContentVariants} initial="hidden" animate="visible">
                <ApiKeysSettings />
              </MotionTabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton theme="dark" />
    </AppLayout>
  );
}
export default SettingsPage;