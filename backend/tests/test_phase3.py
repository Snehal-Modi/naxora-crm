"""Phase 3 tests: Courses, Services, Enrollments, Placements, Documents, and Dashboard Metrics."""

import io
import uuid
from fastapi.testclient import TestClient


def test_courses_and_categories_crud(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    uid = uuid.uuid4().hex[:6]

    # 1. Create course category
    cat_res = client.post(
        "/api/v1/courses/categories",
        headers=headers,
        json={"name": f"Software Engineering {uid}", "description": "Tech & Dev courses", "is_active": True},
    )
    assert cat_res.status_code == 201, cat_res.text
    category_id = cat_res.json()["id"]

    # 2. List course categories
    list_cat = client.get("/api/v1/courses/categories", headers=headers)
    assert list_cat.status_code == 200
    assert any(c["id"] == category_id for c in list_cat.json()["items"])

    # 3. Create course
    course_res = client.post(
        "/api/v1/courses",
        headers=headers,
        json={
            "name": f"Full Stack Python Bootcamp {uid}",
            "code": f"PY-{uid}",
            "category_id": category_id,
            "duration": "12 Weeks",
            "mode": "hybrid",
            "fee": "25000.00",
            "status": "active",
            "capacity": 25,
            "short_description": "Comprehensive Python & Web development course",
        },
    )
    assert course_res.status_code == 201, course_res.text
    course_id = course_res.json()["id"]
    assert course_res.json()["code"] == f"PY-{uid}"

    # 4. Get course by ID
    get_res = client.get(f"/api/v1/courses/{course_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == f"Full Stack Python Bootcamp {uid}"

    # 5. Update course
    put_res = client.put(
        f"/api/v1/courses/{course_id}",
        headers=headers,
        json={"capacity": 30, "fee": "28000.00"},
    )
    assert put_res.status_code == 200
    assert put_res.json()["capacity"] == 30


def test_services_and_categories_crud(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    uid = uuid.uuid4().hex[:6]

    # 1. Create service category
    cat_res = client.post(
        "/api/v1/services/categories",
        headers=headers,
        json={"name": f"Career Counseling {uid}", "description": "1-on-1 counseling", "is_active": True},
    )
    assert cat_res.status_code == 201, cat_res.text
    cat_id = cat_res.json()["id"]

    # 2. Create service
    svc_res = client.post(
        "/api/v1/services",
        headers=headers,
        json={
            "name": f"Executive Resume Revamp {uid}",
            "code": f"RES-{uid}",
            "category_id": cat_id,
            "delivery_mode": "online",
            "fee": "3500.00",
            "status": "active",
            "short_description": "ATS-friendly resume enhancement by HR experts",
        },
    )
    assert svc_res.status_code == 201, svc_res.text
    svc_id = svc_res.json()["id"]

    # 3. List services
    list_svc = client.get("/api/v1/services", headers=headers)
    assert list_svc.status_code == 200
    assert any(s["id"] == svc_id for s in list_svc.json()["items"])


def test_course_and_service_enquiry_leads(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    uid = uuid.uuid4().hex[:6]

    # Create a course
    c_res = client.post(
        "/api/v1/courses",
        headers=headers,
        json={
            "name": f"Data Analytics Masterclass {uid}",
            "code": f"DA-{uid}",
            "mode": "online",
            "fee": "18000.00",
            "status": "active",
        },
    )
    course_id = c_res.json()["id"]

    # Create a service
    s_res = client.post(
        "/api/v1/services",
        headers=headers,
        json={
            "name": f"Mock Technical Interview {uid}",
            "code": f"INT-{uid}",
            "delivery_mode": "online",
            "fee": "2000.00",
            "status": "active",
        },
    )
    service_id = s_res.json()["id"]

    # Create course enquiry lead
    course_lead = client.post(
        "/api/v1/leads",
        headers=headers,
        json={
            "title": f"Enquiry for Data Analytics {uid}",
            "lead_type": "course",
            "source": "website",
            "course_id": course_id,
            "first_name": "Rohan",
            "last_name": "Verma",
            "email": f"rohan.{uid}@example.com",
            "phone": "+919876543210",
        },
    )
    assert course_lead.status_code == 201, course_lead.text
    assert course_lead.json()["lead_type"] == "course"
    assert course_lead.json()["course_id"] == course_id

    # Create service enquiry lead
    service_lead = client.post(
        "/api/v1/leads",
        headers=headers,
        json={
            "title": f"Enquiry for Mock Interview {uid}",
            "lead_type": "service",
            "source": "referral",
            "service_id": service_id,
            "first_name": "Pooja",
            "last_name": "Patel",
            "email": f"pooja.{uid}@example.com",
            "phone": "+919876543211",
        },
    )
    assert service_lead.status_code == 201, service_lead.text
    assert service_lead.json()["lead_type"] == "service"
    assert service_lead.json()["service_id"] == service_id


def test_candidate_enrollment_and_progress(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    uid = uuid.uuid4().hex[:6]

    # Create candidate
    cand_res = client.post(
        "/api/v1/candidates",
        headers=headers,
        json={
            "first_name": "Kavita",
            "last_name": "Sharma",
            "email": f"kavita.{uid}@example.com",
            "phone": "+919876500001",
            "current_location": "Ahmedabad",
        },
    )
    cand_id = cand_res.json()["id"]

    # Create course
    crs_res = client.post(
        "/api/v1/courses",
        headers=headers,
        json={
            "name": f"Cloud DevOps Architecture {uid}",
            "code": f"DEVOPS-{uid}",
            "fee": "30000.00",
            "status": "active",
        },
    )
    crs_id = crs_res.json()["id"]

    # Enroll candidate
    enr_res = client.post(
        "/api/v1/enrollments",
        headers=headers,
        json={
            "candidate_id": cand_id,
            "course_id": crs_id,
            "progress_percentage": 0,
            "status": "enrolled",
            "fee_paid": "15000.00",
            "payment_status": "partial",
        },
    )
    assert enr_res.status_code == 201, enr_res.text
    enr_id = enr_res.json()["id"]
    assert enr_res.json()["progress_percentage"] == 0

    # Test progress validation (cannot exceed 100)
    invalid_patch = client.patch(
        f"/api/v1/enrollments/{enr_id}/progress",
        headers=headers,
        json={"progress_percentage": 120},
    )
    assert invalid_patch.status_code in (400, 422)

    # Valid progress update to 75%
    patch_res = client.patch(
        f"/api/v1/enrollments/{enr_id}/progress",
        headers=headers,
        json={"progress_percentage": 75, "status": "in_progress"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["progress_percentage"] == 75
    assert patch_res.json()["status"] == "in_progress"

    # Fast progress complete to 100%
    complete_res = client.patch(
        f"/api/v1/enrollments/{enr_id}/progress",
        headers=headers,
        json={"progress_percentage": 100},
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["progress_percentage"] == 100
    assert complete_res.json()["status"] == "completed"

    # Verify candidate detail returns enrolled courses
    cand_enrs = client.get(f"/api/v1/candidates/{cand_id}/enrollments", headers=headers)
    assert cand_enrs.status_code == 200
    assert len(cand_enrs.json()) == 1
    assert cand_enrs.json()[0]["id"] == enr_id

    # Verify course detail returns enrolled candidates
    crs_enrs = client.get(f"/api/v1/courses/{crs_id}/enrollments", headers=headers)
    assert crs_enrs.status_code == 200
    assert len(crs_enrs.json()) == 1
    assert crs_enrs.json()[0]["candidate_id"] == cand_id


def test_placement_lifecycle(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    uid = uuid.uuid4().hex[:6]

    # Create candidate
    cand_res = client.post(
        "/api/v1/candidates",
        headers=headers,
        json={
            "first_name": "Aakash",
            "last_name": "Gupta",
            "email": f"aakash.{uid}@example.com",
            "phone": "+919876500002",
        },
    )
    cand_id = cand_res.json()["id"]

    # Create employer company
    comp_res = client.post(
        "/api/v1/companies",
        headers=headers,
        json={"name": f"Tech Corp Solutions {uid}", "city": "Bengaluru"},
    )
    comp_id = comp_res.json()["id"]

    # Create job requirement
    job_res = client.post(
        "/api/v1/jobs",
        headers=headers,
        json={"company_id": comp_id, "job_title": "Senior Python Developer", "vacancies": 2},
    )
    job_id = job_res.json()["id"]

    # Create placement
    plc_res = client.post(
        "/api/v1/placements",
        headers=headers,
        json={
            "candidate_id": cand_id,
            "company_id": comp_id,
            "job_requirement_id": job_id,
            "status": "interview_scheduled",
            "interview_date": "2026-10-05",
        },
    )
    assert plc_res.status_code == 201, plc_res.text
    plc_id = plc_res.json()["id"]

    # Update placement with offer and joining date
    upd_res = client.put(
        f"/api/v1/placements/{plc_id}",
        headers=headers,
        json={
            "status": "joined",
            "offer_date": "2026-10-10",
            "joining_date": "2026-10-20",
            "salary_offered": "1200000.00",
            "placement_fee": "100000.00",
        },
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["status"] == "joined"
    assert upd_res.json()["salary_offered"] == "1200000.00"

    # Verify candidate detail includes placements
    cand_plcs = client.get(f"/api/v1/candidates/{cand_id}/placements", headers=headers)
    assert cand_plcs.status_code == 200
    assert len(cand_plcs.json()) == 1
    assert cand_plcs.json()[0]["id"] == plc_id


def test_candidate_document_upload_and_download(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    uid = uuid.uuid4().hex[:6]

    # Create candidate
    cand_res = client.post(
        "/api/v1/candidates",
        headers=headers,
        json={
            "first_name": "Meera",
            "last_name": "Joshi",
            "email": f"meera.{uid}@example.com",
            "phone": "+919876500003",
        },
    )
    cand_id = cand_res.json()["id"]

    # Test file upload with PDF
    dummy_pdf_content = b"%PDF-1.4 test resume content"
    files = {"file": ("meera_resume.pdf", io.BytesIO(dummy_pdf_content), "application/pdf")}
    data = {"title": "Updated Resume 2026", "document_type": "resume", "notes": "Primary CV"}

    upload_res = client.post(
        f"/api/v1/candidates/{cand_id}/documents",
        headers=headers,
        data=data,
        files=files,
    )
    assert upload_res.status_code == 201, upload_res.text
    doc_id = upload_res.json()["id"]
    assert upload_res.json()["file_name"] == "meera_resume.pdf"
    assert upload_res.json()["mime_type"] == "application/pdf"

    # List candidate documents
    doc_list = client.get(f"/api/v1/candidates/{cand_id}/documents", headers=headers)
    assert doc_list.status_code == 200
    assert len(doc_list.json()) == 1

    # Stream download document securely
    download_res = client.get(f"/api/v1/documents/{doc_id}/download", headers=headers)
    assert download_res.status_code == 200
    assert download_res.content == dummy_pdf_content
    assert download_res.headers["content-type"] == "application/pdf"

    # Delete document
    del_res = client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
    assert del_res.status_code == 200


def test_dashboard_stats_phase3_metrics(client: TestClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/v1/dashboards/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "active_courses" in data
    assert "course_enquiries" in data
    assert "active_enrollments" in data
    assert "completed_enrollments" in data
    assert "active_services" in data
    assert "service_enquiries" in data
    assert "total_placements" in data
    assert "joined_placements" in data
