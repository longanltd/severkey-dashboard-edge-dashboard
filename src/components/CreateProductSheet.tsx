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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle } from "lucide-react";
import type { Product } from "@shared/types";
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
});
type ProductFormValues = z.infer<typeof productSchema>;
export function CreateProductSheet() {
  const queryClient = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0 },
  });
  const mutation = useMutation({
    mutationFn: (newProduct: Omit<Product, 'id' | 'createdAt'>) => {
      return api<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
      });
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      form.reset();
      // Ideally, we'd close the sheet here. This requires controlling open state from parent.
      // For simplicity, we'll rely on SheetClose or manual close.
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
  function onSubmit(values: ProductFormValues) {
    mutation.mutate({ ...values, price: values.price * 100 });
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-gradient-to-r from-[#FF7A18] to-[#0FB4D4] text-white hover:opacity-90 transition-opacity">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-[#081028] border-slate-800 text-slate-300">
        <SheetHeader>
          <SheetTitle className="text-white">Create New Product</SheetTitle>
          <SheetDescription>
            Add a new product to your catalog. This will be available for license generation.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pro Plan" {...field} className="bg-slate-900 border-slate-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short description of the product." {...field} className="bg-slate-900 border-slate-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Price (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="29.99" {...field} className="bg-slate-900 border-slate-700 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={mutation.isPending} className="bg-gradient-primary text-white">
                {mutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}