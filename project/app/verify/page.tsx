"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Mock data - replace with actual data fetching
const mockProjects = [
  {
    id: "1",
    projectName: "Amazon Rainforest Conservation",
    projectType: "Reforestation",
    region: "Brazil",
    vintageYear: "2023",
    certificationBody: "Verra",
    creditAmount: "5000",
    status: "pending",
  },
  // Add more mock projects as needed
];

export default function VerifyPage() {
  const handleVerify = async (id: string, action: "approve" | "reject") => {
    try {
      // TODO: Implement verification logic with Solana contract
      toast({
        title: `Project ${action}ed successfully`,
        description: `Project ID: ${id}`,
      });
    } catch (error) {
      toast({
        title: "Error processing verification",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Verify Carbon Credit Projects</h1>
          <p className="text-gray-600 mt-2">
            Review and verify submitted carbon credit projects
          </p>
        </div>

        <div className="grid gap-6">
          {mockProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.projectName}</CardTitle>
                    <CardDescription>Project ID: {project.id}</CardDescription>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Project Type</p>
                    <p className="text-sm text-gray-600">{project.projectType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Region</p>
                    <p className="text-sm text-gray-600">{project.region}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vintage Year</p>
                    <p className="text-sm text-gray-600">{project.vintageYear}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Credit Amount</p>
                    <p className="text-sm text-gray-600">
                      {project.creditAmount} tCO2e
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={() => handleVerify(project.id, "approve")}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleVerify(project.id, "reject")}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}