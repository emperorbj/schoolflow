"use client";

import { useState } from "react";
import { useClassesQuery } from "@/features/admin/hooks";
import { useCreateStudentMutation, useStudentsQuery, useUpdateStudentMutation } from "@/features/students/hooks";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function StudentsPage() {
  const [q, setQ] = useState("");
  const [classId, setClassId] = useState("");
  const classesQuery = useClassesQuery();
  const studentsQuery = useStudentsQuery({
    q: q.trim() || undefined,
    classId: classId || undefined,
  });

  const createStudent = useCreateStudentMutation();
  const updateStudent = useUpdateStudentMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [createClassId, setCreateClassId] = useState("");

  const classes = classesQuery.data?.classes ?? [];
  const students = studentsQuery.data?.students ?? [];
  const topError =
    studentsQuery.error ??
    classesQuery.error ??
    createStudent.error ??
    updateStudent.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter, create, and update student records.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{errorText(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create student</CardTitle>
          <CardDescription>Add a student to a class roster.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-5">
          <Input value={firstName} placeholder="First name" onChange={(e) => setFirstName(e.target.value)} />
          <Input value={lastName} placeholder="Last name" onChange={(e) => setLastName(e.target.value)} />
          <Input
            value={admissionNumber}
            placeholder="Admission number"
            onChange={(e) => setAdmissionNumber(e.target.value)}
          />
          <Select value={createClassId || undefined} onValueChange={setCreateClassId}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {classes.map((row) => (
                  <SelectItem key={row._id} value={row._id}>
                    {row.name} {row.arm}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            disabled={
              createStudent.isPending ||
              !firstName.trim() ||
              !lastName.trim() ||
              !admissionNumber.trim() ||
              !createClassId
            }
            onClick={async () => {
              await createStudent.mutateAsync({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                admissionNumber: admissionNumber.trim(),
                classId: createClassId,
              });
              setFirstName("");
              setLastName("");
              setAdmissionNumber("");
            }}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student records</CardTitle>
          <CardDescription>Filter by class or search by name/admission number.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={q} placeholder="Search by name or admission number" onChange={(e) => setQ(e.target.value)} />
            <Select value={classId || undefined} onValueChange={setClassId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {classes.map((row) => (
                    <SelectItem key={row._id} value={row._id}>
                      {row.name} {row.arm}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setQ(""); setClassId(""); }}>
              Clear filters
            </Button>
          </div>

          {studentsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading students...</p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <StudentRow
                  key={student._id}
                  id={student._id}
                  firstName={student.firstName}
                  lastName={student.lastName}
                  admissionNumber={student.admissionNumber}
                  classId={student.classId}
                  isActive={student.isActive}
                  classOptions={classes.map((c) => ({
                    id: c._id,
                    label: `${c.name} ${c.arm}`,
                  }))}
                  onSave={(payload) => updateStudent.mutateAsync({ id: student._id, payload })}
                />
              ))}
              {!students.length ? (
                <p className="text-sm text-muted-foreground">No student records found.</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentRow({
  id,
  firstName,
  lastName,
  admissionNumber,
  classId,
  isActive,
  classOptions,
  onSave,
}: {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classId: string;
  isActive: boolean;
  classOptions: { id: string; label: string }[];
  onSave: (payload: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    classId: string;
    isActive: boolean;
  }) => Promise<unknown>;
}) {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [admission, setAdmission] = useState(admissionNumber);
  const [clazz, setClazz] = useState(classId);
  const [active, setActive] = useState(isActive);
  const [pending, setPending] = useState(false);

  return (
    <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]">
      <Input value={first} onChange={(e) => setFirst(e.target.value)} />
      <Input value={last} onChange={(e) => setLast(e.target.value)} />
      <Input value={admission} onChange={(e) => setAdmission(e.target.value)} />
      <Select value={clazz || undefined} onValueChange={setClazz}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {classOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Label className="flex items-center gap-2">
        <input checked={active} type="checkbox" onChange={(e) => setActive(e.target.checked)} />
        Active
      </Label>
      <Button
        size="sm"
        disabled={pending || !first.trim() || !last.trim() || !admission.trim() || !clazz}
        onClick={async () => {
          setPending(true);
          await onSave({
            firstName: first.trim(),
            lastName: last.trim(),
            admissionNumber: admission.trim(),
            classId: clazz,
            isActive: active,
          });
          setPending(false);
        }}
      >
        Save
      </Button>
      <input type="hidden" value={id} />
    </div>
  );
}
