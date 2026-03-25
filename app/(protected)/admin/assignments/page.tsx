"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

  const classRows = classes.data?.classes ?? [];
  const termRows = terms.data?.terms ?? [];
  const subjectRows = subjects.data?.subjects ?? [];

  const subjectTeachers = useMemo(
    () => (users.data?.users ?? []).filter((u) => u.role === "SUBJECT_TEACHER" && u.isActive),
    [users.data?.users],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Teacher–subject assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign subject teachers to classes, view coverage, and unassign when needed.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">← Admin setup</Link>
        </Button>
      </div>

      {classes.error || terms.error || subjects.error || users.error ? (
        <p className="text-sm text-destructive">
          {errorText(classes.error ?? terms.error ?? subjects.error ?? users.error)}
        </p>
      ) : null}
      {coverage.error ? (
        <p className="text-sm text-destructive">{errorText(coverage.error)}</p>
      ) : null}
      {assign.error ? <p className="text-sm text-destructive">{errorText(assign.error)}</p> : null}
      {unassign.error ? <p className="text-sm text-destructive">{errorText(unassign.error)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Coverage filters</CardTitle>
          <CardDescription>
            Pick a class to load active assignments. Optionally limit to one term.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={classId || undefined} onValueChange={setClassId}>
            <SelectTrigger className="h-10 w-[220px]">
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
            <SelectTrigger className="h-10 w-[220px]">
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
        <p className="text-sm text-muted-foreground">Loading coverage…</p>
      ) : null}

      {coverage.data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Coverage summary</CardTitle>
              <CardDescription>{coverage.data.scopeNote}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverage.data.assignedTeacherIdsNotSubjectTeacherRole.length > 0 ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                  Some assignments reference users who are not active subject teachers in this school:
                  {" "}
                  {coverage.data.assignedTeacherIdsNotSubjectTeacherRole.join(", ")}
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Assigned in this scope</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {coverage.data.assignedSubjectTeachers.map((t) => (
                      <li key={t.id}>
                        {t.firstName} {t.lastName} — {t.email}
                      </li>
                    ))}
                    {coverage.data.assignedSubjectTeachers.length === 0 ? (
                      <li>No subject teachers assigned for this class in this scope.</li>
                    ) : null}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Subject teachers not assigned</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {coverage.data.unassignedSubjectTeachers.map((t) => (
                      <li key={t.id}>
                        {t.firstName} {t.lastName} — {t.email}
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

          <Card>
            <CardHeader>
              <CardTitle>Assign teacher</CardTitle>
              <CardDescription>
                Creates an active teaching assignment for the selected class.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Subject teacher</span>
                <Select
                  value={assignTeacherId || undefined}
                  onValueChange={(v) => setAssignTeacherId(v ?? "")}
                >
                  <SelectTrigger className="h-10 w-[240px]">
                    <SelectValue placeholder="Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {subjectTeachers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Subject</span>
                <Select
                  value={assignSubjectId || undefined}
                  onValueChange={(v) => setAssignSubjectId(v ?? "")}
                >
                  <SelectTrigger className="h-10 w-[200px]">
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
                  value={assignTermId || undefined}
                  onValueChange={(v) => setAssignTermId(v ?? "")}
                >
                  <SelectTrigger className="h-10 w-[200px]">
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
                }}
              >
                Assign
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active assignments</CardTitle>
              <CardDescription>
                Unassign marks the row inactive (API unassign).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Rows reflect current filters</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coverage.data.assignments.map((row) => (
                    <TableRow key={row.id}>
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
              {coverage.data.assignments.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No active assignments in this view.</p>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : classId ? null : (
        <p className="text-sm text-muted-foreground">Select a class to view coverage and assignments.</p>
      )}
    </div>
  );
}
