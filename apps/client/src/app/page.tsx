// src/app/page.tsx

import Link from "next/link";

const features = [
  {
    title: "HD Video Meetings",
    description:
      "Crystal clear real-time meetings powered by WebRTC.",
  },

  {
    title: "AI Meeting Summary",
    description:
      "Automatically generate summaries after every meeting.",
  },

  {
    title: "Live Chat",
    description:
      "Send messages and collaborate instantly during calls.",
  },

  {
    title: "Screen Sharing",
    description:
      "Share presentations, coding sessions, and workflows.",
  },

  {
    title: "Meeting Rooms",
    description:
      "Create private/public rooms with secure access.",
  },

  {
    title: "AI Transcription",
    description:
      "Convert meeting speech into readable text in real-time.",
  },

  {
    title: "Notifications",
    description:
      "Stay updated with real-time meeting alerts.",
  },

  {
    title: "Recording Metadata",
    description:
      "Track recordings, participants, and meeting history.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Meeting",
    description:
      "Start instant meetings with one click.",
  },

  {
    step: "02",
    title: "Invite Team",
    description:
      "Share room ID or secure meeting links.",
  },

  {
    step: "03",
    title: "Collaborate Live",
    description:
      "Use video, chat, and screen sharing together.",
  },

  {
    step: "04",
    title: "AI Generates Summary",
    description:
      "Receive smart meeting insights automatically.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0f19] text-white overflow-x-hidden" data-scroll-behavior="smooth">
      {/* ================= HERO SECTION ================= */}

      <section className="relative lg:px-12 py-2 border-b border-gray-800">
        {/* NAVBAR */}

        <header className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-3xl font-bold text-indigo-500">
              StreamFlow
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-gray-300">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#about">About</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2 rounded-lg border border-gray-700 hover:border-indigo-500 transition"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* HERO CONTENT */}

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}

          <div>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <span>🚀</span>

              <span className="text-sm text-gray-300">
                AI-Powered Collaboration Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Smart Meetings
              <span className="text-indigo-500">
                {" "}
                for Modern Teams
              </span>
            </h1>

            <p className="text-gray-400 text-lg mt-8 leading-relaxed max-w-2xl">
              StreamFlow helps teams collaborate
              through video meetings, AI-powered
              summaries, live chat, screen sharing,
              and real-time communication.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                href="/register"
                className="btn-primary text-lg"
              >
                Start Free
              </Link>

              <Link
                href="/dashboard"
                className="glass px-6 py-3 rounded-xl"
              >
                View Dashboard
              </Link>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-3 gap-6 mt-16">
              <div>
                <h2 className="text-3xl font-bold">
                  10K+
                </h2>

                <p className="text-gray-400 mt-2">
                  Meetings
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">
                  99.9%
                </h2>

                <p className="text-gray-400 mt-2">
                  Reliability
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">
                  AI
                </h2>

                <p className="text-gray-400 mt-2">
                  Smart Insights
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="relative">
            <div className="glass p-6 rounded-3xl border border-gray-800">
              {/* TOP BAR */}

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">
                    Team Meeting
                  </h3>

                  <p className="text-gray-400 text-sm">
                    8 participants
                  </p>
                </div>

                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              </div>

              {/* VIDEO GRID */}

              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="aspect-video rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold"
                    >
                      {index + 1}
                    </div>
                  )
                )}
              </div>

              {/* CONTROLS */}

              <div className="flex items-center justify-center gap-4 mt-6">
                <button className="w-12 h-12 rounded-full bg-gray-800">
                  🎤
                </button>

                <button className="w-12 h-12 rounded-full bg-gray-800">
                  📹
                </button>

                <button className="w-12 h-12 rounded-full bg-red-500">
                  📞
                </button>

                <button className="w-12 h-12 rounded-full bg-gray-800">
                  💬
                </button>
              </div>
            </div>

            {/* FLOATING AI CARD */}

            <div className="absolute -bottom-8 -left-8 glass p-5 rounded-2xl max-w-xs">
              <h4 className="font-semibold mb-2">
                🤖 AI Summary
              </h4>

              <p className="text-sm text-gray-400">
                Meeting discussed product roadmap,
                backend scaling, and deployment
                strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="py-24 px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold">
              Powerful Features
            </h2>

            <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
              Everything your team needs for modern
              collaboration and AI-enhanced meetings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass p-8 rounded-3xl hover:border-indigo-500 transition"
              >
                <h3 className="text-2xl font-semibold mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WORKFLOW ================= */}

      <section
        id="workflow"
        className="py-24 px-6 lg:px-12 border-t border-gray-800"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold">
              How StreamFlow Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div
                key={index}
                className="glass p-8 rounded-3xl"
              >
                <div className="text-5xl font-bold text-indigo-500 mb-6">
                  {item.step}
                </div>

                <h3 className="text-2xl font-semibold mb-4">
                  {item.title}
                </h3>

                <p className="text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="py-24 px-6 lg:px-12 border-t border-gray-800">
        <div className="max-w-5xl mx-auto text-center glass rounded-[40px] p-16">
          <h2 className="text-5xl font-bold leading-tight">
            Ready to transform your meetings?
          </h2>

          <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto">
            Start using StreamFlow today and build
            smarter collaboration experiences.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="btn-primary text-lg"
            >
              Create Account
            </Link>

            <Link
              href="/dashboard"
              className="glass px-6 py-3 rounded-xl"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-gray-800 py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-indigo-500">
              StreamFlow
            </h3>

            <p className="text-gray-400 mt-2">
              AI-powered communication platform.
            </p>
          </div>

          <div className="flex gap-8 text-gray-400">
            <Link href="/login">Login</Link>

            <Link href="/register">
              Register
            </Link>

            <a href="#features">Features</a>
          </div>
        </div>
      </footer>
    </main>
  );
}