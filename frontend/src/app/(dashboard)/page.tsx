"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Briefcase,
  CheckSquare,
  Shield,
  Plus,
  Clock,
  Building2,
  Calendar,
  Activity as ActivityIcon,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  BookOpen,
  UserCheck,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { crmApi } from "@/lib/crm-api";
import { AdminDashboardStats, StaffDashboardStats, Task } from "@/types/crm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isSuperAdmin = user?.is_superuser || hasRole("super_admin");

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => crmApi.getStats(),
    refetchInterval: 30000,
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => crmApi.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const adminStats = isSuperAdmin ? (stats as AdminDashboardStats) : null;
  const staffStats = !isSuperAdmin ? (stats as StaffDashboardStats) : null;

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
              ? "Nexora Staffing LLP • Enterprise CRM Governance & Pipeline Intelligence"
              : "Nexora Staffing LLP • Recruitment, Matching & Candidate Placement"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/leads">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              New Lead
            </Button>
          </Link>
          <Link href="/candidates">
            <Button variant="primary" size="sm">
              <Users className="h-4 w-4 mr-1.5" />
              Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      {/* CRM Phase 2 Operational Status */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50/60 via-white to-slate-50">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Phase 2 Core CRM Live • Real-Time Database Mode
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Role-based scoping active. All metrics derived from PostgreSQL transactions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Database Synced
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Audit Logger Active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          Failed to load real-time dashboard data. Please check network connectivity or refresh.
        </div>
      )}

      {/* Metric Cards Grid */}
      {isSuperAdmin ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Candidates</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : adminStats?.total_candidates ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">In talent database</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Employers</span>
              <Building2 className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : adminStats?.total_employers ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Companies registered</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Leads</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : adminStats?.active_leads ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Pipeline inquiries</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Open Jobs</span>
              <Briefcase className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : adminStats?.open_jobs ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Active mandates</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Tasks</span>
              <CheckSquare className="h-4 w-4 text-violet-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : adminStats?.pending_tasks ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Due for action</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Interviews</span>
              <Calendar className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : adminStats?.upcoming_interviews ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Scheduled calls</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Leads</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : staffStats?.my_leads ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Assigned leads</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Candidates</span>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : staffStats?.my_candidates ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Under management</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Employers</span>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : staffStats?.my_employers ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Client accounts</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Tasks</span>
              <CheckSquare className="h-4 w-4 text-violet-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "..." : staffStats?.my_tasks ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Follow-ups due</p>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Overdue</span>
              <Clock className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600">
              {isLoading ? "..." : staffStats?.overdue_tasks ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Needs attention</p>
          </Card>
        </div>
      )}

      {/* Phase 3 Training, Services & Placements Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
            Training, Services & Placements Overview
          </h3>
          <div className="flex items-center gap-2">
            <Link href="/courses" className="text-xs text-indigo-600 hover:underline font-medium">
              Courses →
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/services" className="text-xs text-emerald-600 hover:underline font-medium">
              Services →
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/placements" className="text-xs text-purple-600 hover:underline font-medium">
              Placements →
            </Link>
          </div>
        </div>

        {isSuperAdmin ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Courses</span>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : adminStats?.active_courses ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Catalogue live</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Course Inquiries</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : adminStats?.course_enquiries ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Leads generated</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Enrolled</span>
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : adminStats?.active_enrollments ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">In training</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Graduated</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : adminStats?.completed_enrollments ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Courses completed</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Services</span>
                <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : adminStats?.active_services ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Career services</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Placements</span>
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : adminStats?.total_placements ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Interviews & offers</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Candidates Placed</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-emerald-700">
                {isLoading ? "..." : adminStats?.joined_placements ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Joined employers</p>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Courses</span>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : staffStats?.active_courses ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Open for students</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>My Enrollments</span>
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : staffStats?.my_enrollments ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Students enrolled</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>My Placements</span>
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : staffStats?.my_placements ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Outcomes tracked</p>
            </Card>

            <Card className="p-3 bg-white border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Course Enquiries</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {isLoading ? "..." : staffStats?.course_enquiries ?? 0}
              </div>
              <p className="text-[11px] text-slate-400">Leads interested</p>
            </Card>
          </div>
        )}
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  {isSuperAdmin ? "High Priority & Urgent Tasks" : "My Follow-up Tasks"}
                </CardTitle>
                <CardDescription>
                  {isSuperAdmin ? "System-wide pending items requiring action" : "Your active assignments and client calls"}
                </CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {(() => {
                const tasks: Task[] = isSuperAdmin
                  ? adminStats?.urgent_tasks || []
                  : staffStats?.today_tasks || [];

                if (tasks.length === 0) {
                  return (
                    <EmptyState
                      icon={CheckSquare}
                      title="No pending tasks"
                      description="You are completely caught up! New assigned tasks will show here."
                    />
                  );
                }

                return (
                  <div className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <div key={task.id} className="py-3 flex items-start justify-between gap-3 group">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900 truncate">
                              {task.title}
                            </span>
                            <Badge
                              variant={
                                task.priority === "urgent" || task.priority === "high"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-[10px] uppercase"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                            {task.assigned_user && (
                              <span>Assigned: {task.assigned_user.first_name} {task.assigned_user.last_name}</span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          disabled={completeTaskMutation.isPending}
                          onClick={() => completeTaskMutation.mutate(task.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Done
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4 text-blue-600" />
                  Recent CRM Activity
                </CardTitle>
                <CardDescription>Live audit stream of candidate & lead events</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const activities = stats?.recent_activities || [];
                if (activities.length === 0) {
                  return (
                    <EmptyState
                      icon={ActivityIcon}
                      title="No recent activity"
                      description="Actions performed by staff or system automation will appear in this timeline."
                    />
                  );
                }

                return (
                  <div className="space-y-4">
                    {activities.map((act) => (
                      <div key={act.id} className="flex gap-3 text-xs">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium">
                          {act.activity_type.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800">{act.title}</p>
                          {act.description && (
                            <p className="text-slate-500 mt-0.5 line-clamp-2">{act.description}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                            {act.user ? `${act.user.first_name} ${act.user.last_name}` : "System"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
