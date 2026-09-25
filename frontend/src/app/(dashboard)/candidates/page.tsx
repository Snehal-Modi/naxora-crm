"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Filter,
  FileText,
  Upload,
  Download,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { Candidate, CandidateCreate } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";

export default function CandidatesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [formData, setFormData] = useState<CandidateCreate>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    highest_education: "",
    experience_years: 0,
    current_job_title: "",
    current_company: "",
    expected_salary: undefined,
    notice_period: "",
    skills: "",
    preferred_job_title: "",
    preferred_location: "",
    status: "active",
    notes: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["candidates", search, skillFilter, statusFilter, page],
    queryFn: () =>
      crmApi.getCandidates({
        search: search || undefined,
        skill: skillFilter || undefined,
        status: statusFilter || undefined,
        skip: (page - 1) * limit,
        limit,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newCandidate: CandidateCreate) => crmApi.createCandidate(newCandidate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (selectedCandidate) setSelectedCandidate(null);
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      country: "India",
      highest_education: "",
      experience_years: 0,
      current_job_title: "",
      current_company: "",
      expected_salary: undefined,
      notice_period: "",
      skills: "",
      preferred_job_title: "",
      preferred_location: "",
      status: "active",
      notes: "",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const candidates = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Candidates / Job Seekers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Talent database, resume profiles, skills, and recruitment tracking
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Candidate
        </Button>
      </div>

      <Card className="p-4 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Filter by skill (e.g. Python)..."
              value={skillFilter}
              onChange={(e) => {
                setSkillFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter candidates by status"
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="interviewing">Interviewing</option>
            <option value="placed">Placed</option>
            <option value="archived">Archived</option>
          </select>

          <div className="flex items-center justify-end text-xs text-slate-500 font-medium px-2">
            Total Candidates: {data?.total ?? 0}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading candidates...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-600">Failed to load candidates.</div>
        ) : candidates.length === 0 ? (
          <CardContent className="p-8">
            <EmptyState
              icon={Users}
              title="No candidates found"
              description="No candidates match your search or filter criteria. Add a new candidate to get started."
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Experience & Role</th>
                  <th className="py-3.5 px-4">Skills</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {candidate.first_name} {candidate.last_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {candidate.highest_education || "Education not specified"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{candidate.phone}</span>
                      </div>
                      {candidate.city && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 text-slate-400" />
                          <span>{candidate.city}, {candidate.state || candidate.country}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-800">
                        {candidate.experience_years} years exp
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {candidate.current_job_title || "Unemployed / Open"}
                      </div>
                      {candidate.current_company && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Briefcase className="h-2.5 w-2.5" />
                          {candidate.current_company}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      {candidate.skills ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.split(",").slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium truncate"
                            >
                              {s.trim()}
                            </span>
                          ))}
                          {candidate.skills.split(",").length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{candidate.skills.split(",").length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          candidate.status === "placed"
                            ? "default"
                            : candidate.status === "interviewing"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[11px] capitalize"
                      >
                        {candidate.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {candidate.assigned_staff ? (
                        <span>
                          {candidate.assigned_staff.first_name} {candidate.assigned_staff.last_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={archiveMutation.isPending}
                          onClick={() => {
                            if (confirm(`Archive ${candidate.first_name} ${candidate.last_name}?`)) {
                              archiveMutation.mutate(candidate.id);
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
        title="Add New Candidate"
        description="Register a new job seeker profile in the CRM database."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">First Name *</label>
              <Input
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Rohan"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Last Name *</label>
              <Input
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Sharma"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address *</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rohan.sharma@example.com"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">City</label>
              <Input
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">State</label>
              <Input
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Maharashtra"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Experience (Years)</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={formData.experience_years ?? 0}
                onChange={(e) => setFormData({ ...formData, experience_years: parseFloat(e.target.value) || 0 })}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Current Job Title</label>
              <Input
                value={formData.current_job_title || ""}
                onChange={(e) => setFormData({ ...formData, current_job_title: e.target.value })}
                placeholder="Software Engineer"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Current Company</label>
              <Input
                value={formData.current_company || ""}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                placeholder="Acme Corp"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Skills (Comma-separated)</label>
            <Input
              value={formData.skills || ""}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Python, FastAPI, React, PostgreSQL"
              className="mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Expected Salary (Annual)</label>
              <Input
                type="number"
                value={formData.expected_salary ?? ""}
                onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="1200000"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Notice Period</label>
              <Input
                value={formData.notice_period || ""}
                onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                placeholder="30 days / Immediate"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Candidate"}
            </Button>
          </div>
        </form>
      </Modal>

      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

function CandidateProfileModal({
  candidate,
  onClose,
}: {
  candidate: Candidate;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "enrollments" | "placements" | "documents">("overview");

  // Document upload state
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("resume");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docNotes, setDocNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Queries for tab data
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["candidate-enrollments", candidate.id],
    queryFn: () => crmApi.getCandidateEnrollments(candidate.id),
  });

  const { data: placements = [], isLoading: loadingPlacements } = useQuery({
    queryKey: ["candidate-placements", candidate.id],
    queryFn: () => crmApi.getCandidatePlacements(candidate.id),
  });

  const { data: documents = [], isLoading: loadingDocuments } = useQuery({
    queryKey: ["candidate-documents", candidate.id],
    queryFn: () => crmApi.getCandidateDocuments(candidate.id),
  });

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !docTitle) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("title", docTitle);
      formData.append("document_type", docType);
      formData.append("file", docFile);
      if (docNotes) formData.append("notes", docNotes);
      await crmApi.uploadCandidateDocument(candidate.id, formData);
      queryClient.invalidateQueries({ queryKey: ["candidate-documents", candidate.id] });
      setDocTitle("");
      setDocFile(null);
      setDocNotes("");
      const fileInput = document.getElementById("doc-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null;
      setUploadError(msg || "Upload failed. Please ensure file is under 10MB (PDF, DOC, DOCX, PNG, JPG).");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      await crmApi.downloadDocument(docId, filename);
    } catch {
      alert("Failed to download document");
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await crmApi.deleteDocument(docId);
      queryClient.invalidateQueries({ queryKey: ["candidate-documents", candidate.id] });
    } catch {
      alert("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${candidate.first_name} ${candidate.last_name}`}
      description={`Candidate Profile • ID: ${candidate.id.slice(0, 8)}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "enrollments"
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Courses ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab("placements")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "placements"
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Placements ({placements.length})
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "documents"
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Documents & Resumes ({documents.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                Status: {candidate.status}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                Availability: {candidate.availability_status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                Employment: {candidate.employment_status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="font-semibold text-slate-500">Email:</span>
                <p className="text-slate-900 mt-0.5">{candidate.email}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Phone:</span>
                <p className="text-slate-900 mt-0.5">{candidate.phone}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Location:</span>
                <p className="text-slate-900 mt-0.5">
                  {[candidate.city, candidate.state, candidate.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Experience:</span>
                <p className="text-slate-900 mt-0.5">{candidate.experience_years} Years</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Current Role:</span>
                <p className="text-slate-900 mt-0.5">
                  {candidate.current_job_title
                    ? `${candidate.current_job_title} at ${candidate.current_company || "N/A"}`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Expected Salary:</span>
                <p className="text-slate-900 mt-0.5">
                  {candidate.expected_salary ? `₹${Number(candidate.expected_salary).toLocaleString()}` : "Not disclosed"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Notice Period:</span>
                <p className="text-slate-900 mt-0.5">{candidate.notice_period || "Immediate"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Highest Education:</span>
                <p className="text-slate-900 mt-0.5">{candidate.highest_education || "N/A"}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-500 uppercase tracking-wide mb-1">Key Skills</h4>
              {candidate.skills ? (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.split(",").map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs border border-slate-200"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No skills listed</p>
              )}
            </div>

            {candidate.notes && (
              <div>
                <h4 className="font-semibold text-slate-500 uppercase tracking-wide mb-1">Recruiter Notes</h4>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {candidate.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Courses / Enrollments */}
        {activeTab === "enrollments" && (
          <div className="space-y-3">
            {loadingEnrollments ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading course enrollments...</div>
            ) : enrollments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Candidate is not currently enrolled in any training courses.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {enrollments.map((enr) => (
                  <div key={enr.id} className="py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{enr.course?.name || "Course"}</span>
                        <span className="text-slate-400 ml-2">({enr.course?.code})</span>
                      </div>
                      <Badge variant="outline" className="capitalize text-[11px]">
                        {enr.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Progress</span>
                        <span className="font-semibold text-indigo-600">{enr.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${enr.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Enrolled: {enr.enrollment_date}</span>
                      <span>
                        Fee Paid: <strong className="text-slate-700">₹{Number(enr.fee_paid).toLocaleString()}</strong> ({enr.payment_status})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Placements */}
        {activeTab === "placements" && (
          <div className="space-y-3">
            {loadingPlacements ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading placement records...</div>
            ) : placements.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No job interviews or placement outcomes recorded for this candidate yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {placements.map((plc) => (
                  <div key={plc.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{plc.company?.name || "Company"}</span>
                      <Badge
                        variant={plc.status === "joined" ? "default" : "outline"}
                        className="capitalize text-[11px]"
                      >
                        {plc.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {plc.job_requirement?.job_title || "Placement Role"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      {plc.interview_date && <div>Interview: {plc.interview_date}</div>}
                      {plc.offer_date && <div>Offer Date: {plc.offer_date}</div>}
                      {plc.joining_date && <div className="font-semibold text-emerald-600">Joined: {plc.joining_date}</div>}
                      {plc.salary_offered && (
                        <div>Salary: ₹{Number(plc.salary_offered).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Documents & Resumes */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            {/* Upload Document Box */}
            <form onSubmit={handleUploadDoc} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-600" /> Upload Candidate Document / Resume
              </h4>

              {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

              <div className="grid grid-cols-2 gap-2">
                <Input
                  required
                  placeholder="Document Title (e.g. Master Resume 2026)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="resume">Resume / CV</option>
                  <option value="id_proof">Government ID / Passport</option>
                  <option value="educational">Degree / Certificate</option>
                  <option value="offer_letter">Offer Letter</option>
                  <option value="payslip">Salary Payslip</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="doc-file-input"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploading}
                  className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>

            {/* Documents List */}
            {loadingDocuments ? (
              <div className="py-6 text-center text-slate-400 text-xs">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No documents uploaded yet for this candidate.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {documents.map((doc) => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{doc.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {doc.file_name} • {formatFileSize(doc.file_size)} •{" "}
                          <span className="capitalize">{doc.document_type.replace("_", " ")}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.id, doc.file_name)}
                        className="h-7 text-xs flex items-center gap-1 text-slate-700"
                      >
                        <Download className="w-3 h-3" /> Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}
