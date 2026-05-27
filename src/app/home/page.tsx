"use client";

import { HomeDashboard } from "@/components/home/HomeDashboard";
import { StudentSessionGuard } from "@/components/student/StudentSessionGuard";

export default function StudentHomePage() {
  return (
    <StudentSessionGuard>
      <HomeDashboard />
    </StudentSessionGuard>
  );
}
