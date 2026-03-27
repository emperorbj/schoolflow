"use client";

import { Fragment, useMemo, useState } from "react";
import { useClassesQuery, useSubjectsQuery, useTermsQuery } from "@/features/admin/hooks";
import {
  useAggregateClassResultsMutation,
  useBulkReportCardsQuery,
  useClassResultsStatusQuery,
  useClassResultStudentsQuery,
  useDownloadReportCardPdfMutation,
  usePatchCommentsMutation,
  useSubjectPositionsQuery,
} from "@/features/class-results/hooks";
import { useCurrentUserQuery } from "@/features/auth/hooks";
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
import { Eye } from "lucide-react";
import type { BulkReportCardsResponse } from "@/types/class-results";

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

export default function ClassResultsPage() {
  const me = useCurrentUserQuery();
  const classes = useClassesQuery();
  const terms = useTermsQuery();
  const subjects = useSubjectsQuery();

  const [classId, setClassId] = useState("");
  const [termId, setTermId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [reportStudentId, setReportStudentId] = useState<string | null>(null);

  const status = useClassResultsStatusQuery(classId, termId);
  const students = useClassResultStudentsQuery(classId, termId);
  const reportCards = useBulkReportCardsQuery(classId, termId);
  const effectiveSubjectId = selectedSubjectId || status.data?.subjects?.[0]?.subjectId || "";
  const subjectPositions = useSubjectPositionsQuery(classId, termId, effectiveSubjectId || undefined);
  const aggregate = useAggregateClassResultsMutation();
  const patchComments = usePatchCommentsMutation();
  const downloadPdf = useDownloadReportCardPdfMutation();
  const reportSubjectsMeta = useMemo(() => {
    const fromApi = reportCards.data?.subjectsMeta ?? [];
    const byId = new Map(
      fromApi.map((subject) => [
        subject.subjectId,
        {
          subjectId: subject.subjectId,
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
        },
      ]),
    );

    // Fallback/augmentation: ensure all subjects present in student rows are shown.
    for (const student of reportCards.data?.students ?? []) {
      for (const subject of student.subjects ?? []) {
        if (!byId.has(subject.subjectId)) {
          byId.set(subject.subjectId, {
            subjectId: subject.subjectId,
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
          });
        }
      }
    }
    return Array.from(byId.values());
  }, [reportCards.data?.subjectsMeta, reportCards.data?.students]);
  const selectedReportStudent = useMemo(
    () =>
      reportStudentId
        ? (reportCards.data?.students ?? []).find((s) => s.studentId === reportStudentId) ?? null
        : null,
    [reportCards.data?.students, reportStudentId],
  );

  const subjectMap = useMemo(
    () =>
      new Map((subjects.data?.subjects ?? []).map((s) => [s._id, `${s.name} (${s.code})`])),
    [subjects.data?.subjects],
  );

  const topError =
    classes.error ??
    terms.error ??
    subjects.error ??
    status.error ??
    students.error ??
    reportCards.error ??
    subjectPositions.error ??
    aggregate.error ??
    patchComments.error ??
    downloadPdf.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Class results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track subject submission status, compute aggregate, and manage comments.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{errorText(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Selection</CardTitle>
          <CardDescription>Choose class and term.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <Select value={classId || undefined} onValueChange={setClassId}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(classes.data?.classes ?? []).map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} {c.arm}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={termId || undefined} onValueChange={setTermId}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(terms.data?.terms ?? []).map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name} (Order {t.order})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            disabled={aggregate.isPending || !classId || !termId}
            onClick={async () => {
              await aggregate.mutateAsync({ classId, termId });
            }}
          >
            Recompute aggregate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject submission status</CardTitle>
          <CardDescription>Submitted subjects are fully locked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {status.isLoading ? <p className="text-sm text-muted-foreground">Loading status...</p> : null}
          {(status.data?.subjects ?? []).map((row) => (
            <div key={row.subjectId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <p>{subjectMap.get(row.subjectId) ?? row.subjectId}</p>
              <p className="text-muted-foreground">
                {row.lockedRows}/{row.totalRows} {row.submitted ? "submitted" : "pending"}
              </p>
            </div>
          ))}
          {status.data && !status.data.subjects.length ? (
            <p className="text-sm text-muted-foreground">No subject status found.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject positions</CardTitle>
          <CardDescription>Ranked positions for a single subject in this class and term.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select value={effectiveSubjectId || undefined} onValueChange={setSelectedSubjectId}>
            <SelectTrigger className="h-10 w-full md:w-[320px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(status.data?.subjects ?? []).map((row) => (
                  <SelectItem key={row.subjectId} value={row.subjectId}>
                    {subjectMap.get(row.subjectId) ?? row.subjectId}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {subjectPositions.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading subject positions...</p>
          ) : null}
          {(subjectPositions.data?.rankings ?? []).map((row) => (
            <div key={row.studentId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <p>
                {row.lastName} {row.firstName} ({row.admissionNumber})
              </p>
              <p className="text-muted-foreground">
                Pos {row.position} • {row.totalPercent}% • {row.grade ?? "-"}
              </p>
            </div>
          ))}
          {subjectPositions.data && !subjectPositions.data.rankings.length ? (
            <p className="text-sm text-muted-foreground">No rankings found for this subject.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students aggregate</CardTitle>
          <CardDescription>Per-student summary with comment editors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {students.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading student results...</p>
          ) : null}
          {(students.data?.students ?? []).map((row) => (
            <StudentAggregateRow
              key={row.studentId}
              studentId={row.studentId}
              name={`${row.lastName} ${row.firstName}`}
              admissionNumber={row.admissionNumber}
              totalScore={row.totalScore}
              average={row.average}
              position={row.position}
              passedSubjects={row.passedSubjects}
              subjectCount={row.subjectCount}
              classTeacherComment={row.classTeacherComment}
              headteacherComment={row.headteacherComment}
              canEditClassTeacher={me.data?.role === "CLASS_TEACHER"}
              canEditHeadteacher={me.data?.role === "HEADTEACHER"}
              onSave={async (payload) => {
                if (!classId || !termId) return;
                await patchComments.mutateAsync({
                  classId,
                  termId,
                  payload: { comments: [payload] },
                });
              }}
            />
          ))}
          {students.data && !students.data.students.length ? (
            <p className="text-sm text-muted-foreground">
              No aggregate data found. Run aggregate first.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All report cards (class table)</CardTitle>
          <CardDescription>
            Full class view with per-subject tests, exam, total, grade, and subject position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportCards.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading full report-card table...</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            All subjects are shown in one table. Scroll horizontally to view every subject column.
          </p>
          {reportCards.data ? (
            reportCards.data.students.length > 0 ? (
              <div className="overflow-x-auto overflow-y-hidden rounded-lg border">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead rowSpan={2} className="sticky left-0 z-20 bg-background whitespace-nowrap">Student</TableHead>
                      <TableHead rowSpan={2} className="sticky left-[220px] z-20 bg-background whitespace-nowrap">Admission</TableHead>
                      <TableHead rowSpan={2} className="whitespace-nowrap">Gender</TableHead>
                      <TableHead rowSpan={2} className="whitespace-nowrap">Overall Pos</TableHead>
                      <TableHead rowSpan={2} className="whitespace-nowrap">Action</TableHead>
                      {reportSubjectsMeta.map((subject) => (
                        <TableHead key={subject.subjectId} colSpan={6} className="text-center whitespace-nowrap">
                          {subject.subjectCode} • {subject.subjectName}
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow>
                      {reportSubjectsMeta.map((subject) => (
                        <Fragment key={`${subject.subjectId}-cols`}>
                          <TableHead className="whitespace-nowrap">T1</TableHead>
                          <TableHead className="whitespace-nowrap">T2</TableHead>
                          <TableHead className="whitespace-nowrap">Exam</TableHead>
                          <TableHead className="whitespace-nowrap">Total</TableHead>
                          <TableHead className="whitespace-nowrap">Grade</TableHead>
                          <TableHead className="whitespace-nowrap">Pos</TableHead>
                        </Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCards.data.students.map((studentRow) => {
                      const bySubject = new Map(
                        studentRow.subjects.map((subjectRow) => [subjectRow.subjectId, subjectRow]),
                      );
                      return (
                        <TableRow key={studentRow.studentId}>
                          <TableCell className="sticky left-0 z-10 min-w-[220px] bg-background font-medium whitespace-nowrap">
                            {studentRow.lastName} {studentRow.firstName}
                          </TableCell>
                          <TableCell className="sticky left-[220px] z-10 min-w-[120px] bg-background whitespace-nowrap">
                            {studentRow.admissionNumber}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{studentRow.gender ?? "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">{studentRow.aggregate.overallPosition}</TableCell>
                          <TableCell>
                            <Button
                              size="icon-sm"
                              variant="outline"
                              title="Open report card"
                              onClick={() => setReportStudentId(studentRow.studentId)}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TableCell>
                          {reportSubjectsMeta.map((subject) => {
                            const row = bySubject.get(subject.subjectId);
                            return (
                              <Fragment key={subject.subjectId}>
                                <TableCell>{row ? row.test1 : "-"}</TableCell>
                                <TableCell>{row ? row.test2 : "-"}</TableCell>
                                <TableCell>{row ? row.exam : "-"}</TableCell>
                                <TableCell>{row ? row.totalPercent : "-"}</TableCell>
                                <TableCell>{row ? (row.grade ?? "-") : "-"}</TableCell>
                                <TableCell>{row ? row.subjectPosition : "-"}</TableCell>
                              </Fragment>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No report-card rows found. Run aggregate first, then reload this class/term.
              </p>
            )
          ) : null}
        </CardContent>
      </Card>

      <ReportCardDialog
        open={Boolean(reportStudentId)}
        onOpenChange={(open) => {
          if (!open) setReportStudentId(null);
        }}
        row={selectedReportStudent}
        subjectsMeta={reportSubjectsMeta}
        onDownload={async () => {
          if (!classId || !termId || !selectedReportStudent) return;
          await downloadPdf.mutateAsync({
            classId,
            termId,
            studentId: selectedReportStudent.studentId,
          });
        }}
        downloadPending={downloadPdf.isPending}
      />
    </div>
  );
}

function StudentAggregateRow({
  studentId,
  name,
  admissionNumber,
  totalScore,
  average,
  position,
  passedSubjects,
  subjectCount,
  classTeacherComment,
  headteacherComment,
  canEditClassTeacher,
  canEditHeadteacher,
  onSave,
}: {
  studentId: string;
  name: string;
  admissionNumber: string;
  totalScore: number;
  average: number;
  position: number;
  passedSubjects: number;
  subjectCount: number;
  classTeacherComment: string;
  headteacherComment: string;
  canEditClassTeacher: boolean;
  canEditHeadteacher: boolean;
  onSave: (payload: {
    studentId: string;
    classTeacherComment?: string;
    headteacherComment?: string;
  }) => Promise<unknown>;
}) {
  const [classComment, setClassComment] = useState(classTeacherComment);
  const [headComment, setHeadComment] = useState(headteacherComment);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{admissionNumber}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Pos {position} - Avg {average} - {passedSubjects}/{subjectCount} passed - Total {totalScore}
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Input
          value={classComment}
          disabled={!canEditClassTeacher}
          placeholder="Class teacher comment"
          onChange={(e) => setClassComment(e.target.value)}
        />
        <Input
          value={headComment}
          disabled={!canEditHeadteacher}
          placeholder="Headteacher comment"
          onChange={(e) => setHeadComment(e.target.value)}
        />
      </div>

      {(canEditClassTeacher || canEditHeadteacher) ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            await onSave({
              studentId,
              classTeacherComment: canEditClassTeacher ? classComment : undefined,
              headteacherComment: canEditHeadteacher ? headComment : undefined,
            });
            setPending(false);
          }}
        >
          Save comment
        </Button>
      ) : null}
    </div>
  );
}

function ReportCardDialog({
  open,
  onOpenChange,
  row,
  subjectsMeta,
  onDownload,
  downloadPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: BulkReportCardsResponse["students"][number] | null;
  subjectsMeta: BulkReportCardsResponse["subjectsMeta"];
  onDownload: () => Promise<void>;
  downloadPending: boolean;
}) {
  const bySubject = useMemo(
    () => new Map((row?.subjects ?? []).map((subjectRow) => [subjectRow.subjectId, subjectRow])),
    [row?.subjects],
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[88vh] overflow-hidden sm:max-w-6xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Report card details</AlertDialogTitle>
          <AlertDialogDescription>
            {row
              ? `${row.lastName} ${row.firstName} (${row.admissionNumber})`
              : "Student report card details"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {row ? (
          <div className="space-y-3 overflow-auto pr-1 text-sm">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-indigo-100 bg-white px-3 py-2">
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-base font-semibold">{row.aggregate.average}</p>
                </div>
                <div className="rounded-lg border border-indigo-100 bg-white px-3 py-2">
                  <p className="text-xs text-muted-foreground">Overall position</p>
                  <p className="text-base font-semibold">{row.aggregate.overallPosition}</p>
                </div>
                <div className="rounded-lg border border-indigo-100 bg-white px-3 py-2">
                  <p className="text-xs text-muted-foreground">Passed subjects</p>
                  <p className="text-base font-semibold">
                    {row.aggregate.passedSubjects}/{row.aggregate.subjectCount}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                  <p className="text-xs font-medium text-emerald-700">Class teacher comment</p>
                  <p className="mt-1 text-sm text-foreground">{row.comments.classTeacherComment || "-"}</p>
                </div>
                <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2">
                  <p className="text-xs font-medium text-sky-700">Headteacher comment</p>
                  <p className="mt-1 text-sm text-foreground">{row.comments.headteacherComment || "-"}</p>
                </div>
              </div>
            </div>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>T1</TableHead>
                    <TableHead>T2</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Pos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectsMeta.map((subject) => {
                    const s = bySubject.get(subject.subjectId);
                    return (
                      <TableRow key={subject.subjectId}>
                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                        <TableCell>{s ? s.test1 : "-"}</TableCell>
                        <TableCell>{s ? s.test2 : "-"}</TableCell>
                        <TableCell>{s ? s.exam : "-"}</TableCell>
                        <TableCell>{s ? s.totalPercent : "-"}</TableCell>
                        <TableCell>{s ? (s.grade ?? "-") : "-"}</TableCell>
                        <TableCell>{s ? s.subjectPosition : "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No report data available.</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction
            disabled={!row || downloadPending}
            onClick={async (event) => {
              event.preventDefault();
              if (!row) return;
              await onDownload();
            }}
          >
            Download PDF
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
