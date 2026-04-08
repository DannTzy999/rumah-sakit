"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
  createQueueEntry,
  getApiErrorMessage,
  listDoctors,
  listPatients,
  queueDashboard,
  setQueueStatus
} from "@/lib/simrs-api";
import type { QueueStatus } from "@/lib/types";

const queueSchema = z.object({
  patientId: z.string().min(1, "Patient wajib dipilih"),
  doctorId: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib dipilih")
});

type QueueFormValues = z.infer<typeof queueSchema>;

const queueStatuses: QueueStatus[] = ["WAITING", "CALLED", "IN_SERVICE", "DONE", "CANCELLED"];

function todayValue() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export default function QueuesPage() {
  const [date, setDate] = useState(todayValue());
  const qc = useQueryClient();

  const dashboard = useQuery({
    queryKey: ["queues-dashboard", date],
    queryFn: () => queueDashboard(date)
  });

  const patients = useQuery({
    queryKey: ["queues", "patients-options"],
    queryFn: () => listPatients({ page: 1, limit: 200 })
  });

  const doctors = useQuery({
    queryKey: ["queues", "doctors-options"],
    queryFn: () => listDoctors({ page: 1, limit: 200 })
  });

  const form = useForm<QueueFormValues>({
    resolver: zodResolver(queueSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      date: `${todayValue()}T08:00`
    }
  });

  const create = useMutation({
    mutationFn: createQueueEntry,
    onSuccess: async () => {
      toast.success("Queue entry created");
      await qc.invalidateQueries({ queryKey: ["queues-dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueStatus }) => setQueueStatus(id, status),
    onSuccess: async () => {
      toast.success("Queue status updated");
      await qc.invalidateQueries({ queryKey: ["queues-dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const queueSummary = useMemo(() => {
    const list = dashboard.data ?? [];
    return {
      total: list.length,
      waiting: list.filter((entry) => entry.status === "WAITING").length,
      inService: list.filter((entry) => entry.status === "IN_SERVICE").length,
      done: list.filter((entry) => entry.status === "DONE").length
    };
  }, [dashboard.data]);

  return (
    <div className="space-y-4 p-6">
      <PageHeader title="Queue Dashboard" description="Antrian pasien harian" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah antrian</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={form.handleSubmit((values) => create.mutate(values))}>
            <div className="space-y-1.5">
              <Label htmlFor="queue-patient">Patient</Label>
              <select id="queue-patient" className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm" {...form.register("patientId")}>
                <option value="">Select patient</option>
                {(patients.data?.data ?? []).map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.mrn} - {patient.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="queue-doctor">Doctor</Label>
              <select id="queue-doctor" className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm" {...form.register("doctorId")}>
                <option value="">Any doctor</option>
                {(doctors.data?.data ?? []).map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="queue-date">Queue date</Label>
              <Input id="queue-date" type="datetime-local" {...form.register("date")} />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Add queue"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-date">Dashboard date</Label>
              <Input id="dashboard-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <Button variant="secondary" onClick={() => dashboard.refetch()} disabled={dashboard.isFetching}>Refresh</Button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryCard label="Total" value={queueSummary.total} />
            <SummaryCard label="Waiting" value={queueSummary.waiting} />
            <SummaryCard label="In service" value={queueSummary.inService} />
            <SummaryCard label="Done" value={queueSummary.done} />
          </div>

          {dashboard.isLoading ? <LoadingBlock label="Loading queue dashboard..." /> : null}
          {dashboard.isError ? <ErrorBlock message="Failed to load queue dashboard" onRetry={() => dashboard.refetch()} /> : null}

          {dashboard.data ? (
            <div className="space-y-2">
              {dashboard.data.map((entry) => (
                <div key={entry.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">#{entry.number} - {entry.patient?.name}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {entry.patient?.mrn} · {entry.doctor?.name ?? "Any doctor"}
                      </div>
                    </div>
                    <Badge variant={entry.status === "DONE" ? "success" : entry.status === "CANCELLED" ? "danger" : "outline"}>{entry.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {queueStatuses.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={status === entry.status ? "default" : "outline"}
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: entry.id, status })}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {dashboard.data.length === 0 ? <EmptyBlock message="No queue entries for selected date" /> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-[hsl(var(--muted-foreground))]">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
