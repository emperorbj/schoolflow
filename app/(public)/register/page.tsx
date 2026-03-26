"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api/client";
import { Mail } from "lucide-react";

const registerSchema = z.object({
  schoolName: z.string().trim().min(1, "School name is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      schoolName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await registerMutation.mutateAsync(values);
    router.replace("/dashboard");
  };

  const errorMessage =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : "Unable to register. Please try again.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4 py-10">
      <Card className="w-full max-w-2xl border bg-background/95 shadow-xl">
        <CardHeader>
          <CardTitle>Bootstrap your school</CardTitle>
          <CardDescription>
            Create the first super admin account for a new school setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="School name" id="schoolName" error={errors.schoolName?.message}>
                <Input id="schoolName" {...register("schoolName")} />
              </Field>
              <Field label="Email" id="email" error={errors.email?.message}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" className="pl-10" type="email" {...register("email")} />
                </div>
              </Field>
              <Field label="First name" id="firstName" error={errors.firstName?.message}>
                <Input id="firstName" {...register("firstName")} />
              </Field>
              <Field label="Last name" id="lastName" error={errors.lastName?.message}>
                <Input id="lastName" {...register("lastName")} />
              </Field>
            </div>

            <Field label="Password" id="password" error={errors.password?.message}>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
            </Field>

            {registerMutation.isError ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}

            <Button
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Create super admin"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
