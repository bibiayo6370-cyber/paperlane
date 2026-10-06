"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthInput } from "@/lib/schemas";
import { signIn, signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthInput>({ resolver: zodResolver(authSchema) });

  const isLogin = mode === "login";

  const onSubmit = async (values: AuthInput) => {
    setServerError(null);
    const result = isLogin ? await signIn(values) : await signUp(values);
    if (result?.error) setServerError(result.error);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isLogin ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>
          {isLogin ? "Log in to see your orders and downloads." : "Sign up to check out and download."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "No account yet? " : "Already registered? "}
            <Link href={isLogin ? "/signup" : "/login"} className="underline">
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
