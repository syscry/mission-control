"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export function Providers({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    if (isStaticExport) return null;
    const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210";
    return new ConvexReactClient(url);
  }, []);

  if (isStaticExport || !convex) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</>;
}
