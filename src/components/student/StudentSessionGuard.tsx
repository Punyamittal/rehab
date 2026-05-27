"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

export function StudentSessionGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { role, studentProfileChosen, studentId, isManagedStudent } =
    useAppStore();

  useEffect(() => {
    if (role === null) {
      router.replace("/");
      return;
    }
    if (role !== "student") {
      router.replace("/");
      return;
    }
    if (
      !studentProfileChosen ||
      !studentId ||
      !isManagedStudent(studentId)
    ) {
      router.replace("/choose-student");
    }
  }, [role, studentProfileChosen, studentId, isManagedStudent, router]);

  if (
    role !== "student" ||
    !studentProfileChosen ||
    !studentId ||
    !isManagedStudent(studentId)
  ) {
    return null;
  }

  return <>{children}</>;
}
