"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  UserSquare2,
  Briefcase,
  CheckSquare,
  Shield,
  Plus,
  Database,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isSuperAdmin = user?.is_superuser || hasRole("super_admin");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {user?.first_name} {user?.last_name}
            </h1>
            <Badge variant={isSuperAdmin ? "default" : "secondary"}>
              {isSuperAdmin ? "Super Admin" : "Staff Consultant"}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            {isSuperAdmin
              ? "Nexora Staffing LLP • Master Administration & System Governance"
              : "Nexora Staffing LLP • Recruitment & Placement Workspace"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSuperAdmin ? (
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Database className="h-4 w-4 mr-1.5 text-blue-600" />
                Manage Staff & Roles
              </Button>
            </Link>
          ) : (
            <Link href="/leads">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Lead
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* System Status / Architecture Phase Card */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 via-white to-slate-50">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Phase 1 Active: Foundation & RBAC Complete
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                FastAPI 0.115 + Next.js App Router + PostgreSQL 18.3 + Argon2id Password Hashing + Dual-Token RBAC
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              PostgreSQL Connected
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              RBAC Enforced
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Admin Dashboard View */}
      {isSuperAdmin ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Candidate Pipeline</span>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardTitle>
                <CardDescription>Live job seeker records in CRM</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Users}
                  title="No candidates available"
                  description="Candidate management activates in Phase 3. Ready to import and register candidates."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Active Leads</span>
                  <UserSquare2 className="h-4 w-4 text-slate-400" />
                </CardTitle>
                <CardDescription>Candidate, Employer & Course enquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={UserSquare2}
                  title="No leads yet"
                  description="Lead pipelines and automated stages activate in Phase 3."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Open Job Positions</span>
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </CardTitle>
                <CardDescription>Employer requirements & openings</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Briefcase}
                  title="No jobs posted yet"
                  description="Job posting, screening, and matching activate in Phase 4."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Staff Dashboard View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>My Assigned Leads</span>
                  <UserSquare2 className="h-4 w-4 text-slate-400" />
                </CardTitle>
                <CardDescription>Follow-ups and candidate enquiries assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={UserSquare2}
                  title="No leads assigned"
                  description="You currently have zero active leads in your queue. New assignments will appear here."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Today&apos;s Tasks &amp; Follow-ups</span>
                  <CheckSquare className="h-4 w-4 text-slate-400" />
                </CardTitle>
                <CardDescription>Calls, meetings, and candidate submissions scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks assigned"
                  description="All clear! You have no pending follow-up tasks scheduled for today."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

