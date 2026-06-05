import Link from "next/link";

export default function DashboardSidebar() {
  return (
    <aside className="w-64 border-r border-gray-800 bg-[#111827] hidden md:flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-indigo-500">
          StreamFlow
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className="block glass px-4 py-3 hover:bg-gray-800 transition"
        >
          Dashboard
        </Link>

        <Link
          href="/meeting"
          className="block glass px-4 py-3 hover:bg-gray-800 transition"
        >
          Meetings
        </Link>

        <Link
          href="/chat"
          className="block glass px-4 py-3 hover:bg-gray-800 transition"
        >
          Chat
        </Link>

        <Link
          href="/settings"
          className="block glass px-4 py-3 hover:bg-gray-800 transition"
        >
          Settings
        </Link>
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800">
        <button className="btn-danger w-full">
          Logout
        </button>
      </div>
    </aside>
  );
}