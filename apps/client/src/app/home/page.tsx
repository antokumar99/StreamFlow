import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";

const actions = [
  {
    title: "Start New Meeting",
    description:
      "Create instant video meetings with your team.",
    icon: "🎥",
    href: "/meeting/new",
  },

  {
    title: "Join Meeting",
    description:
      "Join using room ID or invitation link.",
    icon: "🚀",
    href: "/meeting/join",
  },

  {
    title: "Audio Call",
    description:
      "Start lightweight voice conversations.",
    icon: "🎧",
    href: "/audio",
  },

  {
    title: "Start Chat",
    description:
      "Send messages and collaborate instantly.",
    icon: "💬",
    href: "/chat",
  },
];

export default function HomePage() {
  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-[#0b0f19] text-white">
      {/* ================= NAVBAR ================= */}
{/* 
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111827]">
        <div>
          <h1 className="text-2xl font-bold text-indigo-500">
            StreamFlow
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="glass px-4 py-2">
            Notifications
          </button>

          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
            A
          </div>
        </div>
      </header> */}

      {/* ================= HERO ================= */}

      <section className="px-6 lg:px-12 py-14">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-5xl font-bold leading-tight">
              Welcome to{" "}
              <span className="text-indigo-500">
                StreamFlow
              </span>
            </h1>

            <p className="text-gray-400 text-lg mt-5 max-w-2xl">
              Collaborate with your team using
              AI-powered meetings, chat, and
              real-time communication tools.
            </p>
          </div>

          {/* ACTION CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-16">
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="glass p-8 rounded-3xl hover:border-indigo-500 transition group"
              >
                <div className="text-5xl mb-6">
                  {action.icon}
                </div>

                <h2 className="text-2xl font-semibold group-hover:text-indigo-400 transition">
                  {action.title}
                </h2>

                <p className="text-gray-400 mt-4 leading-relaxed">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>

          {/* QUICK INFO */}

          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-3xl font-bold">
                24
              </h3>

              <p className="text-gray-400 mt-2">
                Meetings This Month
              </p>
            </div>

            <div className="glass p-6 rounded-3xl">
              <h3 className="text-3xl font-bold">
                12h
              </h3>

              <p className="text-gray-400 mt-2">
                Collaboration Time
              </p>
            </div>

            <div className="glass p-6 rounded-3xl">
              <h3 className="text-3xl font-bold">
                AI
              </h3>

              <p className="text-gray-400 mt-2">
                Smart Summaries Enabled
              </p>
            </div>
          </div>

          {/* RECENT ACTIVITY */}

          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8">
              Recent Activity
            </h2>

            <div className="space-y-4">
              <div className="glass p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Team Sync Meeting
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    Yesterday • 8 Participants
                  </p>
                </div>

                <button className="btn-primary">
                  View
                </button>
              </div>

              <div className="glass p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Product Planning
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    Monday • AI Summary Generated
                  </p>
                </div>

                <button className="btn-primary">
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </ProtectedRoute>
  );
}