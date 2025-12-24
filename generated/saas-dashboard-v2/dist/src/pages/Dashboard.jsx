import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{trend}</p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-400">Overview of your system status.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="$45,231.89" icon={DollarSign} trend="+20.1% from last month" />
        <StatCard title="Active Users" value="2,350" icon={Users} trend="+180.1% from last month" />
        <StatCard title="Sales" value="+12,234" icon={TrendingUp} trend="+19% from last month" />
        <StatCard title="Active Now" value="573" icon={Activity} trend="+201 since last hour" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="font-semibold mb-4">Overview</h3>
          <div className="h-[200px] flex items-center justify-center text-gray-500 border border-dashed border-gray-700 rounded">
            Chart Component Placeholder
          </div>
        </div>
        <div className="col-span-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="font-semibold mb-4">Recent Sales</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
               <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center">SD</div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">User {i}</p>
                    <p className="text-xs text-gray-500">user{i}@example.com</p>
                  </div>
                  <div className="ml-auto font-medium">+$1,999.00</div>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}