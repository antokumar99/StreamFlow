export default function QuickActions() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="glass p-6 text-left hover:border-indigo-500 transition">
          <h3 className="text-xl font-semibold">
            New Meeting
          </h3>

          <p className="text-gray-400 mt-2">
            Start instant meeting
          </p>
        </button>

        <button className="glass p-6 text-left hover:border-indigo-500 transition">
          <h3 className="text-xl font-semibold">
            Join Meeting
          </h3>

          <p className="text-gray-400 mt-2">
            Join with room ID
          </p>
        </button>

        <button className="glass p-6 text-left hover:border-indigo-500 transition">
          <h3 className="text-xl font-semibold">
            AI Summary
          </h3>

          <p className="text-gray-400 mt-2">
            View meeting summaries
          </p>
        </button>
      </div>
    </div>
  );
}