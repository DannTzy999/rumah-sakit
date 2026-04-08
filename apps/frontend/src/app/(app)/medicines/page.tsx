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
import { createMedicine, deleteMedicine, getApiErrorMessage, listMedicines } from "@/lib/simrs-api";

const medicineSchema = z.object({
  sku: z.string().min(2, "SKU wajib diisi"),
  name: z.string().min(2, "Nama wajib diisi"),
  unit: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().int().min(0)
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

export default function MedicinesPage() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();

  const medicines = useQuery({
    queryKey: ["medicines", q],
    queryFn: () => listMedicines({ page: 1, limit: 100, q: q || undefined })
  });

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: { sku: "", name: "", unit: "tablet", stock: 0, price: 0 }
  });

  const create = useMutation({
    mutationFn: createMedicine,
    onSuccess: async () => {
      toast.success("Medicine added");
      form.reset({ sku: "", name: "", unit: "tablet", stock: 0, price: 0 });
      await qc.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const remove = useMutation({
    mutationFn: deleteMedicine,
    onSuccess: async () => {
      toast.success("Medicine deleted");
      await qc.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  return (
    <div className="space-y-4 p-6">
      <PageHeader title="Medicines / Pharmacy" description="Stok dan harga obat" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah obat</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-5" onSubmit={form.handleSubmit((values) => create.mutate(values))}>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...form.register("sku")} placeholder="MED003" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} placeholder="Nama obat" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" {...form.register("unit")} placeholder="tablet" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...form.register("stock")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" {...form.register("price")} />
            </div>
            <div className="md:col-span-5">
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Save medicine"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex gap-2">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search medicines..." />
            <Button variant="secondary" onClick={() => medicines.refetch()} disabled={medicines.isFetching}>Search</Button>
          </div>

          {medicines.isLoading ? <LoadingBlock label="Loading medicines..." /> : null}
          {medicines.isError ? <ErrorBlock message="Failed to load medicines" onRetry={() => medicines.refetch()} /> : null}

          {medicines.data ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-2">SKU</th>
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Unit</th>
                    <th className="py-2 pr-2">Stock</th>
                    <th className="py-2 pr-2">Price</th>
                    <th className="py-2 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.data.data.map((medicine) => (
                    <tr key={medicine.id} className="border-b">
                      <td className="py-2 pr-2 font-mono text-xs">{medicine.sku}</td>
                      <td className="py-2 pr-2 font-medium">{medicine.name}</td>
                      <td className="py-2 pr-2">{medicine.unit}</td>
                      <td className="py-2 pr-2"><Badge variant={medicine.stock > 0 ? "success" : "danger"}>{medicine.stock}</Badge></td>
                      <td className="py-2 pr-2">Rp {medicine.price.toLocaleString("id-ID")}</td>
                      <td className="py-2 pr-2 text-right">
                        <Button size="sm" variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate(medicine.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {medicines.data.data.length === 0 ? <EmptyBlock message="No medicines found" /> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
