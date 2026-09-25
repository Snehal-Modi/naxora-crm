"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Layers,
  Edit,
  Trash2,
  FileCheck2,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { Service, ServiceCategory, ServiceCreate, ServiceUpdate } from "@/types/crm";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateCatOpen, setIsCreateCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);

  // Forms
  const [serviceForm, setServiceForm] = useState<ServiceCreate>({
    name: "",
    code: "",
    short_description: "",
    category_id: "",
    delivery_mode: "online",
    fee: 0,
    status: "active",
  });

  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // Queries
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ["services", search, modeFilter, statusFilter],
    queryFn: () =>
      crmApi.getServices({
        search: search || undefined,
        delivery_mode: modeFilter || undefined,
        status: statusFilter || undefined,
        limit: 100,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => crmApi.getServiceCategories({ limit: 100 }),
  });

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceCreate) => crmApi.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsCreateServiceOpen(false);
      resetServiceForm();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceUpdate }) =>
      crmApi.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setEditingService(null);
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: typeof catForm) => crmApi.createServiceCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      setIsCreateCatOpen(false);
      setCatForm({ name: "", description: "", is_active: true });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof catForm> }) =>
      crmApi.updateServiceCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      setEditingCat(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveServiceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    },
  });

  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      code: "",
      short_description: "",
      category_id: "",
      delivery_mode: "online",
      fee: 0,
      status: "active",
    });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      code: service.code,
      short_description: service.short_description || "",
      category_id: service.category_id || "",
      delivery_mode: service.delivery_mode,
      fee: service.fee,
      status: service.status,
    });
  };

  const services = servicesData?.items || [];
  const categories = categoriesData?.items || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-emerald-600" />
            Career & Staffing Services
          </h1>
          <p className="text-sm text-slate-500">
            Offerings for resume revamping, interview preparation, career advisory, and enterprise talent consulting
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "services" && hasPermission("services:create") && (
            <Button
              onClick={() => {
                resetServiceForm();
                setIsCreateServiceOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          )}

          {activeTab === "categories" && hasPermission("service_categories:create") && (
            <Button
              onClick={() => {
                setCatForm({ name: "", description: "", is_active: true });
                setIsCreateCatOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "services"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> Service Catalogue ({services.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "categories"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" /> Categories ({categories.length})
        </button>
      </div>

      {/* Services Catalogue */}
      {activeTab === "services" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search services by title, code..."
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
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Delivery Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Service Cards */}
          {loadingServices ? (
            <div className="py-12 text-center text-slate-400">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
              <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No services found</p>
              <p className="text-sm text-slate-400">Try modifying filters or create a new service package.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-xs font-mono text-emerald-700 bg-emerald-50 border-emerald-200 mb-1">
                          {service.code}
                        </Badge>
                        <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                          {service.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={service.status === "active" ? "default" : "outline"}
                        className="capitalize"
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-600">
                    {service.short_description && (
                      <p className="text-slate-500 text-xs line-clamp-2">{service.short_description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <span className="text-slate-400">Delivery:</span>{" "}
                        <span className="font-medium text-slate-700 capitalize">{service.delivery_mode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Category:</span>{" "}
                        <span className="font-medium text-slate-700">{service.category?.name || "General"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">Service Fee:</span>{" "}
                        <span className="font-bold text-slate-900 text-sm">₹{Number(service.fee).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-1">
                      {hasPermission("services:edit") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditService(service)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {hasPermission("services:archive") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Archive service "${service.name}"?`)) {
                              deleteServiceMutation.mutate(service.id);
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Service Categories</h2>
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

      {/* Modal: Create Service */}
      <Modal
        isOpen={isCreateServiceOpen}
        onClose={() => setIsCreateServiceOpen(false)}
        title="Add New Service"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createServiceMutation.mutate(serviceForm);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Service Code *</label>
              <Input
                required
                placeholder="e.g. RES-01"
                value={serviceForm.code}
                onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Service Name *</label>
              <Input
                required
                placeholder="e.g. Executive Resume Revamp"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Category</label>
              <select
                value={serviceForm.category_id || ""}
                onChange={(e) => setServiceForm({ ...serviceForm, category_id: e.target.value || undefined })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                value={serviceForm.delivery_mode}
                onChange={(e) => setServiceForm({ ...serviceForm, delivery_mode: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Fee (₹) *</label>
              <Input
                type="number"
                required
                min={0}
                value={serviceForm.fee}
                onChange={(e) => setServiceForm({ ...serviceForm, fee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={serviceForm.status}
                onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Summary / Highlight</label>
            <Input
              placeholder="e.g. ATS optimization with 2 revisions"
              value={serviceForm.short_description || ""}
              onChange={(e) => setServiceForm({ ...serviceForm, short_description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateServiceOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createServiceMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createServiceMutation.isPending ? "Creating..." : "Save Service"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Service */}
      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Edit Service"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingService) {
              updateServiceMutation.mutate({ id: editingService.id, data: serviceForm });
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Service Code</label>
              <Input
                required
                value={serviceForm.code}
                onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Service Name</label>
              <Input
                required
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Fee (₹)</label>
              <Input
                type="number"
                required
                value={serviceForm.fee}
                onChange={(e) => setServiceForm({ ...serviceForm, fee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <select
                value={serviceForm.status}
                onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateServiceMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {updateServiceMutation.isPending ? "Updating..." : "Update Service"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Category */}
      <Modal
        isOpen={isCreateCatOpen}
        onClose={() => setIsCreateCatOpen(false)}
        title="Add Service Category"
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
              placeholder="e.g. Talent Advisory"
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
            <Button type="button" variant="outline" onClick={() => setIsCreateCatOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
        title="Edit Service Category"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
