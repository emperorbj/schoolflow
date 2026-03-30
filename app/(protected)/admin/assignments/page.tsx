"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookUser,
  CircleAlert,
  ClipboardCheck,
  Filter,
  UserCheck2,
  UserMinus2,
  UserPlus2,
} from "lucide-react";
import {
  useClassesQuery,
  useClassCoverageQuery,
  useCreateTeachingAssignmentMutation,
  useSubjectsQuery,
  useTermsQuery,
  useUnassignTeachingAssignmentMutation,
  useUsersQuery,
} from "@/features/admin/hooks";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

const TEACHING_ASSIGNMENT_USER_ROLES = ["SUBJECT_TEACHER", "CLASS_TEACHER"] as const;

function roleLabelForAssignment(role: string) {
  if (role === "CLASS_TEACHER") return "Class teacher";
  if (role === "SUBJECT_TEACHER") return "Subject teacher";
  return role;
}

export default function AdminAssignmentsPage() {
  const classes = useClassesQuery();
  const terms = useTermsQuery();
  const subjects = useSubjectsQuery();
  const users = useUsersQuery();

  const [classId, setClassId] = useState("");
  const [termFilter, setTermFilter] = useState<string>("__all__");
  const coverageTermId = termFilter === "__all__" ? undefined : termFilter;

  const coverage = useClassCoverageQuery(classId || undefined, coverageTermId);
  const assign = useCreateTeachingAssignmentMutation();
  const unassign = useUnassignTeachingAssignmentMutation();

  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");
  const [assignTermId, setAssignTermId] = useState("");
  /** Remount Radix Selects after submit so cleared values show as empty (placeholder). */
  const [assignFormSelectKey, setAssignFormSelectKey] = useState(0);

  const classRows = classes.data?.classes ?? [];
  const termRows = terms.data?.terms ?? [];
  const subjectRows = subjects.data?.subjects ?? [];

  const teachersForAssignment = useMemo(() => {
    const list = (users.data?.users ?? []).filter(
      (u) => u.isActive && TEACHING_ASSIGNMENT_USER_ROLES.includes(u.role as (typeof TEACHING_ASSIGNMENT_USER_ROLES)[number]),
    );
    return [...list].sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, undefined, {
        sensitivity: "base",
      }),
    );
  }, [users.data?.users]);

  const unexpectedAssignmentTeacherIds = useMemo(() => {
    const ids = coverage.data?.assignedTeacherIdsNotSubjectTeacherRole ?? [];
    const list = users.data?.users;
    if (!list?.length) return ids;
    return ids.filter((id) => {
      const u = list.find((x) => x.id === id);
      return !u || u.role !== "CLASS_TEACHER";
    });
  }, [coverage.data?.assignedTeacherIdsNotSubjectTeacherRole, users.data?.users]);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-r from-indigo-100/70 via-indigo-50 to-background shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Teacher-subject assignments</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Assign staff who teach each subject (subject teachers or class teachers), view
                coverage, and unassign when needed.
              </p>
            </div>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/admin">
                <ArrowLeft className="size-4" />
                Admin setup
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2">
        {classes.error || terms.error || subjects.error || users.error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorText(classes.error ?? terms.error ?? subjects.error ?? users.error)}
          </p>
        ) : null}
        {coverage.error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorText(coverage.error)}
          </p>
        ) : null}
        {assign.error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorText(assign.error)}
          </p>
        ) : null}
        {unassign.error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorText(unassign.error)}
          </p>
        ) : null}
      </div>

      <Card className="border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5 text-indigo-600" />
            Coverage filters
          </CardTitle>
          <CardDescription>
            Pick a class to load active assignments. Optionally limit to one term.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={classId || undefined} onValueChange={setClassId}>
            <SelectTrigger className="h-10 w-[240px] bg-white">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {classRows.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} {c.arm}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={termFilter} onValueChange={setTermFilter}>
            <SelectTrigger className="h-10 w-[240px] bg-white">
              <SelectValue placeholder="Term scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="__all__">All terms (active)</SelectItem>
                {termRows.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name} (order {t.order})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {coverage.isFetching && classId ? (
        <p className="text-sm text-muted-foreground">Loading coverage...</p>
      ) : null}

      {coverage.data ? (
        <>
          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="size-5 text-indigo-600" />
                Coverage summary
              </CardTitle>
              <CardDescription>{coverage.data.scopeNote}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {unexpectedAssignmentTeacherIds.length > 0 ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <CircleAlert className="size-4" />
                    Some assignments reference users who are not subject or class teachers:
                  </span>{" "}
                  {unexpectedAssignmentTeacherIds.join(", ")}
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <UserCheck2 className="size-4" />
                    Assigned in this scope
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {coverage.data.assignedSubjectTeachers.map((t) => (
                      <li key={t.id}>
                        {t.firstName} {t.lastName} - {t.email}
                      </li>
                    ))}
                    {coverage.data.assignedSubjectTeachers.length === 0 ? (
                      <li>No subject teachers assigned for this class in this scope.</li>
                    ) : null}
                  </ul>
                </div>
                <div className="rounded-xl border border-sky-200/70 bg-sky-50/60 p-3">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-sky-700">
                    <UserMinus2 className="size-4" />
                    Subject teachers not assigned
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {coverage.data.unassignedSubjectTeachers.map((t) => (
                      <li key={t.id}>
                        {t.firstName} {t.lastName} - {t.email}
                      </li>
                    ))}
                    {coverage.data.unassignedSubjectTeachers.length === 0 ? (
                      <li>All active subject teachers have at least one assignment in this scope.</li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus2 className="size-5 text-indigo-600" />
                Assign teacher
              </CardTitle>
              <CardDescription>
                Creates an active teaching assignment for the selected class.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Teacher</span>
                <Select
                  key={`teacher-${assignFormSelectKey}`}
                  value={assignTeacherId || undefined}
                  onValueChange={(v) => setAssignTeacherId(v ?? "")}
                >
                  <SelectTrigger className="h-10 w-[280px]">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {teachersForAssignment.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.email}) — {roleLabelForAssignment(u.role)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Subject</span>
                <Select
                  key={`subject-${assignFormSelectKey}`}
                  value={assignSubjectId || undefined}
                  onValueChange={(v) => setAssignSubjectId(v ?? "")}
                >
                  <SelectTrigger className="h-10 w-[220px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {subjectRows.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Term</span>
                <Select
                  key={`term-${assignFormSelectKey}`}
                  value={assignTermId || undefined}
                  onValueChange={(v) => setAssignTermId(v ?? "")}
                >
                  <SelectTrigger className="h-10 w-[220px]">
                    <SelectValue placeholder="Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {termRows.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={
                  assign.isPending ||
                  !classId ||
                  !assignTeacherId ||
                  !assignSubjectId ||
                  !assignTermId
                }
                onClick={async () => {
                  await assign.mutateAsync({
                    teacherUserId: assignTeacherId,
                    classId,
                    subjectId: assignSubjectId,
                    termId: assignTermId,
                  });
                  setAssignTeacherId("");
                  setAssignSubjectId("");
                  setAssignTermId("");
                  setAssignFormSelectKey((k) => k + 1);
                }}
              >
                <BookUser className="size-4" />
                Assign
              </Button>
            </CardContent>
          </Card>

          <Card className="border-indigo-100">
            <CardHeader>
              <CardTitle>Active assignments</CardTitle>
              <CardDescription>
                Unassign marks the row inactive (API unassign).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-indigo-100">
                <Table>
                  <TableCaption>Rows reflect current filters</TableCaption>
                  <TableHeader>
                    <TableRow className="bg-indigo-50/70">
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coverage.data.assignments.map((row) => (
                      <TableRow key={row.id} className="hover:bg-indigo-50/40">
                        <TableCell>
                          {row.teacher
                            ? `${row.teacher.firstName} ${row.teacher.lastName}`
                            : row.teacherUserId}
                        </TableCell>
                        <TableCell>
                          {row.subject ? `${row.subject.name} (${row.subject.code})` : row.subjectId}
                        </TableCell>
                        <TableCell>
                          {row.term ? `${row.term.name} (#${row.term.order})` : row.termId}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 text-rose-700 hover:bg-rose-50"
                            disabled={unassign.isPending}
                            onClick={async () => {
                              await unassign.mutateAsync({
                                teacherUserId: row.teacherUserId,
                                classId: row.classId,
                                subjectId: row.subjectId,
                                termId: row.termId,
                              });
                            }}
                          >
                            Unassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {coverage.data.assignments.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No active assignments in this view.</p>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : classId ? null : (
        <p className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          Select a class to view coverage and assignments.
        </p>
      )}
    </div>
  );
}
