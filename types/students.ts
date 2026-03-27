export type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  gender?: "MALE" | "FEMALE";
  admissionNumber: string;
  classId: string;
  isActive: boolean;
  /** From GET /students: true when a STUDENT user is linked to this record (`User.studentId`). */
  hasPortalAccount: boolean;
};

export type ListStudentsQuery = {
  classId?: string;
  q?: string;
};

export type CreateStudentPayload = {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  admissionNumber: string;
  classId: string;
  /** Optional: create STUDENT user + welcome email; must be sent together with loginPassword */
  loginEmail?: string;
  /** Optional; min 8 chars when used with loginEmail */
  loginPassword?: string;
};

export type StudentMyResultRow = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  test1: number;
  test2: number;
  exam: number;
  totalPercent: number;
  grade: string | null;
  remark: string | null;
  subjectPassed: boolean;
  locked: boolean;
  submittedAt: string | null;
};

export type StudentMyResultsResponse = {
  termId: string;
  classId: string;
  student: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    studentId: string;
  };
  results: StudentMyResultRow[];
  aggregate: {
    subjectCount: number;
    passedSubjects: number;
    totalScore: number;
    average: number;
  };
};

export type UpdateStudentPayload = {
  firstName?: string;
  lastName?: string;
  gender?: "MALE" | "FEMALE";
  admissionNumber?: string;
  classId?: string;
  isActive?: boolean;
};

/** Backend: POST /api/v1/students/:id/portal — create login and link to student. */
export type CreateStudentPortalPayload = {
  loginEmail: string;
  loginPassword: string;
};
