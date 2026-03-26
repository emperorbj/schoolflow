"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookCopy,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  LineChart,
  Megaphone,
  NotebookPen,
  ShieldCheck,
  School,
  Target,
  Users,
} from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  useClassCoverageQuery,
  useClassesQuery,
  useSessionsQuery,
  useTermsQuery,
  useUsersQuery,
} from "@/features/admin/hooks";
import { useStudentCountsQuery, useTeachingContextsQuery } from "@/features/assessments/hooks";
import { useCurrentUserQuery } from "@/features/auth/hooks";
import { useStudentMeResultsQuery, useStudentsQuery } from "@/features/students/hooks";
import { ApiError } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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

const quickActions = [
  {
    href: "/admin",
    label: "Manage school setup",
    hint: "Sessions, terms, classes, subjects",
    icon: School,
    borderClass: "border-indigo-200",
  },
  {
    href: "/students",
    label: "Open students",
    hint: "Create and update student records",
    icon: GraduationCap,
    borderClass: "border-sky-200",
  },
  {
    href: "/assessments",
    label: "Assessments",
    hint: "Enter and submit score sheets",
    icon: BookCopy,
    borderClass: "border-emerald-200",
  },
  {
    href: "/class-results",
    label: "Class results",
    hint: "Aggregate and comments",
    icon: CalendarDays,
    borderClass: "border-amber-200",
  },
  {
    href: "/notifications",
    label: "Notifications",
    hint: "Results and alerts emails",
    icon: Users,
    borderClass: "border-rose-200",
  },
] as const;

const chartConfig = {
  total: { label: "Users", color: "#93C5FD" },
  assigned: { label: "Assigned", color: "#34D399" },
  unassigned: { label: "Unassigned", color: "#FDBA74" },
  studentsByClass: { label: "Students", color: "#7DD3FC" },
} satisfies ChartConfig;

type RoleQuickAction = {
  href: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  borderClass: string;
};

export default function DashboardPage() {
  const me = useCurrentUserQuery();
  const role = me.data?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN";
  const isAdminLike = isSuperAdmin || isAdmin;
  const canViewStudents = role
    ? ["SUPER_ADMIN", "ADMIN", "CLASS_TEACHER", "HEADTEACHER", "PRINCIPAL"].includes(role)
    : false;

  const sessions = useSessionsQuery(isAdminLike);
  const terms = useTermsQuery(undefined, isAdminLike);
  const classes = useClassesQuery(isAdminLike);
  const users = useUsersQuery(isAdminLike);
  const students = useStudentsQuery({}, canViewStudents);
  const studentTerms = useTermsQuery(undefined, role === "STUDENT");
  const [studentTermId, setStudentTermId] = useState("");
  const teachingContexts = useTeachingContextsQuery(role === "SUBJECT_TEACHER");
  const [subjectTeacherSubjectId, setSubjectTeacherSubjectId] = useState("");
  const [subjectTeacherTermId, setSubjectTeacherTermId] = useState("");
  const [selectedCoverageClassId, setSelectedCoverageClassId] = useState<string | undefined>(
    undefined,
  );

  const classRows = classes.data?.classes ?? [];
  const effectiveCoverageClassId = selectedCoverageClassId ?? classRows[0]?._id;
  const coverage = useClassCoverageQuery(effectiveCoverageClassId, undefined, isAdminLike);

  const studentTermRows = studentTerms.data?.terms ?? [];
  const effectiveStudentTermId =
    studentTermId ||
    studentTermRows.find((t) => t.isActive)?._id ||
    studentTermRows[0]?._id ||
    "";
  const studentMeResults = useStudentMeResultsQuery(
    effectiveStudentTermId || null,
    role === "STUDENT" && Boolean(effectiveStudentTermId),
  );

  const stats = [
    {
      label: "Sessions",
      value: sessions.data?.sessions.length ?? 0,
      icon: CalendarDays,
      iconBg: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Terms",
      value: terms.data?.terms.length ?? 0,
      icon: BookCopy,
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Classes",
      value: classes.data?.classes.length ?? 0,
      icon: School,
      iconBg: "bg-amber-100 text-amber-700",
    },
    {
      label: "Students",
      value: students.data?.students.length ?? 0,
      icon: GraduationCap,
      iconBg: "bg-sky-100 text-sky-700",
    },
  ];

  const activeSession = sessions.data?.sessions.find((row) => row.isActive);
  const activeTerm = terms.data?.terms.find((row) => row.isActive);
  const userRoleBarData = [
    "ADMIN",
    "SUBJECT_TEACHER",
    "CLASS_TEACHER",
    "HEADTEACHER",
    "PRINCIPAL",
    "STUDENT",
    "PARENT",
  ].map((role) => ({
    role: role.replaceAll("_", " "),
    total: (users.data?.users ?? []).filter((u) => u.role === role).length,
  }));
  const roleChartHasData = userRoleBarData.some((r) => r.total > 0);
  const coveragePieData = [
    {
      name: "Assigned",
      value: coverage.data?.assignedSubjectTeachers.length ?? 0,
      fill: "var(--color-assigned)",
    },
    {
      name: "Unassigned",
      value: coverage.data?.unassignedSubjectTeachers.length ?? 0,
      fill: "var(--color-unassigned)",
    },
  ];
  const loading =
    me.isLoading ||
    sessions.isLoading ||
    terms.isLoading ||
    classes.isLoading ||
    users.isLoading ||
    students.isLoading ||
    (role === "STUDENT" && studentTerms.isLoading);

  const roleQuickActions: Record<string, RoleQuickAction[]> = {
    SUPER_ADMIN: quickActions as unknown as RoleQuickAction[],
    ADMIN: [
      { href: "/admin", label: "School setup", hint: "Manage sessions, terms, classes, subjects", icon: School, borderClass: "border-indigo-200" },
      { href: "/admin/users", label: "User management", hint: "Register, edit, and disable users", icon: Users, borderClass: "border-sky-200" },
      { href: "/admin/assignments", label: "Teacher assignment", hint: "Assign teachers to class/subject/term", icon: NotebookPen, borderClass: "border-emerald-200" },
      { href: "/notifications", label: "Notifications", hint: "Send results and alerts", icon: Megaphone, borderClass: "border-rose-200" },
    ],
    SUBJECT_TEACHER: [
      { href: "/assessments", label: "Score sheets", hint: "Enter and submit continuous assessments", icon: NotebookPen, borderClass: "border-indigo-200" },
      { href: "/materials", label: "Materials", hint: "Upload lesson resources", icon: BookCopy, borderClass: "border-sky-200" },
      { href: "/class-results", label: "Result tracker", hint: "Monitor submission and results status", icon: LineChart, borderClass: "border-emerald-200" },
    ],
    CLASS_TEACHER: [
      { href: "/students", label: "Class students", hint: "Manage your learners and records", icon: GraduationCap, borderClass: "border-indigo-200" },
      { href: "/class-results", label: "Class results", hint: "Review comments and outcomes", icon: CheckSquare, borderClass: "border-amber-200" },
      { href: "/assessments", label: "Assessment status", hint: "Track subject submissions", icon: Target, borderClass: "border-sky-200" },
    ],
    HEADTEACHER: [
      { href: "/headteacher", label: "Headteacher analytics", hint: "Class-level monitoring and trends", icon: LineChart, borderClass: "border-indigo-200" },
      { href: "/students", label: "Students", hint: "View student lists and records", icon: GraduationCap, borderClass: "border-sky-200" },
      { href: "/notifications", label: "Notifications", hint: "Send targeted school alerts", icon: Megaphone, borderClass: "border-rose-200" },
    ],
    PRINCIPAL: [
      { href: "/principal", label: "Principal analytics", hint: "Oversight, promotions, and lock term", icon: ShieldCheck, borderClass: "border-indigo-200" },
      { href: "/class-results", label: "Class outcomes", hint: "Review school-wide performance", icon: LineChart, borderClass: "border-amber-200" },
      { href: "/notifications", label: "Notifications", hint: "Send strategic communications", icon: Megaphone, borderClass: "border-rose-200" },
    ],
    STUDENT: [
      {
        href: "/materials",
        label: "Materials",
        hint: "Learning resources for your classes",
        icon: BookCopy,
        borderClass: "border-sky-200",
      },
    ],
  };

  const scopedQuickActions = role ? roleQuickActions[role] ?? [] : [];
  const subjectTeacherStats = useMemo(() => {
    const teachingContextsRows = teachingContexts.data?.contexts ?? [];
    const uniqueClassIds = new Set<string>();
    const uniqueSubjectIds = new Set<string>();
    const uniqueTermIds = new Set<string>();

    for (const ctx of teachingContextsRows) {
      const classId = typeof ctx.classId === "string" ? ctx.classId : ctx.classId._id;
      const subjectId = typeof ctx.subjectId === "string" ? ctx.subjectId : ctx.subjectId._id;
      const termId = typeof ctx.termId === "string" ? ctx.termId : ctx.termId._id;
      uniqueClassIds.add(classId);
      uniqueSubjectIds.add(subjectId);
      uniqueTermIds.add(termId);
    }

    return [
      {
        label: "Teaching contexts",
        value: teachingContextsRows.length,
        icon: NotebookPen,
        iconBg: "bg-indigo-100 text-indigo-700",
      },
      {
        label: "Classes",
        value: uniqueClassIds.size,
        icon: School,
        iconBg: "bg-sky-100 text-sky-700",
      },
      {
        label: "Subjects",
        value: uniqueSubjectIds.size,
        icon: BookCopy,
        iconBg: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Terms",
        value: uniqueTermIds.size,
        icon: CalendarDays,
        iconBg: "bg-amber-100 text-amber-700",
      },
    ];
  }, [teachingContexts.data?.contexts]);
  const subjectOptions = useMemo(() => {
    const rows = teachingContexts.data?.contexts ?? [];
    const map = new Map<string, string>();
    for (const row of rows) {
      const id = typeof row.subjectId === "string" ? row.subjectId : row.subjectId._id;
      const label =
        typeof row.subjectId === "string"
          ? row.subjectId
          : `${row.subjectId.name} (${row.subjectId.code})`;
      map.set(id, label);
    }
    return [...map.entries()].map(([id, label]) => ({ id, label }));
  }, [teachingContexts.data?.contexts]);
  const termOptions = useMemo(() => {
    const rows = teachingContexts.data?.contexts ?? [];
    const map = new Map<string, string>();
    for (const row of rows) {
      const id = typeof row.termId === "string" ? row.termId : row.termId._id;
      const label =
        typeof row.termId === "string"
          ? row.termId
          : `${row.termId.name} (Order ${row.termId.order})`;
      map.set(id, label);
    }
    return [...map.entries()].map(([id, label]) => ({ id, label }));
  }, [teachingContexts.data?.contexts]);
  const effectiveSubjectTeacherSubjectId = subjectTeacherSubjectId || subjectOptions[0]?.id || "";
  const effectiveSubjectTeacherTermId = subjectTeacherTermId || termOptions[0]?.id || "";
  const studentCounts = useStudentCountsQuery(
    effectiveSubjectTeacherSubjectId && effectiveSubjectTeacherTermId
      ? { subjectId: effectiveSubjectTeacherSubjectId, termId: effectiveSubjectTeacherTermId }
      : null,
    role === "SUBJECT_TEACHER",
  );
  const subjectTeacherBarData = useMemo(
    () =>
      (studentCounts.data?.classes ?? []).map((row) => ({
        classLabel: `${row.className}${row.classArm ?? ""}`,
        studentsByClass: row.totalStudents,
      })),
    [studentCounts.data?.classes],
  );
  const subjectTeacherYAxisMax = useMemo(() => {
    const maxCount = subjectTeacherBarData.reduce(
      (acc, row) => Math.max(acc, row.studentsByClass),
      0,
    );
    // Keep a practical visible range with headroom for typical class sizes.
    return Math.max(100, Math.ceil(maxCount * 1.2 / 10) * 10);
  }, [subjectTeacherBarData]);

  const studentDashboardStats = useMemo(() => {
    const agg = studentMeResults.data?.aggregate;
    if (!agg) {
      return [
        { label: "Subjects", value: 0, icon: BookCopy, iconBg: "bg-indigo-100 text-indigo-700" },
        { label: "Passed", value: 0, icon: CheckSquare, iconBg: "bg-emerald-100 text-emerald-700" },
        { label: "Total score", value: 0, icon: LineChart, iconBg: "bg-sky-100 text-sky-700" },
        { label: "Average", value: 0, icon: GraduationCap, iconBg: "bg-amber-100 text-amber-700" },
      ];
    }
    return [
      {
        label: "Subjects",
        value: agg.subjectCount,
        icon: BookCopy,
        iconBg: "bg-indigo-100 text-indigo-700",
      },
      {
        label: "Passed",
        value: agg.passedSubjects,
        icon: CheckSquare,
        iconBg: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Total score",
        value: agg.totalScore,
        icon: LineChart,
        iconBg: "bg-sky-100 text-sky-700",
      },
      {
        label: "Average",
        value: agg.average,
        icon: GraduationCap,
        iconBg: "bg-amber-100 text-amber-700",
      },
    ];
  }, [studentMeResults.data?.aggregate]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary/15 via-primary/5 to-background shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">
                Welcome back, {me.data?.firstName ?? "User"}
              </CardTitle>
              <CardDescription className="mt-1">
                {isSuperAdmin
                  ? "Your school command center with quick actions and live setup stats."
                  : role === "ADMIN"
                    ? "Coordinate operations, users, and assignments from one admin hub."
                    : role === "SUBJECT_TEACHER"
                      ? "Manage assessment workflows and teaching contexts efficiently."
                      : role === "CLASS_TEACHER"
                        ? "Track your class progress, records, and assessment readiness."
                        : role === "STUDENT"
                          ? "View your term results and stay on top of your progress."
                          : role === "HEADTEACHER"
                            ? "Monitor class performance trends and student outcomes."
                            : "Oversee school performance, promotions, and key decisions."}
              </CardDescription>
            </div>
            <Badge>{(me.data?.role ?? "").replaceAll("_", " ") || "LOADING"}</Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(isAdminLike
          ? stats
          : role === "SUBJECT_TEACHER"
            ? subjectTeacherStats
            : role === "STUDENT"
              ? studentDashboardStats
              : [
                  { label: "Students", value: students.data?.students.length ?? 0, icon: GraduationCap, iconBg: "bg-indigo-100 text-indigo-700" },
                  { label: "Role tools", value: 1, icon: ShieldCheck, iconBg: "bg-sky-100 text-sky-700" },
                  { label: "Reports", value: 1, icon: LineChart, iconBg: "bg-emerald-100 text-emerald-700" },
                  { label: "Actions", value: scopedQuickActions.length, icon: CheckSquare, iconBg: "bg-amber-100 text-amber-700" },
                ]).map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl p-3 ${stat.iconBg}`}>
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold">
                  {loading
                    ? "..."
                    : stat.label === "Average" && typeof stat.value === "number"
                      ? stat.value.toFixed(2)
                      : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-indigo-50/60 to-white shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-indigo-950/10 dark:to-card">
          <CardHeader>
            <CardTitle>{isAdminLike ? "School status" : "Role status"}</CardTitle>
            <CardDescription>{isAdminLike ? "Active setup context." : "Current context overview."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {isAdminLike ? (
              <>
                <div className="flex items-center justify-between rounded-xl border border-indigo-200/70 bg-white/80 p-3 backdrop-blur-sm dark:border-indigo-900/40 dark:bg-card/60">
                  <span className="text-muted-foreground">Active session</span>
                  <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                    {activeSession?.name ?? "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-indigo-200/70 bg-white/80 p-3 backdrop-blur-sm dark:border-indigo-900/40 dark:bg-card/60">
                  <span className="text-muted-foreground">Active term</span>
                  <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                    {activeTerm?.name ?? "Not set"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl border border-indigo-200/70 bg-white/80 p-3 backdrop-blur-sm dark:border-indigo-900/40 dark:bg-card/60">
                  <span className="text-muted-foreground">Role</span>
                  <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                    {(role ?? "").replaceAll("_", " ") || "Loading"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-indigo-200/70 bg-white/80 p-3 backdrop-blur-sm dark:border-indigo-900/40 dark:bg-card/60">
                  <span className="text-muted-foreground">Tools</span>
                  <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                    {scopedQuickActions.length} shortcuts
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>{isAdminLike ? "Jump straight into key workflows." : "Shortcuts for your role."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {scopedQuickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md ${item.borderClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                    <item.icon className="size-4" />
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      {isAdminLike ? (
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users by role</CardTitle>
            <CardDescription>Distribution of school users.</CardDescription>
          </CardHeader>
          <CardContent>
            {roleChartHasData ? (
              <ChartContainer config={chartConfig} className="h-[220px]">
                <BarChart accessibilityLayer data={userRoleBarData}>
                  <XAxis
                    dataKey="role"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.split(" ").map((s: string) => s[0]).join("")}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={8} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No user data available yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Teacher assignment coverage</CardTitle>
                <CardDescription>Assigned vs unassigned subject teachers.</CardDescription>
              </div>
              <Select
                value={effectiveCoverageClassId}
                onValueChange={setSelectedCoverageClassId}
                disabled={!classRows.length}
              >
                <SelectTrigger className="h-9 w-[220px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classRows.map((row) => (
                    <SelectItem key={row._id} value={row._id}>
                      {row.name} {row.arm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {coverage.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            ) : classRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create at least one class to show coverage.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[220px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={coveragePieData} dataKey="value" nameKey="name" outerRadius={96}>
                    {coveragePieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border p-2">
                <span className="text-muted-foreground">Assigned</span>
                <p className="font-semibold">{coveragePieData[0].value}</p>
              </div>
              <div className="rounded-lg border p-2">
                <span className="text-muted-foreground">Unassigned</span>
                <p className="font-semibold">{coveragePieData[1].value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      ) : null}

      {role === "STUDENT" ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>My results</CardTitle>
                <CardDescription>Per-subject scores for the selected term.</CardDescription>
              </div>
              <Select
                value={effectiveStudentTermId || undefined}
                onValueChange={setStudentTermId}
                disabled={!studentTermRows.length}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  {studentTermRows.map((row) => (
                    <SelectItem key={row._id} value={row._id}>
                      {row.name} (Order {row.order})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentMeResults.error instanceof ApiError && studentMeResults.error.status === 403 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {studentMeResults.error.message}. If you should see results, ask an admin to create your student record
                with a portal account (login email and password).
              </div>
            ) : null}
            {studentMeResults.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading your results...</p>
            ) : studentMeResults.data ? (
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
                    {(studentMeResults.data.results ?? []).map((row) => (
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
                {!studentMeResults.data.results.length ? (
                  <p className="border-t p-4 text-sm text-muted-foreground">No subject results for this term yet.</p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {role === "SUBJECT_TEACHER" ? (
        <Card>
          <CardHeader>
            <CardTitle>Students offering subject (by class)</CardTitle>
            <CardDescription>
              Uses `/api/v1/student-counts` for your assigned subject and term.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
              <Select
                value={effectiveSubjectTeacherSubjectId || undefined}
                onValueChange={setSubjectTeacherSubjectId}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={effectiveSubjectTeacherTermId || undefined} onValueChange={setSubjectTeacherTermId}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  {termOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center rounded-lg border px-3 text-sm text-muted-foreground">
                Total students: {studentCounts.data?.totalStudents ?? 0}
              </div>
            </div>

            {studentCounts.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading student counts...</p>
            ) : effectiveSubjectTeacherSubjectId && effectiveSubjectTeacherTermId ? (
              subjectTeacherBarData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[260px]">
                  <BarChart accessibilityLayer data={subjectTeacherBarData}>
                    <XAxis dataKey="classLabel" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis allowDecimals={false} domain={[0, subjectTeacherYAxisMax]} tickCount={6} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="studentsByClass" fill="var(--color-studentsByClass)" radius={8} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No classes found for this subject/term scope.</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">Select subject and term to load class counts.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
