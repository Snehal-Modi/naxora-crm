"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { Placement, PlacementCreate, PlacementUpdate } from "@/types/crm";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

export default function PlacementsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);

  // Form state
  const [form, setForm] = useState<PlacementCreate>({
    candidate_id: "",
    company_id: "",
    job_requirement_id: "",
    status: "interview_scheduled",
    interview_date: "",
    offer_date: "",
    joining_date: "",
    salary_offered: 0,
    placement_fee: 0,
    notes: "",
  });

  // Queries
  const { data: placementsData, isLoading } = useQuery({
    queryKey: ["placements", search, statusFilter],
    queryFn: () =>
      crmApi.getPlacements({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 100,
      }),
  });

  const { data: candidatesData } = useQuery({
    queryKey: ["candidates-select"],
    queryFn: () => crmApi.getCandidates({ limit: 100 }),
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies-select"],
    queryFn: () => crmApi.getCompanies({ limit: 100 }),
  });

  const { data: jobsData } = useQuery({
    queryKey: ["jobs-select", form.company_id],
    queryFn: () => crmApi.getJobs({ limit: 100, company_id: form.company_id || undefined }),
    enabled: !!form.company_id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: PlacementCreate) => crmApi.createPlacement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlacementUpdate }) =>
      crmApi.updatePlacement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      setEditingPlacement(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => crmApi.archivePlacement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placements"] });
    },
  });

  const resetForm = () => {
    setForm({
      candidate_id: "",
      company_id: "",
      job_requirement_id: "",
      status: "interview_scheduled",
      interview_date: "",
      offer_date: "",
      joining_date: "",
      salary_offered: 0,
      placement_fee: 0,
      notes: "",
    });
  };

  const handleEditOpen = (plc: Placement) => {
    setEditingPlacement(plc);
    setForm({
      candidate_id: plc.candidate_id,
      company_id: plc.company_id,
      job_requirement_id: plc.job_requirement_id || "",
      status: plc.status,
      interview_date: plc.interview_date || "",
      offer_date: plc.offer_date || "",
      joining_date: plc.joining_date || "",
      salary_offered: plc.salary_offered || 0,
      placement_fee: plc.placement_fee || 0,
      notes: plc.notes || "",
    });
  };

  const placements = placementsData?.items || [];
  const candidates = candidatesData?.items || [];
  const companies = companiesData?.items || [];
  const jobs = jobsData?.items || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-purple-600" />
            Candidate Placements
          </h1>
          <p className="text-sm text-slate-500">
            Track interview outcomes, compensation offers, candidate joining dates, and agency placement billing
          </p>
        </div>

        {hasPermission("placements:create") && (
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Record Placement
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search candidate name or employer..."
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
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="interview_completed">Interview Completed</option>
            <option value="offered">Offered</option>
            <option value="joined">Joined</option>
            <option value="rejected">Rejected</option>
            <option value="backed_out">Backed Out</option>
          </select>
        </div>
      </div>

      {/* Placements Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading placement records...</div>
        ) : placements.length === 0 ? (
          <div className="py-12 text-center">
            <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No placement records found</p>
            <p className="text-sm text-slate-400">Record candidate interviews and offers to monitor outcomes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Employer & Job</th>
                  <th className="py-3 px-4">Timeline Dates</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Placement Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {placements.map((plc) => (
                  <tr key={plc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">
                        {plc.candidate ? `${plc.candidate.first_name} ${plc.candidate.last_name}` : "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">{plc.candidate?.email || "—"}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{plc.company?.name || "Company"}</p>
                      <p className="text-xs text-slate-500">{plc.job_requirement?.job_title || "General Hiring"}</p>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600 space-y-0.5">
                      {plc.interview_date && (
                        <div>
                          <span className="text-slate-400">Interview:</span> {plc.interview_date}
                        </div>
                      )}
                      {plc.offer_date && (
                        <div>
                          <span className="text-slate-400">Offered:</span> {plc.offer_date}
                        </div>
                      )}
                      {plc.joining_date && (
                        <div className="font-semibold text-emerald-600">
                          <span>Joined:</span> {plc.joining_date}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {plc.salary_offered ? `₹${Number(plc.salary_offered).toLocaleString()}` : "—"}
                    </td>

                    <td className="py-3 px-4 font-medium text-purple-700">
                      {plc.placement_fee ? `₹${Number(plc.placement_fee).toLocaleString()}` : "—"}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          plc.status === "joined"
                            ? "default"
                            : plc.status === "offered"
                            ? "secondary"
                            : plc.status === "rejected" || plc.status === "backed_out"
                            ? "outline"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {plc.status.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasPermission("placements:edit") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOpen(plc)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {hasPermission("placements:archive") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Archive this placement record?")) {
                                deleteMutation.mutate(plc.id);
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

      {/* Modal: Create Placement */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Candidate Placement"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              ...form,
              job_requirement_id: form.job_requirement_id || undefined,
              interview_date: form.interview_date || undefined,
              offer_date: form.offer_date || undefined,
              joining_date: form.joining_date || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Candidate *</label>
            <select
              required
              value={form.candidate_id}
              onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <label className="text-xs font-medium text-slate-700">Hiring Employer *</label>
            <select
              required
              value={form.company_id}
              onChange={(e) => setForm({ ...form, company_id: e.target.value, job_requirement_id: "" })}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Employer</option>
              {companies.map((cmp) => (
                <option key={cmp.id} value={cmp.id}>
                  {cmp.name}
                </option>
              ))}
            </select>
          </div>

          {form.company_id && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Job Requirement (Optional)</label>
              <select
                value={form.job_requirement_id || ""}
                onChange={(e) => setForm({ ...form, job_requirement_id: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Direct / General Placement</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.job_title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="interview_completed">Interview Completed</option>
                <option value="offered">Offered</option>
                <option value="joined">Joined</option>
                <option value="rejected">Rejected</option>
                <option value="backed_out">Backed Out</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Interview Date</label>
              <Input
                type="date"
                value={form.interview_date || ""}
                onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Offer Date</label>
              <Input
                type="date"
                value={form.offer_date || ""}
                onChange={(e) => setForm({ ...form, offer_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Joining Date</label>
              <Input
                type="date"
                value={form.joining_date || ""}
                onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Annual Salary / Package (₹)</label>
              <Input
                type="number"
                min={0}
                value={form.salary_offered || ""}
                onChange={(e) => setForm({ ...form, salary_offered: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Placement Fee (₹)</label>
              <Input
                type="number"
                min={0}
                value={form.placement_fee || ""}
                onChange={(e) => setForm({ ...form, placement_fee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {createMutation.isPending ? "Recording..." : "Save Record"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Placement */}
      <Modal
        isOpen={!!editingPlacement}
        onClose={() => setEditingPlacement(null)}
        title="Update Placement Status"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingPlacement) {
              updateMutation.mutate({
                id: editingPlacement.id,
                data: {
                  status: form.status,
                  interview_date: form.interview_date || undefined,
                  offer_date: form.offer_date || undefined,
                  joining_date: form.joining_date || undefined,
                  salary_offered: form.salary_offered,
                  placement_fee: form.placement_fee,
                  notes: form.notes,
                },
              });
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="interview_completed">Interview Completed</option>
              <option value="offered">Offered</option>
              <option value="joined">Joined</option>
              <option value="rejected">Rejected</option>
              <option value="backed_out">Backed Out</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Offer Date</label>
              <Input
                type="date"
                value={form.offer_date || ""}
                onChange={(e) => setForm({ ...form, offer_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Joining Date</label>
              <Input
                type="date"
                value={form.joining_date || ""}
                onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Salary Package (₹)</label>
              <Input
                type="number"
                value={form.salary_offered || ""}
                onChange={(e) => setForm({ ...form, salary_offered: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Placement Fee (₹)</label>
              <Input
                type="number"
                value={form.placement_fee || ""}
                onChange={(e) => setForm({ ...form, placement_fee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Notes</label>
            <Input
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setEditingPlacement(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {updateMutation.isPending ? "Updating..." : "Update Placement"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
