"use client";

import { useState } from "react";
import { useTermsQuery } from "@/features/admin/hooks";
import {
  useHeadteacherClassesQuery,
  useHeadteacherClassStudentsQuery,
  useHeadteacherOverviewQuery,
  useHeadteacherStudentPerformanceQuery,
} from "@/features/leadership/hooks";
import { ApiError } from "@/lib/api/client";
import { SubjectPerformanceBarChartCard } from "@/components/leadership/subject-performance-bar-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireRouteAccess } from "@/components/auth/require-route-access";

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

export default function HeadteacherPage() {
  return (
    <RequireRouteAccess route="/headteacher">
      <HeadteacherPageContent />
    </RequireRouteAccess>
  );
}

function HeadteacherPageContent() {
  const terms = useTermsQuery();
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");

  const overview = useHeadteacherOverviewQuery(termId);
  const classes = useHeadteacherClassesQuery(termId);
  const classStudents = useHeadteacherClassStudentsQuery(classId, termId);
  const studentPerformance = useHeadteacherStudentPerformanceQuery(studentId, termId || undefined);

  const topError =
    terms.error ??
    overview.error ??
    classes.error ??
    classStudents.error ??
    studentPerformance.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Headteacher overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Class-level monitoring and student performance drill-down.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{errorText(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Term</CardTitle>
          <CardDescription>Choose a term to load metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={termId || undefined}
            onValueChange={(value) => {
              setTermId(value);
              setClassId("");
              setStudentId("");
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select term" />
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
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Classes" value={overview.data?.classes ?? 0} />
        <StatCard title="Students" value={overview.data?.students ?? 0} />
        <StatCard title="Average" value={overview.data?.avgPerformance ?? 0} />
        <StatCard title="Pass Rate %" value={overview.data?.passRatePercent ?? 0} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Class focus</CardTitle>
          <CardDescription>
            Choose a class to load subject averages and the student list (requires term above).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={classId || undefined}
            onValueChange={(value) => {
              setClassId(value);
              setStudentId("");
            }}
            disabled={!termId}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder={termId ? "Select class" : "Select a term first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(classes.data?.classes ?? []).map((row) => (
                  <SelectItem key={row.classId} value={row.classId}>
                    {row.name} {row.arm}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <SubjectPerformanceBarChartCard
        classId={classId || null}
        termId={termId || null}
        emptyDescription="Select a term and class to see mean score (%) per subject from aggregated results."
      />

      <Card>
        <CardHeader>
          <CardTitle>Students in class</CardTitle>
          <CardDescription>Ranking and drill-down for the class selected above.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!classId ? (
            <p className="text-sm text-muted-foreground">Select a class to list students.</p>
          ) : null}
          {(classStudents.data?.students ?? []).map((s) => (
            <button
              key={s.studentId}
              type="button"
              className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm hover:bg-muted/40"
              onClick={() => setStudentId(s.studentId)}
            >
              <span>
                {s.lastName} {s.firstName} ({s.admissionNumber})
              </span>
              <span className="text-muted-foreground">
                Pos {s.position} / Avg {s.average}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student subject history</CardTitle>
          <CardDescription>Selected student subject-by-subject results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(studentPerformance.data?.performance ?? []).map((p, index) => (
            <div key={`${p.subjectId}-${index}`} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>{p.subjectName || p.subjectId}</span>
              <span className="text-muted-foreground">
                {p.totalPercent}% - {p.grade}
              </span>
            </div>
          ))}
          {studentId && studentPerformance.data && !studentPerformance.data.performance.length ? (
            <p className="text-sm text-muted-foreground">No performance records found.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
