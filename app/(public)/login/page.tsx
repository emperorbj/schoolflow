"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api/client";
import { Mail } from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
    router.replace("/dashboard");
  };

  const errorMessage =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : "Unable to sign in. Please try again.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 md:p-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-2xl">
        <div className="grid min-h-[640px] grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          <section className="relative hidden p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-indigo-600" />
            <div className="relative z-10">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/90">
                Schoolflow
              </p>
              <h1 className="mt-10 text-5xl font-semibold leading-tight">
                Fast, clear school operations for every role.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-primary-foreground/90">
                Manage students, assessments, class results, leadership analytics, materials, and
                notifications in one modern workspace.
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                  HV
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">Dr. Helena Vance</p>
                  <p className="mt-1 text-xs text-primary-foreground/85">Dean of Administration</p>
                </div>
              </div>
              <span className="text-xl leading-none text-primary-foreground/80">&rdquo;</span>
            </div>
          </section>

          <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Welcome Back</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please enter your details to sign in.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-10"
                      type="email"
                      placeholder="name@school.edu"
                      autoComplete="email"
                      {...register("email")}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      className="pr-11"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-0.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <FiEyeOff className="size-4" aria-hidden />
                      ) : (
                        <FiEye className="size-4" aria-hidden />
                      )}
                    </Button>
                  </div>
                  {errors.password ? (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  ) : null}
                </div>

                {loginMutation.isError ? (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                ) : null}

                <Button
                  className="mt-2 w-full py-4 shadow-md bg-indigo-600 text-white hover:bg-indigo-700"
                  type="submit"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In to Portal"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Need to bootstrap a new school?{" "}
                  <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
                    Register
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
