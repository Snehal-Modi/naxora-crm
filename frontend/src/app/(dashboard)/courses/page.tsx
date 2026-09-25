"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Users,
  Layers,
  Edit,
  Trash2,
  BookOpen,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { Course, CourseCategory, CourseCreate, CourseUpdate } from "@/types/crm";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<"courses" | "categories">("courses");
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [isCreateCatOpen, setIsCreateCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CourseCategory | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState<CourseCreate>({
    name: "",
    code: "",
    short_description: "",
    category_id: "",
    duration: "",
    mode: "online",
    fee: 0,
    status: "active",
    capacity: 30,
    start_date: "",
    end_date: "",
  });

  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // Queries
  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ["courses", search, modeFilter, statusFilter],
    queryFn: () =>
      crmApi.getCourses({
        search: search || undefined,
        mode: modeFilter || undefined,
        status: statusFilter || undefined,
        limit: 100,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => crmApi.getCourseCategories({ limit: 100 }),
  });

  const { data: enrolledStudents, isLoading: loadingEnrolled } = useQuery({
    queryKey: ["course-enrollments", viewingCourse?.id],
    queryFn: () => crmApi.getCourseEnrollments(viewingCourse!.id),
    enabled: !!viewingCourse,
  });

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: (data: CourseCreate) => crmApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsCreateCourseOpen(false);
      resetCourseForm();
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseUpdate }) =>
      crmApi.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setEditingCourse(null);
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: typeof catForm) => crmApi.createCourseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
      setIsCreateCatOpen(false);
      setCatForm({ name: "", description: "", is_active: true });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof catForm> }) =>
      crmApi.updateCourseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
      setEditingCat(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveCourseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-categories"] });
    },
  });

  const resetCourseForm = () => {
    setCourseForm({
      name: "",
      code: "",
      short_description: "",
      category_id: "",
      duration: "",
      mode: "online",
      fee: 0,
      status: "active",
      capacity: 30,
      start_date: "",
      end_date: "",
    });
  };

  const handleEditCourseOpen = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      code: course.code,
      short_description: course.short_description || "",
      category_id: course.category_id || "",
      duration: course.duration || "",
      mode: course.mode,
      fee: course.fee,
      status: course.status,
      capacity: course.capacity,
      start_date: course.start_date || "",
      end_date: course.end_date || "",
    });
  };

  const courses = coursesData?.items || [];
  const categories = categoriesData?.items || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Training & Courses
          </h1>
          <p className="text-sm text-slate-500">
            Manage course catalogue, curriculum categories, student capacities, and training batches
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "courses" && hasPermission("courses:create") && (
            <Button
              onClick={() => {
                resetCourseForm();
                setIsCreateCourseOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Course
            </Button>
          )}

          {activeTab === "categories" && hasPermission("course_categories:create") && (
            <Button
              onClick={() => {
                setCatForm({ name: "", description: "", is_active: true });
                setIsCreateCatOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "courses"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Course Catalogue ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "categories"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" /> Categories ({categories.length})
        </button>
      </div>

      {/* Course Catalogue Tab */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search courses by title, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Courses List */}
          {loadingCourses ? (
            <div className="py-12 text-center text-slate-400">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No courses found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters or create a new course.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-xs font-mono text-indigo-700 bg-indigo-50 border-indigo-200 mb-1">
                          {course.code}
                        </Badge>
                        <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                          {course.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={
                          course.status === "active"
                            ? "default"
                            : course.status === "completed"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {course.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-600">
                    {course.short_description && (
                      <p className="text-slate-500 text-xs line-clamp-2">{course.short_description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <span className="text-slate-400">Mode:</span>{" "}
                        <span className="font-medium text-slate-700 capitalize">{course.mode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Duration:</span>{" "}
                        <span className="font-medium text-slate-700">{course.duration || "Self-paced"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Fee:</span>{" "}
                        <span className="font-semibold text-slate-900">₹{Number(course.fee).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Enrolled:</span>{" "}
                        <span className="font-medium text-indigo-600">
                          {course.enrollment_count} / {course.capacity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingCourse(course)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 p-0 h-auto flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" /> Enrolled Students ({course.enrollment_count})
                      </Button>

                      <div className="flex items-center gap-1">
                        {hasPermission("courses:edit") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCourseOpen(course)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {hasPermission("courses:archive") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Archive course "${course.name}"?`)) {
                                deleteCourseMutation.mutate(course.id);
                              }
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Course Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Categories Management</h2>
              <span className="text-xs text-slate-500">{categories.length} registered categories</span>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{cat.name}</td>
                    <td className="py-3 px-4 text-slate-500">{cat.description || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={cat.is_active ? "default" : "secondary"}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCat(cat);
                            setCatForm({
                              name: cat.name,
                              description: cat.description || "",
                              is_active: cat.is_active,
                            });
                          }}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Archive category "${cat.name}"?`)) {
                              deleteCategoryMutation.mutate(cat.id);
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Course */}
      <Modal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        title="Add New Course"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCourseMutation.mutate(courseForm);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Course Code *</label>
              <Input
                required
                placeholder="e.g. PY-101"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Course Name *</label>
              <Input
                required
                placeholder="e.g. Full Stack Python Bootcamp"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Category</label>
              <select
                value={courseForm.category_id || ""}
                onChange={(e) => setCourseForm({ ...courseForm, category_id: e.target.value || undefined })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Delivery Mode</label>
              <select
                value={courseForm.mode}
                onChange={(e) => setCourseForm({ ...courseForm, mode: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Fee (₹) *</label>
              <Input
                type="number"
                required
                min={0}
                value={courseForm.fee}
                onChange={(e) => setCourseForm({ ...courseForm, fee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Duration</label>
              <Input
                placeholder="e.g. 12 Weeks"
                value={courseForm.duration || ""}
                onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Capacity</label>
              <Input
                type="number"
                min={1}
                value={courseForm.capacity}
                onChange={(e) => setCourseForm({ ...courseForm, capacity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Start Date</label>
              <Input
                type="date"
                value={courseForm.start_date || ""}
                onChange={(e) => setCourseForm({ ...courseForm, start_date: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">End Date</label>
              <Input
                type="date"
                value={courseForm.end_date || ""}
                onChange={(e) => setCourseForm({ ...courseForm, end_date: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Short Summary</label>
            <Input
              placeholder="Brief course highlight"
              value={courseForm.short_description || ""}
              onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateCourseOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createCourseMutation.isPending ? "Creating..." : "Save Course"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Course */}
      <Modal
        isOpen={!!editingCourse}
        onClose={() => setEditingCourse(null)}
        title="Edit Course"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingCourse) {
              updateCourseMutation.mutate({ id: editingCourse.id, data: courseForm });
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Course Code</label>
              <Input
                required
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Course Name</label>
              <Input
                required
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Fee (₹)</label>
              <Input
                type="number"
                required
                value={courseForm.fee}
                onChange={(e) => setCourseForm({ ...courseForm, fee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={courseForm.status}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Capacity</label>
              <Input
                type="number"
                value={courseForm.capacity}
                onChange={(e) => setCourseForm({ ...courseForm, capacity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCourseMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {updateCourseMutation.isPending ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Enrolled Students */}
      <Modal
        isOpen={!!viewingCourse}
        onClose={() => setViewingCourse(null)}
        title={`Enrolled Students — ${viewingCourse?.name || ""}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b">
            <span>Course Code: <strong className="text-slate-800">{viewingCourse?.code}</strong></span>
            <span>Capacity: <strong className="text-slate-800">{viewingCourse?.enrollment_count} / {viewingCourse?.capacity}</strong></span>
          </div>

          {loadingEnrolled ? (
            <div className="py-8 text-center text-slate-400">Loading student roster...</div>
          ) : !enrolledStudents || enrolledStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No students enrolled in this course yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {enrolledStudents.map((enr) => (
                <div key={enr.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-slate-900">
                      {enr.candidate?.first_name} {enr.candidate?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{enr.candidate?.email} • {enr.candidate?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-indigo-600">{enr.progress_percentage}%</span>
                    <p className="text-[11px] text-slate-400 capitalize">{enr.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t">
            <Button variant="outline" onClick={() => setViewingCourse(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Category */}
      <Modal
        isOpen={isCreateCatOpen}
        onClose={() => setIsCreateCatOpen(false)}
        title="Add Course Category"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCategoryMutation.mutate(catForm);
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Category Name *</label>
            <Input
              required
              placeholder="e.g. Data Science & AI"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Description</label>
            <Input
              placeholder="e.g. Machine learning and analytics syllabus"
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateCatOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createCategoryMutation.isPending ? "Saving..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Category */}
      <Modal
        isOpen={!!editingCat}
        onClose={() => setEditingCat(null)}
        title="Edit Course Category"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingCat) {
              updateCategoryMutation.mutate({ id: editingCat.id, data: catForm });
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Category Name</label>
            <Input
              required
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Description</label>
            <Input
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setEditingCat(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCategoryMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
