import React from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 items-center justify-center border-r border-gray-800">
        <div className="max-w-md px-10">
          <h1 className="text-5xl font-bold mb-6">
            StreamFlow
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed">
            Modern AI-powered video meetings for
            teams, collaboration, and real-time
            communication.
          </p>

          <div className="mt-10 space-y-4">
            <div className="glass p-4">
              🎥 HD Video Meetings
            </div>

            <div className="glass p-4">
              🤖 AI Meeting Summaries
            </div>

            <div className="glass p-4">
              💬 Real-time Chat & Collaboration
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="glass p-8">
            <h2 className="text-3xl font-bold mb-2">
              {title}
            </h2>

            <p className="text-gray-400 mb-8">
              {subtitle}
            </p>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}