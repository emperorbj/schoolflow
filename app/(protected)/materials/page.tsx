"use client";

import { useState } from "react";
import { useClassesQuery, useSubjectsQuery } from "@/features/admin/hooks";
import {
  useMaterialsQuery,
  useMaterialSignedUrlMutation,
  useUploadMaterialMutation,
} from "@/features/materials/hooks";
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

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

export default function MaterialsPage() {
  const classes = useClassesQuery();
  const subjects = useSubjectsQuery();
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const materials = useMaterialsQuery({
    classId: filterClassId || undefined,
    subjectId: filterSubjectId || undefined,
  });
  const upload = useUploadMaterialMutation();
  const getSignedUrl = useMaterialSignedUrlMutation();

  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const topError =
    classes.error ?? subjects.error ?? materials.error ?? upload.error ?? getSignedUrl.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Materials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload learning materials and generate signed download links.
        </p>
      </div>

      {topError ? <p className="text-sm text-destructive">{errorText(topError)}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Upload material</CardTitle>
          <CardDescription>Attach file, title, class, and subject.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-5">
          <Input value={title} placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
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
          <Select value={subjectId || undefined} onValueChange={setSubjectId}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(subjects.data?.subjects ?? []).map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button
            disabled={upload.isPending || !file || !title.trim() || !classId || !subjectId}
            onClick={async () => {
              if (!file) return;
              await upload.mutateAsync({
                file,
                title: title.trim(),
                classId,
                subjectId,
              });
              setTitle("");
              setClassId("");
              setSubjectId("");
              setFile(null);
            }}
          >
            Upload
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Material library</CardTitle>
          <CardDescription>Filter and open temporary signed URLs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <Select value={filterClassId || undefined} onValueChange={setFilterClassId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All classes" />
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
            <Select value={filterSubjectId || undefined} onValueChange={setFilterSubjectId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(subjects.data?.subjects ?? []).map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setFilterClassId("");
                setFilterSubjectId("");
              }}
            >
              Clear filters
            </Button>
          </div>

          {(materials.data?.materials ?? []).map((m) => (
            <div key={m._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-muted-foreground">
                  {(m.size / 1024).toFixed(1)} KB - {m.mimeType}
                </p>
              </div>
              <Button
                size="sm"
                onClick={async () => {
                  const result = await getSignedUrl.mutateAsync(m._id);
                  window.open(result.signedUrl, "_blank", "noopener,noreferrer");
                }}
              >
                Download
              </Button>
            </div>
          ))}
          {materials.data && !materials.data.materials.length ? (
            <p className="text-sm text-muted-foreground">No materials found.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
