import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Ban, FileDown, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
interface BulkActionsProps {
  selectedIds: string[];
  onComplete: () => void;
}
export function BulkActions({ selectedIds, onComplete }: BulkActionsProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => api("/api/licenses/deleteMany", { method: "POST", body: JSON.stringify({ ids }) }),
    onSuccess: () => {
      toast.success(`${selectedIds.length} license(s) deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      onComplete();
    },
    onError: (error) => {
      toast.error(`Failed to delete licenses: ${error.message}`);
    },
  });
  const revokeMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => api(`/api/licenses/${id}/revoke`, { method: "POST" }))),
    onSuccess: () => {
      toast.success(`${selectedIds.length} license(s) revoked successfully.`);
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      onComplete();
    },
    onError: (error) => {
      toast.error(`Failed to revoke licenses: ${error.message}`);
    },
  });
  const handleExport = () => {
    toast.info("Export functionality is not yet implemented.");
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between"
    >
      <p className="text-sm font-medium text-white">
        {selectedIds.length} item(s) selected
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="bg-transparent text-white border-slate-600 hover:bg-slate-700" onClick={() => revokeMutation.mutate(selectedIds)}>
          <Ban className="mr-2 h-4 w-4" /> Revoke
        </Button>
        <Button variant="outline" size="sm" className="bg-transparent text-white border-slate-600 hover:bg-slate-700" onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(selectedIds)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onComplete}>
            <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}