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
  CourseCategory,
  CourseCategoryCreate,
  CourseCategoryUpdate,
  Course,
  CourseCreate,
  CourseUpdate,
  ServiceCategory,
  ServiceCategoryCreate,
  ServiceCategoryUpdate,
  Service,
  ServiceCreate,
  ServiceUpdate,
  Enrollment,
  EnrollmentCreate,
  EnrollmentUpdate,
  EnrollmentProgressUpdate,
  Placement,
  PlacementCreate,
  PlacementUpdate,
  CandidateDocument,
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
  getCandidateEnrollments: async (id: string): Promise<Enrollment[]> => {
    const res = await apiClient.get<Enrollment[]>(`/candidates/${id}/enrollments`);
    return res.data;
  },
  getCandidatePlacements: async (id: string): Promise<Placement[]> => {
    const res = await apiClient.get<Placement[]>(`/candidates/${id}/placements`);
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
    pipeline_id?: string;
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
  archiveJob: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/jobs/${id}`);
    return res.data;
  },
  matchCandidate: async (jobId: string, data: { candidate_id: string; status?: string; notes?: string }): Promise<CandidateJobMatch> => {
    const res = await apiClient.post<CandidateJobMatch>(`/jobs/${jobId}/matches`, data);
    return res.data;
  },
  matchCandidateToJob: async (jobId: string, data: { candidate_id: string; status?: string; notes?: string }): Promise<CandidateJobMatch> => {
    const res = await apiClient.post<CandidateJobMatch>(`/jobs/${jobId}/matches`, data);
    return res.data;
  },

  // COURSES & CATEGORIES
  getCourses: async (params?: {
    search?: string;
    category_id?: string;
    mode?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Course>> => {
    const res = await apiClient.get<PaginatedResponse<Course>>("/courses", { params });
    return res.data;
  },
  getCourse: async (id: string): Promise<Course> => {
    const res = await apiClient.get<Course>(`/courses/${id}`);
    return res.data;
  },
  createCourse: async (data: CourseCreate): Promise<Course> => {
    const res = await apiClient.post<Course>("/courses", data);
    return res.data;
  },
  updateCourse: async (id: string, data: CourseUpdate): Promise<Course> => {
    const res = await apiClient.put<Course>(`/courses/${id}`, data);
    return res.data;
  },
  archiveCourse: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/courses/${id}`);
    return res.data;
  },
  getCourseEnrollments: async (courseId: string): Promise<Enrollment[]> => {
    const res = await apiClient.get<Enrollment[]>(`/courses/${courseId}/enrollments`);
    return res.data;
  },
  getCourseCategories: async (params?: {
    search?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CourseCategory>> => {
    const res = await apiClient.get<PaginatedResponse<CourseCategory>>("/courses/categories", { params });
    return res.data;
  },
  createCourseCategory: async (data: CourseCategoryCreate): Promise<CourseCategory> => {
    const res = await apiClient.post<CourseCategory>("/courses/categories", data);
    return res.data;
  },
  updateCourseCategory: async (id: string, data: CourseCategoryUpdate): Promise<CourseCategory> => {
    const res = await apiClient.put<CourseCategory>(`/courses/categories/${id}`, data);
    return res.data;
  },
  archiveCourseCategory: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/courses/categories/${id}`);
    return res.data;
  },

  // SERVICES & CATEGORIES
  getServices: async (params?: {
    search?: string;
    category_id?: string;
    delivery_mode?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Service>> => {
    const res = await apiClient.get<PaginatedResponse<Service>>("/services", { params });
    return res.data;
  },
  getService: async (id: string): Promise<Service> => {
    const res = await apiClient.get<Service>(`/services/${id}`);
    return res.data;
  },
  createService: async (data: ServiceCreate): Promise<Service> => {
    const res = await apiClient.post<Service>("/services", data);
    return res.data;
  },
  updateService: async (id: string, data: ServiceUpdate): Promise<Service> => {
    const res = await apiClient.put<Service>(`/services/${id}`, data);
    return res.data;
  },
  archiveService: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/services/${id}`);
    return res.data;
  },
  getServiceCategories: async (params?: {
    search?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ServiceCategory>> => {
    const res = await apiClient.get<PaginatedResponse<ServiceCategory>>("/services/categories", { params });
    return res.data;
  },
  createServiceCategory: async (data: ServiceCategoryCreate): Promise<ServiceCategory> => {
    const res = await apiClient.post<ServiceCategory>("/services/categories", data);
    return res.data;
  },
  updateServiceCategory: async (id: string, data: ServiceCategoryUpdate): Promise<ServiceCategory> => {
    const res = await apiClient.put<ServiceCategory>(`/services/categories/${id}`, data);
    return res.data;
  },
  archiveServiceCategory: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/services/categories/${id}`);
    return res.data;
  },

  // ENROLLMENTS
  getEnrollments: async (params?: {
    candidate_id?: string;
    course_id?: string;
    status?: string;
    payment_status?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Enrollment>> => {
    const res = await apiClient.get<PaginatedResponse<Enrollment>>("/enrollments", { params });
    return res.data;
  },
  getEnrollment: async (id: string): Promise<Enrollment> => {
    const res = await apiClient.get<Enrollment>(`/enrollments/${id}`);
    return res.data;
  },
  createEnrollment: async (data: EnrollmentCreate): Promise<Enrollment> => {
    const res = await apiClient.post<Enrollment>("/enrollments", data);
    return res.data;
  },
  updateEnrollment: async (id: string, data: EnrollmentUpdate): Promise<Enrollment> => {
    const res = await apiClient.put<Enrollment>(`/enrollments/${id}`, data);
    return res.data;
  },
  updateEnrollmentProgress: async (id: string, data: EnrollmentProgressUpdate): Promise<Enrollment> => {
    const res = await apiClient.patch<Enrollment>(`/enrollments/${id}/progress`, data);
    return res.data;
  },
  archiveEnrollment: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/enrollments/${id}`);
    return res.data;
  },

  // PLACEMENTS
  getPlacements: async (params?: {
    candidate_id?: string;
    company_id?: string;
    job_requirement_id?: string;
    status?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Placement>> => {
    const res = await apiClient.get<PaginatedResponse<Placement>>("/placements", { params });
    return res.data;
  },
  getPlacement: async (id: string): Promise<Placement> => {
    const res = await apiClient.get<Placement>(`/placements/${id}`);
    return res.data;
  },
  createPlacement: async (data: PlacementCreate): Promise<Placement> => {
    const res = await apiClient.post<Placement>("/placements", data);
    return res.data;
  },
  updatePlacement: async (id: string, data: PlacementUpdate): Promise<Placement> => {
    const res = await apiClient.put<Placement>(`/placements/${id}`, data);
    return res.data;
  },
  archivePlacement: async (id: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/placements/${id}`);
    return res.data;
  },

  // CANDIDATE DOCUMENTS
  getCandidateDocuments: async (candidateId: string): Promise<CandidateDocument[]> => {
    const res = await apiClient.get<CandidateDocument[]>(`/candidates/${candidateId}/documents`);
    return res.data;
  },
  uploadCandidateDocument: async (
    candidateId: string,
    formData: FormData
  ): Promise<CandidateDocument> => {
    const res = await apiClient.post<CandidateDocument>(
      `/candidates/${candidateId}/documents`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },
  downloadDocument: async (documentId: string, filename: string): Promise<void> => {
    const res = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  deleteDocument: async (documentId: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/documents/${documentId}`);
    return res.data;
  },

  // TASKS
  getTasks: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    filter_type?: string;
    assigned_user_id?: string;
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
    skip?: number;
    limit?: number;
  }): Promise<Activity[]> => {
    const res = await apiClient.get<Activity[]>("/activities", { params });
    return res.data;
  },
  addNote: async (data: {
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
