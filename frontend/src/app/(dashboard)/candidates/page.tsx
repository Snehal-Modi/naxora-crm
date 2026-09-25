"use client";

import React from "react";
import { Users, Plus, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function CandidatesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates Directory</h1>
          <p className="text-sm text-slate-500">Talent pool, resumes, skills, and placement history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1.5" /> Import CSV
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Candidate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates Pool</CardTitle>
          <CardDescription>Verified job seekers and profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="No candidates available"
            description="Candidate profiles, resumes, and skill tags will be activated in Phase 3."
          />
        </CardContent>
      </Card>
    </div>
  );
}

