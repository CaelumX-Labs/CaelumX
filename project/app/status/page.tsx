"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function StatusPage() {
  const [projectId, setProjectId] = useState("");
  const [projectDetails, setProjectDetails] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual project status fetch
    // Mock response for demonstration
    setProjectDetails({
      id: projectId,
      projectName: "Sample Project",
      status: "pending",
      submissionDate: "2024-03-20",
      lastUpdated: "2024-03-21",
      type: "Reforestation",
      creditAmount: "5000",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Check Project Status</h1>
          <p className="text-gray-600 mt-2">
            Enter your project ID to check its current status
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Enter Project ID"
            className="flex-1"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>

        {projectDetails && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{projectDetails.projectName}</CardTitle>
                  <CardDescription>ID: {projectDetails.id}</CardDescription>
                </div>
                <Badge
                  variant={
                    projectDetails.status === "approved"
                      ? "default"
                      : projectDetails.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {projectDetails.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Project Type</p>
                  <p className="text-sm text-gray-600">{projectDetails.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Credit Amount</p>
                  <p className="text-sm text-gray-600">
                    {projectDetails.creditAmount} tCO2e
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Submission Date</p>
                  <p className="text-sm text-gray-600">
                    {projectDetails.submissionDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {projectDetails.lastUpdated}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}