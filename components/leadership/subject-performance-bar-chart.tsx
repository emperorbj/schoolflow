"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useBulkReportCardsQuery } from "@/features/class-results/hooks";
import { ApiError } from "@/lib/api/client";
import type { SubjectMeanChartRow } from "@/lib/class-results/subject-means";
import { subjectMeansFromBulkReportCards } from "@/lib/class-results/subject-means";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

function notReadyMessage(error: unknown) {
  const m = errorMessage(error).toLowerCase();
  if (error instanceof ApiError && error.status === 404) return true;
  return m.includes("aggregate") || m.includes("not found");
}

/** oklch fills for mean % bands (0–100 scale). */
export function barColorForMeanPercent(mean: number): string {
  if (mean >= 70) return "oklch(0.65 0.17 150)";
  if (mean >= 55) return "oklch(0.78 0.14 85)";
  if (mean >= 40) return "oklch(0.75 0.14 55)";
  return "oklch(0.62 0.18 25)";
}

const LEGEND_ITEMS = [
  { label: "Strong (≥70%)", color: barColorForMeanPercent(75) },
  { label: "Moderate (55–69%)", color: barColorForMeanPercent(62) },
  { label: "Low (40–54%)", color: barColorForMeanPercent(47) },
  { label: "Critical (<40%)", color: barColorForMeanPercent(30) },
] as const;

type SubjectPerformanceBarChartCardProps = {
  classId: string | null;
  termId: string | null;
  /** Shown in the empty state when class or term is missing. */
  emptyDescription?: string;
};

export function SubjectPerformanceBarChartCard({
  classId,
  termId,
  emptyDescription = "Select a class and term to see mean score (%) per subject from aggregated results.",
}: SubjectPerformanceBarChartCardProps) {
  const enabled = Boolean(classId && termId);
  const report = useBulkReportCardsQuery(classId ?? undefined, termId ?? undefined);

  const chartData = useMemo(() => subjectMeansFromBulkReportCards(report.data), [report.data]);

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject averages</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject averages</CardTitle>
        <CardDescription>
          Mean total percent per subject for students with a score in this class and term (from report
          cards). Bar colors reflect performance bands.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {report.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading subject averages…</p>
        ) : null}
        {report.error ? (
          <p className="text-sm text-destructive">
            {notReadyMessage(report.error)
              ? "Results are not ready for this class and term. Run class aggregation first, then open again."
              : errorMessage(report.error)}
          </p>
        ) : null}
        {!report.isLoading && !report.error && chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subject scores in report cards for this class and term yet.
          </p>
        ) : null}
        {chartData.length > 0 ? (
          <>
            <ChartContainer
              config={{
                meanPercent: { label: "Class mean %", color: barColorForMeanPercent(60) },
              }}
              className="aspect-auto h-[320px] w-full md:h-[360px]"
            >
              <BarChart data={chartData} margin={{ bottom: 52, left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tickCount={6} width={36} />
                <ChartTooltip
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as SubjectMeanChartRow | undefined;
                    return row?.fullName ?? "";
                  }}
                  formatter={(value: number | string) => [`${value}%`, "Class mean"]}
                />
                <Bar
                  dataKey="meanPercent"
                  maxBarSize={28}
                  radius={[5, 5, 0, 0]}
                >
                  {chartData.map((row) => (
                    <Cell key={row.subjectId} fill={barColorForMeanPercent(row.meanPercent)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {LEGEND_ITEMS.map((b) => (
                <li key={b.label} className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: b.color }}
                    aria-hidden
                  />
                  <span>{b.label}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
