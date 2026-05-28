"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

export default function VolunteerGuidePage() {
  const router = useRouter();
  const role = useAppStore((s) => s.role);

  useEffect(() => {
    if (role === "volunteer") {
      useAppStore.setState({ role: null });
    }
    router.replace("/");
  }, [role, router]);

  return null;
}
