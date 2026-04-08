"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Activity, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authStore } from "@/lib/auth-store";
import { getApiErrorMessage, login as loginRequest } from "@/lib/simrs-api";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@simrs.local", password: "Admin123!" }
  });

  const loginMutation = useMutation({
    mutationFn: (values: FormValues) => loginRequest(values),
    onSuccess: (data) => {
      authStore.setTokens(data.accessToken, data.refreshToken);
      toast.success("Login berhasil");
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(201_84%_56%/.25),transparent_40%),radial-gradient(circle_at_bottom_left,hsl(174_62%_47%/.18),transparent_45%)]" />

      <Card className="relative w-full max-w-md border-white/30 bg-white/80 backdrop-blur">
        <CardContent className="p-8">
          <div className="mb-6 space-y-2 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              <Stethoscope className="size-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">SIMRS Portal</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Masuk untuk mengelola operasional rumah sakit.
            </p>
          </div>

          <form className="space-y-4" onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <Button className="w-full" disabled={loginMutation.isPending} type="submit">
              {loginMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Activity className="size-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
            <p className="text-center">Password semua akun seed: Admin123!</p>
            <p className="text-center">admin@simrs.local, doctor@simrs.local, cashier@simrs.local</p>
            <p className="text-center">staff.rina@simrs.local, apoteker.maya@simrs.local</p>
            <p className="text-center">radiologi.eko@simrs.local, lab.tuti@simrs.local, pasien.andi@simrs.local</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

