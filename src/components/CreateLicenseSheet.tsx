import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PlusCircle, CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Product, License } from "@shared/types";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
const fieldVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};
export function CreateLicenseSheet() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => api<{ items: Product[] }>("/api/products"),
  });
  const mutation = useMutation({
    mutationFn: (newLicense: Partial<License>) => {
      return api<License>("/api/licenses", {
        method: "POST",
        body: JSON.stringify(newLicense),
      });
    },
    onSuccess: () => {
      toast.success("License created successfully!");
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["licensesInfinite"] });
      setSelectedProduct(null);
      setExpiresAt(undefined);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create license: ${error.message}`);
    },
  });
  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }
    mutation.mutate({
      productId: selectedProduct.id,
      expiresAt: expiresAt ? expiresAt.getTime() : null,
    });
  };
  const progressValue = selectedProduct ? 50 : 0;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-[#FF7A18] to-[#0FB4D4] text-white hover:opacity-90 transition-opacity">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create License
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-[#081028] border-slate-800 text-slate-300">
        <SheetHeader>
          <SheetTitle className="text-white">Create New License</SheetTitle>
          <SheetDescription>
            Generate a new license key for a product.
          </SheetDescription>
        </SheetHeader>
        <Progress value={progressValue} className="w-full my-4 h-1 bg-slate-700" />
        <div className="space-y-8 py-4">
          <motion.div variants={fieldVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-2">
            <label className="text-sm font-medium text-white">Product</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-slate-900 border-slate-700 text-white hover:bg-slate-800 hover:text-white"
                >
                  {selectedProduct ? selectedProduct.name : "Select product..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search product..." />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {productsData?.items.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.name}
                          onSelect={() => {
                            setSelectedProduct(product);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedProduct?.id === product.id ? "opacity-100" : "opacity-0")} />
                          {product.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </motion.div>
          <motion.div variants={fieldVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-2">
            <label className="text-sm font-medium text-white">Expiration Date (Optional)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-white hover:bg-slate-800 hover:text-white",
                    !expiresAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={setExpiresAt}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSubmit} disabled={mutation.isPending || !selectedProduct} className="bg-gradient-primary text-white">
            {mutation.isPending ? "Generating..." : "Generate License"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}