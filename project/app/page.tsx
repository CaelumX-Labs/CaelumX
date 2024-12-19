import { Button } from "@/components/ui/button";
import { Leaf, Shield, Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Carbon Credit Registry
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A transparent and efficient platform for registering and verifying carbon credits
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/submit">
            <Button className="w-full sm:w-auto" size="lg">
              <Leaf className="mr-2 h-5 w-5" />
              Register Project
            </Button>
          </Link>
          <Link href="/verify">
            <Button variant="outline" className="w-full sm:w-auto" size="lg">
              <Shield className="mr-2 h-5 w-5" />
              Verify Projects
            </Button>
          </Link>
          <Link href="/status">
            <Button variant="outline" className="w-full sm:w-auto" size="lg">
              <Search className="mr-2 h-5 w-5" />
              Check Status
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative bg-white p-6 rounded-lg shadow-sm border">
          <div className="absolute top-6 left-6">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-8 text-lg font-semibold">Register Projects</h3>
          <p className="mt-2 text-gray-600">
            Submit your carbon credit projects with detailed information for verification
          </p>
        </div>

        <div className="relative bg-white p-6 rounded-lg shadow-sm border">
          <div className="absolute top-6 left-6">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-8 text-lg font-semibold">Verify Credits</h3>
          <p className="mt-2 text-gray-600">
            Authorized verifiers can review and approve submitted carbon credit projects
          </p>
        </div>

        <div className="relative bg-white p-6 rounded-lg shadow-sm border">
          <div className="absolute top-6 left-6">
            <Search className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-8 text-lg font-semibold">Track Status</h3>
          <p className="mt-2 text-gray-600">
            Monitor your project's verification status using the unique project ID
          </p>
        </div>
      </div>
    </div>
  );
}