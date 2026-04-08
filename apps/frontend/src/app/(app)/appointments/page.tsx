"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/ui/state-block";
import {
  createAppointment,
  getApiErrorMessage,
  listAppointments,
  listDoctors,
  listPatients,
  setAppointmentStatus
} from "@/lib/simrs-api";
import type { AppointmentStatus } from "@/lib/types";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient wajib dipilih"),
  doctorId: z.string().min(1, "Doctor wajib dipilih"),
  scheduledAt: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const statuses: AppointmentStatus[] = ["SCHEDULED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function AppointmentsPage() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();

  const appointments = useQuery({
    queryKey: ["appointments", q],
    queryFn: () => listAppointments({ page: 1, limit: 50, q: q || undefined })
  });
  const patients = useQuery({
    queryKey: ["appointments", "patients-options"],
    queryFn: () => listPatients({ page: 1, limit: 200 })
  });
  const doctors = useQuery({
    queryKey: ["appointments", "doctors-options"],
    queryFn: () => listDoctors({ page: 1, limit: 200 })
  });

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { patientId: "", doctorId: "", scheduledAt: "", notes: "" }
  });

  const create = useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      toast.success("Appointment created");
      form.reset();
      await qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) => setAppointmentStatus(id, status),
    onSuccess: async () => {
      toast.success("Appointment status updated");
      await qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  return (
    <div className="space-y-4 p-6">
      <PageHeader title="Appointments" description="Jadwal konsultasi pasien" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buat appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit((values) => create.mutate(values))}>
            <div className="space-y-1.5">
              <Label htmlFor="patient">Patient</Label>
              <select id="patient" className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm" {...form.register("patientId")}>
                <option value="">Select patient</option>
                {(patients.data?.data ?? []).map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.mrn} - {patient.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doctor">Doctor</Label>
              <select id="doctor" className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm" {...form.register("doctorId")}>
                <option value="">Select doctor</option>
                {(doctors.data?.data ?? []).map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.code} - {doctor.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Schedule</Label>
              <Input id="scheduledAt" type="datetime-local" {...form.register("scheduledAt")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...form.register("notes")} placeholder="Optional notes" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Save appointment"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex gap-2">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search patient or doctor..." />
            <Button variant="secondary" onClick={() => appointments.refetch()} disabled={appointments.isFetching}>Search</Button>
          </div>

          {appointments.isLoading ? <LoadingBlock label="Loading appointments..." /> : null}
          {appointments.isError ? <ErrorBlock message="Failed to load appointments" onRetry={() => appointments.refetch()} /> : null}

          {appointments.data ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-2">Schedule</th>
                    <th className="py-2 pr-2">Patient</th>
                    <th className="py-2 pr-2">Doctor</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.data.data.map((appointment) => (
                    <tr key={appointment.id} className="border-b align-top">
                      <td className="py-2 pr-2">{new Date(appointment.scheduledAt).toLocaleString()}</td>
                      <td className="py-2 pr-2">{appointment.patient?.name ?? "-"}</td>
                      <td className="py-2 pr-2">{appointment.doctor?.name ?? "-"}</td>
                      <td className="py-2 pr-2"><Badge variant="outline">{appointment.status}</Badge></td>
                      <td className="py-2 pr-2">
                        <div className="flex flex-wrap gap-1">
                          {statuses.map((status) => (
                            <Button
                              key={status}
                              variant={status === appointment.status ? "default" : "outline"}
                              size="sm"
                              disabled={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ id: appointment.id, status })}
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.data.data.length === 0 ? <EmptyBlock message="No appointments found" /> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
