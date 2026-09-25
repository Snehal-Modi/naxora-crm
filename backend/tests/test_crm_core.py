"""Comprehensive tests for CRM Core modules (Phase 2)."""

import uuid
from decimal import Decimal
from fastapi.testclient import TestClient


def test_candidates_crud(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Candidate
    candidate_payload = {
        "first_name": "Rohan",
        "last_name": "Sharma",
        "email": f"rohan.sharma.{uuid.uuid4().hex[:6]}@example.com",
        "phone": "+91 9876543210",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "highest_education": "B.Tech Computer Science",
        "experience_years": 4.5,
        "current_job_title": "Full Stack Developer",
        "current_company": "Tech Corp",
        "expected_salary": 1200000.0,
        "notice_period": "30 days",
        "skills": "Python, FastAPI, React, PostgreSQL",
        "preferred_job_title": "Senior Python Engineer",
        "preferred_location": "Mumbai / Remote",
        "employment_status": "employed",
        "availability_status": "actively_looking",
        "source": "LinkedIn",
        "status": "active"
    }
    create_res = client.post("/api/v1/candidates", json=candidate_payload, headers=headers)
    assert create_res.status_code == 201, create_res.text
    candidate_data = create_res.json()
    candidate_id = candidate_data["id"]
    assert candidate_data["first_name"] == "Rohan"
    assert "FastAPI" in candidate_data["skills"]

    # 2. Get Candidate by ID
    get_res = client.get(f"/api/v1/candidates/{candidate_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["email"] == candidate_payload["email"]

    # 3. Search & Filter Candidate
    search_res = client.get(f"/api/v1/candidates?search=Rohan&skill=FastAPI", headers=headers)
    assert search_res.status_code == 200
    items = search_res.json()["items"]
    assert any(c["id"] == candidate_id for c in items)

    # 4. Update Candidate
    update_res = client.patch(
        f"/api/v1/candidates/{candidate_id}",
        json={"expected_salary": 1500000.0, "status": "interviewing"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert float(update_res.json()["expected_salary"]) == 1500000.0
    assert update_res.json()["status"] == "interviewing"

    # 5. Soft Delete Candidate
    del_res = client.delete(f"/api/v1/candidates/{candidate_id}", headers=headers)
    assert del_res.status_code == 200

    # 6. Verify Soft Deleted (not returned in normal fetch)
    verify_get = client.get(f"/api/v1/candidates/{candidate_id}", headers=headers)
    assert verify_get.status_code == 404


def test_companies_and_contacts(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Company
    company_payload = {
        "name": f"Acme Innovations {uuid.uuid4().hex[:6]}",
        "industry": "Information Technology",
        "website": "https://acmeinnovations.example.com",
        "phone": "+91 22 12345678",
        "email": "hr@acmeinnovations.example.com",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "status": "client"
    }
    create_res = client.post("/api/v1/companies", json=company_payload, headers=headers)
    assert create_res.status_code == 201, create_res.text
    company = create_res.json()
    company_id = company["id"]
    assert company["name"] == company_payload["name"]

    # 2. Add Contact to Company
    contact_payload = {
        "company_id": company_id,
        "first_name": "Priya",
        "last_name": "Nair",
        "designation": "Talent Acquisition Lead",
        "email": f"priya.{uuid.uuid4().hex[:6]}@acmeinnovations.example.com",
        "phone": "+91 9988776655",
        "is_primary": True
    }
    contact_res = client.post(f"/api/v1/companies/{company_id}/contacts", json=contact_payload, headers=headers)
    assert contact_res.status_code == 201, contact_res.text
    contact = contact_res.json()
    assert contact["first_name"] == "Priya"
    assert contact["is_primary"] is True

    # 3. Retrieve Company with contacts included
    get_res = client.get(f"/api/v1/companies/{company_id}", headers=headers)
    assert get_res.status_code == 200
    comp_detail = get_res.json()
    assert len(comp_detail["contacts"]) >= 1
    assert comp_detail["contacts"][0]["designation"] == "Talent Acquisition Lead"


def test_pipelines_and_stages(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch seeded pipelines
    res = client.get("/api/v1/pipelines", headers=headers)
    assert res.status_code == 200
    pipelines = res.json()
    assert len(pipelines) >= 2
    pipeline_names = [p["name"] for p in pipelines]
    assert "Candidate Pipeline" in pipeline_names
    assert "Employer Pipeline" in pipeline_names


def test_leads_and_assignment(client: TestClient, admin_token: str, staff_token: str):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # 1. Get staff user ID
    me_res = client.get("/api/v1/auth/me", headers=staff_headers)
    assert me_res.status_code == 200
    staff_user_id = me_res.json()["id"]

    # 2. Admin creates a lead
    lead_payload = {
        "title": "Corporate Recruitment Retainer - Apex FinTech",
        "lead_type": "employer",
        "source": "Website Enquiry",
        "first_name": "Vikram",
        "last_name": "Mehta",
        "email": f"vikram.{uuid.uuid4().hex[:6]}@apexfin.example.com",
        "phone": "+91 9123456780",
        "company_name": "Apex FinTech Services",
        "priority": "high",
        "status": "new"
    }
    create_res = client.post("/api/v1/leads", json=lead_payload, headers=admin_headers)
    assert create_res.status_code == 201, create_res.text
    lead = create_res.json()
    lead_id = lead["id"]
    assert lead["status"] == "new"

    # 3. Assign Lead to Staff
    assign_payload = {
        "assigned_to_id": staff_user_id,
        "notes": "Assigned to staff recruiter for initial discovery call."
    }
    assign_res = client.post(f"/api/v1/leads/{lead_id}/assign", json=assign_payload, headers=admin_headers)
    assert assign_res.status_code == 200
    updated_lead = assign_res.json()
    assert updated_lead["assigned_staff_id"] == staff_user_id
    assert updated_lead["assigned_staff"]["email"] == "staff@nexorastaffing.com"

    # 4. Staff queries their leads and finds this lead
    staff_leads_res = client.get(f"/api/v1/leads?assigned_staff_id={staff_user_id}", headers=staff_headers)
    assert staff_leads_res.status_code == 200
    staff_leads = staff_leads_res.json()["items"]
    assert any(l["id"] == lead_id for l in staff_leads)


def test_job_requirements_and_matching(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Company
    company_res = client.post("/api/v1/companies", json={
        "name": f"Hiring Corp {uuid.uuid4().hex[:6]}",
        "status": "client"
    }, headers=headers)
    company_id = company_res.json()["id"]

    # 2. Create Candidate
    candidate_res = client.post("/api/v1/candidates", json={
        "first_name": "Ananya",
        "last_name": "Iyer",
        "email": f"ananya.{uuid.uuid4().hex[:6]}@example.com",
        "phone": "+91 9112233445",
        "skills": "React, TypeScript, Tailwind"
    }, headers=headers)
    candidate_id = candidate_res.json()["id"]

    # 3. Post Job Requirement
    job_payload = {
        "company_id": company_id,
        "job_title": "Lead Frontend Architect",
        "description": "Leading frontend architecture with React & TypeScript.",
        "required_skills": "React, TypeScript, Next.js",
        "experience_min_years": 5.0,
        "vacancies": 2,
        "salary_min": 2000000.0,
        "salary_max": 2800000.0,
        "employment_type": "full_time",
        "location": "Bengaluru",
        "status": "open",
        "priority": "high"
    }
    job_res = client.post("/api/v1/jobs", json=job_payload, headers=headers)
    assert job_res.status_code == 201, job_res.text
    job = job_res.json()
    job_id = job["id"]
    assert job["job_title"] == "Lead Frontend Architect"

    # 4. Match Candidate to Job
    match_payload = {
        "candidate_id": candidate_id,
        "notes": "Candidate meets 100% of frontend architecture requirements."
    }
    match_res = client.post(f"/api/v1/jobs/{job_id}/matches", json=match_payload, headers=headers)
    assert match_res.status_code == 201, match_res.text
    match_data = match_res.json()
    assert match_data["candidate_id"] == candidate_id
    assert match_data["status"] == "submitted"

    # 5. Verify Candidate Match in Job Detail
    get_job = client.get(f"/api/v1/jobs/{job_id}", headers=headers)
    assert get_job.status_code == 200
    assert len(get_job.json()["candidate_matches"]) >= 1


def test_tasks_and_completion(client: TestClient, admin_token: str, staff_token: str):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # Staff ID
    me_res = client.get("/api/v1/auth/me", headers=staff_headers)
    staff_id = me_res.json()["id"]

    # 1. Admin creates task for Staff
    task_payload = {
        "title": "Schedule technical screening for shortlisted candidates",
        "description": "Coordinate slot between candidate and client VP Engineering",
        "priority": "high",
        "assigned_user_id": staff_id
    }
    create_res = client.post("/api/v1/tasks", json=task_payload, headers=admin_headers)
    assert create_res.status_code == 201, create_res.text
    task = create_res.json()
    task_id = task["id"]
    assert task["status"] == "pending"

    # 2. Staff views task
    get_res = client.get(f"/api/v1/tasks/{task_id}", headers=staff_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == task_payload["title"]

    # 3. Staff completes task
    complete_res = client.post(f"/api/v1/tasks/{task_id}/complete", headers=staff_headers)
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "completed"
    assert complete_res.json()["completed_at"] is not None


def test_notes_and_activities(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Candidate
    candidate_res = client.post("/api/v1/candidates", json={
        "first_name": "Dev",
        "last_name": "Patel",
        "email": f"dev.{uuid.uuid4().hex[:6]}@example.com",
        "phone": "+91 9776655443"
    }, headers=headers)
    assert candidate_res.status_code == 201
    candidate_id = candidate_res.json()["id"]

    # 2. Add Note to Candidate
    note_payload = {
        "content": "Candidate completed round 1 screening with outstanding marks in system design.",
        "related_candidate_id": candidate_id
    }
    note_res = client.post("/api/v1/notes", json=note_payload, headers=headers)
    assert note_res.status_code == 201, note_res.text
    note = note_res.json()
    assert "outstanding marks" in note["content"]

    # 3. List Notes for Candidate
    list_notes_res = client.get(f"/api/v1/notes?related_candidate_id={candidate_id}", headers=headers)
    assert list_notes_res.status_code == 200
    notes = list_notes_res.json()
    assert len(notes) >= 1

    # 4. Check Activity Timeline for Candidate
    activities_res = client.get(f"/api/v1/activities?related_candidate_id={candidate_id}", headers=headers)
    assert activities_res.status_code == 200
    activities = activities_res.json()
    assert len(activities) >= 1
    assert any("Note" in a["title"] or "candidate" in a["activity_type"] for a in activities)


def test_dashboard_stats(client: TestClient, admin_token: str, staff_token: str):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # Admin stats
    admin_stats_res = client.get("/api/v1/dashboards/stats", headers=admin_headers)
    assert admin_stats_res.status_code == 200
    admin_stats = admin_stats_res.json()
    assert "total_candidates" in admin_stats
    assert "total_employers" in admin_stats
    assert "active_leads" in admin_stats
    assert "open_jobs" in admin_stats
    assert admin_stats["total_candidates"] >= 1

    # Staff stats
    staff_stats_res = client.get("/api/v1/dashboards/stats", headers=staff_headers)
    assert staff_stats_res.status_code == 200
    staff_stats = staff_stats_res.json()
    assert "my_leads" in staff_stats
    assert "my_candidates" in staff_stats
    assert "my_tasks" in staff_stats
