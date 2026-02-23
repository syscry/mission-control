"use client";

import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SeedControl() {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => alert("Demo data already loaded!")}
    >
      <Database className="h-4 w-4 mr-2" />
      Demo Data Loaded
    </Button>
  );
}
