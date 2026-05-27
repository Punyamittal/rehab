"use client";

import { useCatalogStore } from "@/stores/catalog-store";

export function CatalogLoader({ children }: { children: React.ReactNode }) {
  const isLoading = useCatalogStore((s) => s.isLoading);
  const isReady = useCatalogStore((s) => s.isReady);
  const error = useCatalogStore((s) => s.error);

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

  if (!isReady && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  return <>{children}</>;
}
