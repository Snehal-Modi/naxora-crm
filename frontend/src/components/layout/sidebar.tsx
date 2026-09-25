"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserSquare2,
  GraduationCap,
  Wrench,
  CheckSquare,
  Clock,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  adminOnly?: boolean;
  comingSoon?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const isSuperAdmin = user?.is_superuser || user?.roles.includes("super_admin");

  const navigationSections: NavSection[] = [
    {
      label: "OVERVIEW",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "CRM CORE",
      items: [
        {
          title: "Leads",
          href: "/leads",
          icon: UserSquare2,
          permission: "leads:view",
        },
        {
          title: "Candidates",
          href: "/candidates",
          icon: Users,
          permission: "candidates:view",
        },
        {
          title: "Employers",
          href: "/employers",
          icon: Building2,
          permission: "employers:view",
        },
        {
          title: "Jobs",
          href: "/jobs",
          icon: Briefcase,
          permission: "jobs:view",
        },
      ],
    },
    {
      label: "SERVICES & TRAINING",
      items: [
        {
          title: "Courses",
          href: "/courses",
          icon: GraduationCap,
          comingSoon: true,
        },
        {
          title: "Services",
          href: "/services",
          icon: Wrench,
          comingSoon: true,
        },
      ],
    },
    {
      label: "OPERATIONS",
      items: [
        {
          title: "Tasks",
          href: "/tasks",
          icon: CheckSquare,
          comingSoon: true,
        },
        {
          title: "Attendance",
          href: "/attendance",
          icon: Clock,
          comingSoon: true,
        },
        {
          title: "Leave",
          href: "/leave",
          icon: CalendarDays,
          comingSoon: true,
        },
        {
          title: "Payroll",
          href: "/payroll",
          icon: CreditCard,
          adminOnly: true,
          permission: "payroll:view",
          comingSoon: true,
        },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          title: "Reports",
          href: "/reports",
          icon: BarChart3,
          permission: "reports:view",
          comingSoon: true,
        },
        {
          title: "Settings & Users",
          href: "/settings",
          icon: Settings,
          adminOnly: true,
          permission: "settings:manage",
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-64 bg-slate-900 text-slate-300 border-r border-slate-800 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950/40">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
            N
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">NAXORA</span>
            <span className="text-xs text-blue-400 font-medium block -mt-1 tracking-wider uppercase">CRM</span>
          </div>
        </Link>
        {isSuperAdmin && (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
            ADMIN
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.adminOnly && !isSuperAdmin) return false;
            if (item.permission && !hasPermission(item.permission)) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.comingSoon ? "#" : item.href}
                      onClick={() => {
                        if (!item.comingSoon && onClose) onClose();
                      }}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : item.comingSoon
                          ? "text-slate-500 hover:text-slate-400 hover:bg-slate-800/40 cursor-not-allowed"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                        <span>{item.title}</span>
                      </div>
                      {item.comingSoon && (
                        <span className="text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                          Later
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
              {user ? `${user.first_name[0]}${user.last_name[0]}` : "U"}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-medium text-white truncate">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.is_superuser ? "Super Admin" : user?.roles[0] || "Staff"}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

