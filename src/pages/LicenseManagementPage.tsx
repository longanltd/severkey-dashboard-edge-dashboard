import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { License, Product } from "@shared/types";
import { KeyRound, Search, Copy, MoreVertical, Trash2, Ban, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { BulkActions } from "@/components/BulkActions";
import { CreateLicenseSheet } from "@/components/CreateLicenseSheet";
const STATUS_MAP: { [key in License['status']]: { text: string; className: string } } = {
  active: { text: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  expired: { text: "Expired", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  banned: { text: "Banned", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};
function LicenseManagementPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: licensesData, isLoading: isLoadingLicenses } = useQuery({
    queryKey: ["licenses"],
    queryFn: () => api<{ items: License[] }>("/api/licenses"),
  });
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => api<{ items: Product[] }>("/api/products"),
  });
  const productsMap = useMemo(() => {
    return new Map(productsData?.items.map(p => [p.id, p.name]));
  }, [productsData]);
  const filteredLicenses = licensesData?.items.filter(l =>
    l.key.toLowerCase().includes(search.toLowerCase()) ||
    productsMap.get(l.productId)?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(filteredLicenses.map(l => l.id)));
    } else {
      setSelected(new Set());
    }
  };
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelected(newSelected);
  };
  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("License key copied to clipboard!");
  };
  const renderSkeleton = () => (
    [...Array(10)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
      </TableRow>
    ))
  );
  return (
    <AppLayout container={false} className="bg-[#081028]">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <KeyRound className="h-8 w-8 text-[#0FB4D4]" />
                  License Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  View, create, and manage all your licenses.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search licenses..." 
                        className="pl-9 bg-muted/40 border-muted-foreground/30 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <CreateLicenseSheet />
              </div>
            </header>
            {selected.size > 0 && <BulkActions selectedIds={Array.from(selected)} onComplete={() => setSelected(new Set())} />}
            <div className="rounded-2xl border border-muted-foreground/30 bg-muted/40 backdrop-blur-sm shadow-soft overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} /></TableHead>
                    <TableHead>License Key</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLicenses || isLoadingProducts ? renderSkeleton() :
                   filteredLicenses.map(license => {
                    const status = STATUS_MAP[license.status];
                    return (
                      <TableRow key={license.id}>
                        <TableCell><Checkbox checked={selected.has(license.id)} onCheckedChange={(checked) => handleSelectRow(license.id, !!checked)} /></TableCell>
                        <TableCell className="font-mono text-xs">{license.key}</TableCell>
                        <TableCell>{productsMap.get(license.productId) ?? 'Unknown Product'}</TableCell>
                        <TableCell><Badge variant="outline" className={status.className}>{status.text}</Badge></TableCell>
                        <TableCell>{license.expiresAt ? format(new Date(license.expiresAt), 'MMM d, yyyy') : 'Never'}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(license.createdAt), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleCopy(license.key)}><Copy className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                   })
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton theme="dark" />
    </AppLayout>
  );
}
export default LicenseManagementPage;