import type {
  BranchingStory,
  FacilitatorStudentRow,
  GameDefinition,
  LearningModule,
  StudentSession,
} from "@/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? res.statusText);
  }
  return data as T;
}

export async function fetchCatalog(): Promise<{
  modules: LearningModule[];
  games: GameDefinition[];
  stories: BranchingStory[];
}> {
  return parseJson(await fetch("/api/catalog"));
}

export async function fetchStudents(): Promise<{
  students: FacilitatorStudentRow[];
  totalModules: number;
}> {
  return parseJson(await fetch("/api/centre/students"));
}

export async function createStudent(
  alias: string,
  avatarEmoji: string
): Promise<FacilitatorStudentRow> {
  const data = await parseJson<{ student: FacilitatorStudentRow }>(
    await fetch("/api/centre/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias, avatarEmoji }),
    })
  );
  return data.student;
}

export async function removeStudent(studentId: string): Promise<void> {
  await parseJson(
    await fetch(`/api/students/${studentId}`, { method: "DELETE" })
  );
}

export async function updateStudent(
  studentId: string,
  patch: {
    note?: string;
    presentToday?: boolean;
    awardBucket?: "assessment" | "game";
    awardPoints?: number;
  }
): Promise<{ assessmentPoints?: number; gamePoints?: number }> {
  return parseJson(
    await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function fetchStudentSession(
  studentId: string
): Promise<StudentSession> {
  const data = await parseJson<{ session: StudentSession }>(
    await fetch(`/api/students/${studentId}/session`)
  );
  return data.session;
}

export async function saveStudentSession(
  studentId: string,
  session: StudentSession
): Promise<void> {
  await parseJson(
    await fetch(`/api/students/${studentId}/session`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    })
  );
}

export async function postModuleProgress(
  moduleSlug: string,
  payload: {
    studentId: string;
    checkpointIndex: number;
    completed: boolean;
    score?: number;
  }
): Promise<void> {
  await parseJson(
    await fetch(`/api/modules/${moduleSlug}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function postEmotionLog(payload: {
  studentId: string;
  checkType: string;
  emotion: string;
  moduleId?: string;
  storyId?: string;
}): Promise<void> {
  await parseJson(
    await fetch("/api/emotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}
