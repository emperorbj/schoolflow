export type Material = {
  _id: string;
  title: string;
  classId: string;
  subjectId: string;
  bucket: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedByUserId: string;
  createdAt?: string;
};

export type CreateMaterialPayload = {
  file: File;
  title: string;
  classId: string;
  subjectId: string;
};
