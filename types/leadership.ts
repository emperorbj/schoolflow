export type SchoolOverview = {
  classes: number;
  students: number;
  avgPerformance: number;
  passRatePercent: number;
};

export type ClassesOverviewItem = {
  classId: string;
  name: string;
  arm: string;
  rollCount: number;
  avgPerformance: number;
};

export type LeadershipStudentRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  average: number;
  position: number;
  totalScore: number;
  subjectCount: number;
  passedSubjects: number;
  classTeacherComment: string;
  headteacherComment: string;
};

export type StudentPerformanceRow = {
  termId: string;
  subjectId: string;
  subjectName: string;
  test1: number;
  test2: number;
  exam: number;
  totalPercent: number;
  grade: string;
  remark: string;
  subjectPassed: boolean;
};

export type PromotionSuggestion = {
  studentId: string;
  classId: string;
  average: number;
  subjectCount: number;
  passedSubjects: number;
  suggestedDecision: "PROMOTE" | "REPEAT";
};
