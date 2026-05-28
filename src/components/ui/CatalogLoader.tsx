"use client";

import { useEffect, useState } from "react";
import { useCatalogStore } from "@/stores/catalog-store";
import { PencilLoader } from "@/components/ui/PencilLoader";

export function CatalogLoader({ children }: { children: React.ReactNode }) {
  const isLoading = useCatalogStore((s) => s.isLoading);
  const isReady = useCatalogStore((s) => s.isReady);
  const error = useCatalogStore((s) => s.error);
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinDelayDone(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold text-red-800">{error}</p>
        <p className="text-sm text-muted">
          Check Supabase keys in .env and run supabase/schema.sql
        </p>
      </div>
    );
  }

  if (!minDelayDone || (!isReady && isLoading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PencilLoader />
      </div>
    );
  }

  return <>{children}</>;
}
