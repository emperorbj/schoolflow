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

function getError(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

export default function AssessmentsPage() {
  const me = useCurrentUserQuery();
  const role = me.data?.role;

  if (role === "CLASS_TEACHER") {
    return <ClassTeacherAssessments />;
  }

  return <SubjectTeacherAssessments />;
}

function SubjectTeacherAssessments() {
  const contexts = useTeachingContextsQuery();
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
                {(contexts.data?.contexts ?? []).map((ctx) => {
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

          {rows.map((row) => {
            const values = applyValue(row);
            return (
              <div key={row.studentId} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_100px_100px_100px_auto]">
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
                <div className="text-xs text-muted-foreground">
                  <p>Total: {row.totalPercent}</p>
                  <p>Grade: {row.grade ?? "-"}</p>
                  <p>{row.locked ? "Locked" : "Editable"}</p>
                </div>
              </div>
            );
          })}

          {!rows.length && selectedContextId ? (
            <p className="text-sm text-muted-foreground">No students in this class yet.</p>
          ) : null}

          <div className="flex gap-2">
            <Button
              disabled={putScores.isPending || !selection || !rows.length}
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
              Save scores
            </Button>
            <Button
              variant="outline"
              disabled={submitScores.isPending || !selection || !rows.length}
              onClick={async () => {
                if (!selection) return;
                await submitScores.mutateAsync(selection);
              }}
            >
              Submit & lock
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
  const status = useSubmissionStatusQuery(classId && termId ? { classId, termId } : null);

  const subjectMap = new Map((subjects.data?.subjects ?? []).map((s) => [s._id, `${s.name} (${s.code})`]));
  const topError = classes.error ?? terms.error ?? subjects.error ?? status.error;

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
            <div key={row.subjectId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <p>{subjectMap.get(row.subjectId) ?? row.subjectId}</p>
              <p className="text-muted-foreground">
                {row.lockedCount}/{row.total} {row.submitted ? "submitted" : "pending"}
              </p>
            </div>
          ))}
          {status.data && !status.data.subjects.length ? (
            <p className="text-sm text-muted-foreground">No subject results found for this selection.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
