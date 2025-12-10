import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Product } from "@shared/types";
import { Box, Search, PackagePlus, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { CreateProductSheet } from "@/components/CreateProductSheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { MOCK_LICENSE_TRENDS } from "@shared/mock-data";
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount / 100);
};
function ProductCard({ product }: { product: Product }) {
  const mockSalesData = useMemo(() => MOCK_LICENSE_TRENDS.map(d => ({...d, sales: d.active})).slice(0, 10), []);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-white">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <p className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#FF7A18] to-[#0FB4D4]">
            {formatCurrency(product.price)}
          </p>
          <div className="h-16 -mx-6 -mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSalesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A18" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF7A18" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="sales" stroke="#FF7A18" strokeWidth={2} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [priceRange, setPriceRange] = useState([0, 500]);
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api<{ items: Product[] }>("/api/products"),
  });
  const filteredProducts = useMemo(() => {
    return data?.items.filter(p => {
      const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
      const priceMatch = p.price / 100 >= priceRange[0] && p.price / 100 <= priceRange[1];
      const dateMatch = !dateRange || (
        (!dateRange.from || p.createdAt >= dateRange.from.getTime()) &&
        (!dateRange.to || p.createdAt <= dateRange.to.getTime())
      );
      return searchMatch && priceMatch && dateMatch;
    }) ?? [];
  }, [data, search, priceRange, dateRange]);
  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <Card key={i} className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl">
        <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full mt-2" /><Skeleton className="h-4 w-1/2 mt-1" /></CardHeader>
        <CardContent><Skeleton className="h-8 w-1/3" /></CardContent>
        <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
      </Card>
    ))
  );
  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-muted/20 border-2 border-dashed border-muted-foreground/30">
        <img src="https://images.unsplash.com/photo-1579226905180-636b76d96082?q=80&w=600&auto=format&fit=crop" alt="Empty products" className="w-32 h-32 rounded-full object-cover mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-white">No Products Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">Try adjusting your filters or create a new product.</p>
        <CreateProductSheet />
    </div>
  );
  return (
    <AppLayout container={false} className="bg-[#081028]">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Box className="h-8 w-8 text-[#FF7A18]" />Products</h1>
                <p className="text-muted-foreground mt-1">Manage your products and their pricing.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto"><CreateProductSheet /></div>
            </header>
            <div className="mb-8 p-4 rounded-2xl border border-muted-foreground/30 bg-muted/20 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-9 bg-muted/40 border-muted-foreground/30 text-white" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal bg-muted/40 border-muted-foreground/30 text-white hover:bg-muted/60" aria-describedby="date-range-description">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Pick a date range</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start"><Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
                </Popover>
                <div className="w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground" id="price-range-label"><span>Price: {formatCurrency(priceRange[0]*100)}</span><span>{formatCurrency(priceRange[1]*100)}</span></div>
                    <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="[&>span:first-child]:h-1" aria-labelledby="price-range-label" />
                </div>
                <ExportCSVButton data={filteredProducts} filename="products.csv" className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? renderSkeleton() : filteredProducts.length > 0 ? filteredProducts.map(product => <ProductCard key={product.id} product={product} />) : renderEmptyState()}
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton theme="dark" />
    </AppLayout>
  );
}
export default ProductsPage;