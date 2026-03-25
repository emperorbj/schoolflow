"use client";

import { useState } from "react";
import { FiCopy, FiEdit2, FiEye, FiEyeOff, FiTrash2, FiUserPlus } from "react-icons/fi";
import {
  useClassesQuery,
  useCreateSchoolUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUserDetailQuery,
  useUsersQuery,
} from "@/features/admin/hooks";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import type { SchoolUser, SchoolUserRole, UpdateUserPayload } from "@/types/admin";

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Request failed";
}

function generatePassword(length = 14) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@%*-_=+";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const EDIT_ROLES: SchoolUserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUBJECT_TEACHER",
  "CLASS_TEACHER",
  "HEADTEACHER",
  "PRINCIPAL",
  "STUDENT",
  "PARENT",
];

export default function AdminUsersPage() {
  const users = useUsersQuery();
  const classes = useClassesQuery();
  const createUser = useCreateSchoolUserMutation();
  const updateUser = useUpdateUserMutation();
  const deleteUser = useDeleteUserMutation();
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const detail = useUserDetailQuery(activeUserId ?? undefined);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<SchoolUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [role, setRole] = useState<
    "ADMIN" | "SUBJECT_TEACHER" | "CLASS_TEACHER" | "HEADTEACHER" | "PRINCIPAL" | "STUDENT" | "PARENT"
  >("ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          School users in table form with quick details.
        </p>
      </div>

      {users.error ? <p className="text-sm text-destructive">{errorText(users.error)}</p> : null}
      {createUser.error ? (
        <p className="text-sm text-destructive">{errorText(createUser.error)}</p>
      ) : null}
      {updateUser.error ? (
        <p className="text-sm text-destructive">{errorText(updateUser.error)}</p>
      ) : null}
      {deleteUser.error ? (
        <p className="text-sm text-destructive">{errorText(deleteUser.error)}</p>
      ) : null}

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FiUserPlus />
              Register user
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Register new user</AlertDialogTitle>
              <AlertDialogDescription>
                Create a new user for the current school.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-2 md:grid-cols-2">
              <Input value={firstName} placeholder="First name" onChange={(e) => setFirstName(e.target.value)} />
              <Input value={lastName} placeholder="Last name" onChange={(e) => setLastName(e.target.value)} />
              <Input
                className="md:col-span-2"
                value={email}
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="relative min-w-0 flex-1">
                  <Input
                    value={password}
                    type={showRegisterPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    placeholder="Password (min 8 chars)"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showRegisterPassword ? "Hide password" : "Show password"}
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowRegisterPassword((v) => !v)}
                  >
                    {showRegisterPassword ? (
                      <FiEyeOff className="size-4" aria-hidden />
                    ) : (
                      <FiEye className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 sm:w-auto"
                  onClick={() => {
                    setPassword(generatePassword());
                    setShowRegisterPassword(true);
                  }}
                >
                  Generate password
                </Button>
              </div>
              <div className="md:col-span-2">
                <Select value={role} onValueChange={(value) => setRole(value as typeof role)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="SUBJECT_TEACHER">SUBJECT_TEACHER</SelectItem>
                      <SelectItem value="CLASS_TEACHER">CLASS_TEACHER</SelectItem>
                      <SelectItem value="HEADTEACHER">HEADTEACHER</SelectItem>
                      <SelectItem value="PRINCIPAL">PRINCIPAL</SelectItem>
                      <SelectItem value="STUDENT">STUDENT</SelectItem>
                      <SelectItem value="PARENT">PARENT</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={
                  createUser.isPending ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !email.trim() ||
                  password.length < 8
                }
                onClick={async (event) => {
                  event.preventDefault();
                  await createUser.mutateAsync({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password,
                    role,
                  });
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPassword("");
                  setShowRegisterPassword(false);
                }}
              >
                Create user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Table>
        <TableCaption>Users in current school</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>School ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users.data?.users ?? []).map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.firstName} {user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <CopyableId value={user.id} />
              </TableCell>
              <TableCell>
                <CopyableId value={user.schoolId} />
              </TableCell>
              <TableCell>{user.isActive ? "Active" : "Disabled"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    title="Edit user"
                    onClick={() => setEditingUser(user)}
                  >
                    <FiEdit2 />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    title="Delete user"
                    onClick={() => setUserToDelete(user)}
                  >
                    <FiTrash2 />
                  </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      title="View details"
                      onClick={() => setActiveUserId(user.id)}
                    >
                      <FiEye />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>User details</AlertDialogTitle>
                      <AlertDialogDescription>
                        Full details for selected user.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    {detail.isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading user details...</p>
                    ) : detail.error ? (
                      <p className="text-sm text-destructive">{errorText(detail.error)}</p>
                    ) : detail.data?.user ? (
                      <div className="grid gap-2 text-sm">
                        <DetailRow label="ID" value={<CopyableId value={detail.data.user.id} />} />
                        <DetailRow label="First name" value={detail.data.user.firstName} />
                        <DetailRow label="Last name" value={detail.data.user.lastName} />
                        <DetailRow label="Email" value={detail.data.user.email} />
                        <DetailRow label="Role" value={detail.data.user.role} />
                        <DetailRow label="School ID" value={<CopyableId value={detail.data.user.schoolId} />} />
                        <DetailRow
                          label="Class teacher class ID"
                          value={
                            detail.data.user.classTeacherClassId ? (
                              <CopyableId value={detail.data.user.classTeacherClassId} />
                            ) : (
                              "N/A"
                            )
                          }
                        />
                        <DetailRow label="Active" value={detail.data.user.isActive ? "Yes" : "No"} />
                        <DetailRow
                          label="Created at"
                          value={new Date(detail.data.user.createdAt).toLocaleString()}
                        />
                        <DetailRow
                          label="Updated at"
                          value={new Date(detail.data.user.updatedAt).toLocaleString()}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No details found.</p>
                    )}

                    <AlertDialogFooter>
                      <AlertDialogCancel>Close</AlertDialogCancel>
                      <AlertDialogAction>Done</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-xl">
          {editingUser ? (
            <EditUserForm
              key={editingUser.id}
              user={editingUser}
              classes={classes.data?.classes ?? []}
              onSave={async (payload) => {
                await updateUser.mutateAsync({ id: editingUser.id, payload });
                setEditingUser(null);
              }}
              isPending={updateUser.isPending}
            />
          ) : null}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete ? (
                <>
                  Permanently remove {userToDelete.firstName} {userToDelete.lastName} ({userToDelete.email})?
                  This cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteUser.isPending || !userToDelete}
              onClick={async () => {
                if (!userToDelete) {
                  return;
                }
                await deleteUser.mutateAsync(userToDelete.id);
                setUserToDelete(null);
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditUserForm({
  user,
  classes,
  onSave,
  isPending,
}: {
  user: SchoolUser;
  classes: { _id: string; name: string; arm: string }[];
  onSave: (payload: UpdateUserPayload) => Promise<void>;
  isPending: boolean;
}) {
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [role, setRole] = useState<SchoolUserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [classId, setClassId] = useState(user.classTeacherClassId ?? "__none__");

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Edit user</AlertDialogTitle>
        <AlertDialogDescription>Update profile and access for this user.</AlertDialogDescription>
      </AlertDialogHeader>

      <div className="grid gap-2 md:grid-cols-2">
        <Input value={firstName} placeholder="First name" onChange={(e) => setFirstName(e.target.value)} />
        <Input value={lastName} placeholder="Last name" onChange={(e) => setLastName(e.target.value)} />
        <Input className="md:col-span-2" value={email} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <div className="md:col-span-2">
          <Select value={role} onValueChange={(value) => setRole(value as SchoolUserRole)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {EDIT_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {role === "CLASS_TEACHER" ? (
          <div className="md:col-span-2">
            <Label className="mb-2 block text-sm text-muted-foreground">Class teacher assignment</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__none__">None</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} {c.arm}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <Label className="flex items-center gap-2 md:col-span-2">
          <input checked={isActive} type="checkbox" onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </Label>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button
          disabled={
            isPending ||
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim()
          }
          onClick={async () => {
            const payload: UpdateUserPayload = {
              email: email.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              role,
              isActive,
              classTeacherClassId: role === "CLASS_TEACHER" ? (classId === "__none__" ? null : classId) : null,
            };
            await onSave(payload);
          }}
        >
          Save changes
        </Button>
      </AlertDialogFooter>
    </>
  );
}

function CopyableId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span className="max-w-[180px] truncate align-middle">{value}</span>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        onClick={onCopy}
        title="Copy ID"
      >
        <FiCopy />
      </Button>
      {copied ? <span className="text-xs text-muted-foreground">Copied</span> : null}
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border p-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] break-words text-right">{value}</span>
    </div>
  );
}
