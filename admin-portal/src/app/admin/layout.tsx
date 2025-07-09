import AdminNav from '../../components/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cmu-light">
      {/* Sidebar */}
      <aside className="w-64 bg-cmu-red text-cmu-white flex flex-col py-8 px-6 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <svg className="w-8 h-8 text-cmu-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="text-2xl font-extrabold tracking-tight">ML Lab Admin</span>
        </div>
        <nav className="flex-1">
          <AdminNav />
        </nav>
        <div className="mt-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cmu-gray flex items-center justify-center font-bold text-cmu-white">A</div>
          <span className="font-medium">Admin</span>
        </div>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-cmu-white border-b border-cmu-light flex items-center px-8 justify-between shadow-sm">
          <h1 className="text-xl font-bold text-cmu-red tracking-tight">ML Lab Platform</h1>
          <div className="flex items-center gap-4">
            {/* Light/Dark mode toggle placeholder */}
            <button className="w-10 h-10 rounded-full bg-cmu-light hover:bg-cmu-gray flex items-center justify-center transition">
              <svg className="w-6 h-6 text-cmu-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95-7.07l-.71.71M6.34 6.34l-.71-.71" /></svg>
            </button>
            <div className="w-9 h-9 rounded-full bg-cmu-red flex items-center justify-center font-bold text-cmu-white">A</div>
          </div>
        </header>
        <main className="flex-1 p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
