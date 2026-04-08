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
  addLaboratoryResult,
  createLaboratoryOrder,
  getApiErrorMessage,
  laboratoryDailySummary,
  listDoctors,
  listLaboratoryOrders,
  listVisits,
  setLaboratoryOrderStatus
} from "@/lib/simrs-api";

type LaboratoryOrderStatus = "MENUNGGU" | "PROSES" | "SELESAI" | "BATAL";

const orderStatuses: LaboratoryOrderStatus[] = ["MENUNGGU", "PROSES", "SELESAI", "BATAL"];

const createOrderSchema = z.object({
  visitId: z.string().min(1, "Visit wajib dipilih"),
  doctorId: z.string().min(1, "Dokter wajib dipilih"),
  testType: z.string().min(2, "Jenis pemeriksaan wajib diisi"),
  notes: z.string().optional()
});

const addResultSchema = z.object({
  orderId: z.string().min(1, "Order wajib dipilih"),
  parameter: z.string().min(2, "Parameter wajib diisi"),
  value: z.string().min(1, "Nilai wajib diisi"),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  notes: z.string().optional()
});

type CreateOrderValues = z.infer<typeof createOrderSchema>;
type AddResultValues = z.infer<typeof addResultSchema>;

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function statusVariant(status: LaboratoryOrderStatus): "default" | "warning" | "success" | "danger" {
  if (status === "MENUNGGU" || status === "PROSES") return "warning";
  if (status === "SELESAI") return "success";
  return "danger";
}

export default function LaboratoryPage() {
  const [q, setQ] = useState("");
  const [date, setDate] = useState(todayValue());
  const qc = useQueryClient();

  const orders = useQuery({
    queryKey: ["laboratory", "orders", q],
    queryFn: () => listLaboratoryOrders({ page: 1, limit: 100, q: q || undefined })
  });

  const summary = useQuery({
    queryKey: ["laboratory", "summary", date],
    queryFn: () => laboratoryDailySummary(date)
  });

  const visits = useQuery({
    queryKey: ["laboratory", "visit-options"],
    queryFn: () => listVisits({ page: 1, limit: 200 })
  });

  const doctors = useQuery({
    queryKey: ["laboratory", "doctor-options"],
    queryFn: () => listDoctors({ page: 1, limit: 200 })
  });

  const createOrderForm = useForm<CreateOrderValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { visitId: "", doctorId: "", testType: "", notes: "" }
  });

  const addResultForm = useForm<AddResultValues>({
    resolver: zodResolver(addResultSchema),
    defaultValues: { orderId: "", parameter: "", value: "", unit: "", normalRange: "", notes: "" }
  });

  const createOrder = useMutation({
    mutationFn: createLaboratoryOrder,
    onSuccess: async () => {
      toast.success("Order laboratorium berhasil dibuat");
      createOrderForm.reset({ visitId: "", doctorId: "", testType: "", notes: "" });
      await qc.invalidateQueries({ queryKey: ["laboratory"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LaboratoryOrderStatus }) =>
      setLaboratoryOrderStatus(id, status),
    onSuccess: async () => {
      toast.success("Status order laboratorium diperbarui");
      await qc.invalidateQueries({ queryKey: ["laboratory"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const addResult = useMutation({
    mutationFn: (values: AddResultValues) =>
      addLaboratoryResult(values.orderId, {
        parameter: values.parameter,
        value: values.value,
        unit: values.unit,
        normalRange: values.normalRange,
        notes: values.notes
      }),
    onSuccess: async () => {
      toast.success("Hasil laboratorium berhasil ditambahkan");
      addResultForm.reset({ orderId: "", parameter: "", value: "", unit: "", normalRange: "", notes: "" });
      await qc.invalidateQueries({ queryKey: ["laboratory"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  return (
    <div className="space-y-4 p-6">
      <PageHeader title="Laboratory" description="Kelola order dan hasil laboratorium" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buat order laboratorium</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={createOrderForm.handleSubmit((values) => createOrder.mutate(values))}>
            <div className="space-y-1.5">
              <Label htmlFor="lab-visit">Visit</Label>
              <select
                id="lab-visit"
                className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm"
                {...createOrderForm.register("visitId")}
              >
                <option value="">Pilih visit</option>
                {(visits.data?.data ?? []).map((visit) => (
                  <option key={visit.id} value={visit.id}>
                    {visit.id.slice(0, 8)} - {visit.patient?.name ?? "Unknown patient"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lab-doctor">Dokter</Label>
              <select
                id="lab-doctor"
                className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm"
                {...createOrderForm.register("doctorId")}
              >
                <option value="">Pilih dokter</option>
                {(doctors.data?.data ?? []).map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lab-test-type">Jenis pemeriksaan</Label>
              <Input id="lab-test-type" placeholder="Darah Lengkap, CRP" {...createOrderForm.register("testType")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lab-notes">Catatan</Label>
              <Input id="lab-notes" placeholder="Catatan klinis" {...createOrderForm.register("notes")} />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? "Menyimpan..." : "Buat order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan harian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lab-summary-date">Tanggal</Label>
              <Input id="lab-summary-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <Button variant="secondary" onClick={() => summary.refetch()} disabled={summary.isFetching}>
              Refresh summary
            </Button>
          </div>

          {summary.isLoading ? <LoadingBlock label="Memuat ringkasan laboratorium..." /> : null}
          {summary.isError ? <ErrorBlock message="Gagal memuat ringkasan laboratorium" onRetry={() => summary.refetch()} /> : null}

          {summary.data ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <SummaryCard label="Menunggu" value={summary.data.counts.menunggu} />
              <SummaryCard label="Proses" value={summary.data.counts.proses} />
              <SummaryCard label="Selesai" value={summary.data.counts.selesai} />
              <SummaryCard label="Total" value={summary.data.counts.total} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Input hasil laboratorium</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={addResultForm.handleSubmit((values) => addResult.mutate(values))}>
            <div className="space-y-1.5 md:col-span-3">
              <Label htmlFor="lab-order">Order</Label>
              <select
                id="lab-order"
                className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm"
                {...addResultForm.register("orderId")}
              >
                <option value="">Pilih order</option>
                {(orders.data?.data ?? []).map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.testType} - {order.visit?.patient?.name ?? "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lab-parameter">Parameter</Label>
              <Input id="lab-parameter" placeholder="Hemoglobin" {...addResultForm.register("parameter")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lab-value">Nilai</Label>
              <Input id="lab-value" placeholder="12.5" {...addResultForm.register("value")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lab-unit">Satuan</Label>
              <Input id="lab-unit" placeholder="g/dL" {...addResultForm.register("unit")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lab-range">Nilai normal</Label>
              <Input id="lab-range" placeholder="12-16" {...addResultForm.register("normalRange")} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="lab-result-notes">Keterangan</Label>
              <Input id="lab-result-notes" placeholder="Normal / tinggi" {...addResultForm.register("notes")} />
            </div>

            <div className="md:col-span-3">
              <Button type="submit" disabled={addResult.isPending}>
                {addResult.isPending ? "Menyimpan..." : "Tambah hasil"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar order laboratorium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Cari pasien, dokter, status, atau jenis pemeriksaan..."
            />
            <Button variant="secondary" onClick={() => orders.refetch()} disabled={orders.isFetching}>
              Search
            </Button>
          </div>

          {orders.isLoading ? <LoadingBlock label="Memuat order laboratorium..." /> : null}
          {orders.isError ? <ErrorBlock message="Gagal memuat order laboratorium" onRetry={() => orders.refetch()} /> : null}

          {orders.data ? (
            <div className="space-y-2">
              {orders.data.data.map((order) => (
                <div key={order.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{order.testType}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {order.visit?.patient?.name ?? "Unknown patient"} · {order.doctor?.name ?? "Unknown doctor"}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">Hasil: {order.results?.length ?? 0}</div>
                    </div>
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {orderStatuses.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={status === order.status ? "default" : "outline"}
                        disabled={setStatus.isPending}
                        onClick={() => setStatus.mutate({ id: order.id, status })}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {orders.data.data.length === 0 ? <EmptyBlock message="Belum ada order laboratorium" /> : null}
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
