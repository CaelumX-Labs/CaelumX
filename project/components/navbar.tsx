"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-xl">Carbon Registry</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link href="/submit">
              <Button variant="ghost">Submit Project</Button>
            </Link>
            <Link href="/verify">
              <Button variant="ghost">Verify Projects</Button>
            </Link>
            <Link href="/status">
              <Button variant="ghost">Check Status</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}