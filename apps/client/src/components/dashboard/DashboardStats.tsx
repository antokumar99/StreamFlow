const stats = [
  {
    title: "Total Meetings",
    value: "24",
  },

  {
    title: "Hours Spent",
    value: "128h",
  },

  {
    title: "Team Members",
    value: "12",
  },

  {
    title: "AI Summaries",
    value: "45",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass p-6 rounded-2xl"
        >
          <p className="text-gray-400 text-sm">
            {stat.title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {stat.value}
          </h2>
        </div>
      ))}
    </div>
  );
}