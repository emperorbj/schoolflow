"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTermsQuery } from "@/features/admin/hooks";
import {
  useHeadteacherClassesQuery,
  useHeadteacherClassStudentsQuery,
  useHeadteacherOverviewQuery,
  useHeadteacherStudentPerformanceQuery,
} from "@/features/leadership/hooks";
import { ApiError } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

export default function HeadteacherPage() {
  const terms = useTermsQuery();
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");

  const overview = useHeadteacherOverviewQuery(termId);
  const classes = useHeadteacherClassesQuery(termId);
  const classStudents = useHeadteacherClassStudentsQuery(classId, termId);
  const studentPerformance = useHeadteacherStudentPerformanceQuery(studentId, termId || undefined);

  const chartData = useMemo(
    () =>
      (classes.data?.classes ?? []).map((row) => ({
        classLabel: `${row.name}${row.arm}`,
        avgPerformance: row.avgPerformance,
      })),
    [classes.data?.classes],
  );

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
          <CardTitle>Class averages</CardTitle>
          <CardDescription>Term performance comparison by class.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              avgPerformance: { label: "Average", color: "oklch(0.6 0.13 250)" },
            }}
          >
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="classLabel" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip />
              <Bar dataKey="avgPerformance" fill="var(--color-avgPerformance)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class students</CardTitle>
          <CardDescription>Select class to view ranking and comments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={classId || undefined}
            onValueChange={(value) => {
              setClassId(value);
              setStudentId("");
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select class" />
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
