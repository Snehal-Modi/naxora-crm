"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Search,
  Plus,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  UserPlus,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { JobRequirement, JobRequirementCreate } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";

export default function JobsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequirement | null>(null);
  const [matchModalJobId, setMatchModalJobId] = useState<string | null>(null);
  const [matchCandidateId, setMatchCandidateId] = useState("");
  const [matchNotes, setMatchNotes] = useState("");

  const [jobForm, setJobForm] = useState<JobRequirementCreate>({
    job_title: "",
    company_id: "",
    description: "",
    required_skills: "",
    experience_min_years: 1,
    experience_max_years: 5,
    salary_min: undefined,
    salary_max: undefined,
    location: "Bengaluru / Hybrid",
    employment_type: "full_time",
    vacancies: 1,
    status: "open",
    priority: "high",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs", search, statusFilter, page],
    queryFn: () =>
      crmApi.getJobs({
        search: search || undefined,
        status: statusFilter || undefined,
        skip: (page - 1) * limit,
        limit,
      }),
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies-dropdown"],
    queryFn: () => crmApi.getCompanies({ limit: 100 }),
  });

  const { data: candidatesData } = useQuery({
    queryKey: ["candidates-dropdown"],
    queryFn: () => crmApi.getCandidates({ limit: 100 }),
  });

  const createJobMutation = useMutation({
    mutationFn: (newJob: JobRequirementCreate) => crmApi.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsCreateOpen(false);
      setJobForm({
        job_title: "",
        company_id: "",
        description: "",
        required_skills: "",
        experience_min_years: 1,
        experience_max_years: 5,
        salary_min: undefined,
        salary_max: undefined,
        location: "Bengaluru / Hybrid",
        employment_type: "full_time",
        vacancies: 1,
        status: "open",
        priority: "high",
      });
    },
  });

  const matchMutation = useMutation({
    mutationFn: ({ jobId, candidateId, notes }: { jobId: string; candidateId: string; notes?: string }) =>
      crmApi.matchCandidate(jobId, { candidate_id: candidateId, notes, status: "submitted" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setMatchModalJobId(null);
      setMatchCandidateId("");
      setMatchNotes("");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (selectedJob) setSelectedJob(null);
    },
  });

  const jobs = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-600" />
            Job Requirements &amp; Positions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Open hiring mandates from employers and candidate matching pipelines
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Post Job Requirement
        </Button>
      </div>

      <Card className="p-4 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search jobs by title, skills, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
            aria-label="Filter jobs by status"
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="on_hold">On Hold</option>
            <option value="closed">Closed</option>
          </select>

          <div className="flex items-center justify-end text-xs text-slate-500 font-medium px-2">
            Total Job Mandates: {data?.total ?? 0}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading job postings...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-600">Failed to load jobs.</div>
        ) : jobs.length === 0 ? (
          <CardContent className="p-8">
            <EmptyState
              icon={Briefcase}
              title="No job requirements found"
              description="Post an employer hiring requirement to start screening and matching candidates."
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Job Title</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Experience &amp; Skills</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Candidates Matched</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{job.job_title}</div>
                      <div className="text-xs text-slate-400">
                        {job.vacancies} vacancy(ies) • {job.employment_type.replace("_", " ")}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{job.company ? job.company.name : "Company Client"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-800">
                        {job.experience_min_years}-{job.experience_max_years} yrs exp
                      </div>
                      {job.required_skills && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                          {job.required_skills}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{job.location || "Remote"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="secondary" className="text-xs">
                        {job.candidate_matches ? job.candidate_matches.length : 0} Candidates
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={job.status === "open" ? "default" : "outline"}
                        className="text-[11px] capitalize"
                      >
                        {job.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Match Candidate"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600"
                          onClick={() => setMatchModalJobId(job.id)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={archiveMutation.isPending}
                          onClick={() => {
                            if (confirm(`Archive job opening "${job.job_title}"?`)) {
                              archiveMutation.mutate(job.id);
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
        title="Post Job Requirement"
        description="Create an employer recruitment requisition."
        maxWidth="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createJobMutation.mutate(jobForm);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Job Title *</label>
              <Input
                required
                value={jobForm.job_title}
                onChange={(e) => setJobForm({ ...jobForm, job_title: e.target.value })}
                placeholder="Senior Full Stack Engineer"
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Hiring Employer *</label>
              <select
                required
                value={jobForm.company_id}
                onChange={(e) => setJobForm({ ...jobForm, company_id: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              >
                <option value="">Select Employer Company</option>
                {companiesData?.items?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Required Skills</label>
            <Input
              value={jobForm.required_skills || ""}
              onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })}
              placeholder="React, TypeScript, Next.js, Node.js"
              className="mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Min Exp (Years)</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={jobForm.experience_min_years ?? 1}
                onChange={(e) => setJobForm({ ...jobForm, experience_min_years: parseFloat(e.target.value) || 0 })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Max Exp (Years)</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={jobForm.experience_max_years ?? 5}
                onChange={(e) => setJobForm({ ...jobForm, experience_max_years: parseFloat(e.target.value) || 0 })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Vacancies</label>
              <Input
                type="number"
                min="1"
                value={jobForm.vacancies ?? 1}
                onChange={(e) => setJobForm({ ...jobForm, vacancies: parseInt(e.target.value) || 1 })}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Location</label>
              <Input
                value={jobForm.location || ""}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                placeholder="Bengaluru / Remote"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Employment Type</label>
              <select
                value={jobForm.employment_type || "full_time"}
                onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createJobMutation.isPending}>
              {createJobMutation.isPending ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </Modal>

      {matchModalJobId && (
        <Modal
          isOpen={!!matchModalJobId}
          onClose={() => setMatchModalJobId(null)}
          title="Submit / Match Candidate to Job"
          description="Select a candidate from the talent pool to submit for this requisition."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (matchCandidateId) {
                matchMutation.mutate({
                  jobId: matchModalJobId,
                  candidateId: matchCandidateId,
                  notes: matchNotes,
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold text-slate-700">Select Candidate *</label>
              <select
                required
                value={matchCandidateId}
                onChange={(e) => setMatchCandidateId(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              >
                <option value="">Choose a Candidate</option>
                {candidatesData?.items?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} ({c.email}) - {c.experience_years} yrs exp
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Submission Pitch / Notes</label>
              <Input
                placeholder="Candidate has 4+ years React experience and strong system design..."
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setMatchModalJobId(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={matchMutation.isPending}>
                {matchMutation.isPending ? "Submitting..." : "Submit Candidate"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.job_title}
          description={`Employer: ${selectedJob.company ? selectedJob.company.name : "Client"}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
              <div>
                <span className="font-semibold text-slate-500">Location:</span>
                <p className="text-slate-800 mt-0.5">{selectedJob.location || "Remote"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Type:</span>
                <p className="text-slate-800 mt-0.5 capitalize">{selectedJob.employment_type.replace("_", " ")}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Experience Range:</span>
                <p className="text-slate-800 mt-0.5">{selectedJob.experience_min_years}-{selectedJob.experience_max_years} Years</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Vacancies:</span>
                <p className="text-slate-800 mt-0.5">{selectedJob.vacancies}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wide">Required Skills</h4>
              <p className="mt-1 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-md">
                {selectedJob.required_skills || "General requirements"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wide mb-2">
                Matched Candidates ({selectedJob.candidate_matches.length})
              </h4>
              {selectedJob.candidate_matches.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No candidates submitted yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedJob.candidate_matches.map((m) => (
                    <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">
                          {m.candidate ? `${m.candidate.first_name} ${m.candidate.last_name}` : "Candidate"}
                        </div>
                        <div className="text-slate-500 text-[11px]">Status: {m.status}</div>
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {m.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
