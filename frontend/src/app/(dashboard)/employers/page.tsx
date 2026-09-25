"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  Plus,
  Mail,
  Globe,
  MapPin,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
} from "lucide-react";
import { crmApi } from "@/lib/crm-api";
import { Company, CompanyCreate, ContactCreate } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";

export default function EmployersPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [contactModalCompanyId, setContactModalCompanyId] = useState<string | null>(null);

  const [companyForm, setCompanyForm] = useState<CompanyCreate>({
    name: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    company_size: "10-50",
    status: "client",
    notes: "",
  });

  const [contactForm, setContactForm] = useState<ContactCreate>({
    first_name: "",
    last_name: "",
    designation: "",
    email: "",
    phone: "",
    is_primary: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["companies", search, industryFilter, statusFilter, page],
    queryFn: () =>
      crmApi.getCompanies({
        search: search || undefined,
        industry: industryFilter || undefined,
        status: statusFilter || undefined,
        skip: (page - 1) * limit,
        limit,
      }),
  });

  const createCompanyMutation = useMutation({
    mutationFn: (newComp: CompanyCreate) => crmApi.createCompany(newComp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsCreateOpen(false);
      setCompanyForm({
        name: "",
        industry: "",
        website: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        country: "India",
        company_size: "10-50",
        status: "client",
        notes: "",
      });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: ContactCreate }) =>
      crmApi.addContact(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setContactModalCompanyId(null);
      setContactForm({
        first_name: "",
        last_name: "",
        designation: "",
        email: "",
        phone: "",
        is_primary: false,
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => crmApi.archiveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (selectedCompany) setSelectedCompany(null);
    },
  });

  const companies = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            Employers &amp; Companies
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Corporate client accounts, staffing contracts, and stakeholder contact directories
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Company
        </Button>
      </div>

      <Card className="p-4 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search companies by name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          <Input
            placeholder="Industry (e.g. IT, FinTech)..."
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter companies by status"
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="client">Active Client</option>
            <option value="prospect">Prospect</option>
            <option value="lead">Lead</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center justify-end text-xs text-slate-500 font-medium px-2">
            Total Employers: {data?.total ?? 0}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading companies...</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-600">Failed to load companies.</div>
        ) : companies.length === 0 ? (
          <CardContent className="p-8">
            <EmptyState
              icon={Building2}
              title="No companies found"
              description="Register an employer company to start managing client relationships and job postings."
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Key Contacts</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Account Lead</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {companies.map((company) => {
                  const primaryContact =
                    company.contacts.find((c) => c.is_primary) || company.contacts[0];

                  return (
                    <tr key={company.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{company.name}</div>
                        <div className="text-xs text-slate-500">{company.industry || "General"}</div>
                        {company.website && (
                          <a
                            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5"
                          >
                            <Globe className="h-2.5 w-2.5" />
                            {company.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {primaryContact ? (
                          <div>
                            <div className="text-xs font-medium text-slate-800">
                              {primaryContact.first_name} {primaryContact.last_name || ""}
                              {primaryContact.designation && (
                                <span className="text-slate-400 font-normal">
                                  {" "}• {primaryContact.designation}
                                </span>
                              )}
                            </div>
                            {primaryContact.email && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Mail className="h-2.5 w-2.5 text-slate-400" />
                                {primaryContact.email}
                              </div>
                            )}
                            {company.contacts.length > 1 && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                +{company.contacts.length - 1} more contact(s)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No contact person</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{company.city ? `${company.city}, ${company.country}` : company.country}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {company.company_size || "Not specified"}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={company.status === "client" ? "default" : "outline"}
                          className="text-[11px] capitalize"
                        >
                          {company.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {company.assigned_staff ? (
                          `${company.assigned_staff.first_name} ${company.assigned_staff.last_name}`
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Add Contact Person"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                            onClick={() => setContactModalCompanyId(company.id)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedCompany(company)}
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={archiveMutation.isPending}
                            onClick={() => {
                              if (confirm(`Archive ${company.name}?`)) {
                                archiveMutation.mutate(company.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        title="Add Employer / Company"
        description="Register a hiring corporate account in Naxora CRM."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCompanyMutation.mutate(companyForm);
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-slate-700">Company Name *</label>
            <Input
              required
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              placeholder="Apex FinTech Corp"
              className="mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Industry</label>
              <Input
                value={companyForm.industry || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                placeholder="Information Technology"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Website</label>
              <Input
                value={companyForm.website || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                placeholder="https://apexfintech.com"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">City</label>
              <Input
                value={companyForm.city || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                placeholder="Bengaluru"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">State</label>
              <Input
                value={companyForm.state || ""}
                onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                placeholder="Karnataka"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Company Size</label>
              <select
                value={companyForm.company_size || "10-50"}
                onChange={(e) => setCompanyForm({ ...companyForm, company_size: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
              >
                <option value="1-10">1-10 employees</option>
                <option value="10-50">10-50 employees</option>
                <option value="50-200">50-200 employees</option>
                <option value="200-1000">200-1000 employees</option>
                <option value="1000+">1000+ Enterprise</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select
                value={companyForm.status || "client"}
                onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
              >
                <option value="client">Client</option>
                <option value="prospect">Prospect</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createCompanyMutation.isPending}>
              {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!contactModalCompanyId}
        onClose={() => setContactModalCompanyId(null)}
        title="Add Contact Person"
        description="Add a hiring manager or HR stakeholder to this company."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (contactModalCompanyId) {
              addContactMutation.mutate({
                companyId: contactModalCompanyId,
                data: contactForm,
              });
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">First Name *</label>
              <Input
                required
                value={contactForm.first_name}
                onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
                placeholder="Priya"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Last Name</label>
              <Input
                value={contactForm.last_name || ""}
                onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
                placeholder="Nair"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Designation / Role</label>
            <Input
              value={contactForm.designation || ""}
              onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
              placeholder="Head of Talent Acquisition"
              className="mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input
                type="email"
                value={contactForm.email || ""}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="priya@company.com"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <Input
                value={contactForm.phone || ""}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                placeholder="+91 9988776655"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_primary"
              checked={contactForm.is_primary}
              onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_primary" className="text-xs text-slate-700">
              Set as Primary Contact for this company
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setContactModalCompanyId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={addContactMutation.isPending}>
              {addContactMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </Modal>

      {selectedCompany && (
        <Modal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          title={selectedCompany.name}
          description={`Registered client • ${selectedCompany.industry || "General Industry"}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
              <div>
                <span className="font-semibold text-slate-500">Website:</span>
                <p className="text-slate-800 mt-0.5">{selectedCompany.website || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Size:</span>
                <p className="text-slate-800 mt-0.5">{selectedCompany.company_size || "Not specified"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Location:</span>
                <p className="text-slate-800 mt-0.5">
                  {[selectedCompany.city, selectedCompany.state, selectedCompany.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Status:</span>
                <p className="text-slate-800 mt-0.5 capitalize">{selectedCompany.status}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wide mb-2">
                Contacts ({selectedCompany.contacts.length})
              </h4>
              {selectedCompany.contacts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No contacts added yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCompany.contacts.map((c) => (
                    <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">
                          {c.first_name} {c.last_name || ""} {c.is_primary && <Badge variant="secondary" className="text-[10px] ml-1">Primary</Badge>}
                        </div>
                        <div className="text-slate-500 text-[11px]">{c.designation || "Stakeholder"}</div>
                      </div>
                      <div className="text-right text-slate-600 text-[11px]">
                        {c.email && <div>{c.email}</div>}
                        {c.phone && <div>{c.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedCompany(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
