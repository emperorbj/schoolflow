"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useClassesQuery, useSessionsQuery, useSubjectsQuery, useTermsQuery } from "@/features/admin/hooks";
import { useCurrentUserQuery } from "@/features/auth/hooks";
import { useStudentsQuery } from "@/features/students/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const quickActions = [
  { href: "/admin", label: "Manage school setup", hint: "Sessions, terms, classes, subjects" },
  { href: "/students", label: "Open students", hint: "Create and update student records" },
  { href: "/assessments", label: "Go to assessments", hint: "Enter and submit score sheets" },
  { href: "/class-results", label: "Review class results", hint: "Aggregate and comments" },
  { href: "/materials", label: "Materials library", hint: "Upload and share learning files" },
  { href: "/notifications", label: "Send notifications", hint: "Results and alerts emails" },
] as const;

export default function DashboardPage() {
  const me = useCurrentUserQuery();
  const sessions = useSessionsQuery();
  const terms = useTermsQuery();
  const classes = useClassesQuery();
  const subjects = useSubjectsQuery();
  const students = useStudentsQuery({});

  const stats = [
    { label: "Sessions", value: sessions.data?.sessions.length ?? 0 },
    { label: "Terms", value: terms.data?.terms.length ?? 0 },
    { label: "Classes", value: classes.data?.classes.length ?? 0 },
    { label: "Subjects", value: subjects.data?.subjects.length ?? 0 },
    { label: "Students", value: students.data?.students.length ?? 0 },
  ];

  const activeSession = sessions.data?.sessions.find((row) => row.isActive);
  const activeTerm = terms.data?.terms.find((row) => row.isActive);
  const loading =
    me.isLoading ||
    sessions.isLoading ||
    terms.isLoading ||
    classes.isLoading ||
    subjects.isLoading ||
    students.isLoading;

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
                Your school command center with quick actions and live setup stats.
              </CardDescription>
            </div>
            <Badge>{(me.data?.role ?? "").replaceAll("_", " ") || "LOADING"}</Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{loading ? "..." : stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>School status</CardTitle>
            <CardDescription>Current active session and term context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Active session</span>
              <span className="font-medium">{activeSession?.name ?? "Not set"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Active term</span>
              <span className="font-medium">{activeTerm?.name ?? "Not set"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump straight into key workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((item) => (
              <Button key={item.href} asChild variant="outline" className="h-auto w-full justify-between py-3">
                <Link href={item.href}>
                  <span className="text-left">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
