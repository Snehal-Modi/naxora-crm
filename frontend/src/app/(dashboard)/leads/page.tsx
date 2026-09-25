"use client";

import React from "react";
import { UserSquare2, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function LeadsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-sm text-slate-500">Track Candidate, Employer, Course, and Service enquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1.5" /> Filter
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Lead
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>Pipeline stages and lead ownership</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={UserSquare2}
            title="No leads yet"
            description="Leads management, pipelines, and assignment workflows will be activated in Phase 3."
            actionText="Create Demo Lead"
            onAction={() => alert("Lead creation activates in Phase 3!")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

