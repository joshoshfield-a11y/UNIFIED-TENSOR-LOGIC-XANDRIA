export default function Settings() {
  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-400">Manage your account settings and preferences.</p>
      </div>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <form className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <input className="flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" placeholder="Enter name" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input className="flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" placeholder="Enter email" />
            </div>
            <button type="button" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 h-10 px-4 py-2">
                Save Changes
            </button>
        </form>
      </div>
    </div>
  );
}