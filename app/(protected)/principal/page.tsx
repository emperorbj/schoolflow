"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useClassesQuery, useTermsQuery } from "@/features/admin/hooks";
import {
  useApprovePromotionsMutation,
  useLockTermMutation,
  usePrincipalClassStudentsQuery,
  usePrincipalOverviewQuery,
  usePromotionsPreviewQuery,
} from "@/features/leadership/hooks";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
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

export default function PrincipalPage() {
  return (
    <RequireRouteAccess route="/principal">
      <PrincipalPageContent />
    </RequireRouteAccess>
  );
}

function PrincipalPageContent() {
  const terms = useTermsQuery();
  const classes = useClassesQuery();
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");

  const overview = usePrincipalOverviewQuery(termId);
  const classStudents = usePrincipalClassStudentsQuery(classId, termId);
  const preview = usePromotionsPreviewQuery(termId);
  const approve = useApprovePromotionsMutation();
  const lockTerm = useLockTermMutation();

  const chartData = useMemo(() => {
    const students = classStudents.data?.students ?? [];
    return students
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        label: `${s.position}`,
        average: s.average,
      }));
  }, [classStudents.data?.students]);

  const [reasonByStudent, setReasonByStudent] = useState<Record<string, string>>({});
  const topError =
    terms.error ??
    classes.error ??
    overview.error ??
    classStudents.error ??
    preview.error ??
    approve.error ??
    lockTerm.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Principal analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          KPI oversight, promotions approval, and term lock.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{errorText(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Term and class</CardTitle>
          <CardDescription>Select context for analytics and actions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
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
          <CardTitle>Class performance curve</CardTitle>
          <CardDescription>Average by class position (selected class).</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              average: { label: "Average", color: "oklch(0.72 0.17 150)" },
            }}
          >
            <AreaChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip />
              <Area
                type="monotone"
                dataKey="average"
                stroke="var(--color-average)"
                fill="var(--color-average)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotion suggestions</CardTitle>
          <CardDescription>Approve suggested decisions for selected term.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(preview.data?.suggestions ?? []).slice(0, 30).map((row) => (
            <div key={row.studentId} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_140px_1fr]">
              <p className="text-sm">
                {row.studentId} - Avg {row.average} ({row.passedSubjects}/{row.subjectCount})
              </p>
              <p className="text-sm font-medium">{row.suggestedDecision}</p>
              <Input
                placeholder="Reason (optional)"
                value={reasonByStudent[row.studentId] ?? ""}
                onChange={(e) =>
                  setReasonByStudent((prev) => ({
                    ...prev,
                    [row.studentId]: e.target.value,
                  }))
                }
              />
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              disabled={approve.isPending || !termId || !(preview.data?.suggestions.length)}
              onClick={async () => {
                if (!termId || !preview.data?.suggestions.length) return;
                await approve.mutateAsync({
                  termId,
                  decisions: preview.data.suggestions.map((s) => ({
                    studentId: s.studentId,
                    decision: s.suggestedDecision,
                    reason: reasonByStudent[s.studentId] || undefined,
                  })),
                });
              }}
            >
              Approve all suggestions
            </Button>

            <Button
              variant="destructive"
              disabled={lockTerm.isPending || !termId}
              onClick={async () => {
                if (!termId) return;
                await lockTerm.mutateAsync(termId);
              }}
            >
              Lock term
            </Button>
          </div>
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
