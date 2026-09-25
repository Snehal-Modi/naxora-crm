"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserSquare2,
  Search,
  Plus,
  Mail,
  Phone,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { Lead, LeadCreate } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";

export default function LeadsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assignModalLead, setAssignModalLead] = useState<Lead | null>(null);
  const [assignStaffId, setAssignStaffId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const [createForm, setCreateForm] = useState<LeadCreate>({
    title: "",
    lead_type: "candidate",
    source: "website",
    status: "new",
    priority: "medium",
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["leads", search, typeFilter, statusFilter, page],
    queryFn: () =>
      crmApi.getLeads({
        search: search || undefined,
        lead_type: typeFilter || undefined,
        status: statusFilter || undefined,
        skip: (page - 1) * limit,
        limit,
      }),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["courses-leads"],
    queryFn: () => crmApi.getCourses({ limit: 100, status: "active" }),
  });

  const { data: servicesData } = useQuery({
    queryKey: ["services-leads"],
    queryFn: () => crmApi.getServices({ limit: 100, status: "active" }),
  });

  const createLeadMutation = useMutation({
    mutationFn: (newLead: LeadCreate) => crmApi.createLead(newLead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsCreateOpen(false);
      setCreateForm({
        title: "",
        lead_type: "candidate",
        source: "website",
        status: "new",
        priority: "medium",
        first_name: "",
        last_name: "",
        company_name: "",
        email: "",
        phone: "",
        notes: "",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assigned_to_id, notes }: { id: string; assigned_to_id: string; notes?: string }) =>
      crmApi.assignLead(id, { assigned_to_id, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setAssignModalLead(null);
      setAssignStaffId("");
      setAssignNotes("");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (selectedLead) setSelectedLead(null);
    },
  });

  const leads = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserSquare2 className="h-6 w-6 text-amber-600" />
            CRM Leads &amp; Inquiries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Omni-channel leads for Candidates, Employer Retainers, Courses, and Career Services
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Lead
        </Button>
      </div>

      <Card className="p-4 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search leads by title, contact..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter leads by type"
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Lead Types</option>
            <option value="candidate">Candidate</option>
            <option value="employer">Employer / Corporate</option>
            <option value="course">Course / Training</option>
            <option value="service">Career Service</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter leads by status"
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <div className="flex items-center justify-end text-xs text-slate-500 font-medium px-2">
            Total Leads: {data?.total ?? 0}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading leads...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-600">Failed to load leads.</div>
        ) : leads.length === 0 ? (
          <CardContent className="p-8">
            <EmptyState
              icon={UserSquare2}
              title="No leads found"
              description="Capture candidate, corporate, or course leads to build your sales & recruitment pipeline."
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Lead</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Pipeline Stage</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{lead.title}</div>
                      <div className="text-xs text-slate-400 capitalize">Source: {lead.source}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="capitalize text-[11px]">
                        {lead.lead_type}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-800">
                        {lead.first_name || lead.last_name
                          ? `${lead.first_name || ""} ${lead.last_name || ""}`
                          : lead.company_name || "N/A"}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Mail className="h-2.5 w-2.5 text-slate-400" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="h-2.5 w-2.5 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {lead.stage ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white shadow-2xs"
                          style={{ backgroundColor: lead.stage.color_hex || "#3B82F6" }}
                        >
                          {lead.stage.name}
                        </span>
                      ) : (
                        <Badge variant="secondary" className="capitalize text-[11px]">
                          {lead.status}
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          lead.priority === "urgent" || lead.priority === "high"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px] uppercase"
                      >
                        {lead.priority}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {lead.assigned_staff ? (
                        <span className="font-medium text-slate-700">
                          {lead.assigned_staff.first_name} {lead.assigned_staff.last_name}
                        </span>
                      ) : (
                        <span className="text-amber-600 italic font-medium">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Assign Staff"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                          onClick={() => setAssignModalLead(lead)}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={archiveMutation.isPending}
                          onClick={() => {
                            if (confirm(`Archive lead "${lead.title}"?`)) {
                              archiveMutation.mutate(lead.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Lead"
        description="Add a candidate, company recruitment enquiry, or training lead."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createLeadMutation.mutate(createForm);
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-slate-700">Lead Title *</label>
            <Input
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer Enquiry or Acme Staffing Requirement"
              className="mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Lead Type *</label>
              <select
                value={createForm.lead_type}
                onChange={(e) => setCreateForm({ ...createForm, lead_type: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
              >
                <option value="candidate">Candidate / Job Seeker</option>
                <option value="employer">Employer / Corporate</option>
                <option value="course">Course / Training</option>
                <option value="service">Career Service</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Source</label>
              <select
                value={createForm.source || "website"}
                onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
              >
                <option value="website">Website Form</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="phone">Inbound Phone Call</option>
                <option value="walkin">Walk-in / Office</option>
              </select>
            </div>
          </div>

          {createForm.lead_type === "course" && (
            <div>
              <label className="text-xs font-semibold text-slate-700">Course Interested In</label>
              <select
                value={createForm.course_id || ""}
                onChange={(e) => setCreateForm({ ...createForm, course_id: e.target.value || undefined })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
              >
                <option value="">Select Course</option>
                {coursesData?.items?.map((crs) => (
                  <option key={crs.id} value={crs.id}>
                    {crs.code} — {crs.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {createForm.lead_type === "service" && (
            <div>
              <label className="text-xs font-semibold text-slate-700">Service Interested In</label>
              <select
                value={createForm.service_id || ""}
                onChange={(e) => setCreateForm({ ...createForm, service_id: e.target.value || undefined })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
              >
                <option value="">Select Service</option>
                {servicesData?.items?.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.code} — {svc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact First Name</label>
              <Input
                value={createForm.first_name || ""}
                onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                placeholder="Vikram"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact Last Name</label>
              <Input
                value={createForm.last_name || ""}
                onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                placeholder="Mehta"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input
                type="email"
                value={createForm.email || ""}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="vikram@example.com"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <Input
                value={createForm.phone || ""}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+91 9123456780"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Company Name</label>
              <Input
                value={createForm.company_name || ""}
                onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                placeholder="Apex FinTech"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Priority</label>
              <select
                value={createForm.priority || "medium"}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Initial Notes</label>
            <Input
              value={createForm.notes || ""}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              placeholder="Candidate is interested in Cloud Architecture track..."
              className="mt-1 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createLeadMutation.isPending}>
              {createLeadMutation.isPending ? "Creating..." : "Save Lead"}
            </Button>
          </div>
        </form>
      </Modal>

      {assignModalLead && (
        <Modal
          isOpen={!!assignModalLead}
          onClose={() => setAssignModalLead(null)}
          title={`Assign Lead: ${assignModalLead.title}`}
          description="Designate a recruitment consultant to handle this lead."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (assignStaffId) {
                assignMutation.mutate({
                  id: assignModalLead.id,
                  assigned_to_id: assignStaffId,
                  notes: assignNotes,
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold text-slate-700">Assignee Staff User ID *</label>
              <Input
                required
                placeholder="Paste User UUID"
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
                className="mt-1 text-sm font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the staff member user ID to transfer responsibility.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Assignment Note / Handover</label>
              <Input
                placeholder="e.g. Schedule discovery call tomorrow at 11 AM"
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setAssignModalLead(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={assignMutation.isPending}>
                {assignMutation.isPending ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={selectedLead.title}
          description={`Created on ${new Date(selectedLead.created_at).toLocaleDateString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize text-xs">
                Type: {selectedLead.lead_type}
              </Badge>
              <Badge variant="secondary" className="capitalize text-xs">
                Status: {selectedLead.status}
              </Badge>
              <Badge variant="destructive" className="uppercase text-[10px]">
                {selectedLead.priority}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
              <div>
                <span className="font-semibold text-slate-500">Contact:</span>
                <p className="text-slate-800 mt-0.5">
                  {selectedLead.first_name || selectedLead.last_name
                    ? `${selectedLead.first_name || ""} ${selectedLead.last_name || ""}`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Company:</span>
                <p className="text-slate-800 mt-0.5">{selectedLead.company_name || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Email:</span>
                <p className="text-slate-800 mt-0.5">{selectedLead.email || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Phone:</span>
                <p className="text-slate-800 mt-0.5">{selectedLead.phone || "N/A"}</p>
              </div>
              {selectedLead.course && (
                <div className="col-span-2 bg-indigo-50/70 p-2 rounded border border-indigo-100">
                  <span className="font-semibold text-indigo-700">Course Inquiry:</span>
                  <p className="text-indigo-900 font-medium mt-0.5">
                    {selectedLead.course.name} ({selectedLead.course.code})
                  </p>
                </div>
              )}
              {selectedLead.service && (
                <div className="col-span-2 bg-emerald-50/70 p-2 rounded border border-emerald-100">
                  <span className="font-semibold text-emerald-700">Service Inquiry:</span>
                  <p className="text-emerald-900 font-medium mt-0.5">
                    {selectedLead.service.name} ({selectedLead.service.code})
                  </p>
                </div>
              )}
            </div>

            {selectedLead.assignments && selectedLead.assignments.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wide mb-2">
                  Assignment History ({selectedLead.assignments.length})
                </h4>
                <div className="space-y-2">
                  {selectedLead.assignments.map((asgn) => (
                    <div key={asgn.id} className="p-2 bg-slate-50 rounded text-xs border border-slate-100">
                      <div className="font-medium text-slate-800">
                        Assigned to {asgn.assigned_to.first_name} {asgn.assigned_to.last_name} by{" "}
                        {asgn.assigned_by.first_name} {asgn.assigned_by.last_name}
                      </div>
                      {asgn.notes && <div className="text-slate-500 mt-0.5">{asgn.notes}</div>}
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(asgn.assigned_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
