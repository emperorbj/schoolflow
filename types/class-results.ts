export type ClassResultsStatusItem = {
  subjectId: string;
  totalRows: number;
  lockedRows: number;
  submitted: boolean;
};

export type ClassResultStudentRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  totalScore: number;
  average: number;
  subjectCount: number;
  passedSubjects: number;
  position: number;
  classTeacherComment: string;
  headteacherComment: string;
};

export type AggregateResult = {
  generatedAt: string;
  students: number;
};

export type UpdateCommentsPayload = {
  comments: {
    studentId: string;
    classTeacherComment?: string;
    headteacherComment?: string;
  }[];
};
