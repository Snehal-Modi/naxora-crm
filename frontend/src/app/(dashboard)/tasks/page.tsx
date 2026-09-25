"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { TaskCreate } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"my_tasks" | "team_tasks" | "overdue" | "today" | "upcoming">("my_tasks");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [taskForm, setTaskForm] = useState<TaskCreate>({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    status: "pending",
  });

  // Query Tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", activeTab, statusFilter],
    queryFn: () =>
      crmApi.getTasks({
        filter_type: activeTab,
        status: statusFilter || undefined,
        limit: 50,
      }),
  });

  // Complete Mutation
  const completeMutation = useMutation({
    mutationFn: (taskId: string) => crmApi.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newTask: TaskCreate) => crmApi.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsCreateOpen(false);
      setTaskForm({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      });
    },
  });

  const tasks = data?.items || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-violet-600" />
            Tasks &amp; Follow-ups
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Recruiter work queues, interview scheduling, and scheduled touchpoints
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Task
        </Button>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-1">
          {[
            { id: "my_tasks", label: "My Tasks" },
            { id: "today", label: "Due Today" },
            { id: "overdue", label: "Overdue" },
            { id: "upcoming", label: "Upcoming" },
            { id: "team_tasks", label: "Team Tasks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter tasks by status"
            className="h-8 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Task List */}
      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading tasks...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-600">Failed to load tasks.</div>
        ) : tasks.length === 0 ? (
          <CardContent className="p-8">
            <EmptyState
              icon={CheckSquare}
              title="No tasks in this view"
              description="Everything is clear! Create a follow-up task or reminder to stay organized."
            />
          </CardContent>
        ) : (
          <div className="divide-y divide-slate-100 bg-white">
            {tasks.map((task) => {
              const isOverdue =
                task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

              return (
                <div
                  key={task.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => completeMutation.mutate(task.id)}
                      disabled={task.status === "completed" || completeMutation.isPending}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        task.status === "completed"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-violet-500 hover:bg-violet-50 text-transparent"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold text-slate-900 truncate",
                            task.status === "completed" && "line-through text-slate-400"
                          )}
                        >
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
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        {task.due_date && (
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              isOverdue ? "text-rose-600 font-semibold" : "text-slate-500"
                            )}
                          >
                            {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {task.assigned_user && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <User className="h-3 w-3" />
                            {task.assigned_user.first_name} {task.assigned_user.last_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {task.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(task.id)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        description="Schedule a follow-up or operational CRM task."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(taskForm);
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-slate-700">Task Title *</label>
            <Input
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Call candidate to confirm round 2 availability"
              className="mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input
              value={taskForm.description || ""}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Add key talking points, meeting links, or candidate context..."
              className="mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Due Date</label>
              <Input
                type="datetime-local"
                value={taskForm.due_date || ""}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Priority</label>
              <select
                value={taskForm.priority || "medium"}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 mt-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Save Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
