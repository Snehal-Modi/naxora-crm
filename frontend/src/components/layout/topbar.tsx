"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-800 text-sm hidden sm:inline">
            Nexora Staffing LLP
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 font-medium">Enterprise CRM</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Environment status indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-600 border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium">System Online</span>
        </div>

        {user && (
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-slate-800">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-[10px] text-slate-500">
                {user.is_superuser ? "Super Admin" : "Staff Consultant"}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
              {user.first_name[0]}{user.last_name[0]}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

