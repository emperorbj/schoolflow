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

export type SubjectPositionRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  totalPercent: number;
  grade: string | null;
  remark: string | null;
  subjectPassed: boolean;
  position: number;
};

export type SubjectPositionsResponse = {
  subject: { id: string; name: string; code: string };
  rankings: SubjectPositionRow[];
};

export type ReportCardSubjectRow = {
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
  subjectPosition: number;
};

export type ReportCardResponse = {
  classId: string;
  termId: string;
  generatedAt: string;
  student: {
    studentId: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    gender?: "MALE" | "FEMALE";
  };
  aggregate: {
    totalScore: number;
    average: number;
    subjectCount: number;
    passedSubjects: number;
    overallPosition: number;
  };
  comments: {
    classTeacherComment: string;
    headteacherComment: string;
  };
  subjects: ReportCardSubjectRow[];
};

export type BulkReportCardsResponse = {
  classId: string;
  termId: string;
  generatedAt: string;
  subjectsMeta: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
  }[];
  students: {
    studentId: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    gender?: "MALE" | "FEMALE";
    department?: string | null;
    aggregate: {
      totalScore: number;
      average: number;
      subjectCount: number;
      passedSubjects: number;
      overallPosition: number;
    };
    comments: {
      classTeacherComment: string;
      headteacherComment: string;
    };
    subjects: ReportCardSubjectRow[];
  }[];
};
