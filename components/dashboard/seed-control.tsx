"use client";

import { useMutation, useQuery } from "convex/react";
import { Database, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SeedControl() {
  const isSeeded = useQuery("bootstrap:isSeeded", {});
  const seed = useMutation("bootstrap:seed");
  const [loading, setLoading] = useState(false);

  if (isSeeded === undefined || isSeeded) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        setLoading(true);
        try {
          await seed({});
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
      Seed Demo Data
    </Button>
  );
}
