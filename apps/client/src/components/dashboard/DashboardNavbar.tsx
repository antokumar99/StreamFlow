

export default function DashboardNavbar() {
  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111827]">
     

      <div>
        <h2 className="text-xl font-semibold">
          StreamFlow
        </h2>
      </div>

      
      <div className="flex items-center gap-4">
        <button className="glass px-4 py-2">
          Notifications
        </button>

        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
}