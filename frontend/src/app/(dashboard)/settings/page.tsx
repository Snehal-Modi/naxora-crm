"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, Key, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Role, Permission } from "@/types/auth";

interface UserResponseItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  is_superuser: boolean;
  is_active: boolean;
  roles: Role[];
  permissions: string[];
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions">("users");

  const usersQuery = useQuery<UserResponseItem[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiClient.get<UserResponseItem[]>("/users");
      return res.data;
    },
  });

  const rolesQuery = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await apiClient.get<Role[]>("/roles");
      return res.data;
    },
  });

  const permissionsQuery = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await apiClient.get<Permission[]>("/permissions");
      return res.data;
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Administration & RBAC</h1>
        <p className="text-sm text-slate-500">Live database-backed User accounts, Roles, and Granular Permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="h-4 w-4" />
          Active Users ({usersQuery.data?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "roles"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Shield className="h-4 w-4" />
          Roles ({rolesQuery.data?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "permissions"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Key className="h-4 w-4" />
          Permissions ({permissionsQuery.data?.length || 0})
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Staff & Administrators</CardTitle>
            <CardDescription>Live database records from PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">Staff Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Granted Permissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersQuery.data?.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {u.first_name} {u.last_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.is_superuser ? "default" : "secondary"}>
                            {u.is_superuser ? "Super Admin" : u.roles?.[0]?.display_name || "Staff"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 font-mono">
                            {u.is_superuser ? "Full System (*)" : `${u.permissions?.length || 0} permissions`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Roles */}
      {activeTab === "roles" && (
        <Card>
          <CardHeader>
            <CardTitle>Configured Roles</CardTitle>
            <CardDescription>RBAC role definitions and assigned permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {rolesQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading roles...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rolesQuery.data?.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-slate-900 text-sm">{r.display_name}</h3>
                      <Badge variant="outline">{r.name}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{r.description}</p>
                    <div className="text-xs text-slate-600 font-medium">
                      Assigned Permissions: {r.permissions?.length || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Permissions */}
      {activeTab === "permissions" && (
        <Card>
          <CardHeader>
            <CardTitle>System Permissions Dictionary</CardTitle>
            <CardDescription>Granular permission codes enforced by backend dependencies</CardDescription>
          </CardHeader>
          <CardContent>
            {permissionsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading permissions...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {permissionsQuery.data?.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                    <div className="font-mono font-semibold text-blue-700">{p.code}</div>
                    <div className="text-[11px] text-slate-500 uppercase mt-0.5 tracking-wider font-semibold">
                      Module: {p.module}
                    </div>
                    <p className="text-slate-600 mt-1 text-[11px]">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

