export type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classId: string;
  isActive: boolean;
};

export type ListStudentsQuery = {
  classId?: string;
  q?: string;
};

export type CreateStudentPayload = {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classId: string;
};

export type UpdateStudentPayload = {
  firstName?: string;
  lastName?: string;
  admissionNumber?: string;
  classId?: string;
  isActive?: boolean;
};
