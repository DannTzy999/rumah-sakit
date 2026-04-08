"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/ui/state-block";
import { createDoctor, deleteDoctor, getApiErrorMessage, listDoctors } from "@/lib/simrs-api";

const doctorSchema = z.object({
  code: z.string().min(2, "Code is required"),
  name: z.string().min(2, "Name is required"),
  specialty: z.string().optional(),
  phone: z.string().optional()
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function DoctorsPage() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();

  const doctors = useQuery({
    queryKey: ["doctors", q],
    queryFn: () => listDoctors({ page: 1, limit: 50, q: q || undefined })
  });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: { code: "", name: "", specialty: "", phone: "" }
  });

  const create = useMutation({
    mutationFn: createDoctor,
    onSuccess: async () => {
      toast.success("Doctor created");
      form.reset();
      await qc.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const remove = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: async () => {
      toast.success("Doctor deleted");
      await qc.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  return (
    <div className="space-y-4 p-6">
      <PageHeader title="Doctors" description="Master data daftar dokter" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah dokter</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit((values) => create.mutate(values))}>
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" {...form.register("code")} placeholder="DR003" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} placeholder="Dr. Nama" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialty">Specialty</Label>
              <Input id="specialty" {...form.register("specialty")} placeholder="Spesialis" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Save doctor"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search doctor..." />
            <Button variant="secondary" onClick={() => doctors.refetch()} disabled={doctors.isFetching}>Search</Button>
          </div>

          {doctors.isLoading ? <LoadingBlock label="Loading doctors..." /> : null}
          {doctors.isError ? <ErrorBlock message="Failed to load doctors" onRetry={() => doctors.refetch()} /> : null}

          {doctors.data ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-2">Code</th>
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Specialty</th>
                    <th className="py-2 pr-2">Phone</th>
                    <th className="py-2 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.data.data.map((doctor) => (
                    <tr key={doctor.id} className="border-b">
                      <td className="py-2 pr-2 font-mono text-xs">{doctor.code}</td>
                      <td className="py-2 pr-2 font-medium">{doctor.name}</td>
                      <td className="py-2 pr-2">{doctor.specialty || "-"}</td>
                      <td className="py-2 pr-2">{doctor.phone || "-"}</td>
                      <td className="py-2 pr-2 text-right">
                        <Button variant="destructive" size="sm" onClick={() => remove.mutate(doctor.id)} disabled={remove.isPending}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {doctors.data.data.length === 0 ? <EmptyBlock message="No doctors found" /> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
