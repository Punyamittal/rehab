"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useCatalogStore } from "@/stores/catalog-store";
import { useAppStore } from "@/stores/app-store";

export function useSupabaseBootstrap() {
  const loadCatalog = useCatalogStore((s) => s.loadCatalog);
  const loadStudents = useAppStore((s) => s.loadManagedStudents);

  useEffect(() => {
    void loadCatalog();
    if (isSupabaseConfigured()) {
      void loadStudents();
    }
  }, [loadCatalog, loadStudents]);
}
