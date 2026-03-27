"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { CheckCircle2, FilterX, GraduationCap, Hash, KeyRound, Mail, Plus, Save, Search, Users } from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useClassesQuery } from "@/features/admin/hooks";
import { useCurrentUserQuery } from "@/features/auth/hooks";
import {
  useCreateStudentMutation,
  useCreateStudentPortalMutation,
  useDeleteStudentMutation,
  useStudentsQuery,
  useUpdateStudentMutation,
} from "@/features/students/hooks";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CreateStudentPayload, CreateStudentPortalPayload, Student, UpdateStudentPayload } from "@/types/students";

const ALL_CLASSES_VALUE = "__all_classes__";

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

function generatePassword(length = 14) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@%*-_=+";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export default function StudentsPage() {
  const me = useCurrentUserQuery();
  const role = me.data?.role;
  const isClassTeacher = role === "CLASS_TEACHER";
  const canCreateStudentPortal =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "HEADTEACHER" ||
    role === "PRINCIPAL";

  const [q, setQ] = useState("");
  const [classId, setClassId] = useState("");
  const classesQuery = useClassesQuery();
  const studentsQuery = useStudentsQuery({
    q: q.trim() || undefined,
    classId: classId || undefined,
  });

  const createStudent = useCreateStudentMutation();
  const createStudentPortal = useCreateStudentPortalMutation();
  const updateStudent = useUpdateStudentMutation();
  const deleteStudent = useDeleteStudentMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [createClassId, setCreateClassId] = useState("");
  /** Bumps after successful create so the class Select remounts (Radix can keep stale label when value clears). */
  const [createClassSelectKey, setCreateClassSelectKey] = useState(0);
  const [createPortalAccount, setCreatePortalAccount] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPortalPassword, setShowPortalPassword] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [portalStudent, setPortalStudent] = useState<Student | null>(null);

  const classes = classesQuery.data?.classes ?? [];
  const students = studentsQuery.data?.students ?? [];
  const topError =
    studentsQuery.error ??
    classesQuery.error ??
    (isClassTeacher
      ? null
      : createStudent.error ??
        createStudentPortal.error ??
        updateStudent.error ??
        deleteStudent.error);
  const classOptions = classes.map((c) => ({
    id: c._id,
    label: `${c.name} ${c.arm}`,
  }));
  const classLabelById = new Map(classOptions.map((option) => [option.id, option.label]));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-0 bg-gradient-to-r from-primary/15 via-primary/5 to-background p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">{isClassTeacher ? "My class students" : "Students"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isClassTeacher
            ? "Read-only list of students in your assigned class."
            : "Search, filter, create, and update student records."}
        </p>
      </div>

      {topError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorText(topError)}
        </div>
      ) : null}

      {!isClassTeacher ? (
      <Card className="border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-indigo-600" />
            Create student
          </CardTitle>
          <CardDescription>
            Add a student to a class roster. Optionally create a portal login so they can sign in and view results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Input
              className="bg-white"
              value={firstName}
              placeholder="First name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              className="bg-white"
              value={lastName}
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="bg-white pl-9"
                value={admissionNumber}
                placeholder="Admission number"
                onChange={(e) => setAdmissionNumber(e.target.value)}
              />
            </div>
            <Select value={gender || undefined} onValueChange={(value) => setGender(value as "MALE" | "FEMALE")}>
              <SelectTrigger className="h-10 w-full bg-white">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              key={createClassSelectKey}
              value={createClassId || undefined}
              onValueChange={setCreateClassId}
            >
              <SelectTrigger className="h-10 w-full bg-white">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {classes.map((row) => (
                    <SelectItem key={row._id} value={row._id}>
                      {row.name} {row.arm}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-white/80 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-input"
                checked={createPortalAccount}
                onChange={(e) => {
                  setCreatePortalAccount(e.target.checked);
                  if (!e.target.checked) {
                    setLoginEmail("");
                    setLoginPassword("");
                    setShowPortalPassword(false);
                  }
                }}
              />
              <span>
                <span className="font-medium">Create portal account</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  If unchecked, only a student record is created (no app login). Login email and password must both be
                  provided together.
                </span>
              </span>
            </label>
            {createPortalAccount ? (
              <div className="mt-4 grid gap-3">
                <div className="relative max-w-xl">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="email"
                    autoComplete="off"
                    placeholder="Login email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <div className="relative min-w-0 flex-1 max-w-xl">
                    <Input
                      className="pr-11"
                      type={showPortalPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Login password (min 8 characters)"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-0.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      title={showPortalPassword ? "Hide password" : "Show password"}
                      aria-label={showPortalPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPortalPassword((v) => !v)}
                    >
                      {showPortalPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50 sm:w-auto"
                    onClick={() => {
                      setLoginPassword(generatePassword());
                      setShowPortalPassword(true);
                    }}
                  >
                    Generate password
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <Button
            className="w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 md:w-auto"
            disabled={
              createStudent.isPending ||
              !firstName.trim() ||
              !lastName.trim() ||
              !gender ||
              !admissionNumber.trim() ||
              !createClassId ||
              (createPortalAccount &&
                (!loginEmail.trim() ||
                  !loginPassword.trim() ||
                  loginPassword.trim().length < 8))
            }
            onClick={async () => {
              const payload: CreateStudentPayload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                gender,
                admissionNumber: admissionNumber.trim(),
                classId: createClassId,
              };
              if (createPortalAccount) {
                payload.loginEmail = loginEmail.trim();
                payload.loginPassword = loginPassword.trim();
              }
              await createStudent.mutateAsync(payload);
              setFirstName("");
              setLastName("");
              setGender("");
              setAdmissionNumber("");
              setCreateClassId("");
              setCreateClassSelectKey((k) => k + 1);
              setCreatePortalAccount(false);
              setLoginEmail("");
              setLoginPassword("");
              setShowPortalPassword(false);
            }}
          >
            <Plus className="size-4" />
            Create student
          </Button>
        </CardContent>
      </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-indigo-600" />
            {isClassTeacher ? "My class students" : "Student records"}
          </CardTitle>
          <CardDescription>
            {isClassTeacher
              ? "View students in your assigned class."
              : "Filter by class or search by name/admission number."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid gap-2 ${isClassTeacher ? "md:grid-cols-1" : "md:grid-cols-3"}`}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={q}
                placeholder="Search by name or admission number"
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {!isClassTeacher ? (
            <>
            <Select
              value={classId ? classId : ALL_CLASSES_VALUE}
              onValueChange={(value) => {
                setClassId(value === ALL_CLASSES_VALUE ? "" : value);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={ALL_CLASSES_VALUE}>All classes</SelectItem>
                  {classes.map((row) => (
                    <SelectItem key={row._id} value={row._id}>
                      {row.name} {row.arm}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => { setQ(""); setClassId(""); }}>
              <FilterX className="size-4" />
              Clear filters
            </Button>
            </>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm">
            <Table>
              <TableCaption>Student records in current school</TableCaption>
              <TableHeader>
                <TableRow className="bg-indigo-50/70">
                  <TableHead>First name</TableHead>
                  <TableHead>Last name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Admission no.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  {!isClassTeacher ? (
                  <TableHead className="text-right">Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isClassTeacher ? 6 : 7} className="py-6 text-center text-sm text-muted-foreground">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : students.length ? (
                  students.map((student) => (
                    <TableRow key={student._id} className="hover:bg-indigo-50/40">
                      <TableCell className="font-medium">{student.firstName}</TableCell>
                      <TableCell>{student.lastName}</TableCell>
                      <TableCell>{student.gender ?? "-"}</TableCell>
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell>{classLabelById.get(student.classId) ?? student.classId}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${
                            student.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <CheckCircle2 className="size-3.5" />
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      {!isClassTeacher ? (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canCreateStudentPortal && !student.hasPortalAccount ? (
                            <Button
                              size="icon-sm"
                              variant="outline"
                              className="border-amber-200 text-amber-800 hover:bg-amber-50"
                              onClick={() => setPortalStudent(student)}
                              title="Create portal account"
                            >
                              <KeyRound className="size-4" />
                            </Button>
                          ) : null}
                          <Button
                            size="icon-sm"
                            variant="outline"
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setEditingStudent(student)}
                            title="Edit student"
                          >
                            <FiEdit2 className="size-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            className="border-rose-200 text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeletingStudent(student)}
                            title="Delete student"
                          >
                            <FiTrash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isClassTeacher ? 6 : 7} className="py-6 text-center text-sm text-muted-foreground">
                      No student records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!isClassTeacher ? (
      <CreateStudentPortalDialog
        open={Boolean(portalStudent)}
        onOpenChange={(open) => {
          if (!open) setPortalStudent(null);
        }}
        student={portalStudent}
        pending={createStudentPortal.isPending}
        onSubmit={async (id, payload: CreateStudentPortalPayload) => {
          await createStudentPortal.mutateAsync({ id, payload });
          setPortalStudent(null);
        }}
      />
      ) : null}

      {!isClassTeacher ? (
      <EditStudentDialog
        open={Boolean(editingStudent)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingStudent(null);
          }
        }}
        student={editingStudent}
        classOptions={classOptions}
        pending={updateStudent.isPending}
        onSubmit={async (id, payload) => {
          await updateStudent.mutateAsync({ id, payload });
          setEditingStudent(null);
        }}
      />
      ) : null}

      {!isClassTeacher ? (
      <AlertDialog
        open={Boolean(deletingStudent)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingStudent(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deletingStudent?.firstName} {deletingStudent?.lastName} from records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={deleteStudent.isPending || !deletingStudent}
              onClick={async (event) => {
                event.preventDefault();
                if (!deletingStudent) {
                  return;
                }
                await deleteStudent.mutateAsync(deletingStudent._id);
                setDeletingStudent(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      ) : null}
    </div>
  );
}

function CreateStudentPortalDialog({
  open,
  onOpenChange,
  student,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  pending: boolean;
  onSubmit: (id: string, payload: CreateStudentPortalPayload) => Promise<unknown>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const studentId = student?._id ?? "";
  const canSubmit =
    Boolean(studentId) && email.trim().length > 0 && password.trim().length >= 8;

  useEffect(() => {
    if (student) {
      setEmail("");
      setPassword("");
      setShowPassword(false);
    }
  }, [student?._id]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Create portal account</AlertDialogTitle>
          <AlertDialogDescription>
            {student
              ? `Add login for ${student.firstName} ${student.lastName} (${student.admissionNumber}). They can use this email and password to sign in.`
              : "Add login credentials for this student."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              type="email"
              autoComplete="off"
              placeholder="Login email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="relative min-w-0 flex-1">
              <Input
                className="pr-11"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-0.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => {
                setPassword(generatePassword());
                setShowPassword(true);
              }}
            >
              Generate password
            </Button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700"
            disabled={pending || !canSubmit}
            onClick={async (event) => {
              event.preventDefault();
              if (!studentId) return;
              await onSubmit(studentId, { loginEmail: email.trim(), loginPassword: password.trim() });
            }}
          >
            <KeyRound className="size-4" />
            Create portal
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditStudentDialog({
  open,
  onOpenChange,
  student,
  classOptions,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  classOptions: { id: string; label: string }[];
  pending: boolean;
  onSubmit: (id: string, payload: UpdateStudentPayload) => Promise<unknown>;
}) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("");
  const [admission, setAdmission] = useState("");
  const [clazz, setClazz] = useState("");
  const [active, setActive] = useState(true);

  const studentId = student?._id ?? "";

  const initialFirst = student?.firstName ?? "";
  const initialLast = student?.lastName ?? "";
  const initialGender = student?.gender ?? "";
  const initialAdmission = student?.admissionNumber ?? "";
  const initialClazz = student?.classId ?? "";
  const initialActive = student?.isActive ?? true;

  const hasValidFirstChange = first.trim() !== initialFirst && first.trim().length > 0;
  const hasValidLastChange = last.trim() !== initialLast && last.trim().length > 0;
  const hasGenderChange = gender !== initialGender && Boolean(gender);
  const hasValidAdmissionChange =
    admission.trim() !== initialAdmission && admission.trim().length > 0;
  const hasClassChange = clazz !== initialClazz && Boolean(clazz);
  const hasStatusChange = active !== initialActive;
  const hasAnyChange =
    hasValidFirstChange ||
    hasValidLastChange ||
    hasGenderChange ||
    hasValidAdmissionChange ||
    hasClassChange ||
    hasStatusChange;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && student) {
          setFirst(student.firstName);
          setLast(student.lastName);
          setGender(student.gender ?? "");
          setAdmission(student.admissionNumber);
          setClazz(student.classId);
          setActive(student.isActive);
        }
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="sm:max-w-xl border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit student details</AlertDialogTitle>
          <AlertDialogDescription>
            Update student information, class assignment, and status.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={first} placeholder="First name" onChange={(event) => setFirst(event.target.value)} />
          <Input value={last} placeholder="Last name" onChange={(event) => setLast(event.target.value)} />
          <div className="md:col-span-2">
            <Select value={gender || undefined} onValueChange={(value) => setGender(value as "MALE" | "FEMALE")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="relative md:col-span-2">
            <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={admission}
              placeholder="Admission number"
              onChange={(event) => setAdmission(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Select value={clazz || undefined} onValueChange={setClazz}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {classOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`gap-1.5 border ${
                active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActive((prev) => !prev)}
              aria-pressed={active}
            >
              <CheckCircle2 className="size-4" />
              {active ? "Active" : "Inactive"}
            </Button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={
              pending ||
              !hasAnyChange
            }
            onClick={async (event) => {
              event.preventDefault();
              if (!studentId) {
                return;
              }
              const payload: UpdateStudentPayload = {};
              if (hasValidFirstChange) payload.firstName = first.trim();
              if (hasValidLastChange) payload.lastName = last.trim();
              if (hasGenderChange) payload.gender = gender;
              if (hasValidAdmissionChange) payload.admissionNumber = admission.trim();
              if (hasClassChange) payload.classId = clazz;
              if (hasStatusChange) payload.isActive = active;

              await onSubmit(studentId, {
                ...payload,
              });
            }}
          >
            <Save className="size-4" />
            Save changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
