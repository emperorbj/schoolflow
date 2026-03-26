"use client";

import { useMemo, useState } from "react";
import { BookCopy, CheckSquare, GraduationCap, LineChart } from "lucide-react";
import { useTermsQuery } from "@/features/admin/hooks";
import { useCurrentUserQuery } from "@/features/auth/hooks";
import { useStudentMeResultsQuery } from "@/features/students/hooks";
import { ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
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

export default function StudentResultsPage() {
  const me = useCurrentUserQuery();
  const role = me.data?.role;
  const terms = useTermsQuery(undefined, role === "STUDENT");
  const [termId, setTermId] = useState("");

  const termRows = terms.data?.terms ?? [];
  const effectiveTermId =
    termId || termRows.find((t) => t.isActive)?._id || termRows[0]?._id || "";

  const results = useStudentMeResultsQuery(
    effectiveTermId || null,
    role === "STUDENT" && Boolean(effectiveTermId),
  );

  const stats = useMemo(() => {
    const agg = results.data?.aggregate;
    return [
      {
        label: "Subjects",
        value: agg?.subjectCount ?? 0,
        icon: BookCopy,
        iconBg: "bg-indigo-100 text-indigo-700",
      },
      {
        label: "Passed",
        value: agg?.passedSubjects ?? 0,
        icon: CheckSquare,
        iconBg: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Total score",
        value: agg?.totalScore ?? 0,
        icon: LineChart,
        iconBg: "bg-sky-100 text-sky-700",
      },
      {
        label: "Average",
        value: agg?.average ?? 0,
        icon: GraduationCap,
        iconBg: "bg-amber-100 text-amber-700",
      },
    ];
  }, [results.data?.aggregate]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary/15 via-primary/5 to-background shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">My results</CardTitle>
              <CardDescription className="mt-1">
                View your term results and progress summary.
              </CardDescription>
            </div>
            <Badge>{(me.data?.role ?? "").replaceAll("_", " ") || "LOADING"}</Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl p-3 ${stat.iconBg}`}>
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold">
                  {stat.label === "Average" && typeof stat.value === "number"
                    ? stat.value.toFixed(2)
                    : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Results table</CardTitle>
              <CardDescription>Per-subject scores for the selected term.</CardDescription>
            </div>
            <Select
              value={effectiveTermId || undefined}
              onValueChange={setTermId}
              disabled={!termRows.length}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                {termRows.map((row) => (
                  <SelectItem key={row._id} value={row._id}>
                    {row.name} (Order {row.order})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.error instanceof ApiError && results.error.status === 403 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {results.error.message}. If you should see results, ask an admin to create your student record with a
              portal account (login email and password).
            </div>
          ) : null}

          {results.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your results...</p>
          ) : results.data ? (
            <div className="overflow-hidden rounded-xl border border-indigo-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50/70">
                    <TableHead>Subject</TableHead>
                    <TableHead>Test 1</TableHead>
                    <TableHead>Test 2</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Total %</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(results.data.results ?? []).map((row) => (
                    <TableRow key={row.subjectId} className="hover:bg-indigo-50/40">
                      <TableCell className="font-medium">
                        {row.subjectName} ({row.subjectCode})
                      </TableCell>
                      <TableCell>{row.test1}</TableCell>
                      <TableCell>{row.test2}</TableCell>
                      <TableCell>{row.exam}</TableCell>
                      <TableCell>{row.totalPercent}</TableCell>
                      <TableCell>{row.grade ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.locked ? "Locked" : "Open"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!results.data.results.length ? (
                <p className="border-t p-4 text-sm text-muted-foreground">
                  No subject results for this term yet.
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

