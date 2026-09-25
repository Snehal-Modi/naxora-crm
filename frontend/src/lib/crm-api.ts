import { apiClient } from "./api";
import {
  Candidate,
  CandidateCreate,
  Company,
  CompanyCreate,
  Contact,
  ContactCreate,
  Lead,
  LeadCreate,
  JobRequirement,
  JobRequirementCreate,
  CandidateJobMatch,
  Task,
  TaskCreate,
  Activity,
  Note,
  Pipeline,
  AdminDashboardStats,
  StaffDashboardStats,
  PaginatedResponse,
  MessageResponse,
} from "@/types/crm";

export const crmApi = {
  // DASHBOARD
  getStats: async (): Promise<AdminDashboardStats | StaffDashboardStats> => {
    const res = await apiClient.get<AdminDashboardStats | StaffDashboardStats>("/dashboards/stats");
    return res.data;
  },

  // CANDIDATES
  getCandidates: async (params?: {
    search?: string;
    skill?: string;
    status?: string;
    city?: string;
    assigned_staff_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Candidate>> => {
    const res = await apiClient.get<PaginatedResponse<Candidate>>("/candidates", { params });
    return res.data;
  },
  getCandidate: async (id: string): Promise<Candidate> => {
    const res = await apiClient.get<Candidate>(`/candidates/${id}`);
    return res.data;
  },
  createCandidate: async (data: CandidateCreate): Promise<Candidate> => {
    const res = await apiClient.post<Candidate>("/candidates", data);
    return res.data;
  },
  updateCandidate: async (id: string, data: Partial<CandidateCreate>): Promise<Candidate> => {
    const res = await apiClient.patch<Candidate>(`/candidates/${id}`, data);
    return res.data;
  },
  archiveCandidate: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/candidates/${id}`);
    return res.data;
  },

  // COMPANIES & CONTACTS
  getCompanies: async (params?: {
    search?: string;
    industry?: string;
    status?: string;
    assigned_staff_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Company>> => {
    const res = await apiClient.get<PaginatedResponse<Company>>("/companies", { params });
    return res.data;
  },
  getCompany: async (id: string): Promise<Company> => {
    const res = await apiClient.get<Company>(`/companies/${id}`);
    return res.data;
  },
  createCompany: async (data: CompanyCreate): Promise<Company> => {
    const res = await apiClient.post<Company>("/companies", data);
    return res.data;
  },
  updateCompany: async (id: string, data: Partial<CompanyCreate>): Promise<Company> => {
    const res = await apiClient.patch<Company>(`/companies/${id}`, data);
    return res.data;
  },
  addContact: async (companyId: string, data: ContactCreate): Promise<Contact> => {
    const res = await apiClient.post<Contact>(`/companies/${companyId}/contacts`, data);
    return res.data;
  },
  archiveCompany: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/companies/${id}`);
    return res.data;
  },

  // PIPELINES
  getPipelines: async (): Promise<Pipeline[]> => {
    const res = await apiClient.get<Pipeline[]>("/pipelines");
    return res.data;
  },

  // LEADS
  getLeads: async (params?: {
    search?: string;
    lead_type?: string;
    status?: string;
    priority?: string;
    pipeline_id?: string;
    stage_id?: string;
    assigned_staff_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Lead>> => {
    const res = await apiClient.get<PaginatedResponse<Lead>>("/leads", { params });
    return res.data;
  },
  getLead: async (id: string): Promise<Lead> => {
    const res = await apiClient.get<Lead>(`/leads/${id}`);
    return res.data;
  },
  createLead: async (data: LeadCreate): Promise<Lead> => {
    const res = await apiClient.post<Lead>("/leads", data);
    return res.data;
  },
  updateLead: async (id: string, data: Partial<LeadCreate>): Promise<Lead> => {
    const res = await apiClient.patch<Lead>(`/leads/${id}`, data);
    return res.data;
  },
  assignLead: async (id: string, data: { assigned_to_id: string; notes?: string }): Promise<Lead> => {
    const res = await apiClient.post<Lead>(`/leads/${id}/assign`, data);
    return res.data;
  },
  archiveLead: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/leads/${id}`);
    return res.data;
  },

  // JOBS
  getJobs: async (params?: {
    search?: string;
    company_id?: string;
    status?: string;
    assigned_staff_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<JobRequirement>> => {
    const res = await apiClient.get<PaginatedResponse<JobRequirement>>("/jobs", { params });
    return res.data;
  },
  getJob: async (id: string): Promise<JobRequirement> => {
    const res = await apiClient.get<JobRequirement>(`/jobs/${id}`);
    return res.data;
  },
  createJob: async (data: JobRequirementCreate): Promise<JobRequirement> => {
    const res = await apiClient.post<JobRequirement>("/jobs", data);
    return res.data;
  },
  updateJob: async (id: string, data: Partial<JobRequirementCreate>): Promise<JobRequirement> => {
    const res = await apiClient.patch<JobRequirement>(`/jobs/${id}`, data);
    return res.data;
  },
  matchCandidate: async (jobId: string, data: { candidate_id: string; notes?: string; status?: string }): Promise<CandidateJobMatch> => {
    const res = await apiClient.post<CandidateJobMatch>(`/jobs/${jobId}/matches`, data);
    return res.data;
  },
  archiveJob: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/jobs/${id}`);
    return res.data;
  },

  // TASKS
  getTasks: async (params?: {
    filter_type?: string;
    status?: string;
    priority?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> => {
    const res = await apiClient.get<PaginatedResponse<Task>>("/tasks", { params });
    return res.data;
  },
  createTask: async (data: TaskCreate): Promise<Task> => {
    const res = await apiClient.post<Task>("/tasks", data);
    return res.data;
  },
  completeTask: async (id: string): Promise<Task> => {
    const res = await apiClient.post<Task>(`/tasks/${id}/complete`);
    return res.data;
  },

  // ACTIVITIES & NOTES
  getActivities: async (params?: {
    limit?: number;
    related_candidate_id?: string;
    related_company_id?: string;
    related_lead_id?: string;
    related_job_id?: string;
  }): Promise<Activity[]> => {
    const res = await apiClient.get<Activity[]>("/activities", { params });
    return res.data;
  },
  getNotes: async (params?: {
    related_candidate_id?: string;
    related_company_id?: string;
    related_lead_id?: string;
    related_job_id?: string;
  }): Promise<Note[]> => {
    const res = await apiClient.get<Note[]>("/notes", { params });
    return res.data;
  },
  createNote: async (data: {
    content: string;
    related_candidate_id?: string;
    related_company_id?: string;
    related_lead_id?: string;
    related_job_id?: string;
  }): Promise<Note> => {
    const res = await apiClient.post<Note>("/notes", data);
    return res.data;
  },
};

