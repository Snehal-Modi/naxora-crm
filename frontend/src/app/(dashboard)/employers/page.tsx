"use client";

import React from "react";
import { Building2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function EmployersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employers & Companies</h1>
          <p className="text-sm text-slate-500">Corporate client accounts, contacts, and hiring contracts</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Employer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employer Accounts</CardTitle>
          <CardDescription>Corporate client directory</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Building2}
            title="No employers registered yet"
            description="Employer accounts and corporate contact management activate in Phase 3."
          />
        </CardContent>
      </Card>
    </div>
  );
}

