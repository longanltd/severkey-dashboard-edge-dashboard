import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  delta?: string;
  deltaColor?: "text-green-500" | "text-red-500";
  isLoading?: boolean;
}
const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -4, transition: { type: "spring", stiffness: 300 } },
};
export function StatsCard({ label, value, icon, delta, deltaColor, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }
  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
      <Card className="bg-muted/40 backdrop-blur-sm border-muted-foreground/30 shadow-soft rounded-2xl transition-all duration-300 hover:border-muted-foreground/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {delta && <p className={cn("text-xs text-muted-foreground", deltaColor)}>{delta}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}