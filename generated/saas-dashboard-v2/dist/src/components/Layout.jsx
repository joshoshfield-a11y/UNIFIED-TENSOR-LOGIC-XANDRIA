import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Box, Activity } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const nav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: Activity },
    { name: 'Inventory', path: '/inventory', icon: Box },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="mb-8 flex items-center gap-2 px-2 font-bold text-xl tracking-tight text-[hsl(var(--primary))]">
          <Box className="h-6 w-6" />
          XANDRIA
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--border))] ${location.pathname === item.path ? 'bg-[hsl(var(--border))] text-[hsl(var(--primary))]' : 'text-gray-400'}`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}