"use client";

import { useMemo, useState } from "react";
import { useSubjectsQuery, useTermsQuery } from "@/features/admin/hooks";
import {
  usePutScoreSheetMutation,
  useScoreSheetQuery,
  useSubmissionStatusQuery,
  useSubmitScoresMutation,
  useTeachingContextsQuery,
} from "@/features/assessments/hooks";
import { useCurrentUserQuery } from "@/features/auth/hooks";
import { useClassesQuery } from "@/features/admin/hooks";
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
import type { ScoreSheetRow } from "@/types/assessments";
import { RequireRouteAccess } from "@/components/auth/require-route-access";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ListChecks,
  Lock,
  Medal,
  Percent,
  Save,
  ScrollText,
  UserRound,
} from "lucide-react";

function getError(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

/** Tailwind classes for pill-style grade badges (letter grades + pass/fail). */
function gradeBadgeClass(grade: string | null | undefined): string {
  if (grade == null || String(grade).trim() === "") {
    return "border border-slate-200 bg-slate-100 text-slate-600";
  }
  const g = String(grade).trim().toUpperCase();
  const first = g[0];
  if (g.includes("PASS") && !g.includes("FAIL")) {
    return "border border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (g.includes("FAIL")) {
    return "border border-rose-200 bg-rose-50 text-rose-800";
  }
  if (first === "A") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (first === "B") {
    return "border border-sky-200 bg-sky-50 text-sky-800";
  }
  if (first === "C") {
    return "border border-amber-200 bg-amber-50 text-amber-900";
  }
  if (first === "D") {
    return "border border-orange-200 bg-orange-50 text-orange-900";
  }
  if (first === "E" || first === "F") {
    return "border border-rose-200 bg-rose-50 text-rose-800";
  }
  return "border border-violet-200 bg-violet-50 text-violet-900";
}

function GradeBadge({ grade }: { grade: string | null }) {
  const hasGrade = Boolean(grade?.trim());
  const label = hasGrade ? String(grade).trim() : "—";
  return (
    <span
      className={cn(
        "inline-flex min-w-[2.25rem] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        gradeBadgeClass(hasGrade ? grade : null),
      )}
    >
      {label}
    </span>
  );
}

const SCORE_ROW_GRID =
  "gap-2 rounded-lg border p-3 md:grid md:grid-cols-[1fr_100px_100px_100px_auto]";

function ScoreSheetColumnHeader() {
  return (
    <div
      className={cn(
        "mb-1 hidden items-center gap-2 rounded-md border border-indigo-100/80 bg-indigo-50/50 px-3 py-2 text-indigo-800/90 md:grid md:grid-cols-[1fr_100px_100px_100px_auto]",
      )}
    >
      <div className="flex items-center gap-1.5" title="Student">
        <UserRound className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">Student</span>
      </div>
      <div className="flex justify-center" title="Test 1 (max 15)">
        <ListChecks className="size-4" aria-hidden />
        <span className="sr-only">Test 1, maximum 15 points</span>
      </div>
      <div className="flex justify-center" title="Test 2 (max 15)">
        <ClipboardCheck className="size-4" aria-hidden />
        <span className="sr-only">Test 2, maximum 15 points</span>
      </div>
      <div className="flex justify-center" title="Exam (max 70)">
        <ScrollText className="size-4" aria-hidden />
        <span className="sr-only">Exam, maximum 70 points</span>
      </div>
      <div className="flex items-center justify-center gap-3 px-1" title="Total % and grade">
        <Percent className="size-4 shrink-0" aria-hidden />
        <Medal className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">Total percent and grade</span>
      </div>
    </div>
  );
}

function ScoreRowSummary({ totalPercent, grade }: { totalPercent: number; grade: string | null }) {
  return (
    <div className="flex flex-col justify-center gap-2 text-xs">
      <div
        className="flex items-center gap-1.5 text-muted-foreground"
        title={`Total: ${totalPercent}%`}
      >
        <Percent className="size-3.5 shrink-0" aria-hidden />
        <span className="tabular-nums font-semibold text-foreground">{totalPercent}</span>
      </div>
      <div className="flex items-center gap-1.5" title="Grade">
        <Medal className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <GradeBadge grade={grade} />
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <RequireRouteAccess route="/assessments">
      <AssessmentsPageContent />
    </RequireRouteAccess>
  );
}

function AssessmentsPageContent() {
  const me = useCurrentUserQuery();
  const role = me.data?.role;

  if (role === "CLASS_TEACHER") {
    return <ClassTeacherAssessments />;
  }

  return <SubjectTeacherAssessments />;
}

function SubjectTeacherAssessments() {
  const contexts = useTeachingContextsQuery();
  const contextRows = contexts.data?.contexts ?? [];
  const [selectedContextId, setSelectedContextId] = useState("");
  const selectedContext = useMemo(
    () => (contexts.data?.contexts ?? []).find((ctx) => ctx._id === selectedContextId),
    [contexts.data?.contexts, selectedContextId],
  );

  const selection = selectedContext
    ? {
        classId:
          typeof selectedContext.classId === "string"
            ? selectedContext.classId
            : selectedContext.classId._id,
        subjectId:
          typeof selectedContext.subjectId === "string"
            ? selectedContext.subjectId
            : selectedContext.subjectId._id,
        termId:
          typeof selectedContext.termId === "string"
            ? selectedContext.termId
            : selectedContext.termId._id,
      }
    : null;

  const scoreSheet = useScoreSheetQuery(selection, true);
  const putScores = usePutScoreSheetMutation();
  const submitScores = useSubmitScoresMutation();

  const [editedRows, setEditedRows] = useState<Record<string, Pick<ScoreSheetRow, "test1" | "test2" | "exam">>>({});
  const rows = scoreSheet.data?.rows ?? [];

  const applyValue = (row: ScoreSheetRow) => editedRows[row.studentId] ?? {
    test1: row.test1,
    test2: row.test2,
    exam: row.exam,
  };

  const topError = contexts.error ?? scoreSheet.error ?? putScores.error ?? submitScores.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Assessments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Load teaching context, edit scores, save in bulk, and submit final subject results.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{getError(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Teaching context</CardTitle>
          <CardDescription>Select class-subject-term assignment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedContextId || undefined}
            onValueChange={(value) => {
              setSelectedContextId(value);
              setEditedRows({});
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select context" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {contextRows.map((ctx) => {
              const classLabel =
                typeof ctx.classId === "string" ? ctx.classId : `${ctx.classId.name} ${ctx.classId.arm}`;
              const subjectLabel =
                typeof ctx.subjectId === "string" ? ctx.subjectId : `${ctx.subjectId.name} (${ctx.subjectId.code})`;
              const termLabel =
                typeof ctx.termId === "string" ? ctx.termId : `${ctx.termId.name} (Order ${ctx.termId.order})`;

              return (
                <SelectItem key={ctx._id} value={ctx._id}>
                  {classLabel} - {subjectLabel} - {termLabel}
                </SelectItem>
              );
            })}
              </SelectGroup>
            </SelectContent>
          </Select>
          {contexts.data && contextRows.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No active teaching assignment for this term/class.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score sheet</CardTitle>
          <CardDescription>Max scores: Test1 15, Test2 15, Exam 70.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {scoreSheet.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading score sheet...</p>
          ) : null}

          {rows.length > 0 ? <ScoreSheetColumnHeader /> : null}

          {rows.map((row) => {
            const values = applyValue(row);
            return (
              <div key={row.studentId} className={`grid ${SCORE_ROW_GRID}`}>
                <div>
                  <p className="text-sm font-medium">
                    {row.lastName} {row.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.admissionNumber}</p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={15}
                  value={values.test1}
                  disabled={row.locked}
                  onChange={(e) =>
                    setEditedRows((prev) => ({
                      ...prev,
                      [row.studentId]: {
                        ...applyValue(row),
                        test1: Number(e.target.value || 0),
                      },
                    }))
                  }
                />
                <Input
                  type="number"
                  min={0}
                  max={15}
                  value={values.test2}
                  disabled={row.locked}
                  onChange={(e) =>
                    setEditedRows((prev) => ({
                      ...prev,
                      [row.studentId]: {
                        ...applyValue(row),
                        test2: Number(e.target.value || 0),
                      },
                    }))
                  }
                />
                <Input
                  type="number"
                  min={0}
                  max={70}
                  value={values.exam}
                  disabled={row.locked}
                  onChange={(e) =>
                    setEditedRows((prev) => ({
                      ...prev,
                      [row.studentId]: {
                        ...applyValue(row),
                        exam: Number(e.target.value || 0),
                      },
                    }))
                  }
                />
                <ScoreRowSummary totalPercent={row.totalPercent} grade={row.grade} />
              </div>
            );
          })}

          {!rows.length && selectedContextId ? (
            <p className="text-sm text-muted-foreground">No students in this class yet.</p>
          ) : null}

          <div className="flex gap-2">
            <Button
              disabled={putScores.isPending || !selection || !rows.length}
              className="gap-2"
              title="Save all score changes"
              onClick={async () => {
                if (!selection) return;
                await putScores.mutateAsync({
                  ...selection,
                  rows: rows.map((row) => ({
                    studentId: row.studentId,
                    test1: applyValue(row).test1,
                    test2: applyValue(row).test2,
                    exam: applyValue(row).exam,
                  })),
                });
                setEditedRows({});
              }}
            >
              <Save className="size-4 shrink-0" aria-hidden />
              <span className="sr-only">Save scores</span>
            </Button>
            <Button
              variant="outline"
              disabled={submitScores.isPending || !selection || !rows.length}
              className="gap-2 border-indigo-200"
              title="Submit and lock this subject for the term"
              onClick={async () => {
                if (!selection) return;
                await submitScores.mutateAsync(selection);
                setSelectedContextId("");
              }}
            >
              <Lock className="size-4 shrink-0" aria-hidden />
              <span className="sr-only">Submit and lock</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClassTeacherAssessments() {
  const classes = useClassesQuery();
  const terms = useTermsQuery();
  const subjects = useSubjectsQuery();
  const [classId, setClassId] = useState("");
  const [termId, setTermId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const status = useSubmissionStatusQuery(classId && termId ? { classId, termId } : null);

  const subjectMap = new Map((subjects.data?.subjects ?? []).map((s) => [s._id, `${s.name} (${s.code})`]));
  const topError = classes.error ?? terms.error ?? subjects.error ?? status.error;

  const firstSubjectId = status.data?.subjects?.[0]?.subjectId ?? "";
  const effectiveSubjectId = selectedSubjectId || firstSubjectId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Submission status</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Class teacher view of per-subject submission completeness.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{getError(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select class and term.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Select value={classId || undefined} onValueChange={setClassId}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(classes.data?.classes ?? []).map((row) => (
                  <SelectItem key={row._id} value={row._id}>
                    {row.name} {row.arm}
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
                {(terms.data?.terms ?? []).map((row) => (
                  <SelectItem key={row._id} value={row._id}>
                    {row.name} (Order {row.order})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>Locked rows indicate submitted subject results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {status.isLoading ? <p className="text-sm text-muted-foreground">Loading status...</p> : null}
          {(status.data?.subjects ?? []).map((row) => (
            <button
              key={row.subjectId}
              type="button"
              onClick={() => setSelectedSubjectId(row.subjectId)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition ${
                row.subjectId === effectiveSubjectId
                  ? "border-indigo-200 bg-indigo-50/60"
                  : "border-indigo-100 hover:bg-indigo-50/40"
              }`}
            >
              <p className="font-medium">{subjectMap.get(row.subjectId) ?? row.subjectId}</p>
              <div
                className="flex items-center gap-2 text-muted-foreground"
                title={`${row.lockedCount} of ${row.total} locked — ${row.submitted ? "Submitted" : "Pending"}`}
              >
                <span className="text-xs tabular-nums">
                  {row.lockedCount}/{row.total}
                </span>
                {row.submitted ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Clock className="size-4 shrink-0 text-amber-600" aria-hidden />
                )}
                <span className="sr-only">
                  {row.submitted ? "Submitted" : "Pending"}
                </span>
              </div>
            </button>
          ))}
          {status.data && !status.data.subjects.length ? (
            <p className="text-sm text-muted-foreground">No subject results found for this selection.</p>
          ) : null}
        </CardContent>
      </Card>

      {classId && termId && effectiveSubjectId ? (
        <ScoreSheetEditor
          key={`${classId}-${effectiveSubjectId}-${termId}`}
          classId={classId}
          subjectId={effectiveSubjectId}
          termId={termId}
          onAfterSubmitLock={() => setSelectedSubjectId("")}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Score sheet</CardTitle>
            <CardDescription>Select a subject to record scores.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function ScoreSheetEditor({
  classId,
  subjectId,
  termId,
  onAfterSubmitLock,
}: {
  classId: string;
  subjectId: string;
  termId: string;
  /** Called after subject results are submitted and locked (e.g. clear subject picker). */
  onAfterSubmitLock?: () => void;
}) {
  const scoreSheet = useScoreSheetQuery({ classId, subjectId, termId }, true);
  const putScores = usePutScoreSheetMutation();
  const submitScores = useSubmitScoresMutation();

  const [editedRows, setEditedRows] = useState<Record<string, Pick<ScoreSheetRow, "test1" | "test2" | "exam">>>({});
  const rows = scoreSheet.data?.rows ?? [];

  const applyValue = (row: ScoreSheetRow) =>
    editedRows[row.studentId] ?? {
      test1: row.test1,
      test2: row.test2,
      exam: row.exam,
    };

  const topError = scoreSheet.error ?? putScores.error ?? submitScores.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score sheet</CardTitle>
        <CardDescription>Bulk update scores for the selected class/subject/term.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topError ? <p className="text-sm text-destructive">{getError(topError)}</p> : null}

        {scoreSheet.isLoading ? <p className="text-sm text-muted-foreground">Loading score sheet...</p> : null}

        {rows.length > 0 ? <ScoreSheetColumnHeader /> : null}

        {rows.map((row) => {
          const values = applyValue(row);
          return (
            <div key={row.studentId} className={`grid ${SCORE_ROW_GRID}`}>
              <div>
                <p className="text-sm font-medium">
                  {row.lastName} {row.firstName}
                </p>
                <p className="text-xs text-muted-foreground">{row.admissionNumber}</p>
              </div>
              <Input
                type="number"
                min={0}
                max={15}
                value={values.test1}
                disabled={row.locked}
                onChange={(e) =>
                  setEditedRows((prev) => ({
                    ...prev,
                    [row.studentId]: {
                      ...applyValue(row),
                      test1: Number(e.target.value || 0),
                    },
                  }))
                }
              />
              <Input
                type="number"
                min={0}
                max={15}
                value={values.test2}
                disabled={row.locked}
                onChange={(e) =>
                  setEditedRows((prev) => ({
                    ...prev,
                    [row.studentId]: {
                      ...applyValue(row),
                      test2: Number(e.target.value || 0),
                    },
                  }))
                }
              />
              <Input
                type="number"
                min={0}
                max={70}
                value={values.exam}
                disabled={row.locked}
                onChange={(e) =>
                  setEditedRows((prev) => ({
                    ...prev,
                    [row.studentId]: {
                      ...applyValue(row),
                      exam: Number(e.target.value || 0),
                    },
                  }))
                }
              />
              <ScoreRowSummary totalPercent={row.totalPercent} grade={row.grade} />
            </div>
          );
        })}

        {!rows.length && <p className="text-sm text-muted-foreground">No students found for this selection.</p>}

        <div className="flex gap-2">
          <Button
            disabled={putScores.isPending || !rows.length}
            className="gap-2"
            title="Save all score changes"
            onClick={async () => {
              await putScores.mutateAsync({
                classId,
                subjectId,
                termId,
                rows: rows.map((row) => ({
                  studentId: row.studentId,
                  test1: applyValue(row).test1,
                  test2: applyValue(row).test2,
                  exam: applyValue(row).exam,
                })),
              });
              setEditedRows({});
            }}
          >
            <Save className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">Save scores</span>
          </Button>
          <Button
            variant="outline"
            disabled={submitScores.isPending || !rows.length}
            className="gap-2 border-indigo-200"
            title="Submit and lock this subject for the term"
            onClick={async () => {
              await submitScores.mutateAsync({
                classId,
                subjectId,
                termId,
              });
              onAfterSubmitLock?.();
            }}
          >
            <Lock className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">Submit and lock</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
