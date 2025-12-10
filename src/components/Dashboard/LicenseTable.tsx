import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { Chat } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { Copy, MoreVertical, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
const STATUS_MAP: { [key: number]: { text: string; className: string } } = {
  0: { text: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  1: { text: "Expired", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  2: { text: "Banned", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};
export function LicenseTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["licenses"],
    queryFn: () => api<{ items: Chat[] }>("/api/chats?limit=5"),
  });
  const licenses = data?.items ?? [];
  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("License key copied to clipboard!");
  };
  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  );
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={5} className="h-48 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <FilePlus2 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No licenses found</h3>
          <p className="text-sm text-muted-foreground">Create your first license to get started.</p>
          <Button className="bg-gradient-to-r from-[#FF7A18] to-[#0FB4D4] text-white">Create License</Button>
        </div>
      </TableCell>
    </TableRow>
  );
  return (
    <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl h-full">
      <CardHeader>
        <CardTitle>Recent Licenses</CardTitle>
        <CardDescription>A list of the most recently created licenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Key</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? renderSkeleton() :
             !licenses || licenses.length === 0 ? renderEmptyState() :
             licenses.map((license, index) => {
                const status = STATUS_MAP[index % 3];
                return (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-xs">{license.id.substring(0, 16)}...</TableCell>
                    <TableCell>{license.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>{status.text}</Badge>
                    </TableCell>
                    <TableCell>2 days ago</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(license.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
             })
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}