"use client";

import React from "react";
import { Briefcase, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function JobsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Openings</h1>
          <p className="text-sm text-slate-500">Active staffing requirements, job postings, and applicant tracking</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Post Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Openings</CardTitle>
          <CardDescription>Open positions from corporate clients</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Job requirements, candidate matching, and interview pipelines activate in Phase 4."
          />
        </CardContent>
      </Card>
    </div>
  );
}

