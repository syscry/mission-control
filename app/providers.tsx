"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:3210";
    return new ConvexReactClient(url);
  }, []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
