export type TeachingContext = {
  _id: string;
  classId: { _id: string; name: string; arm: string } | string;
  subjectId: { _id: string; name: string; code: string } | string;
  termId: { _id: string; name: string; order: number } | string;
  isActive: boolean;
};

export type ScoreSheetRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
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

export type GetScoreSheetQuery = {
  classId: string;
  subjectId: string;
  termId: string;
};

export type PutScoreSheetPayload = {
  classId: string;
  subjectId: string;
  termId: string;
  rows: {
    studentId: string;
    test1: number;
    test2: number;
    exam: number;
  }[];
};

export type SubmitScoresPayload = {
  classId: string;
  subjectId: string;
  termId: string;
};

export type SubmissionStatusQuery = {
  classId: string;
  termId: string;
};

export type StudentCountsQuery = {
  subjectId: string;
  termId: string;
  classId?: string;
};

export type StudentCountsByClassRow = {
  classId: string;
  className: string;
  classArm: string | null;
  totalStudents: number;
};

export type StudentCountsResponse = {
  subjectId: string;
  termId: string;
  classes: StudentCountsByClassRow[];
  totalStudents: number;
};

export type SubmissionStatusItem = {
  subjectId: string;
  total: number;
  lockedCount: number;
  submitted: boolean;
};
