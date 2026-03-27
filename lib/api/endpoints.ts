export const API_ENDPOINTS = {
  auth: {
    register: "/api/v1/auth/register",
    login: "/api/v1/auth/login",
    me: "/api/v1/auth/me",
  },
  admin: {
    users: "/api/v1/admin/users",
    userById: (id: string) => `/api/v1/admin/users/${id}`,
    sessions: "/api/v1/admin/sessions",
    terms: "/api/v1/admin/terms",
    classes: "/api/v1/admin/classes",
    subjects: "/api/v1/admin/subjects",
    teacherSubjectAssignment: "/api/v1/admin/assignments/teacher-subject",
    teacherSubjectUnassign: "/api/v1/admin/assignments/teacher-subject/unassign",
    classCoverage: "/api/v1/admin/assignments/class-coverage",
  },
  students: {
    list: "/api/v1/students",
    byId: (id: string) => `/api/v1/students/${id}`,
    /** Create STUDENT user + link to existing student row (implement on API). */
    portal: (id: string) => `/api/v1/students/${id}/portal`,
    meResults: "/api/v1/students/me/results",
  },
  assessments: {
    teachingContexts: "/api/v1/teaching-contexts",
    scoreSheets: "/api/v1/score-sheets",
    studentCounts: "/api/v1/student-counts",
    submissions: "/api/v1/submissions",
    submissionStatus: "/api/v1/submissions/status",
  },
  classResults: {
    status: (classId: string, termId: string) =>
      `/api/v1/class-results/${classId}/${termId}/status`,
    aggregate: (classId: string, termId: string) =>
      `/api/v1/class-results/${classId}/${termId}/aggregate`,
    students: (classId: string, termId: string) =>
      `/api/v1/class-results/${classId}/${termId}/students`,
    reportCards: (classId: string, termId: string) =>
      `/api/v1/class-results/${classId}/${termId}/report-cards`,
    subjectPositions: (classId: string, termId: string, subjectId: string) =>
      `/api/v1/class-results/${classId}/${termId}/subjects/${subjectId}/positions`,
    reportCard: (classId: string, termId: string, studentId: string) =>
      `/api/v1/class-results/${classId}/${termId}/report-cards/${studentId}`,
    reportCardPdf: (classId: string, termId: string, studentId: string) =>
      `/api/v1/class-results/${classId}/${termId}/report-cards/${studentId}/pdf`,
    comments: (classId: string, termId: string) =>
      `/api/v1/class-results/${classId}/${termId}/comments`,
  },
  headteacher: {
    overview: "/api/v1/headteacher/overview",
    classes: "/api/v1/headteacher/classes",
    classStudents: (classId: string) =>
      `/api/v1/headteacher/classes/${classId}/students`,
    studentPerformance: (studentId: string) =>
      `/api/v1/headteacher/students/${studentId}/performance`,
  },
  principal: {
    overview: "/api/v1/principal/overview",
    classStudents: (classId: string) =>
      `/api/v1/principal/classes/${classId}/students`,
    promotionsPreview: "/api/v1/principal/promotions/preview",
    promotionsApprove: "/api/v1/principal/promotions/approve",
    lockTerm: (termId: string) => `/api/v1/principal/terms/${termId}/lock`,
  },
  materials: {
    list: "/api/v1/materials",
    upload: "/api/v1/materials",
    signedUrl: (id: string) => `/api/v1/materials/${id}/signed-url`,
  },
  notifications: {
    resultsReleased: "/api/v1/notifications/results-released",
    lowPerformanceAlert: "/api/v1/notifications/low-performance-alert",
  },
} as const;
