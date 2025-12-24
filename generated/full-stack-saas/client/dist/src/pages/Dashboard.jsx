import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

function StatCard({ title, value, icon: Icon, trend, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }} 
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm"
    >
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
      </div>
      <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{trend}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-400">Real-time overview of your system status.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="$45,231.89" icon={DollarSign} trend="+20.1% from last month" delay={0.1} />
        <StatCard title="Active Users" value="2,350" icon={Users} trend="+180.1% from last month" delay={0.2} />
        <StatCard title="Sales" value="+12,234" icon={TrendingUp} trend="+19% from last month" delay={0.3} />
        <StatCard title="Active Now" value="573" icon={Activity} trend="+201 since last hour" delay={0.4} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.5 }}
          className="col-span-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
        >
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `$${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} 
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.6 }}
          className="col-span-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
        >
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-6">
            {[1,2,3,4,5].map((i, idx) => (
               <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-[hsl(var(--border))] flex items-center justify-center text-xs font-medium">
                    U{i}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">User {i} purchased Plan Pro</p>
                    <p className="text-xs text-gray-500">{idx * 5 + 2} minutes ago</p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-[hsl(var(--primary))]">+$99.00</div>
               </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}