"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/client";
import {
  useClassesQuery,
  useCreateClassMutation,
  useCreateSessionMutation,
  useCreateSubjectMutation,
  useCreateTermMutation,
  useDeleteClassMutation,
  useDeleteSessionMutation,
  useDeleteSubjectMutation,
  useSessionsQuery,
  useSubjectsQuery,
  useTermsQuery,
  useUpdateClassMutation,
  useUpdateSessionMutation,
  useUpdateSubjectMutation,
  useUpdateTermMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/features/admin/hooks";
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookUser,
  CheckCircle2,
  Circle,
  Plus,
  Save,
  Users,
} from "lucide-react";
import { FiTrash2 } from "react-icons/fi";

/** e.g. "2026/2027 Academic Session" */
function buildAcademicSessionOptions(count = 10) {
  const startYear = new Date().getFullYear() - 2;
  const options: string[] = [];
  for (let i = 0; i < count; i++) {
    const y = startYear + i;
    options.push(`${y}/${y + 1} Academic Session`);
  }
  return options;
}

const ACADEMIC_SESSION_OPTIONS = buildAcademicSessionOptions();

const TERM_SELECT_OPTIONS = [
  { name: "First Term", order: 1 },
  { name: "Second Term", order: 2 },
  { name: "Third Term", order: 3 },
] as const;

const CLASS_LEVEL_OPTIONS = ["JSS1", "JSS2", "JSS3"] as const;
const CLASS_ARM_OPTIONS = ["A", "B", "C"] as const;

function mutationError(error: unknown) {
  return error instanceof ApiError ? error.message : "Action failed";
}

export default function AdminPage() {
  const sessions = useSessionsQuery();
  const classes = useClassesQuery();
  const subjects = useSubjectsQuery();
  const terms = useTermsQuery();
  const users = useUsersQuery();

  const createSession = useCreateSessionMutation();
  const updateSession = useUpdateSessionMutation();
  const createClass = useCreateClassMutation();
  const updateClass = useUpdateClassMutation();
  const createSubject = useCreateSubjectMutation();
  const updateSubject = useUpdateSubjectMutation();
  const createTerm = useCreateTermMutation();
  const updateTerm = useUpdateTermMutation();
  const updateUser = useUpdateUserMutation();
  const deleteSession = useDeleteSessionMutation();
  const deleteClass = useDeleteClassMutation();
  const deleteSubject = useDeleteSubjectMutation();

  const [sessionSelect, setSessionSelect] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [classArmSelect, setClassArmSelect] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [termSessionId, setTermSessionId] = useState("");
  const [termSelect, setTermSelect] = useState("");

  const sessionRows = sessions.data?.sessions ?? [];
  const classRows = classes.data?.classes ?? [];
  const subjectRows = subjects.data?.subjects ?? [];
  const termRows = terms.data?.terms ?? [];
  const classTeacherOptions = (users.data?.users ?? [])
    .filter((u) => u.role === "CLASS_TEACHER" && u.isActive)
    .map((u) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName} (${u.email})`,
    }));

  const isLoadingAny =
    sessions.isLoading || classes.isLoading || subjects.isLoading || terms.isLoading || users.isLoading;
  const allErrors = [
    sessions.error,
    terms.error,
    classes.error,
    subjects.error,
    users.error,
    createSession.error,
    updateSession.error,
    createTerm.error,
    updateTerm.error,
    createClass.error,
    updateClass.error,
    updateUser.error,
    createSubject.error,
    updateSubject.error,
    deleteSession.error,
    deleteClass.error,
    deleteSubject.error,
  ].filter(Boolean);

  const topError = useMemo(() => {
    if (!allErrors.length) {
      return null;
    }
    return mutationError(allErrors[0]);
  }, [allErrors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin setup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, sessions, terms, classes, and subjects.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{topError}</p> : null}
      {isLoadingAny ? <p className="text-sm text-muted-foreground">Loading admin data...</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-indigo-600" />
              Users table
            </CardTitle>
            <CardDescription>
              Open the dedicated users table with copyable IDs and detail dialog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2">
              <Link href="/admin/users">
                <Users className="size-4" />
                Open users table
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-sky-200/80 bg-gradient-to-br from-sky-50 to-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookUser className="size-5 text-sky-600" />
              Teacher–subject assignments
            </CardTitle>
            <CardDescription>
              Assign subject teachers to classes, review coverage by term, and unassign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2">
              <Link href="/admin/assignments">
                <BookUser className="size-4" />
                Open assignments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Create and activate academic sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Select value={sessionSelect || undefined} onValueChange={setSessionSelect}>
                <SelectTrigger className="h-10 min-w-[220px] flex-1">
                  <SelectValue placeholder="Select academic session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ACADEMIC_SESSION_OPTIONS.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={createSession.isPending || !sessionSelect}
                onClick={async () => {
                  await createSession.mutateAsync({ name: sessionSelect });
                  setSessionSelect("");
                }}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {sessionRows.map((row) => (
                <SessionRow
                  key={row._id}
                  id={row._id}
                  name={row.name}
                  isActive={row.isActive}
                  onSave={(payload) => updateSession.mutateAsync({ id: row._id, payload })}
                  onDelete={() => deleteSession.mutateAsync(row._id)}
                  deletePending={deleteSession.isPending}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms</CardTitle>
            <CardDescription>Create terms and manage term order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
              <Select value={termSessionId || undefined} onValueChange={setTermSessionId}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {sessionRows.map((row) => (
                      <SelectItem key={row._id} value={row._id}>
                        {row.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={termSelect || undefined} onValueChange={setTermSelect}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TERM_SELECT_OPTIONS.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={createTerm.isPending || !termSessionId || !termSelect}
                onClick={async () => {
                  const picked = TERM_SELECT_OPTIONS.find((t) => t.name === termSelect);
                  if (!picked) {
                    return;
                  }
                  await createTerm.mutateAsync({
                    sessionId: termSessionId,
                    name: picked.name,
                    order: picked.order,
                  });
                  setTermSessionId("");
                  setTermSelect("");
                }}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {termRows.map((row) => (
                <TermRow
                  key={row._id}
                  id={row._id}
                  name={row.name}
                  order={row.order}
                  isActive={row.isActive}
                  onSave={(payload) => updateTerm.mutateAsync({ id: row._id, payload })}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>Create classes, assign class teachers, and update class metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
              <Select value={classLevel || undefined} onValueChange={setClassLevel}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CLASS_LEVEL_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={classArmSelect || undefined} onValueChange={setClassArmSelect}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Arm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CLASS_ARM_OPTIONS.map((arm) => (
                      <SelectItem key={arm} value={arm}>
                        {arm}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={createClass.isPending || !classLevel || !classArmSelect}
                onClick={async () => {
                  await createClass.mutateAsync({ name: classLevel, arm: classArmSelect });
                  setClassLevel("");
                  setClassArmSelect("");
                }}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {classRows.map((row) => (
                <ClassRow
                  key={row._id}
                  id={row._id}
                  name={row.name}
                  arm={row.arm}
                  classTeacherUserId={row.classTeacherUserId}
                  isActive={row.isActive}
                  onSave={async (payload) => {
                    await updateClass.mutateAsync({ id: row._id, payload });
                    const previousTeacherId = row.classTeacherUserId;
                    const nextTeacherId = payload.classTeacherUserId ?? null;

                    // Keep user.classTeacherClassId synced with class assignment for RBAC checks.
                    if (previousTeacherId && previousTeacherId !== nextTeacherId) {
                      await updateUser.mutateAsync({
                        id: previousTeacherId,
                        payload: { classTeacherClassId: null },
                      });
                    }
                    if (nextTeacherId) {
                      await updateUser.mutateAsync({
                        id: nextTeacherId,
                        payload: { classTeacherClassId: row._id },
                      });
                    }
                  }}
                  onDelete={() => deleteClass.mutateAsync(row._id)}
                  deletePending={deleteClass.isPending}
                  classTeacherOptions={classTeacherOptions}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Create and maintain subject catalog.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
              <Input value={subjectName} placeholder="Mathematics" onChange={(e) => setSubjectName(e.target.value)} />
              <Input value={subjectCode} placeholder="MTH" onChange={(e) => setSubjectCode(e.target.value)} />
              <Button
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={createSubject.isPending || subjectName.trim().length < 2 || subjectCode.trim().length < 2}
                onClick={async () => {
                  await createSubject.mutateAsync({
                    name: subjectName.trim(),
                    code: subjectCode.trim(),
                  });
                  setSubjectName("");
                  setSubjectCode("");
                }}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {subjectRows.map((row) => (
                <SubjectRow
                  key={row._id}
                  id={row._id}
                  name={row.name}
                  code={row.code}
                  isActive={row.isActive}
                  onSave={(payload) => updateSubject.mutateAsync({ id: row._id, payload })}
                  onDelete={() => deleteSubject.mutateAsync(row._id)}
                  deletePending={deleteSubject.isPending}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function sessionSelectOptions(currentName: string) {
  if (ACADEMIC_SESSION_OPTIONS.includes(currentName)) {
    return ACADEMIC_SESSION_OPTIONS;
  }
  return [currentName, ...ACADEMIC_SESSION_OPTIONS];
}

function SessionRow({
  id,
  name,
  isActive,
  onSave,
  onDelete,
  deletePending,
}: {
  id: string;
  name: string;
  isActive: boolean;
  onSave: (payload: { name: string; isActive: boolean }) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  deletePending: boolean;
}) {
  const [value, setValue] = useState(name);
  const [active, setActive] = useState(isActive);
  const [pending, setPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const sessionChoices = useMemo(() => sessionSelectOptions(name), [name]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-10 min-w-[200px] flex-1">
          <SelectValue placeholder="Session" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sessionChoices.map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <ActiveToggle active={active} onChange={setActive} />
      <Button
        size="sm"
        className="gap-1.5"
        disabled={pending || value.trim().length < 3}
        onClick={async () => {
          setPending(true);
          await onSave({ name: value.trim(), isActive: active });
          setPending(false);
        }}
      >
        <Save className="size-4" />
        Save
      </Button>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button
            size="icon-sm"
            variant="destructive"
            disabled={deletePending}
            title="Delete session"
            type="button"
          >
            <FiTrash2 className="size-4" />
            <span className="sr-only">Delete session</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete session?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes “{name}” and cannot be undone. Terms in this session may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deletePending}
              onClick={async () => {
                await onDelete();
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <input type="hidden" value={id} />
    </div>
  );
}

function termSelectOptions(currentName: string, currentOrder: number) {
  const known = TERM_SELECT_OPTIONS.some((t) => t.name === currentName);
  if (known) {
    return TERM_SELECT_OPTIONS;
  }
  return [{ name: currentName, order: currentOrder }, ...TERM_SELECT_OPTIONS];
}

function TermRow({
  id,
  name,
  order,
  isActive,
  onSave,
}: {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  onSave: (payload: { name: string; order: number; isActive: boolean }) => Promise<unknown>;
}) {
  const [value, setValue] = useState(name);
  const [sortOrder, setSortOrder] = useState(order);
  const [active, setActive] = useState(isActive);
  const [pending, setPending] = useState(false);
  const termChoices = useMemo(() => termSelectOptions(name, order), [name, order]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          const picked = TERM_SELECT_OPTIONS.find((t) => t.name === v);
          if (picked) {
            setSortOrder(picked.order);
          }
        }}
      >
        <SelectTrigger className="h-10 min-w-[160px] flex-1">
          <SelectValue placeholder="Term" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {termChoices.map((t) => (
              <SelectItem key={t.name} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <span className="text-sm tabular-nums text-muted-foreground">Order {sortOrder}</span>
      <ActiveToggle active={active} onChange={setActive} />
      <Button
        size="sm"
        className="gap-1.5"
        disabled={pending || value.trim().length < 3}
        onClick={async () => {
          setPending(true);
          await onSave({ name: value.trim(), order: sortOrder, isActive: active });
          setPending(false);
        }}
      >
        <Save className="size-4" />
        Save
      </Button>
      <input type="hidden" value={id} />
    </div>
  );
}

function classLevelOptions(currentName: string) {
  if (CLASS_LEVEL_OPTIONS.includes(currentName as (typeof CLASS_LEVEL_OPTIONS)[number])) {
    return [...CLASS_LEVEL_OPTIONS];
  }
  return [currentName, ...CLASS_LEVEL_OPTIONS];
}

function classArmOptions(currentArm: string) {
  if (CLASS_ARM_OPTIONS.includes(currentArm as (typeof CLASS_ARM_OPTIONS)[number])) {
    return [...CLASS_ARM_OPTIONS];
  }
  return [currentArm, ...CLASS_ARM_OPTIONS];
}

function ClassRow({
  id,
  name,
  arm,
  classTeacherUserId,
  isActive,
  onSave,
  onDelete,
  deletePending,
  classTeacherOptions,
}: {
  id: string;
  name: string;
  arm: string;
  classTeacherUserId: string | null;
  isActive: boolean;
  onSave: (payload: {
    name: string;
    arm: string;
    classTeacherUserId: string | null;
    isActive: boolean;
  }) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  deletePending: boolean;
  classTeacherOptions: { id: string; label: string }[];
}) {
  const [nameValue, setNameValue] = useState(name);
  const [armValue, setArmValue] = useState(arm);
  const [classTeacherValue, setClassTeacherValue] = useState(classTeacherUserId ?? "__none__");
  const [active, setActive] = useState(isActive);
  const [pending, setPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const levelChoices = useMemo(() => classLevelOptions(name), [name]);
  const armChoices = useMemo(() => classArmOptions(arm), [arm]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
      <Select value={nameValue} onValueChange={setNameValue}>
        <SelectTrigger className="h-10 w-[120px]">
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {levelChoices.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select value={armValue} onValueChange={setArmValue}>
        <SelectTrigger className="h-10 w-20">
          <SelectValue placeholder="Arm" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {armChoices.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select value={classTeacherValue} onValueChange={setClassTeacherValue}>
        <SelectTrigger className="h-10 min-w-[240px] flex-1">
          <SelectValue placeholder="Class teacher" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="__none__">No class teacher</SelectItem>
            {classTeacherOptions.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <ActiveToggle active={active} onChange={setActive} />
      <Button
        size="sm"
        className="gap-1.5"
        disabled={pending || !nameValue.trim() || !armValue.trim()}
        onClick={async () => {
          setPending(true);
          await onSave({
            name: nameValue.trim(),
            arm: armValue.trim(),
            classTeacherUserId: classTeacherValue === "__none__" ? null : classTeacherValue,
            isActive: active,
          });
          setPending(false);
        }}
      >
        <Save className="size-4" />
        Save
      </Button>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button
            size="icon-sm"
            variant="destructive"
            disabled={deletePending}
            title="Delete class"
            type="button"
          >
            <FiTrash2 className="size-4" />
            <span className="sr-only">Delete class</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete class?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes “{name} {arm}” permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deletePending}
              onClick={async () => {
                await onDelete();
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <input type="hidden" value={id} />
    </div>
  );
}

function SubjectRow({
  id,
  name,
  code,
  isActive,
  onSave,
  onDelete,
  deletePending,
}: {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  onSave: (payload: { name: string; code: string; isActive: boolean }) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  deletePending: boolean;
}) {
  const [nameValue, setNameValue] = useState(name);
  const [codeValue, setCodeValue] = useState(code);
  const [active, setActive] = useState(isActive);
  const [pending, setPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
      <Input className="min-w-[120px] flex-1" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
      <Input className="w-28" value={codeValue} onChange={(e) => setCodeValue(e.target.value)} />
      <ActiveToggle active={active} onChange={setActive} />
      <Button
        size="sm"
        className="gap-1.5"
        disabled={pending || nameValue.trim().length < 2 || codeValue.trim().length < 2}
        onClick={async () => {
          setPending(true);
          await onSave({
            name: nameValue.trim(),
            code: codeValue.trim(),
            isActive: active,
          });
          setPending(false);
        }}
      >
        <Save className="size-4" />
        Save
      </Button>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button
            size="icon-sm"
            variant="destructive"
            disabled={deletePending}
            title="Delete subject"
            type="button"
          >
            <FiTrash2 className="size-4" />
            <span className="sr-only">Delete subject</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes “{name}” ({code}) permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deletePending}
              onClick={async () => {
                await onDelete();
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <input type="hidden" value={id} />
    </div>
  );
}

function ActiveToggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={`gap-1.5 border ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "text-muted-foreground"}`}
      onClick={() => onChange(!active)}
      aria-pressed={active}
      title={active ? "Set inactive" : "Set active"}
    >
      {active ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
      {active ? "Active" : "Inactive"}
    </Button>
  );
}
