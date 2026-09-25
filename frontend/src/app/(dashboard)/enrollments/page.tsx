"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { Enrollment, EnrollmentCreate, EnrollmentUpdate, EnrollmentProgressUpdate } from "@/types/crm";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

export default function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [progressModalEnrollment, setProgressModalEnrollment] = useState<Enrollment | null>(null);
  const [newProgress, setNewProgress] = useState<number>(0);
  const [newProgressStatus, setNewProgressStatus] = useState<string>("in_progress");

  // Form state
  const [form, setForm] = useState<EnrollmentCreate>({
    candidate_id: "",
    course_id: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    status: "enrolled",
    progress_percentage: 0,
    fee_paid: 0,
    payment_status: "pending",
    notes: "",
  });

  // Queries
  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ["enrollments", search, statusFilter, paymentStatusFilter],
    queryFn: () =>
      crmApi.getEnrollments({
        search: search || undefined,
        status: statusFilter || undefined,
        payment_status: paymentStatusFilter || undefined,
        limit: 100,
      }),
  });

  const { data: candidatesData } = useQuery({
    queryKey: ["candidates-select"],
    queryFn: () => crmApi.getCandidates({ limit: 100 }),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["courses-select"],
    queryFn: () => crmApi.getCourses({ limit: 100, status: "active" }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: EnrollmentCreate) => crmApi.createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EnrollmentUpdate }) =>
      crmApi.updateEnrollment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      setEditingEnrollment(null);
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EnrollmentProgressUpdate }) =>
      crmApi.updateEnrollmentProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      setProgressModalEnrollment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });

  const resetForm = () => {
    setForm({
      candidate_id: "",
      course_id: "",
      enrollment_date: new Date().toISOString().split("T")[0],
      status: "enrolled",
      progress_percentage: 0,
      fee_paid: 0,
      payment_status: "pending",
      notes: "",
    });
  };

  const handleOpenProgress = (enr: Enrollment) => {
    setProgressModalEnrollment(enr);
    setNewProgress(enr.progress_percentage);
    setNewProgressStatus(enr.status);
  };

  const enrollments = enrollmentsData?.items || [];
  const candidates = candidatesData?.items || [];
  const courses = coursesData?.items || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Course Enrollments & Progress
          </h1>
          <p className="text-sm text-slate-500">
            Track student syllabus completion (0-100%), course fees, and certification status
          </p>
        </div>

        {hasPermission("enrollments:create") && (
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Enrollment
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search candidate name, email, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="enrolled">Enrolled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No enrollments recorded</p>
            <p className="text-sm text-slate-400">Enroll a candidate into a course to start tracking progress.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Enrolled On</th>
                  <th className="py-3 px-4 w-44">Syllabus Progress</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">
                        {enr.candidate ? `${enr.candidate.first_name} ${enr.candidate.last_name}` : "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">{enr.candidate?.email || "—"}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{enr.course?.name || "Course"}</p>
                      <span className="text-xs font-mono text-slate-400">{enr.course?.code}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {enr.enrollment_date}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{enr.progress_percentage}%</span>
                          {hasPermission("enrollments:edit") && (
                            <button
                              onClick={() => handleOpenProgress(enr)}
                              className="text-blue-600 hover:underline text-[11px] font-medium"
                            >
                              Update
                            </button>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              enr.progress_percentage === 100
                                ? "bg-emerald-500"
                                : enr.progress_percentage >= 50
                                ? "bg-blue-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, enr.progress_percentage))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-slate-900">
                        ₹{Number(enr.fee_paid).toLocaleString()}
                      </span>
                      <div>
                        <Badge
                          variant={
                            enr.payment_status === "paid"
                              ? "default"
                              : enr.payment_status === "partial"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[11px] capitalize mt-0.5"
                        >
                          {enr.payment_status}
                        </Badge>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          enr.status === "completed"
                            ? "default"
                            : enr.status === "in_progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {enr.status.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasPermission("enrollments:edit") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingEnrollment(enr);
                              setForm({
                                candidate_id: enr.candidate_id,
                                course_id: enr.course_id,
                                enrollment_date: enr.enrollment_date,
                                status: enr.status,
                                progress_percentage: enr.progress_percentage,
                                fee_paid: enr.fee_paid,
                                payment_status: enr.payment_status,
                                notes: enr.notes || "",
                              });
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {hasPermission("enrollments:archive") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Archive this enrollment record?")) {
                                deleteMutation.mutate(enr.id);
                              }
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Fast Progress Updater */}
      <Modal
        isOpen={!!progressModalEnrollment}
        onClose={() => setProgressModalEnrollment(null)}
        title="Update Course Progress"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Candidate: <strong>{progressModalEnrollment?.candidate?.first_name} {progressModalEnrollment?.candidate?.last_name}</strong>
            <br />
            Course: <strong>{progressModalEnrollment?.course?.name}</strong>
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-slate-700">Completion Percentage</label>
              <span className="font-bold text-blue-600 text-base">{newProgress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={newProgress}
              onChange={(e) => setNewProgress(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% (Started)</span>
              <span>50% (Midway)</span>
              <span>100% (Completed)</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Enrollment Status</label>
            <select
              value={newProgressStatus}
              onChange={(e) => setNewProgressStatus(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="enrolled">Enrolled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setProgressModalEnrollment(null)}>
              Cancel
            </Button>
            <Button
              disabled={progressMutation.isPending}
              onClick={() => {
                if (progressModalEnrollment) {
                  progressMutation.mutate({
                    id: progressModalEnrollment.id,
                    data: {
                      progress_percentage: newProgress,
                      status: newProgressStatus,
                    },
                  });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {progressMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Enrollment */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Enroll Candidate in Course"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Candidate *</label>
            <select
              required
              value={form.candidate_id}
              onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Candidate</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Course *</label>
            <select
              required
              value={form.course_id}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              {courses.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.code} — {crs.name} (₹{Number(crs.fee).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Enrollment Date</label>
              <Input
                type="date"
                required
                value={form.enrollment_date}
                onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Progress (0-100%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progress_percentage}
                onChange={(e) => setForm({ ...form, progress_percentage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Fee Paid (₹)</label>
              <Input
                type="number"
                min={0}
                value={form.fee_paid}
                onChange={(e) => setForm({ ...form, fee_paid: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Payment Status</label>
              <select
                value={form.payment_status}
                onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="enrolled">Enrolled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? "Enrolling..." : "Enroll Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Enrollment */}
      <Modal
        isOpen={!!editingEnrollment}
        onClose={() => setEditingEnrollment(null)}
        title="Edit Enrollment"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingEnrollment) {
              updateMutation.mutate({
                id: editingEnrollment.id,
                data: {
                  status: form.status,
                  progress_percentage: form.progress_percentage,
                  fee_paid: form.fee_paid,
                  payment_status: form.payment_status,
                  notes: form.notes,
                },
              });
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="enrolled">Enrolled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Progress (0-100%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progress_percentage}
                onChange={(e) => setForm({ ...form, progress_percentage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Fee Paid (₹)</label>
              <Input
                type="number"
                value={form.fee_paid}
                onChange={(e) => setForm({ ...form, fee_paid: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Payment Status</label>
              <select
                value={form.payment_status}
                onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setEditingEnrollment(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending ? "Updating..." : "Update Enrollment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
