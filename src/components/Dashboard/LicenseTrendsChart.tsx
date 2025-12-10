import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
interface LicenseTrendsChartProps {
  data: any[];
  variant?: 'mini' | 'full';
  className?: string;
}
export function LicenseTrendsChart({ data, variant = 'full', className }: LicenseTrendsChartProps) {
  const ChartComponent = variant === 'mini' ? AreaChart : LineChart;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
          {variant === 'full' && <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />}
          {variant === 'full' && <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />}
          {variant === 'full' && <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          />}
          <defs>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0FB4D4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0FB4D4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          {variant === 'mini' ? (
            <Area
              type="monotone"
              dataKey="active"
              stroke="#0FB4D4"
              strokeWidth={2}
              fill="url(#colorActive)"
            />
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="active"
                stroke="#0FB4D4"
                strokeWidth={2}
                dot
              />
              <Line type="monotone" dataKey="expired" stroke="#FF7A18" strokeWidth={2} dot />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </motion.div>
  );
}