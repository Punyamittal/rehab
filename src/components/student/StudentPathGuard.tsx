"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

const STUDENT_LEARNING_PREFIXES = [
  "/home",
  "/learn",
  "/games",
  "/story",
  "/check-in",
];

function needsStudentProfile(pathname: string): boolean {
  return STUDENT_LEARNING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function StudentPathGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, studentProfileChosen, studentId, isManagedStudent } =
    useAppStore();

  useEffect(() => {
    if (role !== "student" || !needsStudentProfile(pathname)) return;
    if (
      !studentProfileChosen ||
      !studentId ||
      !isManagedStudent(studentId)
    ) {
      router.replace("/choose-student");
    }
  }, [
    pathname,
    role,
    router,
    studentProfileChosen,
    studentId,
    isManagedStudent,
  ]);

  return null;
}
