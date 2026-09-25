"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, AlertCircle, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axErr = err as { response?: { data?: { detail?: string } } };
        setErrorMessage(axErr.response?.data?.detail || "Invalid email or password. Please try again.");
      } else {
        setErrorMessage("Network connection failed. Please check backend server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (role: "admin" | "staff") => {
    if (role === "admin") {
      setValue("email", "admin@nexorastaffing.com");
      setValue("password", "NexoraAdmin@2026!");
    } else {
      setValue("email", "staff@nexorastaffing.com");
      setValue("password", "NexoraStaff@2026!");
    }
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 p-4 sm:p-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 mb-4">
            <span className="text-2xl font-black tracking-tight text-blue-500">N</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Naxora CRM
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nexora Staffing LLP • Secure Operations Portal
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-lg shadow-slate-200/50 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your corporate credentials to access the workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email" required>
                  Corporate Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@nexorastaffing.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password" required className="mb-0">
                    Password
                  </Label>
                  <span className="text-xs text-slate-400">Argon2id Encrypted</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                Sign In <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            {/* Dev helper buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
                Development Quick Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("staff")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Staff Member
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Nexora Staffing LLP • Role-Based Access Control Enforced
        </p>
      </div>
    </div>
  );
}

