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

// ==================== COURSES & CATEGORIES ====================
export interface CourseCategory {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseCategoryCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CourseCategoryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CourseSummary {
  id: string;
  name: string;
  code: string;
  duration?: string | null;
  mode: string;
  fee: number;
  status: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  short_description?: string | null;
  category_id?: string | null;
  duration?: string | null;
  mode: string; // online, offline, hybrid
  fee: number;
  status: string; // draft, active, inactive, completed, archived
  capacity: number;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  category?: CourseCategory | null;
  created_by?: StaffSummary | null;
  enrollment_count: number;
}

export interface CourseCreate {
  name: string;
  code: string;
  description?: string;
  short_description?: string;
  category_id?: string;
  duration?: string;
  mode?: string;
  fee: number;
  status?: string;
  capacity?: number;
  start_date?: string;
  end_date?: string;
}

export interface CourseUpdate {
  name?: string;
  code?: string;
  description?: string;
  short_description?: string;
  category_id?: string;
  duration?: string;
  mode?: string;
  fee?: number;
  status?: string;
  capacity?: number;
  start_date?: string;
  end_date?: string;
}

// ==================== SERVICES & CATEGORIES ====================
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoryCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface ServiceCategoryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ServiceSummary {
  id: string;
  name: string;
  code: string;
  delivery_mode: string;
  fee: number;
  status: string;
}

export interface Service {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  short_description?: string | null;
  category_id?: string | null;
  delivery_mode: string; // online, offline, hybrid
  fee: number;
  status: string; // draft, active, inactive, archived
  created_at: string;
  updated_at: string;
  category?: ServiceCategory | null;
  created_by?: StaffSummary | null;
}

export interface ServiceCreate {
  name: string;
  code: string;
  description?: string;
  short_description?: string;
  category_id?: string;
  delivery_mode?: string;
  fee: number;
  status?: string;
}

export interface ServiceUpdate {
  name?: string;
  code?: string;
  description?: string;
  short_description?: string;
  category_id?: string;
  delivery_mode?: string;
  fee?: number;
  status?: string;
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
  lead_type: string; // candidate, employer, course, service
  source: string;
  status: string;
  priority: string;
  pipeline_id?: string | null;
  stage_id?: string | null;
  candidate_id?: string | null;
  company_id?: string | null;
  course_id?: string | null;
  service_id?: string | null;
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
  course?: CourseSummary | null;
  service?: ServiceSummary | null;
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
  course_id?: string;
  service_id?: string;
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
  submitted_date: string;
  interview_date?: string | null;
  result?: string | null;
  placement_status?: string | null;
  candidate?: Candidate;
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
  company?: Company;
  contact?: Contact;
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
  opened_date?: string;
  closing_date?: string;
  notes?: string;
}

// ==================== ENROLLMENTS ====================
export interface Enrollment {
  id: string;
  candidate_id: string;
  course_id: string;
  enrollment_date: string;
  status: string; // enrolled, in_progress, completed, dropped, cancelled
  progress_percentage: number; // 0 to 100
  fee_paid: number;
  payment_status: string; // pending, partial, paid, refunded
  completion_date?: string | null;
  certificate_issued: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  candidate?: Candidate | null;
  course?: CourseSummary | null;
  created_by?: StaffSummary | null;
}

export interface EnrollmentCreate {
  candidate_id: string;
  course_id: string;
  enrollment_date?: string;
  status?: string;
  progress_percentage?: number;
  fee_paid?: number;
  payment_status?: string;
  completion_date?: string;
  certificate_issued?: boolean;
  notes?: string;
}

export interface EnrollmentUpdate {
  status?: string;
  progress_percentage?: number;
  fee_paid?: number;
  payment_status?: string;
  completion_date?: string;
  certificate_issued?: boolean;
  notes?: string;
}

export interface EnrollmentProgressUpdate {
  progress_percentage: number;
  status?: string;
  completion_date?: string;
  notes?: string;
}

// ==================== PLACEMENTS ====================
export interface Placement {
  id: string;
  candidate_id: string;
  company_id: string;
  job_requirement_id?: string | null;
  status: string; // applied, screening, interview_scheduled, interview_completed, offered, joined, rejected, backed_out
  interview_date?: string | null;
  offer_date?: string | null;
  joining_date?: string | null;
  salary_offered?: number | null;
  placement_fee?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  candidate?: Candidate | null;
  company?: Company | null;
  job_requirement?: JobRequirement | null;
  created_by?: StaffSummary | null;
}

export interface PlacementCreate {
  candidate_id: string;
  company_id: string;
  job_requirement_id?: string;
  status?: string;
  interview_date?: string;
  offer_date?: string;
  joining_date?: string;
  salary_offered?: number;
  placement_fee?: number;
  notes?: string;
}

export interface PlacementUpdate {
  candidate_id?: string;
  company_id?: string;
  job_requirement_id?: string;
  status?: string;
  interview_date?: string;
  offer_date?: string;
  joining_date?: string;
  salary_offered?: number;
  placement_fee?: number;
  notes?: string;
}

// ==================== CANDIDATE DOCUMENTS ====================
export interface CandidateDocument {
  id: string;
  candidate_id: string;
  title: string;
  document_type: string; // resume, id_proof, educational, certificate, offer_letter, payslip, other
  file_name: string;
  file_size: number;
  mime_type: string;
  is_verified: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by?: StaffSummary | null;
}

// ==================== TASK ====================
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assigned_user_id?: string | null;
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
  active_courses: number;
  course_enquiries: number;
  active_enrollments: number;
  completed_enrollments: number;
  active_services: number;
  service_enquiries: number;
  total_placements: number;
  joined_placements: number;
  recent_activities: Activity[];
  urgent_tasks: Task[];
}

export interface StaffDashboardStats {
  my_leads: number;
  my_candidates: number;
  my_employers: number;
  my_tasks: number;
  overdue_tasks: number;
  my_enrollments: number;
  my_placements: number;
  active_courses: number;
  course_enquiries: number;
  recent_activities: Activity[];
  today_tasks: Task[];
}
