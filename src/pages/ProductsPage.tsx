import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Product } from "@shared/types";
import { Box, PlusCircle, Search, PackagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { CreateProductSheet } from "@/components/CreateProductSheet";
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
};
function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-white">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#FF7A18] to-[#0FB4D4]">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white">
            Edit Product
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api<{ items: Product[] }>("/api/products"),
  });
  const filteredProducts = data?.items.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];
  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <Card key={i} className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))
  );
  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-muted/20 border-2 border-dashed border-muted-foreground/30">
        <PackagePlus className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold text-white">No Products Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">
            It looks like you haven't added any products yet.
        </p>
        <CreateProductSheet />
    </div>
  );
  return (
    <AppLayout container={false} className="bg-[#081028]">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Box className="h-8 w-8 text-[#FF7A18]" />
                  Products
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your products and their pricing.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search products..." 
                        className="pl-9 bg-muted/40 border-muted-foreground/30 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <CreateProductSheet />
              </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? renderSkeleton() : 
               filteredProducts.length > 0 ? filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              )) : renderEmptyState()}
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton theme="dark" />
    </AppLayout>
  );
}
export default ProductsPage;