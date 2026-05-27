"use client";

import { Suspense } from "react";
import { ChooseChildScreen } from "@/components/student/ChooseChildScreen";

export default function ChooseStudentPage() {
  return (
    <Suspense fallback={null}>
      <ChooseChildScreen />
    </Suspense>
  );
}
