"use client";

import { useState } from "react";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-white">
      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <DashboardSidebar />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <aside className="absolute inset-y-0 left-0 shadow-2xl">
            <DashboardSidebar
              onNavigate={() =>
                setSidebarOpen(false)
              }
            />
          </aside>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
            className="absolute left-[17rem] top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
