import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { License, Product, LicenseStatus } from "@shared/types";
import { KeyRound, Search, Copy, MoreVertical, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { BulkActions } from "@/components/BulkActions";
import { CreateLicenseSheet } from "@/components/CreateLicenseSheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { ExportCSVButton } from "@/components/ExportCSVButton";
const STATUS_MAP: { [key in License['status']]: { text: string; className: string } } = {
  active: { text: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  expired: { text: "Expired", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  banned: { text: "Banned", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};
function LicenseManagementPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<LicenseStatus>>(new Set());
  const { data: licensesData, isLoading: isLoadingLicenses, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["licensesInfinite"],
    queryFn: ({ pageParam }) => api<{ items: License[]; next: string | null }>(`/api/licenses?cursor=${pageParam || ''}&limit=50`),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next,
  });
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => api<{ items: Product[] }>("/api/products"),
  });
  const productsMap = useMemo(() => new Map(productsData?.items.map(p => [p.id, p.name])), [productsData]);
  const allLicenses = useMemo(() => licensesData?.pages.flatMap(page => page.items) ?? [], [licensesData]);
  const filteredLicenses = useMemo(() => {
    return allLicenses.filter(l => {
      const searchMatch = l.key.toLowerCase().includes(search.toLowerCase()) || productsMap.get(l.productId)?.toLowerCase().includes(search.toLowerCase());
      const statusMatch = statusFilters.size === 0 || statusFilters.has(l.status);
      return searchMatch && statusMatch;
    });
  }, [allLicenses, search, statusFilters, productsMap]);
  const handleSelectAll = (checked: boolean) => setSelected(checked ? new Set(filteredLicenses.map(l => l.id)) : new Set());
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) newSelected.add(id); else newSelected.delete(id);
    setSelected(newSelected);
  };
  const handleCopy = (key: string) => { navigator.clipboard.writeText(key); toast.success("License key copied!"); };
  const toggleStatusFilter = (status: LicenseStatus) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) newFilters.delete(status); else newFilters.add(status);
    setStatusFilters(newFilters);
  };
  const renderSkeleton = () => [...Array(10)].map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-5 w-5" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
    </TableRow>
  ));
  return (
    <AppLayout container={false} className="bg-[#081028]">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3"><KeyRound className="h-8 w-8 text-[#0FB4D4]" />License Management</h1>
                <p className="text-muted-foreground mt-1">View, create, and manage all your licenses.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto"><CreateLicenseSheet /></div>
            </header>
            <div className="mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between gap-2">
                <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search licenses..." className="pl-9 bg-slate-900 border-slate-700 text-white" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" className="bg-slate-900 border-slate-700 text-white"><Filter className="mr-2 h-4 w-4" />Status{statusFilters.size > 0 && ` (${statusFilters.size})`}</Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {Object.keys(STATUS_MAP).map(s => <DropdownMenuCheckboxItem key={s} checked={statusFilters.has(s as LicenseStatus)} onCheckedChange={() => toggleStatusFilter(s as LicenseStatus)}>{STATUS_MAP[s as LicenseStatus].text}</DropdownMenuCheckboxItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>
                <ExportCSVButton data={filteredLicenses} filename="licenses.csv" className="bg-slate-900 border-slate-700 text-white" />
            </div>
            {selected.size > 0 && <BulkActions selectedIds={Array.from(selected)} onComplete={() => setSelected(new Set())} />}
            <div className="rounded-2xl border border-muted-foreground/30 bg-muted/40 backdrop-blur-sm shadow-soft overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} checked={selected.size > 0 && selected.size === filteredLicenses.length && filteredLicenses.length > 0} /></TableHead><TableHead>License Key</TableHead><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead>Expires</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoadingLicenses && allLicenses.length === 0 ? renderSkeleton() : filteredLicenses.map(license => {
                    const status = STATUS_MAP[license.status];
                    return (
                      <motion.tr key={license.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ backgroundColor: 'hsl(var(--muted))' }} className="[&>td]:border-b [&>td]:border-slate-800">
                        <TableCell><Checkbox checked={selected.has(license.id)} onCheckedChange={(checked) => handleSelectRow(license.id, !!checked)} /></TableCell>
                        <TableCell className="font-mono text-xs">{license.key}</TableCell>
                        <TableCell>{productsMap.get(license.productId) ?? 'Unknown'}</TableCell>
                        <TableCell><Badge variant="outline" className={status.className}>{status.text}</Badge></TableCell>
                        <TableCell>{license.expiresAt ? format(new Date(license.expiresAt), 'MMM d, yyyy') : 'Never'}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(license.createdAt), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleCopy(license.key)}><Copy className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="h-10 flex justify-center items-center">
                {hasNextPage && (
                  <Button
                    variant="link"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton theme="dark" />
    </AppLayout>
  );
}
export default LicenseManagementPage;