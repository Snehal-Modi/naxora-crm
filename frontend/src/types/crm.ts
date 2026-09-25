export interface StaffSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MessageResponse {
  message: string;
}

// ==================== CANDIDATE ====================
export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  alternate_phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  current_location?: string | null;
  highest_education?: string | null;
  experience_years: number;
  current_job_title?: string | null;
  current_company?: string | null;
  expected_salary?: number | null;
  notice_period?: string | null;
  skills?: string | null;
  preferred_job_title?: string | null;
  preferred_location?: string | null;
  employment_status: string;
  availability_status: string;
  source: string;
  status: string;
  assigned_staff_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  assigned_staff?: StaffSummary | null;
}

export interface CandidateCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  city?: string;
  state?: string;
  country?: string;
  current_location?: string;
  highest_education?: string;
  experience_years?: number;
  current_job_title?: string;
  current_company?: string;
  expected_salary?: number;
  notice_period?: string;
  skills?: string;
  preferred_job_title?: string;
  preferred_location?: string;
  employment_status?: string;
  availability_status?: string;
  source?: string;
  status?: string;
  assigned_staff_id?: string;
  notes?: string;
}

// ==================== COMPANY & CONTACT ====================
export interface Contact {
  id: string;
  company_id: string;
  first_name: string;
  last_name?: string | null;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactCreate {
  company_id?: string;
  first_name: string;
  last_name?: string;
  designation?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  is_primary?: boolean;
}

export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  company_size?: string | null;
  status: string;
  source: string;
  assigned_staff_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  assigned_staff?: StaffSummary | null;
  contacts: Contact[];
}

export interface CompanyCreate {
  name: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  company_size?: string;
  status?: string;
  source?: string;
  assigned_staff_id?: string;
  notes?: string;
}

// ==================== PIPELINE & STAGES ====================
export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  order: number;
  color_hex: string;
  is_system_stage: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  pipeline_type: string;
  description?: string | null;
  is_active: boolean;
  stages: PipelineStage[];
}

// ==================== LEAD ====================
export interface LeadAssignment {
  id: string;
  lead_id: string;
  assigned_at: string;
  notes?: string | null;
  assigned_by: StaffSummary;
  assigned_to: StaffSummary;
}

export interface Lead {
  id: string;
  title: string;
  lead_type: string;
  source: string;
  status: string;
  priority: string;
  pipeline_id?: string | null;
  stage_id?: string | null;
  candidate_id?: string | null;
  company_id?: string | null;
  assigned_staff_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  created_at: string;
  updated_at: string;
  assigned_staff?: StaffSummary | null;
  stage?: PipelineStage | null;
  pipeline?: Pipeline | null;
  assignments: LeadAssignment[];
}

export interface LeadCreate {
  title: string;
  lead_type: string;
  source?: string;
  status?: string;
  priority?: string;
  pipeline_id?: string;
  stage_id?: string;
  candidate_id?: string;
  company_id?: string;
  assigned_staff_id?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  next_follow_up_at?: string;
}

// ==================== JOB REQUIREMENT ====================
export interface CandidateJobMatch {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  notes?: string | null;
  interview_date?: string | null;
  result?: string | null;
  placement_status?: string | null;
  submitted_date: string;
  created_at: string;
  candidate?: Candidate | null;
}

export interface JobRequirement {
  id: string;
  job_title: string;
  company_id: string;
  contact_id?: string | null;
  description?: string | null;
  required_skills?: string | null;
  experience_min_years: number;
  experience_max_years: number;
  salary_min?: number | null;
  salary_max?: number | null;
  location?: string | null;
  employment_type: string;
  vacancies: number;
  status: string;
  priority: string;
  assigned_staff_id?: string | null;
  opened_date?: string | null;
  closing_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  company?: Company | null;
  assigned_staff?: StaffSummary | null;
  candidate_matches: CandidateJobMatch[];
}

export interface JobRequirementCreate {
  job_title: string;
  company_id: string;
  contact_id?: string;
  description?: string;
  required_skills?: string;
  experience_min_years?: number;
  experience_max_years?: number;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  employment_type?: string;
  vacancies?: number;
  status?: string;
  priority?: string;
  assigned_staff_id?: string;
  notes?: string;
}

// ==================== TASK ====================
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assigned_user_id: string;
  due_date?: string | null;
  priority: string;
  status: string;
  related_lead_id?: string | null;
  related_candidate_id?: string | null;
  related_company_id?: string | null;
  related_job_id?: string | null;
  reminder_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: StaffSummary | null;
}

export interface TaskCreate {
  title: string;
  description?: string;
  assigned_user_id?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  related_lead_id?: string;
  related_candidate_id?: string;
  related_company_id?: string;
  related_job_id?: string;
  reminder_date?: string;
}

// ==================== ACTIVITY & NOTE ====================
export interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description?: string | null;
  user_id: string;
  related_lead_id?: string | null;
  related_candidate_id?: string | null;
  related_company_id?: string | null;
  related_job_id?: string | null;
  created_at: string;
  user?: StaffSummary | null;
}

export interface Note {
  id: string;
  content: string;
  author_id: string;
  related_lead_id?: string | null;
  related_candidate_id?: string | null;
  related_company_id?: string | null;
  related_job_id?: string | null;
  created_at: string;
  updated_at: string;
  author?: StaffSummary | null;
}

// ==================== DASHBOARD STATS ====================
export interface AdminDashboardStats {
  total_candidates: number;
  total_employers: number;
  active_leads: number;
  open_jobs: number;
  pending_tasks: number;
  upcoming_interviews: number;
  recent_activities: Activity[];
  urgent_tasks: Task[];
}

export interface StaffDashboardStats {
  my_leads: number;
  my_candidates: number;
  my_employers: number;
  my_tasks: number;
  overdue_tasks: number;
  recent_activities: Activity[];
  today_tasks: Task[];
}

