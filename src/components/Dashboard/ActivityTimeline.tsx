import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
interface ActivityTimelineProps {
  data: any[];
  className?: string;
}
export function ActivityTimeline({ data, className }: ActivityTimelineProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="creates" stackId="a" fill="#0FB4D4" name="Creates" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revokes" stackId="a" fill="#FF7A18" name="Revokes" />
          <Bar dataKey="updates" stackId="a" fill="hsl(var(--muted-foreground))" name="Updates" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}