"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Pill,
  ScanSearch,
  Shield,
  Upload,
  UserRound,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErrorBlock, LoadingBlock } from "@/components/ui/state-block";
import { authStore } from "@/lib/auth-store";
import { fetchMe } from "@/lib/simrs-api";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/doctors", label: "Doctors", icon: UserRound },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/queues", label: "Queues", icon: ClipboardList },
  { href: "/medicines", label: "Medicines", icon: Pill },
  { href: "/laboratory", label: "Laboratory", icon: FlaskConical },
  { href: "/radiology", label: "Radiology", icon: ScanSearch },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/admin", label: "Users & Roles", icon: Shield },
  { href: "/files", label: "Files", icon: Upload }
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = authStore.getAccessToken();
    if (!token) router.replace("/login");
  }, [router]);

  const me = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchMe,
    retry: false,
    enabled: authStore.isAuthenticated()
  });

  useEffect(() => {
    if (!me.isError) return;
    authStore.clear();
    router.replace("/login");
  }, [me.isError, router]);

  if (!authStore.isAuthenticated()) return null;

  if (me.isLoading) {
    return (
      <div className="p-6">
        <LoadingBlock label="Preparing workspace..." />
      </div>
    );
  }

  if (me.isError) {
    return (
      <div className="p-6">
        <ErrorBlock message="Session expired, redirecting to login..." />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/40 p-4 md:flex md:flex-col md:gap-4">
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
          <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Signed in as</div>
          <div className="mt-1 font-semibold leading-tight">{me.data?.name}</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">{me.data?.email}</div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="font-semibold">SIMRS Frontdesk</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              authStore.clear();
              router.replace("/login");
            }}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]",
                  active && "bg-[hsl(var(--accent))] font-medium"
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-[hsl(var(--border))] bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">SIMRS Frontdesk</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{me.data?.name}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                authStore.clear();
                router.replace("/login");
              }}
            >
              Logout
            </Button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs whitespace-nowrap",
                    active ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

